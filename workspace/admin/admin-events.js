/* ============================================================================
 * CTEC Administrator — admin-events.js
 * ----------------------------------------------------------------------------
 * Trình soạn thảo Tab 3: Lịch trình / Sự kiện (Schedule / Events) chạy trên bản
 * NHÁP trong trình duyệt, dùng 5 WheelPicker ('Ngày', 'Tháng', 'Năm', 'Giờ',
 * 'Phút') cho mỗi sự kiện, yêu cầu xác thực ADMIN_TOKEN trước mọi thao tác chỉnh
 * sửa và ghi lên Cloudflare Worker / D1.
 *
 * Phụ thuộc : ../assets/ctec-core.js  (window.CTEC)
 *             ./admin-app.js          (tải trước file này)
 * Worker API: GET  /api/events?fresh=
 *             POST /api/admin/events/save
 * ========================================================================== */
(() => {
  'use strict';

  if (!window.CTEC) {
    console.error('[admin-events] Thiếu window.CTEC — hãy nạp ../assets/ctec-core.js trước admin-events.js');
    return;
  }
  const CTEC = window.CTEC;

  /* ======================================================================
   * 1. HẰNG SỐ & TRẠNG THÁI
   * ==================================================================== */
  const DEFAULT_EVENT_TIME = '08:00';
  const BASE_YEARS = [2026, 2027];

  const eventsState = {
    events: [],       // [{ uid, date, time, title, description }]
    dirty: false,
    loaded: false,
    busy: false,
    activeTab: location.hash === '#events' ? 'events' : (location.hash === '#fund' ? 'fund' : 'roster')
  };

  let eventUidSeq = 0;
  const nextEventUid = () => `ev_${++eventUidSeq}`;
  const $ = (id) => document.getElementById(id);
  const esc = CTEC.escapeHtml;
  const curLang = () => CTEC.getSavedLang();
  const pad2 = (n) => String(n).padStart(2, '0');

  /* ======================================================================
   * 2. I18N (vi / en)
   * ==================================================================== */
  const EVENTS_I18N = {
    vi: {
      tabEvents: 'Lịch trình (Schedule)',
      eventsEditorTitle: 'Quản lý lịch trình sự kiện CLB (Tháng 8/2026 – Tháng 12/2027)',
      addEventBtn: 'Thêm sự kiện',
      saveEventsBtn: 'Lưu sự kiện',
      colNo: 'STT',
      colEventDate: 'Ngày / Tháng / Năm',
      colEventTime: 'Giờ : Phút',
      colEventTitle: 'Tiêu đề sự kiện',
      colEventDesc: 'Mô tả sự kiện',
      colDelete: 'Xóa',
      wheelCapDay: 'Ngày',
      wheelCapMonth: 'Tháng',
      wheelCapYear: 'Năm',
      wheelCapHour: 'Giờ',
      wheelCapMinute: 'Phút',
      wheelScrollHint: 'Cuộn hoặc kéo',
      wheelDoneBtn: 'Xong',
      eventsNote1: 'Lưu ý:',
      eventsNote2: 'Dùng 5 WheelPicker (Ngày, Tháng, Năm, Giờ, Phút — múi giờ Việt Nam UTC+7) để chỉnh thời gian cho từng sự kiện',
      eventsNote3: 'Sự kiện sẽ hiển thị trên trang Lịch trình công khai sau khi lưu',
      eventsNote4: 'Đồng hồ Event Countdown sẽ đếm ngược đến sự kiện bạn bấm chọn trên lịch hoặc danh sách sắp tới',

      // Động
      eventsCount: '{n} sự kiện',
      loadingEvents: 'Đang tải danh sách sự kiện từ D1...',
      emptyEvents: 'Chưa có sự kiện nào. Bấm “Thêm sự kiện” để tạo mốc sự kiện mới.',
      titlePlaceholder: 'Nhập tên sự kiện...',
      descPlaceholder: 'Mô tả chi tiết nội dung, địa điểm hoặc ghi chú...',
      deleteEventTitle: 'Xóa sự kiện này khỏi bảng nháp',
      toastBusy: 'Đang xử lý, vui lòng đợi...',
      toastLoadFail: 'Không tải được danh sách sự kiện từ D1: {msg}',
      errNotLoaded: 'Chưa tải được dữ liệu sự kiện từ D1 nên tạm khóa lưu. Hãy bấm “Tải lại từ D1”.',
      errEmptyEvents: 'Danh sách sự kiện đang trống — hệ thống từ chối ghi đè D1 bằng dữ liệu rỗng. Muốn xóa sạch hãy dùng nút Reset D1.',
      errInvalidDate: 'Dòng {row}: Ngày sự kiện không hợp lệ (cần định dạng YYYY-MM-DD).',
      errInvalidTime: 'Dòng {row}: Giờ sự kiện không hợp lệ (cần định dạng HH:MM).',
      errMissingTitle: 'Dòng {row}: Vui lòng nhập tiêu đề sự kiện.',
      warnBlankDropped: 'Đã bỏ qua {n} dòng trống.',
      toastSavedEvents: 'Đã lưu {n} sự kiện lên D1.',
      toastSaveFail: 'Lưu sự kiện thất bại: {msg}',
      kindEvents: 'Lịch trình (Schedule)',
      resetEventsTitle: 'Xóa toàn bộ dữ liệu Lịch trình (Events) trên D1',
      promptResetEvents: 'Thao tác này XÓA TOÀN BỘ dữ liệu Lịch trình (Events) trên D1 và không thể hoàn tác.\nGõ {word} để xác nhận:',
      toastResetCancelled: 'Đã hủy Reset D1.',
      toastResetEventsOk: 'Đã xóa sạch bảng Lịch trình (Events) trên D1.',
      toastResetFail: 'Reset thất bại: {msg}',
      errNetwork: 'Không kết nối được tới máy chủ. Kiểm tra mạng/adblock hoặc cấu hình CORS của Worker.'
    },
    en: {
      tabEvents: 'Schedule',
      eventsEditorTitle: 'Club Schedule & Events Manager (Aug 2026 – Dec 2027)',
      addEventBtn: 'Add event',
      saveEventsBtn: 'Save events',
      colNo: 'No.',
      colEventDate: 'Day / Month / Year',
      colEventTime: 'Hour : Minute',
      colEventTitle: 'Event title',
      colEventDesc: 'Event description',
      colDelete: 'Delete',
      wheelCapDay: 'Day',
      wheelCapMonth: 'Month',
      wheelCapYear: 'Year',
      wheelCapHour: 'Hour',
      wheelCapMinute: 'Minute',
      wheelScrollHint: 'Scroll or drag',
      wheelDoneBtn: 'Done',
      eventsNote1: 'Notes:',
      eventsNote2: 'Use the 5 WheelPickers (Day, Month, Year, Hour, Minute — Vietnam time UTC+7) to set each event time',
      eventsNote3: 'Events appear on the public Schedule page once saved',
      eventsNote4: 'The Event Countdown timer counts down to whichever event is selected on the calendar or upcoming list',

      // Dynamic
      eventsCount: '{n} event(s)',
      loadingEvents: 'Loading events from D1...',
      emptyEvents: 'No events yet. Press “Add event” to create a new event entry.',
      titlePlaceholder: 'Enter event title...',
      descPlaceholder: 'Details, venue, or notes...',
      deleteEventTitle: 'Remove this event from draft',
      toastBusy: 'Working, please wait...',
      toastLoadFail: 'Could not load events from D1: {msg}',
      errNotLoaded: 'Events have not been loaded from D1 yet, so saving is locked. Press “Reload from D1”.',
      errEmptyEvents: 'The Events list is empty — the server refuses to overwrite D1 with empty data. Use Reset D1 to wipe it on purpose.',
      errInvalidDate: 'Row {row}: Invalid event date (expected YYYY-MM-DD).',
      errInvalidTime: 'Row {row}: Invalid event time (expected HH:MM).',
      errMissingTitle: 'Row {row}: Please enter an event title.',
      warnBlankDropped: 'Skipped {n} empty row(s).',
      toastSavedEvents: 'Saved {n} event(s) to D1.',
      toastSaveFail: 'Save failed: {msg}',
      kindEvents: 'Schedule',
      resetEventsTitle: 'Delete all Schedule / Events data in D1',
      promptResetEvents: 'This DELETES ALL Schedule / Events data in D1 and cannot be undone.\nType {word} to confirm:',
      toastResetCancelled: 'Reset D1 cancelled.',
      toastResetEventsOk: 'The Schedule / Events table in D1 has been wiped.',
      toastResetFail: 'Reset failed: {msg}',
      errNetwork: 'Cannot reach the server. Check your connection/ad blocker or Worker CORS configuration.'
    }
  };

  function t(key, vars) {
    const dict = EVENTS_I18N[curLang()] || EVENTS_I18N.vi;
    let str = dict[key] ?? EVENTS_I18N.vi[key] ?? key;
    if (vars) str = str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
    return str;
  }

  function applyEventsStaticI18n() {
    const dict = EVENTS_I18N[curLang()] || EVENTS_I18N.vi;

    const tabSpan = $('tabBtnEvents')?.querySelector('[data-i18n="tabEvents"]');
    if (tabSpan && dict.tabEvents) tabSpan.textContent = dict.tabEvents;

    const panel = $('panelEvents');
    if (panel) {
      panel.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (typeof dict[key] === 'string') el.textContent = dict[key];
      });
    }

    updateEventsStats();
    if (eventsState.activeTab === 'events') {
      const resetBtn = $('resetD1Btn');
      if (resetBtn) resetBtn.title = t('resetEventsTitle');
    }
  }

  /* ======================================================================
   * 3. TIỆN ÍCH (Auth check, Toast, Busy, Dirty, Validate, Wheel Options)
   * ==================================================================== */
  function checkAdminAuth() {
    if (typeof window.requireAdminAuth === 'function') {
      return window.requireAdminAuth();
    }
    if (window.__ctecAdminAuthenticated && CTEC.getAdminToken()) return true;
    if (typeof window.openAdminAuthModal === 'function') window.openAdminAuthModal(false);
    return false;
  }

  const TOAST_STYLES = {
    success: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'fa-circle-check' },
    error: { cls: 'bg-red-50 text-red-700 border-red-200', icon: 'fa-circle-exclamation' },
    warn: { cls: 'bg-amber-50 text-amber-800 border-amber-200', icon: 'fa-triangle-exclamation' },
    info: { cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: 'fa-circle-info' }
  };
  const ALL_TOAST_CLASSES = Object.values(TOAST_STYLES).flatMap((s) => s.cls.split(' '));
  let toastTimer = null;

  function showToast(message, type = 'success', ms) {
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
      return t('errNetwork');
    }
    return m || 'Unknown error';
  }

  function setEventsDirty(value = true) {
    eventsState.dirty = value;
    $('saveEventsBtn')?.classList.toggle('admin-dirty', value);
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

  async function exclusiveEvents(btn, fn) {
    if (eventsState.busy) {
      showToast(t('toastBusy'), 'warn', 2000);
      return undefined;
    }
    eventsState.busy = true;
    setBtnBusy(btn, true);
    try {
      return await fn();
    } finally {
      eventsState.busy = false;
      setBtnBusy(btn, false);
    }
  }

  const daysInYearMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();

  function parseYmdParts(str) {
    const m = String(str || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return { year: 2026, month: 11, day: 28 };
    const year = parseInt(m[1], 10);
    const month = Math.max(1, Math.min(12, parseInt(m[2], 10)));
    const maxD = daysInYearMonth(year, month);
    const day = Math.max(1, Math.min(maxD, parseInt(m[3], 10)));
    return { year, month, day };
  }

  function formatYmdParts({ year, month, day }) {
    const maxD = daysInYearMonth(year, month);
    const safeDay = Math.max(1, Math.min(maxD, day));
    return `${year}-${pad2(month)}-${pad2(safeDay)}`;
  }

  function parseHmParts(str) {
    const m = String(str || '').trim().match(/^([01]?\d|2[0-3]):([0-5]\d)/);
    if (!m) return { hour: 0, minute: 0 };
    return { hour: parseInt(m[1], 10), minute: parseInt(m[2], 10) };
  }

  function formatHmParts({ hour, minute }) {
    return `${pad2(hour)}:${pad2(minute)}`;
  }

  function isValidYmd(str) {
    const m = String(str || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return false;
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10);
    const d = parseInt(m[3], 10);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
    const dt = new Date(Date.UTC(y, mo - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
  }

  function normalizeTimeHm(raw, fallback = '00:00') {
    const str = String(raw ?? '').trim();
    if (!str) return fallback;
    const m = str.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
    if (!m) return null;
    return `${pad2(parseInt(m[1], 10))}:${m[2]}`;
  }

  function isValidHm(str) {
    return normalizeTimeHm(str, null) !== null;
  }

  function makeEventRow(o = {}) {
    const rawTime = o.time ?? o.event_time;
    const cleanTime = normalizeTimeHm(rawTime, '00:00') || '00:00';
    const rawDate = String(o.date ?? o.event_date ?? '').trim();
    const cleanDate = isValidYmd(rawDate) ? rawDate : '2026-11-28';
    return {
      uid: nextEventUid(),
      date: cleanDate,
      time: cleanTime,
      title: String(o.title ?? '').trim(),
      description: String(o.description ?? '').trim()
    };
  }

  function buildDayOptions(year, month) {
    const maxD = daysInYearMonth(year, month);
    const opts = [];
    for (let d = 1; d <= maxD; d++) {
      opts.push({ value: String(d), label: pad2(d) });
    }
    return opts;
  }

  const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: pad2(i + 1)
  }));

  const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
    value: String(i),
    label: pad2(i)
  }));

  const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => ({
    value: String(i),
    label: pad2(i)
  }));

  function buildYearOptions(extraYear) {
    const set = new Set(BASE_YEARS);
    if (Number.isInteger(extraYear) && extraYear >= 2020 && extraYear <= 2035) {
      set.add(extraYear);
    }
    return [...set].sort((a, b) => a - b).map((y) => ({
      value: String(y),
      label: String(y)
    }));
  }

  function injectEventsStyles() {
    if ($('adminEventsStyle')) return;
    const style = document.createElement('style');
    style.id = 'adminEventsStyle';
    style.textContent = `
      html.dark #badgeEventsCount {
        background-color: #1e293b !important;
        color: #e2e8f0 !important;
        border: 1px solid #334155;
      }
      html.dark #tabBtnEvents.bg-amber-600 #badgeEventsCount {
        background-color: rgba(255, 255, 255, 0.2) !important;
        color: #ffffff !important;
        border-color: transparent !important;
      }
      .ev-wheel-trigger {
        padding: 0.375rem 0.5rem;
        font-size: 0.75rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        min-width: 3.35rem;
      }
      .ev-wheel-year .ev-wheel-trigger {
        min-width: 4.25rem;
      }
      .ev-wheel-wrap .wheel-popover {
        min-width: 8.5rem;
      }
    `;
    document.head.appendChild(style);
  }

  /* ======================================================================
   * 4. RENDER BẢNG SỰ KIỆN (5 WHEELPICKERS: NGÀY, THÁNG, NĂM, GIỜ, PHÚT)
   * ==================================================================== */
  function updateEventsStats() {
    const count = eventsState.events.length;
    const badge = $('badgeEventsCount');
    if (badge) badge.textContent = String(count);
    const pill = $('eventsStatsPill');
    if (pill) pill.textContent = t('eventsCount', { n: count });
  }

  function wheelIds(uid) {
    return {
      day: `evW_${uid}_day`,
      month: `evW_${uid}_month`,
      year: `evW_${uid}_year`,
      hour: `evW_${uid}_hour`,
      minute: `evW_${uid}_minute`
    };
  }

  function miniWheelHtml(wheelId, caption, initialLabel, extraWrapCls = '') {
    return `
      <div class="flex flex-col items-center gap-0.5 ${extraWrapCls}">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">${esc(caption)}</span>
        <div id="${wheelId}" class="wheel-picker-wrap ev-wheel-wrap">
          <button type="button" data-ev-wheel-trigger="${wheelId}" class="wheel-trigger ev-wheel-trigger">
            <span id="${wheelId}_lbl">${esc(initialLabel)}</span>
            <i class="fa-solid fa-chevron-down text-[9px] opacity-60"></i>
          </button>
          <div class="wheel-popover">
            <div class="wheel-drum-viewport">
              <div class="wheel-center-highlight"></div>
              <div id="${wheelId}_list" class="wheel-drum-list"></div>
            </div>
            <div class="wheel-footer">
              <span>${esc(t('wheelScrollHint'))}</span>
              <button type="button" class="wheel-confirm-btn" data-wheel-done>${esc(t('wheelDoneBtn'))}</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  function initRowWheels(ev) {
    const ids = wheelIds(ev.uid);
    const dateParts = parseYmdParts(ev.date);
    const timeParts = parseHmParts(ev.time);

    // 1. WheelPicker Ngày
    CTEC.createWheelPicker({
      id: ids.day,
      listId: `${ids.day}_list`,
      labelId: `${ids.day}_lbl`,
      options: buildDayOptions(dateParts.year, dateParts.month),
      onSelect: (val) => {
        const cur = parseYmdParts(ev.date);
        cur.day = parseInt(val, 10) || 1;
        ev.date = formatYmdParts(cur);
        setEventsDirty(true);
      }
    });
    CTEC.setWheelValue(ids.day, String(dateParts.day));

    // 2. WheelPicker Tháng
    CTEC.createWheelPicker({
      id: ids.month,
      listId: `${ids.month}_list`,
      labelId: `${ids.month}_lbl`,
      options: MONTH_OPTIONS,
      onSelect: (val) => {
        const cur = parseYmdParts(ev.date);
        cur.month = parseInt(val, 10) || 1;
        const maxD = daysInYearMonth(cur.year, cur.month);
        if (cur.day > maxD) cur.day = maxD;
        ev.date = formatYmdParts(cur);
        CTEC.updateWheelOptions(ids.day, buildDayOptions(cur.year, cur.month), false);
        CTEC.setWheelValue(ids.day, String(cur.day));
        setEventsDirty(true);
      }
    });
    CTEC.setWheelValue(ids.month, String(dateParts.month));

    // 3. WheelPicker Năm
    CTEC.createWheelPicker({
      id: ids.year,
      listId: `${ids.year}_list`,
      labelId: `${ids.year}_lbl`,
      options: buildYearOptions(dateParts.year),
      onSelect: (val) => {
        const cur = parseYmdParts(ev.date);
        cur.year = parseInt(val, 10) || 2026;
        const maxD = daysInYearMonth(cur.year, cur.month);
        if (cur.day > maxD) cur.day = maxD;
        ev.date = formatYmdParts(cur);
        CTEC.updateWheelOptions(ids.day, buildDayOptions(cur.year, cur.month), false);
        CTEC.setWheelValue(ids.day, String(cur.day));
        setEventsDirty(true);
      }
    });
    CTEC.setWheelValue(ids.year, String(dateParts.year));

    // 4. WheelPicker Giờ
    CTEC.createWheelPicker({
      id: ids.hour,
      listId: `${ids.hour}_list`,
      labelId: `${ids.hour}_lbl`,
      options: HOUR_OPTIONS,
      onSelect: (val) => {
        const cur = parseHmParts(ev.time);
        cur.hour = parseInt(val, 10) || 0;
        ev.time = formatHmParts(cur);
        setEventsDirty(true);
      }
    });
    CTEC.setWheelValue(ids.hour, String(timeParts.hour));

    // 5. WheelPicker Phút
    CTEC.createWheelPicker({
      id: ids.minute,
      listId: `${ids.minute}_list`,
      labelId: `${ids.minute}_lbl`,
      options: MINUTE_OPTIONS,
      onSelect: (val) => {
        const cur = parseHmParts(ev.time);
        cur.minute = parseInt(val, 10) || 0;
        ev.time = formatHmParts(cur);
        setEventsDirty(true);
      }
    });
    CTEC.setWheelValue(ids.minute, String(timeParts.minute));
  }

  function renderEventsEditor() {
    const body = $('eventsEditorBody');
    if (!body) return;
    CTEC.closeAllWheels();
    updateEventsStats();

    if (!eventsState.events.length) {
      body.innerHTML =
        `<tr><td colspan="6" class="py-10 px-4 text-center text-sm text-slate-400">${esc(t('emptyEvents'))}</td></tr>`;
      return;
    }

    const titlePh = esc(t('titlePlaceholder'));
    const descPh = esc(t('descPlaceholder'));
    const delTitle = esc(t('deleteEventTitle'));
    const capDay = t('wheelCapDay');
    const capMonth = t('wheelCapMonth');
    const capYear = t('wheelCapYear');
    const capHour = t('wheelCapHour');
    const capMinute = t('wheelCapMinute');

    body.innerHTML = eventsState.events
      .map((ev, idx) => {
        const ids = wheelIds(ev.uid);
        const d = parseYmdParts(ev.date);
        const tm = parseHmParts(ev.time);
        return (
          `<tr data-uid="${esc(ev.uid)}" class="hover:bg-slate-50/80 transition">` +
            `<td class="py-2.5 px-3 text-center text-xs font-semibold text-slate-400 border-r border-slate-100">${idx + 1}</td>` +
            `<td class="py-2 px-3 border-r border-slate-100">` +
              `<div class="inline-flex items-end gap-1.5">` +
                miniWheelHtml(ids.day, capDay, pad2(d.day)) +
                `<span class="pb-2 text-xs font-bold text-slate-400">/</span>` +
                miniWheelHtml(ids.month, capMonth, pad2(d.month)) +
                `<span class="pb-2 text-xs font-bold text-slate-400">/</span>` +
                miniWheelHtml(ids.year, capYear, String(d.year), 'ev-wheel-year') +
              `</div>` +
            `</td>` +
            `<td class="py-2 px-3 border-r border-slate-100">` +
              `<div class="inline-flex items-end gap-1.5">` +
                miniWheelHtml(ids.hour, capHour, pad2(tm.hour)) +
                `<span class="pb-2 text-xs font-bold text-slate-400">:</span>` +
                miniWheelHtml(ids.minute, capMinute, pad2(tm.minute)) +
              `</div>` +
            `</td>` +
            `<td class="py-2 px-3 border-r border-slate-100">` +
              `<input type="text" data-field="title" value="${esc(ev.title)}" placeholder="${titlePh}" ` +
                     `class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500">` +
            `</td>` +
            `<td class="py-2 px-3 border-r border-slate-100">` +
              `<input type="text" data-field="description" value="${esc(ev.description)}" placeholder="${descPh}" ` +
                     `class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500">` +
            `</td>` +
            `<td class="py-2 px-3 text-center">` +
              `<button type="button" data-act="delete" title="${delTitle}" ` +
                      `class="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 inline-flex items-center justify-center transition cursor-pointer">` +
                `<i class="fa-solid fa-trash-can text-xs"></i>` +
              `</button>` +
            `</td>` +
          `</tr>`
        );
      })
      .join('');

    for (const ev of eventsState.events) {
      initRowWheels(ev);
    }
  }

  function bindEventsEditorListeners() {
    const body = $('eventsEditorBody');
    if (!body || body.dataset.bound === '1') return;
    body.dataset.bound = '1';

    body.addEventListener('input', (e) => {
      const input = e.target.closest('input[data-field]');
      if (!input) return;
      if (!checkAdminAuth()) return;
      const tr = input.closest('tr[data-uid]');
      const row = eventsState.events.find((x) => x.uid === tr?.dataset.uid);
      if (!row) return;
      row[input.dataset.field] = input.value;
      setEventsDirty(true);
    });

    body.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-ev-wheel-trigger]');
      if (trigger) {
        if (!checkAdminAuth()) return;
        const wId = trigger.dataset.evWheelTrigger;
        if (typeof window.openAdminWheelSmart === 'function') {
          window.openAdminWheelSmart(wId, e);
        } else {
          CTEC.toggleWheel(wId, e);
        }
        return;
      }

      if (e.target.closest('[data-wheel-done]')) {
        CTEC.closeAllWheels();
        return;
      }

      if (e.target.closest('.wheel-popover')) {
        e.stopPropagation();
        return;
      }

      const delBtn = e.target.closest('button[data-act="delete"]');
      if (!delBtn) return;
      if (!checkAdminAuth()) return;
      const tr = delBtn.closest('tr[data-uid]');
      const uid = tr?.dataset.uid;
      if (!uid) return;
      eventsState.events = eventsState.events.filter((x) => x.uid !== uid);
      setEventsDirty(true);
      renderEventsEditor();
    });

    const scrollWrap = body.closest('.overflow-x-auto');
    scrollWrap?.addEventListener('scroll', () => CTEC.closeAllWheels(), { passive: true });
  }

  /* ======================================================================
   * 5. THAO TÁC DỮ LIỆU (Load, Add, Save, Reset D1)
   * ==================================================================== */
  async function loadEventsFromD1() {
    const body = $('eventsEditorBody');
    if (body && !eventsState.loaded) {
      body.innerHTML =
        `<tr><td colspan="6" class="py-10 px-4 text-center text-sm text-slate-400">` +
        `<i class="fa-solid fa-spinner fa-spin mr-2 text-amber-500"></i>${esc(t('loadingEvents'))}</td></tr>`;
    }

    try {
      const payload = await CTEC.fetchWorkerJson(`/api/events?fresh=${Date.now()}`);
      const list = Array.isArray(payload.events)
        ? payload.events
        : Array.isArray(payload.rows)
          ? payload.rows
          : [];
      eventsState.events = list.map((item) => makeEventRow(item));
      eventsState.loaded = true;
      setEventsDirty(false);
      renderEventsEditor();
    } catch (err) {
      console.error('[admin-events] Load D1 failed:', err);
      showToast(t('toastLoadFail', { msg: errMsg(err) }), 'error');
      renderEventsEditor();
    }
  }

  function addEventRow() {
    if (!checkAdminAuth()) return;
    const defaultDate = '2026-11-28';
    const last = eventsState.events[eventsState.events.length - 1];
    const row = makeEventRow({
      date: last?.date || defaultDate,
      time: last?.time || DEFAULT_EVENT_TIME,
      title: '',
      description: ''
    });
    eventsState.events.push(row);
    setEventsDirty(true);
    renderEventsEditor();

    const input = $('eventsEditorBody')?.querySelector(`tr[data-uid="${row.uid}"] input[data-field="title"]`);
    input?.focus();
  }

  async function saveEventsToStorage() {
    if (!checkAdminAuth()) return;
    if (!eventsState.loaded) {
      return showToast(t('errNotLoaded'), 'error');
    }

    const cleanRows = [];
    let blankDropped = 0;

    for (let i = 0; i < eventsState.events.length; i++) {
      const ev = eventsState.events[i];
      const date = String(ev.date || '').trim();
      const rawTime = String(ev.time || '').trim();
      const title = String(ev.title || '').trim();
      const description = String(ev.description || '').trim();

      if (!title && !description) {
        blankDropped++;
        continue;
      }

      if (!isValidYmd(date)) {
        return showToast(t('errInvalidDate', { row: i + 1 }), 'error');
      }

      const cleanTime = normalizeTimeHm(rawTime, '00:00');
      if (!cleanTime) {
        return showToast(t('errInvalidTime', { row: i + 1 }), 'error');
      }

      if (!title) {
        const titleInput = $('eventsEditorBody')?.querySelector(`tr[data-uid="${ev.uid}"] input[data-field="title"]`);
        titleInput?.focus();
        return showToast(t('errMissingTitle', { row: i + 1 }), 'error');
      }

      cleanRows.push({ date, time: cleanTime, event_time: cleanTime, title, description });
    }

    if (!cleanRows.length) {
      return showToast(t('errEmptyEvents'), 'error');
    }

    await exclusiveEvents($('saveEventsBtn'), async () => {
      try {
        await CTEC.adminWorkerJson('/api/admin/events/save', {
          method: 'POST',
          body: { rows: cleanRows }
        });

        cleanRows.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
        eventsState.events = cleanRows.map((r) => makeEventRow(r));
        setEventsDirty(false);
        renderEventsEditor();

        let msg = t('toastSavedEvents', { n: cleanRows.length });
        if (blankDropped) msg += ' ' + t('warnBlankDropped', { n: blankDropped });
        showToast(msg, 'success');
      } catch (err) {
        console.error('[admin-events] Save events failed:', err);
        showToast(t('toastSaveFail', { msg: errMsg(err) }), 'error');
      }
    });
  }

  /* ======================================================================
   * 6. TÍCH HỢP VỚI TAB / RELOAD / RESET D1 CỦA admin-app.js
   * ==================================================================== */
  const TAB_OFF = ['text-slate-600', 'hover:text-slate-900'];
  const EVENTS_ON = ['bg-amber-600', 'text-white', 'shadow-sm'];
  const BADGE_ON = ['bg-white/20', 'text-white'];
  const BADGE_OFF = ['bg-slate-200', 'text-slate-700'];

  function setEventsTabVisual(active) {
    const panel = $('panelEvents');
    const btn = $('tabBtnEvents');
    const badge = $('badgeEventsCount');
    if (panel) panel.classList.toggle('hidden', !active);
    if (btn) {
      btn.classList.remove(...EVENTS_ON, ...TAB_OFF);
      btn.classList.add(...(active ? EVENTS_ON : TAB_OFF));
      btn.setAttribute('aria-selected', String(active));
    }
    if (badge) {
      badge.classList.remove(...BADGE_ON, ...BADGE_OFF);
      badge.classList.add(...(active ? BADGE_ON : BADGE_OFF));
    }
  }

  function integrateWithAdminApp() {
    const origSwitchTab = window.switchAdminTab;
    window.switchAdminTab = function patchedSwitchAdminTab(tab) {
      CTEC.closeAllWheels();
      if (tab === 'events') {
        eventsState.activeTab = 'events';
        ['roster', 'fund'].forEach((k) => {
          const p = $(k === 'roster' ? 'panelRoster' : 'panelFund');
          const b = $(k === 'roster' ? 'tabBtnRoster' : 'tabBtnFund');
          const g = $(k === 'roster' ? 'badgeRosterCount' : 'badgeFundCount');
          if (p) p.classList.add('hidden');
          if (b) {
            b.classList.remove('bg-indigo-600', 'bg-emerald-600', 'text-white', 'shadow-sm');
            b.classList.add(...TAB_OFF);
            b.setAttribute('aria-selected', 'false');
          }
          if (g) {
            g.classList.remove(...BADGE_ON);
            g.classList.add(...BADGE_OFF);
          }
        });
        setEventsTabVisual(true);
        const resetBtn = $('resetD1Btn');
        if (resetBtn) resetBtn.title = t('resetEventsTitle');
        try { history.replaceState(null, '', '#events'); } catch (_) { /* file:// */ }
        return;
      }

      eventsState.activeTab = tab === 'fund' ? 'fund' : 'roster';
      setEventsTabVisual(false);
      if (typeof origSwitchTab === 'function') {
        origSwitchTab(tab);
      }
    };

    const origLoadAll = window.loadAllAdminData;
    window.loadAllAdminData = async function patchedLoadAllAdminData(skipConfirm) {
      const tasks = [loadEventsFromD1()];
      if (typeof origLoadAll === 'function') {
        tasks.unshift(origLoadAll(skipConfirm));
      }
      await Promise.all(tasks);
    };

    const origResetD1 = window.resetCurrentTabD1;
    window.resetCurrentTabD1 = async function patchedResetCurrentTabD1() {
      if (eventsState.activeTab !== 'events') {
        if (typeof origResetD1 === 'function') return origResetD1();
        return;
      }

      if (!checkAdminAuth()) return;

      const word = 'RESET';
      const answer = window.prompt(t('promptResetEvents', { word }), '');
      if (answer === null) return;
      if (answer.trim().toUpperCase() !== word) {
        return showToast(t('toastResetCancelled'), 'info', 2500);
      }

      await exclusiveEvents($('resetD1Btn'), async () => {
        try {
          await CTEC.adminWorkerJson('/api/admin/events/save', {
            method: 'POST',
            body: { rows: [], allowEmpty: true }
          });
          eventsState.events = [];
          setEventsDirty(false);
          renderEventsEditor();
          showToast(t('toastResetEventsOk'), 'success');
        } catch (err) {
          console.error('[admin-events] Reset events failed:', err);
          showToast(t('toastResetFail', { msg: errMsg(err) }), 'error');
        }
      });
    };
  }

  /* ======================================================================
   * 7. KHỞI TẠO
   * ==================================================================== */
  function initEventsModule() {
    injectEventsStyles();
    bindEventsEditorListeners();
    integrateWithAdminApp();
    applyEventsStaticI18n();

    document.addEventListener(
      'keydown',
      (e) => {
        if (eventsState.activeTab === 'events' && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          e.stopImmediatePropagation();
          saveEventsToStorage();
        }
      },
      true
    );

    window.addEventListener('ctec:langchange', () => {
      applyEventsStaticI18n();
      renderEventsEditor();
    });

    window.addEventListener('beforeunload', (e) => {
      if (!eventsState.dirty) return;
      e.preventDefault();
      e.returnValue = '';
    });

    if (location.hash === '#events') {
      window.switchAdminTab('events');
    }

    loadEventsFromD1();
  }

  Object.assign(window, {
    addEventRow,
    saveEventsToStorage,
    saveEventsToD1: saveEventsToStorage,
    renderEventsEditor
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEventsModule);
  } else {
    initEventsModule();
  }
})();
