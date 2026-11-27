cess', ms) {
    const el = $('toastBanner');
    if (!el) return;
    const style = TOAST_STYLES[type] || TOAST_STYLES.info;
    el.classList.remove(...ALL_TOAST_CLASSES);
    el.classList.add(...style.cls.split(' '));
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML = `<i class="fa-solid ${style.icon} shrink-0"></i><span class="min-w-0 break-words"></span>`;
    el.lastElementChild.textContent = message;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), ms || (type === 'error' ? 7000 : 4000));
  }

  function errMsg(err) {
    const m = String(err?.message || err || '');
    if (err instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(m)) {
      return t('errNetwork', { origin: window.location.origin || 'origin' });
    }
    return m || 'Unknown error';
  }

  function setBtnBusy(btn, busy) {
    if (!btn) return;
    btn.disabled = busy;
    const icon = btn.querySelector('i');
    if (!icon) return;
    if (busy) {
      icon.dataset.prevClass = icon.className;
      icon.className = 'fa-solid fa-spinner fa-spin';
    } else if (icon.dataset.prevClass) {
      icon.className = icon.dataset.prevClass;
      delete icon.dataset.prevClass;
    }
  }

  // Chỉ cho 1 thao tác mạng chạy tại một thời điểm (tránh vừa lưu vừa reset...)
  async function exclusive(btn, fn) {
    if (state.busy) {
      showToast(t('toastBusy'), 'warn', 2000);
      return undefined;
    }
    state.busy = true;
    setBtnBusy(btn, true);
    try {
      return await fn();
    } finally {
      state.busy = false;
      setBtnBusy(btn, false);
    }
  }

  // Các endpoint /api/admin/* yêu cầu mã quản trị (ADMIN_TOKEN). CTEC.adminWorkerJson tự hỏi mã
  // ở lần đầu (lưu trong sessionStorage của tab) và hỏi lại nếu Worker trả 401.
  async function postWorkerJson(path, body) {
    return CTEC.adminWorkerJson(path, { method: 'POST', body });
  }

  function setDirty(kind, value = true) {
    state.dirty[kind] = value;
    $(kind === 'roster' ? 'saveRosterBtn' : 'saveFundBtn')?.classList.toggle('admin-dirty', value);
  }
  const anyDirty = () => state.dirty.roster || state.dirty.fund;

  function injectStyles() {
    if ($('adminAppStyle')) return;
    const style = document.createElement('style');
    style.id = 'adminAppStyle';
    style.textContent = `
      .admin-dirty::after {
        content: ""; width: 8px; height: 8px; border-radius: 9999px;
        background: #fbbf24; box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.35);
      }
      .sheet-cell-input[type="number"] { -moz-appearance: textfield; }
      select.sheet-cell-input { cursor: pointer; }
    `;
    document.head.appendChild(style);
  }

  /* ======================================================================
   * 4. CHUẨN HÓA DỮ LIỆU
   * ==================================================================== */
  const ROLE_ALIASES = new Map();
  [
    ['President', ['president', 'chu tich']],
    ['Vice President', ['vice president', 'pho chu tich']],
    ['Head of Department', ['head of department', 'truong ban']],
    ['Deputy Head of Department', ['deputy head of department', 'pho ban', 'pho truong ban']],
    ['Member', ['member', 'thanh vien']]
  ].forEach(([canon, list]) => list.forEach((a) => ROLE_ALIASES.set(a, canon)));

  const STATUS_ALIASES = new Map();
  [
    ['Official', ['official', 'chinh thuc']],
    ['Probationary', ['probationary', 'probation', 'thu viec']],
    ['Inactive', ['inactive', 'tam nghi']]
  ].forEach(([canon, list]) => list.forEach((a) => STATUS_ALIASES.set(a, canon)));

  // Chỉ map các giá trị tương đương hoàn toàn; giá trị lạ được giữ nguyên để không làm đổi nội dung hiển thị công khai.
  function normalizeRole(raw) {
    const s = String(raw ?? '').trim();
    if (!s) return 'Member';
    return ROLE_ALIASES.get(CTEC.normText(s)) || s;
  }
  function normalizeMemberStatus(raw) {
    const s = String(raw ?? '').trim();
    if (!s) return 'Official';
    return STATUS_ALIASES.get(CTEC.normText(s)) || s;
  }
  // Dùng chung một quy tắc với Worker (normalizeFundCell) và trang Fund — xem CTEC.normalizeFundStatus
  const normFundStatus = (raw) => CTEC.normalizeFundStatus(raw);

  const makeRosterRow = (o = {}) => ({
    uid: newUid(),
    name: CTEC.normalizeMemberName(o.name),
    dept: o.dept || CTEC.DEFAULT_DEPT,
    role: o.role || 'Member',
    status: o.status || 'Official'
  });

  const makeFundRow = (o = {}) => ({
    uid: newUid(),
    name: CTEC.normalizeMemberName(o.name),
    dept: o.dept || CTEC.DEFAULT_DEPT,
    months: Array.from({ length: MONTH_COUNT }, (_, i) => normFundStatus(o.months?.[i])),
    note: String(o.note ?? '').trim()
  });

  const pairKey = (name, dept) => `${CTEC.buildMemberNameKey(name)}|${dept}`;

  /* ======================================================================
   * 5. OPTION / NHÃN
   * ==================================================================== */
  const deptOptions = (L) => CTEC.DEPARTMENTS.map((d) => ({ value: d.value, label: CTEC.getDeptLabel(d.value, L, false) }));
  const roleOptions = (L) => CTEC.ROLES.map((v) => ({ value: v, label: ROLE_LABELS[L][v] || v }));
  const statusOptions = (L) => CTEC.MEMBER_STATUSES.map((v) => ({ value: v, label: STATUS_LABELS[L][v] || v }));
  const monthLabels = (L) => (L === 'en' ? CTEC.FUND_MONTHS_EN : CTEC.FUND_MONTHS_VI);

  // Giữ lại giá trị lạ (không nằm trong danh sách chuẩn) để không mất dữ liệu khi lưu
  function withCustom(options, value) {
    return options.some((o) => o.value === value) || !value ? options : [...options, { value, label: value }];
  }
  function optionsHtml(options, selected) {
    return options
      .map((o) => `<option value="${esc(o.value)}"${o.value === selected ? ' selected' : ''}>${esc(o.label)}</option>`)
      .join('');
  }
  function fillSelect(id, options) {
    const el = $(id);
    if (!el) return;
    const prev = el.value;
    el.innerHTML = optionsHtml(options, prev);
    if (options.some((o) => o.value === prev)) el.value = prev;
  }
  function fillBulkSelects() {
    const L = curLang();
    fillSelect('bulkRosterDeptSelect', deptOptions(L));
    fillSelect('bulkRosterRoleSelect', roleOptions(L));
    fillSelect('bulkRosterStatusSelect', statusOptions(L));
  }

  const deptColor = (key) => CTEC.DEPARTMENTS.find((d) => d.value === key)?.color || '#94a3b8';
  const STATUS_TONES = ['text-emerald-700', 'text-amber-700', 'text-slate-500'];
  function statusTone(status) {
    const n = CTEC.normText(status);
    if (n === 'official' || n === 'chinh thuc') return 'text-emerald-700';
    if (n === 'inactive' || n === 'tam nghi') return 'text-slate-500';
    return 'text-amber-700';
  }

  /* ======================================================================
   * 6. HẠN ĐÓNG QUỸ & LỊCH ĐƠN (khớp logic trang Fund công khai: 00:00 giờ VN, UTC+7)
   * ==================================================================== */
  const WEEKDAYS_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const WEEKDAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const FULL_WEEKDAYS_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const FULL_WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const FULL_MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const SHORT_MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function monthParts(idx) {
    const [mStr, yStr] = MONTHS_EN[idx].split(' ');
    return { m: MONTH_INDEX[mStr], y: 2000 + parseInt(yStr, 10) };
  }
  const daysInMonth = (idx) => {
    const { m, y } = monthParts(idx);
    return new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  };
  function deadlineUtcMs(idx, day) {
    if (!day) return null;
    const { m, y } = monthParts(idx);
    const d = new Date(Date.UTC(y, m, day));
    if (d.getUTCMonth() !== m) return null; // ngày không tồn tại (vd 30/2)
    return Date.UTC(y, m, day) - 7 * 60 * 60 * 1000;
  }
  const isPastDue = (idx) => {
    const ms = deadlineUtcMs(idx, state.deadlines[idx]);
    return ms !== null && CTEC.getServerNowMs() >= ms;
  };
  function todayVnParts() {
    const vn = new Date(CTEC.getServerNowMs() + 7 * 60 * 60 * 1000);
    return { y: vn.getUTCFullYear(), m: vn.getUTCMonth(), d: vn.getUTCDate() };
  }
  function formatCalendarTitle(idx, L) {
    const { m, y } = monthParts(idx);
    return L === 'en' ? `${FULL_MONTHS_EN[m]} ${y}` : `Tháng ${m + 1}, ${y}`;
  }
  function formatShortDueDate(idx, day, L) {
    if (!day) return t('deadlineNotSet');
    const { m } = monthParts(idx);
    return L === 'en' ? `${SHORT_MONTHS_EN[m]} ${day}` : `${String(day).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}`;
  }
  function formatFullDueDate(idx, day, L) {
    const { m, y } = monthParts(idx);
    const dow = new Date(Date.UTC(y, m, day)).getUTCDay();
    if (L === 'en') {
      return `${FULL_WEEKDAYS_EN[dow]}, ${SHORT_MONTHS_EN[m]} ${day}, ${y}`;
    }
    return `${FULL_WEEKDAYS_VI[dow]}, ${String(day).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}/${y}`;
  }

  /* ======================================================================
   * 7. TẢI DỮ LIỆU TỪ D1
   * ==================================================================== */
  const isValidQr = (v) => /^https:\/\/[^\s"'<>]+$/i.test(v) || !!CTEC.sanitizeQrHtml(v);

  // Đọc bảng "Thông tin chuyển khoản" trong Google Doc (rawHtml) — giống parseTransferHtml của trang Fund
  function parseTransferHtml(html) {
    const info = { accountNumber: '', bankName: '', accountName: '', qrHtml10k: '' };
    if (!html) return info;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('table tr').forEach((tr) => {
      const cells = tr.querySelectorAll('td, th');
      if (cells.length < 2) return;
      const key = CTEC.normText(cells[0].textContent);
      const val = (cells[1].textContent || '').replace(/\u00a0/g, ' ').trim();
      const img = cells[1].querySelector('img');
      if (key.includes('10k') || key.includes('10.000') || key.includes('10 000')) {
        const cand = val || (img ? img.outerHTML : '');
        if (cand && isValidQr(cand)) info.qrHtml10k = cand;
      } else if (key === 'stk' || key.includes('so tai khoan')) {
        info.accountNumber = val;
      } else if (key.includes('ten ngan hang') || key === 'ngan hang') {
        info.bankName = val;
      } else if (key.includes('ten tai khoan') || key.includes('chu tai khoan')) {
        info.accountName = val;
      }
    });
    return info;
  }

  function extractBankInfo(b) {
    const info = {
      accountNumber: String(b.accountNumber || b.stk || ''),
      accountName: String(b.accountName || ''),
      bankName: String(b.bankName || ''),
      qrHtml10k: String(b.qrHtml10k || b.qrUrl || '')
    };
    if (b.rawHtml && !b.accountNumber && !b.stk && !b.qrHtml10k) {
      return parseTransferHtml(b.rawHtml);
    }
    return info;
  }

  function fillBankInputs(info) {
    $('bankStkInput').value = info.accountNumber || '';
    $('bankNameInput').value = info.bankName || '';
    $('bankAccountNameInput').value = info.accountName || '';
    $('bankQrInput').value = info.qrHtml10k || '';
  }

  function collectBankInfo() {
    return {
      accountNumber: $('bankStkInput').value.trim(),
      bankName: $('bankNameInput').value.trim(),
      accountName: $('bankAccountNameInput').value.trim(),
      qrHtml10k: $('bankQrInput').value.trim()
    };
  }

  function showTableMessage(messageKey, withRetry = false) {
    const retry = withRetry
      ? `<div class="mt-3"><button type="button" data-retry-load class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"><i class="fa-solid fa-rotate-right mr-1.5"></i>${esc(t('retryLoadBtn'))}</button></div>`
      : '';
    const row = (cols) => `<tr><td colspan="${cols}" class="py-10 px-4 text-center text-sm text-slate-400">${esc(t(messageKey))}${retry}</td></tr>`;
    $('rosterEditorBody').innerHTML = row(7);
    $('fundEditorBody').innerHTML = row(14);
    if (withRetry) {
      document.querySelectorAll('[data-retry-load]').forEach((b) => {
        b.addEventListener('click', () => loadAllAdminData(true));
      });
    }
  }

  async function loadAllAdminData(skipConfirm) {
    if (skipConfirm !== true && anyDirty() && !window.confirm(t('confirmReloadDirty'))) return;

    const reloadBtn = $('syncAllIcon')?.closest('button');
    await exclusive(reloadBtn, async () => {
      showTableMessage('loadingRows');
      try {
        // `fresh` báo Worker bỏ qua cache edge và đọc thẳng D1 (không tạo thêm entry cache).
        // Trình soạn thảo mà dùng bản cache 60s rồi bấm Lưu thì có thể ghi đè mất chỉnh sửa vừa rồi.
        const stamp = Date.now();
        const [rosterPayload, fundPayload] = await Promise.all([
          CTEC.fetchWorkerJson(`/api/roster?fresh=${stamp}`),
          CTEC.fetchWorkerJson(`/api/fund?fresh=${stamp}`)
        ]);

        state.roster = (rosterPayload.rows || []).map((r) => makeRosterRow({
          name: r.full_name ?? r.name,
          dept: CTEC.canonDept(r.department ?? r.dept, CTEC.DEFAULT_DEPT),
          role: normalizeRole(r.role),
          status: normalizeMemberStatus(r.status)
        }));

        state.fund = (fundPayload.rows || []).map((r) => makeFundRow({
          name: r.full_name ?? r.name,
          dept: CTEC.canonDept(r.department ?? r.dept, CTEC.DEFAULT_DEPT),
          months: Array.isArray(r.months) ? r.months : [r.m0, r.m1, r.m2, r.m3, r.m4, r.m5, r.m6, r.m7],
          note: r.note
        }));

        state.deadlines = Array.from({ length: MONTH_COUNT }, (_, i) => {
          const day = CTEC.parseDeadlineDay(fundPayload.deadlines?.[i]);
          return day > 0 && day <= daysInMonth(i) ? day : 0;
        });
        state.bankInfoRaw = fundPayload.bankInfo && typeof fundPayload.bankInfo === 'object' ? fundPayload.bankInfo : {};
        fillBankInputs(extractBankInfo(state.bankInfoRaw));

        state.selected.roster.clear();
        state.selected.fund.clear();
        state.loaded = true;
        setDirty('roster', false);
        setDirty('fund', false);
        renderAll();
        const unknownDeptRows = [...(rosterPayload.rows || []), ...(fundPayload.rows || [])]
          .filter((r) => r && r.department_unknown).length;
        let loadedMsg = t('toastLoaded', { r: state.roster.length, f: state.fund.length });
        if (unknownDeptRows) loadedMsg += t('warnUnknownDeptLoaded', { n: unknownDeptRows });
        showToast(loadedMsg, unknownDeptRows ? 'warn' : 'success', unknownDeptRows ? 9000 : 2500);
      } catch (err) {
        console.error('[admin-app] Load D1 failed:', err);
        if (!state.loaded) showTableMessage('loadFailedRows', true);
        else renderAll();
        showToast(t('toastLoadFail', { msg: errMsg(err) }), 'error');
      }
    });
  }

  /* ======================================================================
   * 8. RENDER
   * ==================================================================== */
  function getVisible(kind) {
    const q = CTEC.normText($(kind === 'roster' ? 'rosterSearchInput' : 'fundSearchInput')?.value || '');
    return state[kind].filter((r) => !q || CTEC.normText(r.name).includes(q));
  }

  function pruneSelection(kind, visibleRows) {
    const visible = new Set(visibleRows.map((r) => r.uid));
    for (const id of [...state.selected[kind]]) if (!visible.has(id)) state.selected[kind].delete(id);
  }

  function updateBadges() {
    $('badgeRosterCount').textContent = String(state.roster.length);
    $('badgeFundCount').textContent = String(state.fund.length);
  }

  function updateRosterStats() {
    const pill = $('rosterStatsPill');
    if (pill) {
      const named = state.roster.filter((r) => CTEC.normalizeMemberName(r.name));
      const stats = CTEC.getHeadcountStats(named.map((r) => ({ name: r.name, dept: r.dept })));
      pill.textContent = stats.rows !== stats.people
        ? t('rosterMembersCountRows', { n: stats.people, rows: stats.rows })
        : t('rosterMembersCount', { n: stats.people });
    }
    updateBadges();
  }

  function emptyRowHtml(cols, key) {
    return `<tr><td colspan="${cols}" class="py-10 px-4 text-center text-sm text-slate-400">${esc(t(key))}</td></tr>`;
  }

  /* ---------- Roster ---------- */
  function rosterRowHtml(r, pos, opts) {
    return `
      <tr class="group hover:bg-slate-50 transition duration-150" data-uid="${r.uid}">
        <td class="py-2 px-2.5 text-center border-r border-slate-100">
          <input type="checkbox" data-act="select" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
        </td>
        <td class="py-2 px-3 text-center text-xs font-semibold text-slate-400 border-r border-slate-100">${pos}</td>
        <td class="sticky-name-col bg-white group-hover:bg-slate-50 py-1.5 px-2 border-r border-slate-200">
          <input type="text" data-field="name" value="${esc(r.name)}" placeholder="${esc(t('namePlaceholder'))}"
                 autocomplete="off" spellcheck="false" class="sheet-cell-input font-semibold text-slate-800">
        </td>
        <td class="py-1.5 px-2 border-r border-slate-100">
          <select data-field="dept" class="sheet-cell-input font-semibold text-slate-700" style="border-left:3px solid ${deptColor(r.dept)}">
            ${optionsHtml(opts.dept, r.dept)}
          </select>
        </td>
        <td class="py-1.5 px-2 border-r border-slate-100">
          <select data-field="role" class="sheet-cell-input text-slate-700">${optionsHtml(withCustom(opts.role, r.role), r.role)}</select>
        </td>
        <td class="py-1.5 px-2 border-r border-slate-100">
          <select data-field="status" class="sheet-cell-input font-semibold ${statusTone(r.status)}">${optionsHtml(withCustom(opts.status, r.status), r.status)}</select>
        </td>
        <td class="py-1.5 px-3 text-center">
          <button type="button" data-act="delete" title="${esc(t('deleteRowTitle'))}" aria-label="${esc(t('deleteRowTitle'))}"
                  class="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer">
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
        </td>
      </tr>`;
  }

  function renderRosterEditor() {
    const body = $('rosterEditorBody');
    if (!body) return;
    const L = curLang();
    const rows = getVisible('roster');
    pruneSelection('roster', rows);

    if (!rows.length) {
      body.innerHTML = emptyRowHtml(7, state.roster.length ? 'emptySearch' : 'emptyRoster');
    } else {
      const opts = { dept: deptOptions(L), role: roleOptions(L), status: statusOptions(L) };
      const pos = new Map(state.roster.map((r, i) => [r.uid, i + 1]));
      body.innerHTML = rows.map((r) => rosterRowHtml(r, pos.get(r.uid), opts)).join('');
    }
    syncSelectionUI('roster');
    updateRosterStats();
  }

  /* ---------- Fund ---------- */
  const MONTH_BTN_BASE = 'status-pill-btn w-full min-w-[70px] px-2 py-1.5 rounded-lg border text-[11px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer hover:brightness-95';
  const MONTH_BTN_COLORS = {
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    UNPAID: 'bg-amber-50 text-amber-700 border-amber-200',
    DEBT: 'bg-red-50 text-red-700 border-red-200'
  };

  function monthBtnParts(status, idx, pastDue) {
    const overdue = status === 'UNPAID' && pastDue;
    return {
      cls: `${MONTH_BTN_BASE} ${MONTH_BTN_COLORS[status] || MONTH_BTN_COLORS.UNPAID}`,
      title: overdue ? t('overdueTitle') : '',
      inner: `${esc(status)}${overdue ? ' <i class="fa-solid fa-clock text-[9px] opacity-70"></i>' : ''}`
    };
  }

  function monthBtnHtml(status, idx, pastDue) {
    const p = monthBtnParts(status, idx, pastDue);
    return `<button type="button" data-act="cycle" data-m="${idx}" class="${p.cls}" title="${esc(p.title)}">${p.inner}</button>`;
  }

  function paintMonthBtn(btn, status, idx) {
    const p = monthBtnParts(status, idx, isPastDue(idx));
    btn.className = p.cls;
    btn.title = p.title;
    btn.innerHTML = p.inner;
  }

  function renderFundHead() {
    const head = $('fundEditorHead');
    if (!head) return;
    const cell = 'py-3 px-3 text-center border-r border-slate-800';
    head.innerHTML = `
      <tr class="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
        <th class="py-3 px-2.5 text-center w-10 border-r border-slate-800">
          <input type="checkbox" id="fundSelectAllCheckbox" title="${esc(t('selectAllTitle'))}"
                 class="w-4 h-4 rounded border-slate-500 text-emerald-600 focus:ring-emerald-500 cursor-pointer">
        </th>
        <th class="${cell} w-14">${esc(t('colNo'))}</th>
        <th class="sticky-name-col bg-slate-900 py-3 px-4 border-r border-slate-700 min-w-[175px] sm:min-w-[210px]">${esc(t('colFullName'))}</th>
        <th class="py-3 px-4 border-r border-slate-800 min-w-[230px]">${esc(t('colDeptFull'))}</th>
        ${monthLabels(curLang()).map((m) => `<th class="${cell} min-w-[88px]">${esc(m)}</th>`).join('')}
        <th class="py-3 px-4 border-r border-slate-800 min-w-[200px]">${esc(t('colNote'))}</th>
        <th class="py-3 px-3 text-center w-16">${esc(t('colDelete'))}</th>
      </tr>`;
    syncSelectionUI('fund');
  }

  function fundRowHtml(r, pos, deptOpts, pastDue) {
    const months = r.months
      .map((st, i) => `<td class="py-1.5 px-1.5 text-center border-r border-slate-100">${monthBtnHtml(st, i, pastDue[i])}</td>`)
      .join('');
    return `
      <tr class="group hover:bg-slate-50 transition duration-150" data-uid="${r.uid}">
        <td class="py-2 px-2.5 text-center border-r border-slate-100">
          <input type="checkbox" data-act="select" class="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer">
        </td>
        <td class="py-2 px-3 text-center text-xs font-semibold text-slate-400 border-r border-slate-100">${pos}</td>
        <td class="sticky-name-col bg-white group-hover:bg-slate-50 py-1.5 px-2 border-r border-slate-200">
          <input type="text" data-field="name" value="${esc(r.name)}" placeholder="${esc(t('namePlaceholder'))}"
                 autocomplete="off" spellcheck="false" class="sheet-cell-input font-semibold text-slate-800">
        </td>
        <td class="py-1.5 px-2 border-r border-slate-100">
          <select data-field="dept" class="sheet-cell-input font-semibold text-slate-700" style="border-left:3px solid ${deptColor(r.dept)}">
            ${optionsHtml(deptOpts, r.dept)}
          </select>
        </td>
        ${months}
        <td class="py-1.5 px-2 border-r border-slate-100">
          <input type="text" data-field="note" value="${esc(r.note)}" placeholder="${esc(t('notePlaceholder'))}"
                 autocomplete="off" class="sheet-cell-input text-slate-600">
        </td>
        <td class="py-1.5 px-3 text-center">
          <button type="button" data-act="delete" title="${esc(t('deleteRowTitle'))}" aria-label="${esc(t('deleteRowTitle'))}"
                  class="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer">
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
        </td>
      </tr>`;
  }

  function renderFundEditor() {
    const body = $('fundEditorBody');
    if (!body) return;
    const rows = getVisible('fund');
    pruneSelection('fund', rows);

    if (!rows.length) {
      body.innerHTML = emptyRowHtml(14, state.fund.length ? 'emptySearch' : 'emptyFund');
    } else {
      const deptOpts = deptOptions(curLang());
      const pastDue = Array.from({ length: MONTH_COUNT }, (_, i) => isPastDue(i));
      const pos = new Map(state.fund.map((r, i) => [r.uid, i + 1]));
      body.innerHTML = rows.map((r) => fundRowHtml(r, pos.get(r.uid), deptOpts, pastDue)).join('');
    }
    syncSelectionUI('fund');
    updateBadges();
  }

  /* ---------- Single Calendar Deadline Configurator ---------- */
  function renderDeadlineCalendar() {
    const host = $('deadlineConfigurator');
    if (!host) return;

    const L = curLang();
    const idx = Math.max(0, Math.min(MONTH_COUNT - 1, state.calMonthIdx));
    state.calMonthIdx = idx;

    const labels = monthLabels(L);
    const { m, y } = monthParts(idx);
    const totalDays = daysInMonth(idx);
    const firstDowMon = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7; // 0 = Mon .. 6 = Sun
    const selectedDay = state.deadlines[idx] || 0;
    const overdue = isPastDue(idx);
    const today = todayVnParts();
    const isCurrentCalMonth = today.y === y && today.m === m;
    const weekdays = L === 'en' ? WEEKDAYS_EN : WEEKDAYS_VI;

    const monthPillsHtml = labels.map((label, i) => {
      const active = i === idx;
      const dayVal = state.deadlines[i] || 0;
      const pillOverdue = isPastDue(i);
      const shortText = formatShortDueDate(i, dayVal, L);

      let badgeCls = 'bg-slate-200/80 text-slate-500';
      if (active) {
        badgeCls = 'bg-white/20 text-white';
      } else if (dayVal > 0 && pillOverdue) {
        badgeCls = 'bg-red-50 text-red-700 border border-red-200';
      } else if (dayVal > 0) {
        badgeCls = 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      }

      return `
        <button type="button" data-cal-month="${i}" aria-pressed="${active}"
                class="fund-month-pill${active ? ' is-active' : ''}">
          <span class="truncate">${esc(label)}</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${badgeCls}">${esc(shortText)}</span>
        </button>`;
    }).join('');

    const cells = [];
    for (let lead = 0; lead < firstDowMon; lead++) {
      cells.push('<span class="h-9" aria-hidden="true"></span>');
    }
    for (let d = 1; d <= totalDays; d++) {
      const col = (firstDowMon + d - 1) % 7;
      const isWeekend = col === 6;
      const isToday = isCurrentCalMonth && today.d === d;
      const isSelected = selectedDay === d;
      const cls = [
        'fund-cal-day',
        isWeekend ? 'is-weekend' : '',
        isToday ? 'is-today' : '',
        isSelected ? 'is-selected' : ''
      ].filter(Boolean).join(' ');
      const titleAttr = isToday ? ` title="${esc(t('todayLabel'))}"` : '';
      cells.push(
        `<button type="button" data-cal-day="${d}" aria-pressed="${isSelected}" class="${cls}"${titleAttr}>${d}</button>`
      );
    }

    const statusBadgeHtml = selectedDay > 0
      ? (overdue
          ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 shrink-0">${esc(t('deadlineBadgeOverdue'))}</span>`
          : `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">${esc(t('deadlineBadgeActive'))}</span>`)
      : '';

    const statusText = selectedDay > 0
      ? t('deadlineStatusSet', { date: formatFullDueDate(idx, selectedDay, L) })
      : t('deadlineStatusUnset');

    host.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-stretch">
        <!-- Cột chọn nhanh 8 tháng (10/2026 - 05/2027) -->
        <div class="sm:col-span-5 grid grid-cols-2 sm:grid-cols-1 gap-1.5">
          ${monthPillsHtml}
        </div>

        <!-- Lịch đơn hiển thị tháng đang chọn -->
        <div class="sm:col-span-7 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col justify-between">
          <div>
            <!-- Thanh chuyển đổi tháng -->
            <div class="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-200">
              <button type="button" data-cal-prev ${idx === 0 ? 'disabled' : ''}
                      title="${esc(t('prevMonthTitle'))}" aria-label="${esc(t('prevMonthTitle'))}"
                      class="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0">
                <i class="fa-solid fa-chevron-left text-xs"></i>
              </button>

              <div class="text-center min-w-0">
                <div class="text-sm font-extrabold text-slate-800 tracking-tight truncate">
                  ${esc(formatCalendarTitle(idx, L))}
                </div>
                <div class="text-[10px] font-semibold text-slate-400">
                  ${idx + 1} / ${MONTH_COUNT}
                </div>
              </div>

              <button type="button" data-cal-next ${idx === MONTH_COUNT - 1 ? 'disabled' : ''}
                      title="${esc(t('nextMonthTitle'))}" aria-label="${esc(t('nextMonthTitle'))}"
                      class="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0">
                <i class="fa-solid fa-chevron-right text-xs"></i>
              </button>
            </div>

            <!-- Tiêu đề thứ trong tuần -->
            <div class="grid grid-cols-7 gap-1 text-center mb-1">
              ${weekdays.map((w, wi) => `<span class="text-[11px] font-bold uppercase ${wi === 6 ? 'text-rose-500' : 'text-slate-400'}">${esc(w)}</span>`).join('')}
            </div>

            <!-- Lưới ngày trong tháng -->
            <div class="grid grid-cols-7 gap-1">
              ${cells.join('')}
            </div>
          </div>

          <!-- Thanh trạng thái & nút Hủy đặt ngày hạn -->
          <div class="mt-3 pt-2.5 border-t border-slate-200 flex flex-col gap-2">
            <div class="flex items-center justify-between gap-2 min-h-[1.375rem]">
              <span class="text-xs font-bold ${selectedDay > 0 ? 'text-slate-800' : 'text-slate-400'} truncate">
                ${esc(statusText)}
              </span>
              ${statusBadgeHtml}
            </div>

            <button type="button" data-cal-clear ${selectedDay === 0 ? 'disabled' : ''}
                    class="w-full py-1.5 px-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-45 disabled:pointer-events-none text-red-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
              <i class="fa-regular fa-calendar-xmark"></i>
              <span>${esc(t('clearDeadlineBtn'))}</span>
            </button>
          </div>
        </div>
      </div>`;
  }

  function setCalendarMonth(nextIdx) {
    const clamped = Math.max(0, Math.min(MONTH_COUNT - 1, nextIdx));
    if (clamped === state.calMonthIdx) return;
    state.calMonthIdx = clamped;
    renderDeadlineCalendar();
  }

  function selectDeadlineDay(day) {
    const idx = state.calMonthIdx;
    const maxDay = daysInMonth(idx);
    if (!Number.isInteger(day) || day < 1 || day > maxDay) return;

    // Bấm lại đúng ngày đang chọn sẽ hủy đặt ngày hạn (tiện thao tác nhanh)
    if (state.deadlines[idx] === day) {
      clearCurrentMonthDeadline();
      return;
    }

    state.deadlines[idx] = day;
    setDirty('fund');
    renderDeadlineCalendar();
    renderFundEditor();
    const L = curLang();
    showToast(t('toastDeadlineSet', {
      month: monthLabels(L)[idx],
      date: formatFullDueDate(idx, day, L)
    }), 'info', 2500);
  }

  function clearCurrentMonthDeadline() {
    const idx = state.calMonthIdx;
    if (!state.deadlines[idx]) return;
    state.deadlines[idx] = 0;
    setDirty('fund');
    renderDeadlineCalendar();
    renderFundEditor();
    showToast(t('toastDeadlineCleared', { month: monthLabels(curLang())[idx] }), 'info', 2500);
  }

  function renderAll() {
    fillBulkSelects();
    renderRosterEditor();
    renderFundHead();
    renderFundEditor();
    renderDeadlineCalendar();
  }

  /* ======================================================================
   * 9. CHỌN DÒNG & THAO TÁC HÀNG LOẠT
   * ==================================================================== */
  const selectionEls = {
    roster: { body: 'rosterEditorBody', all: 'rosterSelectAllCheckbox', bar: 'rosterBulkBar', label: 'rosterSelectedCountLabel' },
    fund: { body: 'fundEditorBody', all: 'fundSelectAllCheckbox', bar: 'fundBulkBar', label: 'fundSelectedCountLabel' }
  };

  function syncSelectionUI(kind) {
    const ids = selectionEls[kind];
    const set = state.selected[kind];
    $(ids.body)?.querySelectorAll('tr[data-uid]').forEach((tr) => {
      const on = set.has(tr.dataset.uid);
      tr.classList.toggle('row-selected', on);
      const cb = tr.querySelector('input[data-act="select"]');
      if (cb) cb.checked = on;
    });
    const visible = getVisible(kind);
    const selVisible = visible.filter((r) => set.has(r.uid)).length;
    const all = $(ids.all);
    if (all) {
      all.checked = visible.length > 0 && selVisible === visible.length;
      all.indeterminate = selVisible > 0 && selVisible < visible.length;
    }
    $(ids.bar)?.classList.toggle('hidden', set.size === 0);
    const label = $(ids.label);
    if (label) label.textContent = t('selectedRows', { n: set.size });
  }

  function handleSelectClick(kind, e, uid) {
    const set = state.selected[kind];
    const checked = e.target.checked;
    const visible = getVisible(kind);
    if (e.shiftKey && state.anchor[kind]) {
      const a = visible.findIndex((r) => r.uid === state.anchor[kind]);
      const b = visible.findIndex((r) => r.uid === uid);
      if (a !== -1 && b !== -1) {
        for (let i = Math.min(a, b); i <= Math.max(a, b); i++) {
          checked ? set.add(visible[i].uid) : set.delete(visible[i].uid);
        }
      }
    } else {
      checked ? set.add(uid) : set.delete(uid);
    }
    state.anchor[kind] = uid;
    syncSelectionUI(kind);
  }

  function toggleSelectAll(kind, checked) {
    const set = state.selected[kind];
    getVisible(kind).forEach((r) => (checked ? set.add(r.uid) : set.delete(r.uid)));
    syncSelectionUI(kind);
  }
  const toggleSelectAllRoster = (checked) => toggleSelectAll('roster', checked);
  const toggleSelectAllFund = (checked) => toggleSelectAll('fund', checked);

  function clearSelection(kind) {
    state.selected[kind].clear();
    state.anchor[kind] = null;
    syncSelectionUI(kind);
  }
  const clearRosterSelection = () => clearSelection('roster');
  const clearFundSelection = () => clearSelection('fund');

  const renderKind = (kind) => (kind === 'roster' ? renderRosterEditor() : renderFundEditor());

  function selectedRows(kind) {
    const set = state.selected[kind];
    const rows = state[kind].filter((r) => set.has(r.uid));
    if (!rows.length) showToast(t('toastNothingSelected'), 'warn', 2500);
    return rows;
  }

  function applyBulkRosterField(field, selectId) {
    const rows = selectedRows('roster');
    if (!rows.length) return;
    const value = $(selectId).value;
    if (!value) return;
    rows.forEach((r) => { r[field] = value; });
    setDirty('roster');
    renderRosterEditor();
    showToast(t('toastBulkApplied', { n: rows.length }), 'info', 2500);
  }
  const applyBulkRosterDept = () => applyBulkRosterField('dept', 'bulkRosterDeptSelect');
  const applyBulkRosterRole = () => applyBulkRosterField('role', 'bulkRosterRoleSelect');
  const applyBulkRosterStatus = () => applyBulkRosterField('status', 'bulkRosterStatusSelect');

  function applyBulkFundAllMonths() {
    const rows = selectedRows('fund');
    if (!rows.length) return;
    const value = $('bulkFundStatusSelect').value;
    rows.forEach((r) => { r.months = new Array(MONTH_COUNT).fill(value); });
    setDirty('fund');
    renderFundEditor();
    showToast(t('toastBulkApplied', { n: rows.length }), 'info', 2500);
  }

  function deleteSelected(kind) {
    const rows = selectedRows(kind);
    if (!rows.length) return;
    if (!window.confirm(t('confirmDeleteSelected', { n: rows.length }))) return;
    const ids = new Set(rows.map((r) => r.uid));
    state[kind] = state[kind].filter((r) => !ids.has(r.uid));
    state.selected[kind].clear();
    state.anchor[kind] = null;
    setDirty(kind);
    renderKind(kind);
    showToast(t('toastDeleted', { n: rows.length }), 'info', 2500);
  }
  const deleteSelectedRosterRows = () => deleteSelected('roster');
  const deleteSelectedFundRows = () => deleteSelected('fund');

  function deleteRow(kind, uid) {
    state[kind] = state[kind].filter((r) => r.uid !== uid);
    state.selected[kind].delete(uid);
    setDirty(kind);
    renderKind(kind);
  }

  function addRosterRow() {
    const search = $('rosterSearchInput');
    if (search && search.value) search.value = ''; // dòng mới có tên rỗng sẽ bị bộ lọc ẩn đi
    const last = state.roster[state.roster.length - 1];
    const row = makeRosterRow({ name: '', dept: last?.dept });
    state.roster.push(row);
    setDirty('roster');
    renderRosterEditor();
    const input = $('rosterEditorBody').querySelector(`tr[data-uid="${row.uid}"] input[data-field="name"]`);
    if (input) {
      input.focus();
      input.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  /* ======================================================================
   * 10. SỰ KIỆN TRÊN BẢNG & LỊCH (event delegation)
   * ==================================================================== */
  function findRow(kind, el) {
    const tr = el.closest('tr[data-uid]');
    return tr ? state[kind].find((r) => r.uid === tr.dataset.uid) : null;
  }

  function handleEnterNav(kind, e) {
    // Bỏ qua Enter dùng để chốt chữ khi đang gõ Telex/VNI
    if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229) return;
    const el = e.target;
    if (!(el instanceof HTMLInputElement) || el.dataset.field !== 'name') return;
    e.preventDefault();
    const next = el.closest('tr')?.nextElementSibling?.querySelector('input[data-field="name"]');
    if (next) {
      next.focus();
      next.select();
    } else if (kind === 'roster') {
      addRosterRow();
    }
  }

  function bindEditorEvents() {
    /* ----- Roster ----- */
    const rb = $('rosterEditorBody');
    rb.addEventListener('input', (e) => {
      const el = e.target;
      if (el.tagName !== 'INPUT' || el.dataset.field !== 'name') return;
      const row = findRow('roster', el);
      if (!row) return;
      row.name = el.value;
      setDirty('roster');
      updateRosterStats();
    });
    rb.addEventListener('change', (e) => {
      const el = e.target;
      if (el.tagName !== 'SELECT' || !el.dataset.field) return;
      const row = findRow('roster', el);
      if (!row) return;
      row[el.dataset.field] = el.value;
      if (el.dataset.field === 'dept') el.style.borderLeftColor = deptColor(el.value);
      if (el.dataset.field === 'status') {
        el.classList.remove(...STATUS_TONES);
        el.classList.add(statusTone(el.value));
      }
      setDirty('roster');
      updateRosterStats();
    });
    rb.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (!act) return;
      const row = findRow('roster', act);
      if (!row) return;
      if (act.dataset.act === 'select') handleSelectClick('roster', e, row.uid);
      else if (act.dataset.act === 'delete') deleteRow('roster', row.uid);
    });
    rb.addEventListener('keydown', (e) => handleEnterNav('roster', e));

    /* ----- Fund ----- */
    const fb = $('fundEditorBody');
    fb.addEventListener('input', (e) => {
      const el = e.target;
      if (el.tagName !== 'INPUT' || !el.dataset.field) return;
      const row = findRow('fund', el);
      if (!row) return;
      row[el.dataset.field] = el.value;
      setDirty('fund');
    });
    fb.addEventListener('change', (e) => {
      const el = e.target;
      if (el.tagName !== 'SELECT' || el.dataset.field !== 'dept') return;
      const row = findRow('fund', el);
      if (!row) return;
      row.dept = el.value;
      el.style.borderLeftColor = deptColor(el.value);
      setDirty('fund');
    });
    fb.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (!act) return;
      const row = findRow('fund', act);
      if (!row) return;
      if (act.dataset.act === 'select') {
        handleSelectClick('fund', e, row.uid);
      } else if (act.dataset.act === 'delete') {
        deleteRow('fund', row.uid);
      } else if (act.dataset.act === 'cycle') {
        const m = parseInt(act.dataset.m, 10);
        const next = FUND_STATUSES[(FUND_STATUSES.indexOf(row.months[m]) + 1) % FUND_STATUSES.length];
        row.months[m] = next;
        paintMonthBtn(act, next, m);
        setDirty('fund');
      }
    });
    fb.addEventListener('keydown', (e) => handleEnterNav('fund', e));

    $('fundEditorHead').addEventListener('change', (e) => {
      if (e.target.id === 'fundSelectAllCheckbox') toggleSelectAllFund(e.target.checked);
    });

    /* ----- Lịch cấu hình hạn đóng quỹ ----- */
    const calHost = $('deadlineConfigurator');
    calHost?.addEventListener('click', (e) => {
      const prevBtn = e.target.closest('[data-cal-prev]');
      if (prevBtn) {
        setCalendarMonth(state.calMonthIdx - 1);
        return;
      }
      const nextBtn = e.target.closest('[data-cal-next]');
      if (nextBtn) {
        setCalendarMonth(state.calMonthIdx + 1);
        return;
      }
      const monthBtn = e.target.closest('[data-cal-month]');
      if (monthBtn) {
        const idx = parseInt(monthBtn.dataset.calMonth, 10);
        if (Number.isInteger(idx)) setCalendarMonth(idx);
        return;
      }
      const dayBtn = e.target.closest('[data-cal-day]');
      if (dayBtn) {
        const day = parseInt(dayBtn.dataset.calDay, 10);
        if (Number.isInteger(day)) selectDeadlineDay(day);
        return;
      }
      const clearBtn = e.target.closest('[data-cal-clear]');
      if (clearBtn) {
        clearCurrentMonthDeadline();
      }
    });

    /* ----- Bank info ----- */
    ['bankStkInput', 'bankNameInput', 'bankAccountNameInput', 'bankQrInput'].forEach((id) => {
      $(id)?.addEventListener('input', () => setDirty('fund'));
    });
  }

  /* ======================================================================
   * 11. LƯU LÊN D1
   * ==================================================================== */
  function collectRosterPayload() {
    const rows = [];
    const seen = new Set();
    let blank = 0;
    let dup = 0;
    for (const r of state.roster) {
      const name = CTEC.normalizeMemberName(r.name);
      if (!name) { blank++; continue; }
      const key = pairKey(name, r.dept);
      if (seen.has(key)) dup++; else seen.add(key);
      rows.push({
        full_name: name,
        department: r.dept,
        role: String(r.role || '').trim() || 'Member',
        status: String(r.status || '').trim() || 'Official'
      });
    }
    return { rows, blank, dup };
  }

  async function saveRosterToD1() {
    if (!state.loaded) return showToast(t('errNotLoaded'), 'error');
    const { rows, blank, dup } = collectRosterPayload();
    if (!rows.length) return showToast(t('errEmptyRoster'), 'error');
    if (dup > 0 && !window.confirm(t('confirmDup', { n: dup }))) return;

    await exclusive($('saveRosterBtn'), async () => {
      try {
        await postWorkerJson('/api/admin/roster/save', { rows });
        // Đồng bộ bản nháp với những gì đã lưu: bỏ dòng trống, chuẩn hóa khoảng trắng
        state.roster = state.roster.filter((r) => CTEC.normalizeMemberName(r.name));
        state.roster.forEach((r) => { r.name = CTEC.normalizeMemberName(r.name); });
        state.selected.roster.clear();
        setDirty('roster', false);
        renderRosterEditor();
        let msg = t('toastSavedRoster', { n: rows.length });
        if (blank) msg += ` ${t('warnBlankDropped', { n: blank })}`;
        showToast(msg, 'success');
      } catch (err) {
        console.error('[admin-app] Save roster failed:', err);
        showToast(t('toastSaveFail', { msg: errMsg(err) }), 'error');
      }
    });
  }

  function collectFundPayload() {
    const rows = [];
    const seen = new Set();
    let blank = 0;
    let dup = 0;
    for (const r of state.fund) {
      const name = CTEC.normalizeMemberName(r.name);
      if (!name) { blank++; continue; }
      const key = pairKey(name, r.dept);
      if (seen.has(key)) dup++; else seen.add(key);
      rows.push({ full_name: name, department: r.dept, months: r.months.slice(0, MONTH_COUNT), note: String(r.note || '').trim() });
    }
    return { rows, blank, dup };
  }

  async function saveFundToD1() {
    if (!state.loaded) return showToast(t('errNotLoaded'), 'error');

    // Hạn đóng: ngày không tồn tại (vd 30/2) sẽ bị trang công khai bỏ qua âm thầm → chặn ngay tại đây
    for (let i = 0; i < MONTH_COUNT; i++) {
      const day = state.deadlines[i];
      if (day > 0 && day > daysInMonth(i)) {
        state.calMonthIdx = i;
        renderDeadlineCalendar();
        return showToast(t('errDeadlineInvalid', { month: monthLabels(curLang())[i], day }), 'error');
      }
    }

    const bank = collectBankInfo();
    if (bank.qrHtml10k && !isValidQr(bank.qrHtml10k)) {
      $('bankQrInput').focus();
      return showToast(t('errQrInvalid'), 'error');
    }

    const { rows, blank, dup } = collectFundPayload();
    if (!rows.length) return showToast(t('errEmptyFund'), 'error');
    if (dup > 0 && !window.confirm(t('confirmDup', { n: dup }))) return;

    const payload = { rows, deadlines: state.deadlines.slice(0, MONTH_COUNT) };
    // Nếu D1 chỉ có rawHtml (chưa tách được trường nào) và người dùng chưa nhập gì → không gửi bankInfo để khỏi ghi đè rỗng
    const raw = state.bankInfoRaw || {};
    const hadStructured = !!(raw.accountNumber || raw.stk || raw.bankName || raw.accountName || raw.qrHtml10k || raw.qrUrl);
    if (Object.values(bank).some(Boolean) || hadStructured) payload.bankInfo = bank;

    await exclusive($('saveFundBtn'), async () => {
      try {
        await postWorkerJson('/api/admin/fund/save', payload);
        if (payload.bankInfo) state.bankInfoRaw = payload.bankInfo;
        state.fund = state.fund.filter((r) => CTEC.normalizeMemberName(r.name));
        state.fund.forEach((r) => { r.name = CTEC.normalizeMemberName(r.name); });
        state.selected.fund.clear();
        setDirty('fund', false);
        renderFundEditor();
        let msg = t('toastSavedFund', { n: rows.length });
        if (blank) msg += ` ${t('warnBlankDropped', { n: blank })}`;
        showToast(msg, 'success');
      } catch (err) {
        console.error('[admin-app] Save fund failed:', err);
        showToast(t('toastSaveFail', { msg: errMsg(err) }), 'error');
      }
    });
  }

  /* ======================================================================
   * 12. ĐỒNG BỘ ROSTER → FUND
   * ==================================================================== */
  function syncMembersFromRosterToFund() {
    const prune = !!$('pruneMissingOnSyncCheckbox')?.checked;

    const rosterPairs = new Map();
    for (const r of state.roster) {
      const name = CTEC.normalizeMemberName(r.name);
      if (!name) continue;
      const key = pairKey(name, r.dept);
      if (!rosterPairs.has(key)) rosterPairs.set(key, { name, dept: r.dept });
    }
    if (!rosterPairs.size) return showToast(t('errSyncEmpty'), 'warn');

    const fundPairs = new Set(state.fund.map((f) => pairKey(f.name, f.dept)));
    const orphans = state.fund.filter((f) => !rosterPairs.has(pairKey(f.name, f.dept)));
    const orphanUsed = new Set();
    let added = 0;
    let moved = 0;
    let removed = 0;

    for (const [key, info] of rosterPairs) {
      if (fundPairs.has(key)) continue;
      // Cùng tên nhưng khác ban → coi là chuyển ban: giữ nguyên lịch sử đóng quỹ thay vì tạo dòng mới
      const nameKey = CTEC.buildMemberNameKey(info.name);
      const candidate = orphans.find((o) => !orphanUsed.has(o.uid) && CTEC.buildMemberNameKey(o.name) === nameKey);
      if (candidate) {
        candidate.dept = info.dept;
        orphanUsed.add(candidate.uid);
        moved++;
      } else {
        state.fund.push(makeFundRow({ name: info.name, dept: info.dept }));
        added++;
      }
    }

    if (prune) {
      const dead = new Set(orphans.filter((o) => !orphanUsed.has(o.uid)).map((o) => o.uid));
      removed = dead.size;
      state.fund = state.fund.filter((f) => !dead.has(f.uid));
      dead.forEach((id) => state.selected.fund.delete(id));
    }

    if (!added && !moved && !removed) return showToast(t('toastSyncNoop'), 'info');

    const search = $('fundSearchInput');
    if (search && search.value) search.value = '';
    setDirty('fund');
    renderFundEditor();
    showToast(t('toastSyncDone', { added, moved, removed }), 'success', 6000);
  }

  /* ======================================================================
   * 13. NHẬP TỪ GOOGLE SHEET
   * ==================================================================== */
  const HEADER_NAMES = new Set(['name', 'full name', 'ho va ten', 'ho ten', 'ten']);
  const isHeaderName = (s) => HEADER_NAMES.has(CTEC.normText(s));
  const DEADLINE_ROW_RE = /deadline|hạn đóng|kỳ hạn/i;

  // Có cột STT hay không: tiêu đề "STT/No/#" hoặc một trong vài dòng đầu có ô đầu toàn chữ số
  // (tên người không bao giờ chỉ gồm chữ số nên cách này chắc hơn so với chỉ nhìn dòng thứ 2)
  function detectHasNoCol(grid) {
    if (!grid.length) return false;
    if (['stt', 'no', 'no.', '#'].includes(CTEC.normText(grid[0][0]))) return true;
    return grid.slice(0, 6).some((r) => /^\d+$/.test(String(r[0] ?? '').trim()));
  }

  function resolveDept(raw) {
    const s = String(raw ?? '').trim();
    const key = s ? CTEC.canonDept(s, null) : null;
    return { dept: key || CTEC.DEFAULT_DEPT, unknown: !!s && !key };
  }

  function parseRosterGrid(grid) {
    const off = detectHasNoCol(grid) ? 1 : 0;
    const rows = [];
    let unknownDept = 0;
    for (const c of grid) {
      const name = CTEC.normalizeMemberName(c[off]);
      if (!name || isHeaderName(name)) continue;
      const d = resolveDept(c[off + 1]);
      if (d.unknown) unknownDept++;
      rows.push(makeRosterRow({
        name,
        dept: d.dept,
        role: normalizeRole(c[off + 2]),
        status: normalizeMemberStatus(c[off + 3])
      }));
    }
    return { rows, unknownDept, deadlines: null };
  }

  function parseFundGrid(grid) {
    const off = detectHasNoCol(grid) ? 1 : 0;
    const rows = [];
    let unknownDept = 0;
    let deadlines = null;
    for (const c of grid) {
      if (c.slice(0, 3).some((v) => DEADLINE_ROW_RE.test(String(v ?? '').normalize('NFC')))) {
        deadlines = Array.from({ length: MONTH_COUNT }, (_, m) => {
          const day = CTEC.parseDeadlineDay(c[off + 2 + m]);
          return day > 0 && day <= daysInMonth(m) ? day : 0;
        });
        continue;
      }
      const name = CTEC.normalizeMemberName(c[off]);
      if (!name || isHeaderName(name)) continue;
      const d = resolveDept(c[off + 1]);
      if (d.unknown) unknownDept++;
      rows.push(makeFundRow({
        name,
        dept: d.dept,
        months: Array.from({ length: MONTH_COUNT }, (_, m) => c[off + 2 + m]),
        note: c[off + 2 + MONTH_COUNT]
      }));
    }
    return { rows, unknownDept, deadlines };
  }

  let lastModalKind = null;
  function updateImportModalTexts() {
    const fund = state.importTarget === 'fund';
    const title = $('sheetImportTitle');
    const hint = $('sheetImportHint');
    if (title) title.textContent = t(fund ? 'importTitleFund' : 'importTitleRoster');
    if (hint) hint.textContent = t(fund ? 'importHintFund' : 'importHintRoster');
  }

  function openSheetImportModal(kind) {
    state.importTarget = kind === 'fund' ? 'fund' : 'roster';
    if (lastModalKind !== state.importTarget) {
      $('sheetPasteArea').value = '';
      $('sheetUrlInput').value = '';
    }
    lastModalKind = state.importTarget;
    updateImportModalTexts();
    $('sheetImportModal').classList.remove('hidden');
    $('sheetUrlInput').focus();
  }

  function closeSheetImportModal() {
    $('sheetImportModal')?.classList.add('hidden');
  }

  async function fetchFromGoogleSheetUrl() {
    const url = $('sheetUrlInput').value.trim();
    if (!url) return showToast(t('errNeedUrl'), 'error', 3000);
    const btn = $('fetchSheetUrlBtn');
    const icon = $('fetchSheetUrlIcon');
    btn.disabled = true;
    icon?.classList.add('fa-spin');
    try {
      const payload = await CTEC.adminWorkerJson(`/api/admin/fetch-sheet?url=${encodeURIComponent(url)}`);
      const csv = String(payload.csv ?? '');
      $('sheetPasteArea').value = csv;
      showToast(t('toastFetchSheetOk', { n: CTEC.parseCsvRows(csv).length }), 'success');
    } catch (err) {
      console.error('[admin-app] Fetch sheet failed:', err);
      showToast(t('toastFetchSheetFail', { msg: errMsg(err) }), 'error');
    } finally {
      btn.disabled = false;
      icon?.classList.remove('fa-spin');
    }
  }

  function applySheetImportToDraft() {
    const grid = CTEC.parseSheetPasteText($('sheetPasteArea').value);
    if (!grid.length) return showToast(t('errEmptyImport'), 'error');

    const kind = state.importTarget;
    const parsed = kind === 'fund' ? parseFundGrid(grid) : parseRosterGrid(grid);
    if (!parsed.rows.length && !parsed.deadlines) return showToast(t('errNoRowsParsed'), 'error');

    const replace = !!$('sheetReplaceMode').checked;
    let incoming = parsed.rows;
    let skipped = 0;
    if (!replace) {
      const existing = new Set(state[kind].map((r) => pairKey(r.name, r.dept)));
      incoming = incoming.filter((r) => {
        const k = pairKey(r.name, r.dept);
        if (existing.has(k)) { skipped++; return false; }
        existing.add(k);
        return true;
      });
    }

    if (parsed.rows.length || replace) state[kind] = replace ? incoming : state[kind].concat(incoming);
    state.selected[kind].clear();
    state.anchor[kind] = null;

    if (kind === 'fund' && parsed.deadlines) {
      state.deadlines = parsed.deadlines;
      renderDeadlineCalendar();
    }

    setDirty(kind);
    const searchId = kind === 'roster' ? 'rosterSearchInput' : 'fundSearchInput';
    if ($(searchId)) $(searchId).value = '';
    renderKind(kind);
    closeSheetImportModal();
    $('sheetPasteArea').value = '';

    let msg = t('toastImportOk', { n: incoming.length });
    if (skipped) msg += t('toastImportSkippedDup', { n: skipped });
    if (kind === 'fund' && parsed.deadlines) msg += t('toastImportDeadlines');
    if (parsed.unknownDept) msg += t('toastImportUnknownDept', { n: parsed.unknownDept });
    showToast(msg, parsed.unknownDept ? 'warn' : 'success', parsed.unknownDept ? 8000 : 5000);
  }

  /* ======================================================================
   * 14. ĐỒNG BỘ SHEET GỐC & RESET D1
   * ==================================================================== */
  async function migrateFromWorkerSheets() {
    if (!window.confirm(t('confirmMigrate'))) return;
    await exclusive($('migrateWorkerBtn'), async () => {
      try {
        const res = await postWorkerJson('/api/admin/migrate-from-sheet', {});
        let migrateMsg = t('toastMigrateOk', { r: res.rosterCount ?? 0, f: res.fundCount ?? 0 });
        if (res.bankInfoKept) migrateMsg += t('toastMigrateBankKept');
        if (res.unknownDept) migrateMsg += t('toastMigrateUnknownDept', { n: res.unknownDept });
        showToast(migrateMsg, res.unknownDept ? 'warn' : 'success', res.unknownDept ? 8000 : undefined);
        setDirty('roster', false);
        setDirty('fund', false);
      } catch (err) {
        console.error('[admin-app] Migrate failed:', err);
        showToast(t('toastMigrateFail', { msg: errMsg(err) }), 'error');
        return false;
      }
      return true;
    }).then((ok) => { if (ok) loadAllAdminData(true); });
  }

  const kindLabel = (kind) => t(kind === 'roster' ? 'kindRoster' : 'kindFund');

  function updateResetButtonTitle() {
    const btn = $('resetD1Btn');
    if (btn) btn.title = t('resetD1Title', { kind: kindLabel(state.tab) });
  }

  async function resetCurrentTabD1() {
    const kind = state.tab;
    const word = 'RESET';
    const answer = window.prompt(t('promptReset', { kind: kindLabel(kind), word }), '');
    if (answer === null) return;
    if (answer.trim().toUpperCase() !== word) return showToast(t('toastResetCancelled'), 'info', 2500);

    await exclusive($('resetD1Btn'), async () => {
      try {
        // allowEmpty là "cờ an toàn" của Worker: thiếu nó thì Worker từ chối xóa bảng bằng mảng rỗng
        await postWorkerJson(kind === 'roster' ? '/api/admin/roster/save' : '/api/admin/fund/save', { rows: [], allowEmpty: true });
        state[kind] = [];
        state.selected[kind].clear();
        setDirty(kind, false);
        renderKind(kind);
        showToast(t('toastResetOk', { kind: kindLabel(kind) }), 'success');
      } catch (err) {
        console.error('[admin-app] Reset failed:', err);
        showToast(t('toastResetFail', { msg: errMsg(err) }), 'error');
      }
    });
  }

  /* ======================================================================
   * 15. TAB
   * ==================================================================== */
  function switchAdminTab(tab) {
    state.tab = tab === 'fund' ? 'fund' : 'roster';
    $('panelRoster').classList.toggle('hidden', state.tab !== 'roster');
    $('panelFund').classList.toggle('hidden', state.tab !== 'fund');

    Object.entries(TAB_CFG).forEach(([key, cfg]) => {
      const active = key === state.tab;
      const btn = $(cfg.btn);
      const badge = $(cfg.badge);
      Object.values(TAB_CFG).forEach((c) => btn.classList.remove(...c.on));
      btn.classList.remove(...TAB_OFF);
      btn.classList.add(...(active ? cfg.on : TAB_OFF));
      btn.setAttribute('aria-selected', String(active));
      badge.classList.remove(...BADGE_ON, ...BADGE_OFF);
      badge.classList.add(...(active ? BADGE_ON : BADGE_OFF));
    });

    updateResetButtonTitle();
    try { history.replaceState(null, '', `#${state.tab}`); } catch (_) { /* file:// */ }
  }

  /* ======================================================================
   * 16. KHỞI TẠO
   * ==================================================================== */
  function init() {
    injectStyles();
    bindEditorEvents();
    fillBulkSelects();
    applyAdminStaticI18n();
    renderFundHead();
    renderDeadlineCalendar();
    switchAdminTab(location.hash === '#fund' ? 'fund' : 'roster');

    window.addEventListener('ctec:langchange', () => {
      applyAdminStaticI18n();
      updateImportModalTexts();
      renderAll();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        state.tab === 'fund' ? saveFundToD1() : saveRosterToD1();
      } else if (e.key === 'Escape' && !$('sheetImportModal').classList.contains('hidden')) {
        closeSheetImportModal();
      }
    });

    window.addEventListener('beforeunload', (e) => {
      if (!anyDirty()) return;
      e.preventDefault();
      e.returnValue = '';
    });

    loadAllAdminData(true);
  }

  // Các hàm được gọi trực tiếp từ thuộc tính onclick/oninput/onchange trong index.html
  Object.assign(window, {
    switchAdminTab,
    loadAllAdminData,
    migrateFromWorkerSheets,
    resetCurrentTabD1,
    renderRosterEditor,
    renderFundEditor,
    openSheetImportModal,
    closeSheetImportModal,
    fetchFromGoogleSheetUrl,
    applySheetImportToDraft,
    addRosterRow,
    saveRosterToD1,
    toggleSelectAllRoster,
    clearRosterSelection,
    applyBulkRosterDept,
    applyBulkRosterRole,
    applyBulkRosterStatus,
    deleteSelectedRosterRows,
    saveFundToD1,
    syncMembersFromRosterToFund,
    clearFundSelection,
    applyBulkFundAllMonths,
    deleteSelectedFundRows
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
