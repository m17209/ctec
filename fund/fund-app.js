const MONTHS_EN = CTEC.FUND_MONTHS_EN;
const MONTHS_VI = CTEC.FUND_MONTHS_VI;
const MONTH_MAP = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

const FUND_I18N = {
  vi: {
    pageTitle: "CTEC Workspace - Fund Management",
    homeTitle: "Về trang chủ CTEC",
    syncTitle: "Đồng bộ dữ liệu quỹ mới nhất",
    refreshFull: "Làm mới dữ liệu",
    refreshShort: "ĐỒNG BỘ",
    transferSubtitle: "Thông tin chuyển khoản",
    transferDeptNote: "Lưu ý: thêm tên ban vào nội dung chuyển khoản!",
    qr2AmountNote: "10 000 VND",
    accountNumberLabel: "Số tài khoản",
    copyStkLabel: "Sao chép",
    copyStkDone: "Đã chép",
    copyStkTitle: "Sao chép số tài khoản",
    accountNameLabel: "Tên tài khoản",
    bankNameLabel: "Ngân hàng",
    statTotalLabel: "Tổng người đóng góp",
    statPaidLabel: "ĐÃ ĐÓNG",
    statUnpaidLabel: "Chưa đóng / Quá hạn",
    statRateLabel: "Tỷ lệ hoàn thành",
    searchPlaceholder: "Tìm theo tên thành viên...",
    filterDeptLabel: "Ban:",
    filterPeriodLabel: "Kỳ thu:",
    filterStatusLabel: "Trạng thái:",
    wheelHint: "Kéo hoặc cuộn",
    wheelDone: "Xong",
    fullTerm: "CẢ KỲ",
    allDepts: "Tất cả các ban",
    allStatuses: "Tất cả trạng thái",
    statusPaid: "Đã đóng",
    statusUnpaid: "Chưa đóng",
    statusDebt: "Nợ quỹ",
    clearedText: "Đã hoàn tất",
    pendingText: "Chờ đóng",
    overdueFromPrefix: "Quá hạn từ ngày",
    entriesSuffix: "lượt",
    colNo: "STT",
    colFullName: "Họ và tên",
    colDept: "Ban",
    colPayStatus: "Trạng thái đóng",
    colArrears: "Tình trạng nợ",
    colNote: "Ghi chú",
    mobileSwipeHint: "Vuốt ngang để xem từng tháng (cột Tên được ghim)",
    loadingText: "Đang đồng bộ dữ liệu quỹ qua hệ thống CTEC...",
    errorTitle: "Không thể lấy dữ liệu quỹ!",
    errorDesc: "Vui lòng thử lại sau ít phút hoặc kiểm tra kết nối mạng.",
    noResultsText: "Không có người đóng góp nào khớp với từ khóa hoặc bộ lọc đã chọn.",
    footerText: "Báo cáo quỹ & tài chính chính thức CTEC | Thực hiện bởi Nhat Minh",
    deptLabels: CTEC.getDeptLabelsMap("vi")
  },
  en: {
    pageTitle: "CTEC Workspace - Fund Management",
    homeTitle: "Back to CTEC Home",
    syncTitle: "Sync latest treasury records",
    refreshFull: "Refresh Data",
    refreshShort: "SYNC",
    transferSubtitle: "Transfer Information",
    transferDeptNote: "Note: include your department name in the transfer memo!",
    qr2AmountNote: "10 000 VND",
    accountNumberLabel: "Account Number",
    copyStkLabel: "Copy",
    copyStkDone: "Copied",
    copyStkTitle: "Copy account number",
    accountNameLabel: "Account Name",
    bankNameLabel: "Bank",
    statTotalLabel: "Total Contributors",
    statPaidLabel: "PAID",
    statUnpaidLabel: "Unpaid / Overdue",
    statRateLabel: "Compliance Rate",
    searchPlaceholder: "Search by member name...",
    filterDeptLabel: "Department:",
    filterPeriodLabel: "Billing Period:",
    filterStatusLabel: "Status:",
    wheelHint: "Drag or scroll",
    wheelDone: "Done",
    fullTerm: "FULL TERM",
    allDepts: "All Departments",
    allStatuses: "All Statuses",
    statusPaid: "Paid",
    statusUnpaid: "Unpaid",
    statusDebt: "In Debt",
    clearedText: "Cleared",
    pendingText: "Pending",
    overdueFromPrefix: "Overdue from",
    entriesSuffix: "entries",
    colNo: "No.",
    colFullName: "Full Name",
    colDept: "Department",
    colPayStatus: "Payment Status",
    colArrears: "Arrears Standing",
    colNote: "Note",
    mobileSwipeHint: "Swipe horizontally to inspect monthly dues (Name column is pinned)",
    loadingText: "Synchronizing treasury records via CTEC system...",
    errorTitle: "Unable to retrieve treasury data!",
    errorDesc: "Please try again in a moment or check your network connection.",
    noResultsText: "No contributors match your search query or selected filters.",
    footerText: "Official CTEC Treasury & Financial Report | Crafted by Nhat Minh",
    deptLabels: CTEC.getDeptLabelsMap("en")
  }
};

function copyBankAccountNumber() {
  const stkText = (document.getElementById("bankAccountNumber")?.textContent || "").trim();
  if (!stkText) return;
  const lang = CTEC.getSavedLang();
  const t = FUND_I18N[lang] || FUND_I18N.vi;
  const icon = document.getElementById("copyStkIcon");
  const label = document.getElementById("copyStkText");

  const markCopied = () => {
    if (icon) icon.className = "fa-solid fa-check text-emerald-600";
    if (label) label.textContent = t.copyStkDone;
    clearTimeout(copyBankAccountNumber._timer);
    copyBankAccountNumber._timer = setTimeout(() => {
      if (icon) icon.className = "fa-regular fa-copy";
      if (label) label.textContent = t.copyStkLabel;
    }, 1800);
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(stkText).then(markCopied).catch(() => {});
  } else {
    const el = document.createElement("textarea");
    el.value = stkText;
    el.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    markCopied();
  }
}

function normalizeDocKey(str) {
  return String(str ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function renderQrFromHtml(containerId, qrHtmlInput) {
  const container = typeof containerId === "string"
    ? document.getElementById(containerId)
    : containerId;
  if (!container) return;

  const trimmed = String(qrHtmlInput ?? "").trim();
  container.innerHTML = "";

  let safeNode = null;
  if (trimmed) {
    if (window.CTEC && typeof window.CTEC.sanitizeQrHtml === "function") {
      safeNode = window.CTEC.sanitizeQrHtml(trimmed);
    }
    if (!safeNode && /^https:\/\/[^\s"'<>]+$/i.test(trimmed)) {
      const img = document.createElement("img");
      img.src = trimmed;
      img.alt = "QR Code 10,000 VND";
      img.loading = "lazy";
      safeNode = img;
    }
  }

  if (safeNode) {
    container.appendChild(safeNode);
    container.classList.remove(
      "border-2",
      "border-dashed",
      "border-slate-300",
      "dark:border-slate-700",
      "bg-slate-50",
      "dark:bg-slate-950/60",
      "p-1"
    );
    container.classList.add("border", "border-slate-200", "p-1.5", "qr-safe-surface");
  } else {
    container.classList.add(
      "border-2",
      "border-dashed",
      "border-slate-300",
      "dark:border-slate-700",
      "bg-slate-50",
      "dark:bg-slate-950/60",
      "p-1"
    );
    container.classList.remove("border", "border-slate-200", "p-1.5", "qr-safe-surface");
  }
}

function parseTransferHtml(htmlText) {
  if (!htmlText) return;
  const doc = new DOMParser().parseFromString(htmlText, "text/html");
  const rows = doc.querySelectorAll("table tr");

  let stk = "";
  let bankName = "";
  let accountName = "";
  let qrHtml10k = "";

  rows.forEach(tr => {
    const cells = tr.querySelectorAll("td, th");
    if (cells.length < 2) return;

    const key = normalizeDocKey(cells[0].textContent);
    const rawValue = (cells[1].textContent || "").replace(/\u00a0/g, " ").trim();
    const embeddedImg = cells[1].querySelector("img");
    const fallbackVal = rawValue || (embeddedImg ? embeddedImg.outerHTML : "");

    if (key === "ma html ma qr 10k" || key.includes("10k") || key.includes("10.000") || key.includes("10 000")) {
      qrHtml10k = fallbackVal;
    } else if (key === "stk" || key.includes("so tai khoan")) {
      stk = rawValue;
    } else if (key.includes("ten ngan hang") || key === "ngan hang") {
      bankName = rawValue;
    } else if (key.includes("ten tai khoan") || key.includes("chu tai khoan")) {
      accountName = rawValue;
    }
  });

  const stkEl = document.getElementById("bankAccountNumber");
  const accNameEl = document.getElementById("bankAccountName");
  const bankEl = document.getElementById("bankName");

  if (stkEl) stkEl.textContent = stk;
  if (accNameEl) accNameEl.textContent = accountName;
  if (bankEl) bankEl.textContent = bankName;

  renderQrFromHtml("qrContainer2", qrHtml10k);
}

function getMonths(lang) {
  return lang === "en" ? MONTHS_EN : MONTHS_VI;
}

function getDeptOptions(lang) {
  const t = FUND_I18N[lang] || FUND_I18N.vi;
  return [
    { value: "ALL", label: t.allDepts },
    ...CTEC.DEPARTMENTS.map(d => ({
      value: d.value,
      label: t.deptLabels[d.value] || CTEC.getDeptLabel(d.value, lang, false)
    }))
  ];
}

function getMonthOptions(lang) {
  const t = FUND_I18N[lang] || FUND_I18N.vi;
  const ms = getMonths(lang);
  return [{ value: "ALL", label: t.fullTerm }, ...ms.map((m, i) => ({ value: String(i), label: m }))];
}

function getStatusOptions(lang) {
  const t = FUND_I18N[lang] || FUND_I18N.vi;
  return [
    { value: "ALL", label: t.allStatuses },
    { value: "PAID", label: t.statusPaid },
    { value: "UNPAID", label: t.statusUnpaid },
    { value: "DEBT", label: t.statusDebt }
  ];
}

function getBadgeHtml(key, lang) {
  const t = FUND_I18N[lang] || FUND_I18N.vi;
  if (key === "PAID") {
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">${CTEC.escapeHtml(t.statusPaid)}</span>`;
  }
  if (key === "DEBT") {
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">${CTEC.escapeHtml(t.statusDebt)}</span>`;
  }
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">${CTEC.escapeHtml(t.statusUnpaid)}</span>`;
}

let rawFunds = [];
let deadlines = new Array(MONTHS_EN.length).fill(0);
let currentDept = "ALL";
let selectedMonthIndex = "ALL";

function getDeadlineDayNumber(deadlineVal) {
  return CTEC.parseDeadlineDay(deadlineVal);
}

function getDeadlineUtcMs(monthIdx, dayVal) {
  const day = getDeadlineDayNumber(dayVal);
  if (day <= 0 || day > 31) return null;
  const [mStr, yStr] = MONTHS_EN[monthIdx].split(" ");
  const m = MONTH_MAP[mStr];
  const y = 2000 + parseInt(yStr, 10);
  const checkDt = new Date(Date.UTC(y, m, day));
  if (checkDt.getUTCFullYear() !== y || checkDt.getUTCMonth() !== m || checkDt.getUTCDate() !== day) {
    return null;
  }
  return Date.UTC(y, m, day, 0, 0, 0, 0) - 7 * 60 * 60 * 1000;
}

function normalizeStatus(status, monthIdx) {
  const up = (status || "").trim().toUpperCase();
  if (up === "PAID" || up.includes("SETTLED") || up.includes("ĐÃ ĐÓNG")) return "PAID";
  if (up.includes("DEBT") || up.includes("OVERDUE") || up.includes("NỢ") || up.includes("QUÁ HẠN")) return "DEBT";

  const deadlineMs = getDeadlineUtcMs(monthIdx, deadlines[monthIdx]);
  const nowMs = CTEC.getServerNowMs ? CTEC.getServerNowMs() : Date.now();
  if (deadlineMs !== null && nowMs >= deadlineMs) {
    return "DEBT";
  }
  return "UNPAID";
}

function renderArrearsBadge(dayVal, lang) {
  const t = FUND_I18N[lang] || FUND_I18N.vi;
  const day = getDeadlineDayNumber(dayVal);
  const label = (day > 0 && day <= 31)
    ? `${t.overdueFromPrefix} ${day}`
    : t.statusDebt;
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">${CTEC.escapeHtml(label)}</span>`;
}

function applyFundStaticI18n(lang) {
  const t = FUND_I18N[lang] || FUND_I18N.vi;
  document.title = t.pageTitle;
  const homeLink = document.getElementById("homeLink");
  if (homeLink) homeLink.title = t.homeTitle;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (t[key] !== undefined) el.placeholder = t[key];
  });
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    if (t[key] !== undefined) el.title = t[key];
  });

  CTEC.updateWheelOptions("deptWheelPicker", getDeptOptions(lang), true);
  CTEC.updateWheelOptions("monthWheelPicker", getMonthOptions(lang), true);
  CTEC.updateWheelOptions("statusWheelPicker", getStatusOptions(lang), true);
}

async function refreshAllData() {
  const reloadBtn = document.getElementById("reloadBtn");
  const reloadIcon = document.getElementById("reloadIcon");
  const loadingState = document.getElementById("loadingState");
  const errorState = document.getElementById("errorState");
  const noResults = document.getElementById("noResults");
  const tableBody = document.getElementById("tableBody");

  if (reloadBtn) reloadBtn.disabled = true;
  if (reloadIcon) reloadIcon.classList.add("fa-spin");
  if (tableBody) tableBody.innerHTML = "";
  errorState?.classList.add("hidden");
  noResults?.classList.add("hidden");
  loadingState?.classList.remove("hidden");
  deadlines = new Array(MONTHS_EN.length).fill(0);

  try {
    const payload = await CTEC.fetchWorkerJson("/api/fund");

    if (payload.bankInfo && typeof payload.bankInfo === "object") {
      const b = payload.bankInfo;
      if (b.rawHtml && !b.accountNumber && !b.stk && !b.qrHtml10k) {
        parseTransferHtml(b.rawHtml);
      } else {
        document.getElementById("bankAccountNumber").textContent = b.accountNumber || b.stk || "";
        document.getElementById("bankAccountName").textContent = b.accountName || "";
        document.getElementById("bankName").textContent = b.bankName || "";
        renderQrFromHtml("qrContainer2", b.qrHtml10k || b.qrUrl || "");
      }
    } else if (payload.transferHtml) {
      parseTransferHtml(payload.transferHtml);
    }

    const list = payload.rows || payload.members || payload.fund || payload.data;
    if (Array.isArray(list)) {
      if (Array.isArray(payload.deadlines)) {
        deadlines = MONTHS_EN.map((_, i) => getDeadlineDayNumber(payload.deadlines[i]));
      }
      rawFunds = list.map(m => {
        const name = String(m.name ?? m.full_name ?? "").trim();
        const dept = String(m.dept || m.department || "").trim();
        const rawMonths = Array.isArray(m.months)
          ? m.months
          : [m.m0, m.m1, m.m2, m.m3, m.m4, m.m5, m.m6, m.m7];
        const months = MONTHS_EN.map((_, idx) => String(rawMonths[idx] ?? "UNPAID").trim());
        return {
          name,
          nameLower: name.toLowerCase(),
          dept,
          deptKey: CTEC.normalizeDeptKey(dept),
          months,
          monthKeys: months.map((st, idx) => normalizeStatus(st, idx)),
          note: String(m.note ?? "").trim()
        };
      }).filter(m => m.name.length > 0);
    } else if (payload.csv) {
      const cells = CTEC.parseCsvRows(payload.csv);
      const tempRows = [];
      cells.forEach(c => {
        const label = c.slice(0, 3).join(" ").toLowerCase();
        if (label.includes("deadline") || label.includes("hạn đóng") || label.includes("kỳ hạn")) {
          deadlines = MONTHS_EN.map((_, m) => getDeadlineDayNumber(c[3 + m]));
          return;
        }
        const name = String(c[1] ?? "").trim();
        if (!name || name.toUpperCase() === "NAME" || name.toUpperCase() === "HỌ VÀ TÊN") return;
        const dept = String(c[2] ?? "").trim();
        tempRows.push({
          name,
          nameLower: name.toLowerCase(),
          dept,
          deptKey: CTEC.normalizeDeptKey(dept),
          months: MONTHS_EN.map((_, m) => String(c[3 + m] ?? "UNPAID").trim()),
          note: String(c[11] ?? "").trim()
        });
      });
      rawFunds = tempRows.map(item => ({
        ...item,
        monthKeys: item.months.map((st, idx) => normalizeStatus(st, idx))
      }));
    } else {
      throw new Error(payload?.error || "Invalid D1 fund payload");
    }

    loadingState?.classList.add("hidden");
    updateStats();
    renderTableHeader();
    renderTable();
  } catch (err) {
    console.error("D1 Fund synchronization error:", err);
    loadingState?.classList.add("hidden");
    errorState?.classList.remove("hidden");
  } finally {
    if (reloadBtn) reloadBtn.disabled = false;
    if (reloadIcon) reloadIcon.classList.remove("fa-spin");
  }
}

function getFilteredFundMembers(allRows, deptFilter) {
  const normalizedRows = (Array.isArray(allRows) ? allRows : []).map((r) => ({
    ...r,
    deptKey: CTEC.normalizeDeptKey(r.deptKey || r.dept)
  }));

  if (!deptFilter || deptFilter === "ALL") {
    const grouped = new Map();
    for (const row of normalizedRows) {
      const key = CTEC.normText(row.name);
      if (!key) continue;

      if (!grouped.has(key)) {
        grouped.set(key, {
          ...row,
          monthKeys: Array.isArray(row.monthKeys) ? row.monthKeys.slice() : [],
          depts: [row.deptKey]
        });
      } else {
        const existing = grouped.get(key);
        if (!existing.depts.includes(row.deptKey)) {
          existing.depts.push(row.deptKey);
        }
        if (Array.isArray(row.monthKeys)) {
          existing.monthKeys = existing.monthKeys.map((st, idx) => {
            const other = row.monthKeys[idx];
            if (st === "PAID" || other === "PAID") return "PAID";
            if (st === "DEBT" || other === "DEBT") return "DEBT";
            return st || other || "UNPAID";
          });
        }
        if (!existing.note && row.note) existing.note = row.note;
      }
    }
    return Array.from(grouped.values());
  }

  const targetDept = CTEC.normalizeDeptKey(deptFilter);
  return normalizedRows
    .filter((row) => row.deptKey === targetDept)
    .map((row) => ({
      ...row,
      depts: [row.deptKey]
    }));
}

function getVisibleFundRows() {
  const searchVal = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const statusFilter = document.getElementById("statusSelect")?.value || "ALL";
  const isAll = selectedMonthIndex === "ALL";
  const filteredMembers = getFilteredFundMembers(rawFunds, currentDept);

  return filteredMembers.filter(item => {
    if (searchVal && !item.nameLower.includes(searchVal)) return false;
    if (statusFilter !== "ALL") {
      const ok = isAll ? item.monthKeys.includes(statusFilter) : item.monthKeys[selectedMonthIndex] === statusFilter;
      if (!ok) return false;
    }
    return true;
  });
}

function updateStats() {
  const lang = CTEC.getSavedLang();
  const t = FUND_I18N[lang] || FUND_I18N.vi;
  const ms = getMonths(lang);
  const isAll = selectedMonthIndex === "ALL";
  const label = isAll ? t.fullTerm : ms[selectedMonthIndex];

  ["selectedPeriodLabel1", "selectedPeriodLabel2", "selectedPeriodLabel3"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = label;
  });

  const filteredMembers = getFilteredFundMembers(rawFunds, currentDept);
  let total = 0, paid = 0, unpaid = 0;
  for (const item of filteredMembers) {
    total++;
    if (isAll) {
      for (const k of item.monthKeys) k === "PAID" ? paid++ : unpaid++;
    } else {
      item.monthKeys[selectedMonthIndex] === "PAID" ? paid++ : unpaid++;
    }
  }

  const denom = isAll ? total * MONTHS_EN.length : total;
  const rate = denom > 0 ? Math.round((paid / denom) * 100) : 0;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("cntPaid").textContent = isAll ? `${paid} ${t.entriesSuffix}` : paid;
  document.getElementById("cntUnpaid").textContent = isAll ? `${unpaid} ${t.entriesSuffix}` : unpaid;
  document.getElementById("completionRate").textContent = `${rate}%`;
}

function renderTableHeader() {
  const lang = CTEC.getSavedLang();
  const t = FUND_I18N[lang] || FUND_I18N.vi;
  const ms = getMonths(lang);

  const base =
    `<th class="py-3.5 px-3 sm:px-4 text-center w-14 border-r border-slate-200 dark:border-slate-800">${CTEC.escapeHtml(t.colNo)}</th>` +
    `<th class="sticky-name-col bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white py-3.5 px-4 sm:px-5 border-r border-slate-200 dark:border-slate-700 min-w-[165px] sm:min-w-[200px]">${CTEC.escapeHtml(t.colFullName)}</th>` +
    `<th class="py-3.5 px-5 border-r border-slate-200 dark:border-slate-800 min-w-[210px]">${CTEC.escapeHtml(t.colDept)}</th>`;

  if (selectedMonthIndex === "ALL") {
    const mCols = ms.map((m, idx) => `<th class="py-3.5 px-3 text-center ${idx < ms.length - 1 ? "border-r border-slate-200 dark:border-slate-800" : ""}">${CTEC.escapeHtml(m)}</th>`).join("");
    document.getElementById("tableHead").innerHTML = `<tr class="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-white border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider">${base}${mCols}</tr>`;
  } else {
    const mName = ms[selectedMonthIndex];
    document.getElementById("tableHead").innerHTML =
      `<tr class="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-white border-b border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider">${base}` +
        `<th class="py-3.5 px-4 text-center border-r border-slate-200 dark:border-slate-800 min-w-[150px]">${CTEC.escapeHtml(t.colPayStatus)} (${CTEC.escapeHtml(mName)})</th>` +
        `<th class="py-3.5 px-4 text-center border-r border-slate-200 dark:border-slate-800 min-w-[150px]">${CTEC.escapeHtml(t.colArrears)} (${CTEC.escapeHtml(mName)})</th>` +
        `<th class="py-3.5 px-5 min-w-[160px]">${CTEC.escapeHtml(t.colNote)}</th>` +
      `</tr>`;
  }
}

function renderTable() {
  const lang = CTEC.getSavedLang();
  const t = FUND_I18N[lang] || FUND_I18N.vi;
  const isAll = selectedMonthIndex === "ALL";
  const visibleMembers = getVisibleFundRows();
  const rows = [];

  visibleMembers.forEach((item, index) => {
    const idx = index + 1;
    const deptList = Array.isArray(item.depts) && item.depts.length > 0 ? item.depts : [item.deptKey];
    const deptBadgesHtml = deptList
      .map(dKey => CTEC.renderDeptBadge(dKey, t.deptLabels[dKey] || item.dept))
      .join(" ");
    const prefix =
      `<tr class="group hover:bg-slate-50 dark:hover:bg-slate-800/60 transition duration-150 border-b border-slate-100 dark:border-slate-800">` +
        `<td class="py-3 px-3 sm:px-4 text-center text-xs font-semibold text-slate-400 border-r border-slate-100 dark:border-slate-800">${idx}</td>` +
        `<td class="sticky-name-col bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/60 py-3 px-4 sm:px-5 font-semibold text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap transition duration-150"><span>${CTEC.escapeHtml(item.name)}</span></td>` +
        `<td class="py-3 px-5 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap"><div class="flex flex-wrap items-center gap-1.5">${deptBadgesHtml}</div></td>`;

    if (isAll) {
      const cells = item.monthKeys.map((k, mIdx) => `<td class="py-3 px-3 text-center ${mIdx < item.monthKeys.length - 1 ? "border-r border-slate-100 dark:border-slate-800" : ""}">${getBadgeHtml(k, lang)}</td>`).join("");
      rows.push(`${prefix}${cells}</tr>`);
    } else {
      const noteText = item.note ? CTEC.escapeHtml(item.note) : "—";
      const key = item.monthKeys[selectedMonthIndex];
      const deadlineDay = deadlines[selectedMonthIndex];
      const debtHtml = key === "DEBT"
        ? renderArrearsBadge(deadlineDay, lang)
        : (key === "PAID"
          ? `<span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">${CTEC.escapeHtml(t.clearedText)}</span>`
          : `<span class="text-xs font-semibold text-amber-700 dark:text-amber-400">${CTEC.escapeHtml(t.pendingText)}</span>`);

      rows.push(
        `${prefix}` +
        `<td class="py-3 px-4 text-center border-r border-slate-100 dark:border-slate-800 bg-indigo-50/30 dark:bg-indigo-950/20">${getBadgeHtml(key, lang)}</td>` +
        `<td class="py-3 px-4 text-center border-r border-slate-100 dark:border-slate-800">${debtHtml}</td>` +
        `<td class="py-3 px-5 text-xs text-slate-500 dark:text-slate-400"><span>${noteText}</span></td></tr>`
      );
    }
  });

  document.getElementById("noResults").classList.toggle("hidden", rows.length > 0);
  document.getElementById("tableBody").innerHTML = rows.join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const initLang = CTEC.getSavedLang();
  CTEC.createWheelPicker({
    id: "deptWheelPicker",
    listId: "deptDrumList",
    labelId: "deptWheelLabel",
    options: getDeptOptions(initLang),
    onSelect: val => { currentDept = val; updateStats(); renderTable(); }
  });
  CTEC.createWheelPicker({
    id: "monthWheelPicker",
    listId: "monthDrumList",
    labelId: "monthWheelLabel",
    selectId: "monthSelect",
    options: getMonthOptions(initLang),
    onSelect: val => { selectedMonthIndex = val === "ALL" ? "ALL" : parseInt(val, 10); updateStats(); renderTableHeader(); renderTable(); }
  });
  CTEC.createWheelPicker({
    id: "statusWheelPicker",
    listId: "statusDrumList",
    labelId: "statusWheelLabel",
    selectId: "statusSelect",
    options: getStatusOptions(initLang),
    onSelect: () => renderTable()
  });

  applyFundStaticI18n(initLang);
  renderTableHeader();

  window.addEventListener("ctec:langchange", e => {
    applyFundStaticI18n(e.detail.lang);
    updateStats();
    renderTableHeader();
    renderTable();
  });

  refreshAllData();
});
