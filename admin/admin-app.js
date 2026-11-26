const EXECUTIVE_DEPT = "EXCUTIVE BOARD";

const DEPARTMENTS = CTEC.DEPARTMENTS;
const ROLES = CTEC.ROLES;
const MEMBER_STATUSES = CTEC.MEMBER_STATUSES;

const FUND_MONTH_LABELS_VI = CTEC.FUND_MONTHS_VI;
const FUND_MONTH_LABELS_EN = CTEC.FUND_MONTHS_EN;
const STATUS_CYCLE = ["UNPAID", "PAID", "DEBT"];

const ADMIN_I18N = {
  vi: {
    pageTitle: "CTEC Administrator",
    homeTitle: "Về trang chủ CTEC",
    navViewRosterFull: "XEM ROSTER",
    navViewRosterShort: "DS",
    navViewFundFull: "XEM FUND",
    navViewFundShort: "QUỸ",
    tabRoster: "Sheet 1: Nhân sự (Roster)",
    tabFund: "Sheet 2: Quỹ CLB (Fund)",
    migrateWorkerBtn: "Đồng bộ Sheet/Docs gốc",
    reloadD1: "Tải lại từ D1",
    resetD1Btn: "Reset D1",
    filterMemberPlaceholder: "Lọc nhanh tên thành viên...",
    rosterSummary: (people, roles) =>
      roles > people
        ? `${people} thành viên (${roles} lượt vai trò)`
        : `${people} thành viên`,
    importSheetBtn: "Nhập từ Google Sheet",
    addMemberBtn: "Thêm thành viên",
    saveRosterBtn: "Lưu Roster lên D1",
    colNo: "STT",
    colFullName: "Họ và tên",
    colDept: "Ban",
    colDeptFull: "Ban (Department)",
    colRoleFull: "Chức vụ (Role)",
    colStatus: "Trạng thái",
    colDelete: "Xóa",
    colNoteFull: "Ghi chú (Note)",
    deadlinesTitle: "Cấu hình ngày hạn đóng hàng tháng (1 - 31, nhập 0 nếu chưa đặt hạn)",
    deadlinesHint: '* Khi qua ngày hạn đóng của tháng tương ứng, trạng thái <strong class="text-amber-600">UNPAID</strong> sẽ tự động hiển thị thành <strong class="text-red-600">DEBT</strong> trên trang công khai.',
    bankInfoTitle: "Thông tin chuyển khoản (Bank Info)",
    bankStkLabel: "Số tài khoản (STK)",
    bankNameLabel: "Ngân hàng",
    bankHolderLabel: "Tên chủ tài khoản",
    bankQrLabel: "URL ảnh QR / Mã HTML QR 10K",
    fundSearchPlaceholder: "Tìm thành viên trong bảng quỹ...",
    fundTipHtml: 'Mẹo: Bấm vào ô tháng để xoay vòng <strong class="text-amber-600">UNPAID</strong> → <strong class="text-emerald-600">PAID</strong> → <strong class="text-red-600">DEBT</strong>',
    pruneMissingLabel: "Xóa người không có trong Roster",
    syncFromRosterTitle: "Đồng bộ danh sách thành viên từ tab Roster sang Fund",
    syncFromRosterBtn: "Đồng bộ từ Roster",
    saveFundBtn: "Lưu Fund lên D1",
    modalBadge: "Tiền xử lý trước khi đẩy D1",
    modalMethod1: "Cách 1: Tải từ Link Google Sheets (đã bật chia sẻ xem) hoặc link xuất CSV",
    modalFetchBtn: "Tải Sheet",
    modalMethod2: "Cách 2: Dán trực tiếp từ Google Sheets (Ctrl + C trên Sheet rồi Ctrl + V vào đây)",
    modalReplaceCheck: "Ghi đè danh sách hiện tại trong bảng nháp",
    modalCancelBtn: "Hủy",
    modalApplyBtn: "Nạp vào bảng xem trước",
    emptyRoster: 'Chưa có dữ liệu thành viên. Nhấn "Thêm thành viên" hoặc "Nhập từ Google Sheet".',
    emptyFund: 'Chưa có dữ liệu quỹ. Nhấn "Đồng bộ từ Roster" hoặc "Nhập từ Google Sheet".',
    namePlaceholder: "Họ và tên...",
    notePlaceholder: "Ghi chú...",
    deleteTitle: "Xóa dòng này",
    confirmDelete: (name) => `Xóa thành viên "${name || 'Chưa đặt tên'}" khỏi Roster?`,
    confirmDeleteFund: (name) => `Xóa thành viên "${name || 'Chưa đặt tên'}" khỏi bảng Quỹ (Fund)?`,
    confirmMigrateWorker: "Thao tác này sẽ kéo dữ liệu trực tiếp từ Google Sheets & Docs gốc cấu hình trên Worker và ghi đè lên D1. Tiếp tục?",
    toastMigrateDone: (r, f) => `Đồng bộ gốc thành công: ${r} Roster, ${f} Fund!`,
    toastMigrateErr: (msg) => `Đồng bộ Sheet/Docs gốc thất bại: ${msg}`,
    confirmDuplicateSameDept: (items) =>
      `Phát hiện tên bị lặp trong cùng một ban (hệ thống vẫn cho phép trùng tên giữa các ban khác nhau):\n\n${items.join("\n")}\n\nBạn có vẫn muốn lưu lên D1 không?`,
    promptResetD1: (label) =>
      `CẢNH BÁO: Thao tác này sẽ xóa sạch dữ liệu ${label} hiện tại trên D1.\nNhập chữ RESET để xác nhận:`,
    toastResetCancelled: "Đã hủy thao tác Reset D1.",
    toastResetRosterDone: "Đã reset toàn bộ dữ liệu Roster trên D1!",
    toastResetFundDone: "Đã reset toàn bộ dữ liệu thành viên & hạn đóng Fund trên D1!",
    toastResetErr: (msg) => `Reset D1 thất bại: ${msg}`,
    toastLoadErr: (msg) => `Lỗi tải dữ liệu: ${msg}`,
    toastInvalidUrl: "Vui lòng nhập đường dẫn Google Sheets hợp lệ.",
    toastFetched: "Đã tải dữ liệu từ Google Sheet. Kiểm tra rồi nhấn Nạp vào bảng xem trước.",
    toastFetchErr: (msg) => `Không tải được tự động do CORS/quyền truy cập (${msg}). Hãy mở Sheet, nhấn Ctrl+A -> Ctrl+C và dán trực tiếp vào ô Cách 2 bên dưới.`,
    toastNoPaste: "Chưa có dữ liệu hợp lệ để nhập.",
    toastNoRosterRows: "Không tìm thấy dòng thành viên hợp lệ trong dữ liệu dán.",
    toastImportedRoster: (people, roles) =>
      roles > people
        ? `Đã nạp ${people} thành viên (${roles} lượt vai trò) vào bảng nháp. Kiểm tra và bấm "Lưu Roster lên D1" khi sẵn sàng.`
        : `Đã nạp ${people} thành viên vào bảng nháp. Kiểm tra và bấm "Lưu Roster lên D1" khi sẵn sàng.`,
    toastNoFundRows: "Không tìm thấy dòng dữ liệu quỹ hợp lệ trong dữ liệu dán.",
    toastImportedFund: (n) => `Đã nạp ${n} thành viên vào bảng Quỹ nháp. Kiểm tra và bấm "Lưu Fund lên D1" khi sẵn sàng.`,
    toastSavedRoster: (people, roles) =>
      roles > people
        ? `Đã lưu ${people} thành viên (${roles} lượt vai trò) vào D1 thành công!`
        : `Đã lưu ${people} thành viên vào D1 thành công!`,
    toastSaveRosterErr: (msg) => `Lưu Roster thất bại: ${msg}`,
    toastSyncedFund: (n, removed) =>
      removed > 0
        ? `Đã đồng bộ ${n} thành viên sang bảng Fund (đã loại bỏ ${removed} người không còn trong Roster)!`
        : `Đã đồng bộ danh sách (${n} thành viên) sang bảng Fund!`,
    toastSavedFund: "Đã lưu dữ liệu Quỹ, Hạn đóng & Thông tin CK lên D1!",
    toastSaveFundErr: (msg) => `Lưu Fund thất bại: ${msg}`
  },
  en: {
    pageTitle: "CTEC Administrator",
    homeTitle: "Back to CTEC Home",
    navViewRosterFull: "VIEW ROSTER",
    navViewRosterShort: "ROSTER",
    navViewFundFull: "VIEW FUND",
    navViewFundShort: "FUND",
    tabRoster: "Sheet 1: Personnel (Roster)",
    tabFund: "Sheet 2: Club Treasury (Fund)",
    migrateWorkerBtn: "Sync Source Sheets/Docs",
    reloadD1: "Reload from D1",
    resetD1Btn: "Reset D1",
    filterMemberPlaceholder: "Quick filter member name...",
    rosterSummary: (people, roles) =>
      roles > people
        ? `${people} members (${roles} role entries)`
        : `${people} members`,
    importSheetBtn: "Import from Google Sheet",
    addMemberBtn: "Add Member",
    saveRosterBtn: "Save Roster to D1",
    colNo: "No.",
    colFullName: "Full Name",
    colDept: "Department",
    colDeptFull: "Department",
    colRoleFull: "Role",
    colStatus: "Status",
    colDelete: "Delete",
    colNoteFull: "Note",
    deadlinesTitle: "Monthly Due Day Config (1 - 31, enter 0 if no deadline set)",
    deadlinesHint: '* Once a month’s due day passes, <strong class="text-amber-600">UNPAID</strong> automatically displays as <strong class="text-red-600">DEBT</strong> on the public page.',
    bankInfoTitle: "Bank Transfer Information",
    bankStkLabel: "Account Number",
    bankNameLabel: "Bank Name",
    bankHolderLabel: "Account Holder Name",
    bankQrLabel: "QR Image URL / 10K QR HTML",
    fundSearchPlaceholder: "Search member in treasury table...",
    fundTipHtml: 'Tip: Click a month cell to cycle <strong class="text-amber-600">UNPAID</strong> → <strong class="text-emerald-600">PAID</strong> → <strong class="text-red-600">DEBT</strong>',
    pruneMissingLabel: "Remove members not in Roster",
    syncFromRosterTitle: "Sync members from Roster tab into Fund tab",
    syncFromRosterBtn: "Sync from Roster",
    saveFundBtn: "Save Fund to D1",
    modalBadge: "Pre-processing before pushing to D1",
    modalMethod1: "Method 1: Load from a Google Sheets link (view-shared) or CSV export URL",
    modalFetchBtn: "Load Sheet",
    modalMethod2: "Method 2: Paste directly from Google Sheets (Ctrl + C on Sheet, then Ctrl + V here)",
    modalReplaceCheck: "Overwrite current draft table rows",
    modalCancelBtn: "Cancel",
    modalApplyBtn: "Load into Preview Table",
    emptyRoster: 'No member records yet. Click "Add Member" or "Import from Google Sheet".',
    emptyFund: 'No treasury records yet. Click "Sync from Roster" or "Import from Google Sheet".',
    namePlaceholder: "Full name...",
    notePlaceholder: "Note...",
    deleteTitle: "Delete this row",
    confirmDelete: (name) => `Remove "${name || 'Unnamed'}" from Roster?`,
    confirmDeleteFund: (name) => `Remove "${name || 'Unnamed'}" from Fund table?`,
    confirmMigrateWorker: "This will pull data directly from the Worker's configured Google Sheets & Docs and overwrite D1. Continue?",
    toastMigrateDone: (r, f) => `Source sync complete: ${r} Roster, ${f} Fund!`,
    toastMigrateErr: (msg) => `Source Sheets/Docs sync failed: ${msg}`,
    confirmDuplicateSameDept: (items) =>
      `Duplicate names found within the same department (cross-department duplicates are allowed):\n\n${items.join("\n")}\n\nSave to D1 anyway?`,
    promptResetD1: (label) =>
      `WARNING: This will wipe all current ${label} data on D1.\nType RESET to confirm:`,
    toastResetCancelled: "Reset D1 cancelled.",
    toastResetRosterDone: "Reset all Roster data on D1!",
    toastResetFundDone: "Reset all Fund members & deadlines on D1!",
    toastResetErr: (msg) => `Reset D1 failed: ${msg}`,
    toastLoadErr: (msg) => `Data load error: ${msg}`,
    toastInvalidUrl: "Please enter a valid Google Sheets URL.",
    toastFetched: "Loaded data from Google Sheet. Review and click Load into Preview Table.",
    toastFetchErr: (msg) => `Auto-fetch blocked by CORS/permissions (${msg}). Open the Sheet, press Ctrl+A -> Ctrl+C, and paste directly into Method 2 below.`,
    toastNoPaste: "No valid data to import.",
    toastNoRosterRows: "No valid member rows found in pasted data.",
    toastImportedRoster: (people, roles) =>
      roles > people
        ? `Loaded ${people} unique members (${roles} role entries) into draft. Review and click "Save Roster to D1" when ready.`
        : `Loaded ${people} members into draft. Review and click "Save Roster to D1" when ready.`,
    toastNoFundRows: "No valid fund rows found in pasted data.",
    toastImportedFund: (n) => `Loaded ${n} unique members into Fund draft. Review and click "Save Fund to D1" when ready.`,
    toastSavedRoster: (people, roles) =>
      roles > people
        ? `Saved ${people} unique members (${roles} role entries) to D1 successfully!`
        : `Saved ${people} members to D1 successfully!`,
    toastSaveRosterErr: (msg) => `Failed to save Roster: ${msg}`,
    toastSyncedFund: (n, removed) =>
      removed > 0
        ? `Synced ${n} members into Fund (removed ${removed} no longer in Roster)!`
        : `Synced ${n} members into the Fund table!`,
    toastSavedFund: "Saved Fund records, Deadlines & Bank Info to D1!",
    toastSaveFundErr: (msg) => `Failed to save Fund: ${msg}`
  }
};

const API_BASE = CTEC.API_BASE_URL;

let rosterRows = [];
let fundRows = [];
let fundDeadlines = [0, 0, 0, 0, 0, 0, 0, 0];
let bankInfo = {
  accountNumber: "",
  accountName: "",
  bankName: "",
  qrHtml10k: "",
  rawHtml: ""
};
let importTargetType = "roster";

function tAdmin() {
  return ADMIN_I18N[CTEC.getSavedLang()] || ADMIN_I18N.vi;
}

function getMonthLabels() {
  return CTEC.getSavedLang() === "en" ? FUND_MONTH_LABELS_EN : FUND_MONTH_LABELS_VI;
}

function getDeptLabel(deptKey) {
  return CTEC.getDeptLabel(deptKey, CTEC.getSavedLang(), false);
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

function parseTransferHtmlToObj(htmlText) {
  const parsed = {
    accountNumber: "",
    accountName: "",
    bankName: "",
    qrHtml10k: ""
  };
  if (!htmlText) return parsed;
  const doc = new DOMParser().parseFromString(htmlText, "text/html");
  doc.querySelectorAll("table tr").forEach(tr => {
    const tds = tr.querySelectorAll("td, th");
    if (tds.length < 2) return;
    const k = normalizeDocKey(tds[0].textContent);
    const v = (tds[1].textContent || "").replace(/\u00a0/g, " ").trim();
    const img = tds[1].querySelector("img");
    const fallback = v || (img ? img.outerHTML : "");
    if (k === "ma html ma qr 10k" || k.includes("10k") || k.includes("10.000") || k.includes("10 000") || k.includes("qr")) {
      parsed.qrHtml10k = fallback;
    } else if (k === "stk" || k.includes("so tai khoan") || k.includes("account number")) {
      parsed.accountNumber = v;
    } else if (k.includes("ten ngan hang") || k === "ngan hang" || k.includes("bank")) {
      parsed.bankName = v;
    } else if (k.includes("ten tai khoan") || k.includes("chu tai khoan") || k.includes("account name")) {
      parsed.accountName = v;
    }
  });
  return parsed;
}

function applyAdminI18n(lang) {
  const activeEl = document.activeElement;
  const focusState =
    activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")
      ? {
          id: activeEl.id,
          rowIdx: activeEl.dataset?.rowIdx,
          field: activeEl.dataset?.field,
          start: activeEl.selectionStart,
          end: activeEl.selectionEnd
        }
      : null;

  const t = ADMIN_I18N[lang] || ADMIN_I18N.vi;
  document.title = t.pageTitle;
  const homeLink = document.getElementById("homeLink");
  if (homeLink) homeLink.title = t.homeTitle;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const key = el.getAttribute("data-i18n-html");
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (t[key] !== undefined) el.placeholder = t[key];
  });
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    if (t[key] !== undefined) el.title = t[key];
  });

  updateRosterCountBadges();
  renderFundEditorHeader();
  renderDeadlinesEditor();

  if (!focusState) {
    renderRosterEditor();
    renderFundEditor();
  } else {
    const target = focusState.id
      ? document.getElementById(focusState.id)
      : document.querySelector(
          `[data-row-idx="${focusState.rowIdx}"][data-field="${focusState.field}"]`
        );
    if (target) {
      target.focus();
      if (typeof focusState.start === "number" && typeof target.setSelectionRange === "function") {
        target.setSelectionRange(focusState.start, focusState.end);
      }
    }
  }
}

function showToast(message, type = "success") {
  const el = document.getElementById("toastBanner");
  const styles = {
    success: "bg-emerald-600 text-white border-emerald-500",
    error: "bg-red-600 text-white border-red-500",
    info: "bg-slate-900 text-white border-slate-700"
  };
  const icons = {
    success: "fa-circle-check",
    error: "fa-triangle-exclamation",
    info: "fa-circle-info"
  };
  el.className = `fixed bottom-5 right-5 left-5 sm:left-auto z-50 sm:max-w-sm px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold flex items-center gap-2.5 ${styles[type] || styles.info}`;
  el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info} shrink-0"></i><span>${CTEC.escapeHtml(message)}</span>`;
  el.classList.remove("hidden");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add("hidden"), 4500);
}

function switchAdminTab(tab) {
  const isRoster = tab === "roster";
  document.getElementById("panelRoster").classList.toggle("hidden", !isRoster);
  document.getElementById("panelFund").classList.toggle("hidden", isRoster);

  const btnR = document.getElementById("tabBtnRoster");
  const btnF = document.getElementById("tabBtnFund");

  if (isRoster) {
    btnR.className = "px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 sm:gap-2 bg-indigo-600 text-white shadow-sm cursor-pointer";
    btnF.className = "px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 sm:gap-2 text-slate-600 hover:text-slate-900 cursor-pointer";
  } else {
    btnF.className = "px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 sm:gap-2 bg-emerald-600 text-white shadow-sm cursor-pointer";
    btnR.className = "px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 sm:gap-2 text-slate-600 hover:text-slate-900 cursor-pointer";
  }
}

function normalizeMonthStatus(val) {
  const up = String(val ?? "").trim().toUpperCase();
  if (up === "PAID" || up.includes("ĐÃ ĐÓNG")) return "PAID";
  if (up === "DEBT" || up.includes("NỢ") || up.includes("OVERDUE")) return "DEBT";
  return "UNPAID";
}

function normalizeDeptSmart(rawDept) {
  return CTEC.normalizeDeptKey(rawDept || CTEC.DEFAULT_DEPT);
}

function normalizeRoleSmart(rawRole) {
  const s = String(rawRole ?? "").trim();
  if (!s) return "Member";
  const low = s.toLowerCase();
  if (low.includes("chủ tịch") && !low.includes("phó")) return "President";
  if (low.includes("phó chủ tịch")) return "Vice President";
  if (low.includes("trưởng ban") || low.includes("head of department")) return "Head of Department";
  if (low.includes("phó ban") || low.includes("deputy")) return "Deputy Head of Department";
  if (low.includes("thành viên") || low === "member") return "Member";
  return s;
}

function normalizeMemberStatusSmart(rawStatus) {
  const s = String(rawStatus ?? "").trim();
  if (!s) return "Official";
  const low = s.toLowerCase();
  if (low.includes("chính thức") || low === "official") return "Official";
  if (low.includes("thử việc") || low === "probationary") return "Probationary";
  if (low.includes("tạm nghỉ") || low === "inactive") return "Inactive";
  return s;
}

function normalizeMemberName(name) {
  return CTEC.normalizeMemberName(name);
}

function buildMemberNameKey(name) {
  return CTEC.buildMemberNameKey(name);
}

function countUniquePeople(rows) {
  return CTEC.countUniquePeople(rows);
}

function mergeMonthStatusArrays(baseMonths, extraMonths) {
  const rank = { PAID: 3, DEBT: 2, UNPAID: 1 };
  return Array.from({ length: 8 }, (_, i) => {
    const a = normalizeMonthStatus(baseMonths?.[i]);
    const b = normalizeMonthStatus(extraMonths?.[i]);
    return (rank[b] || 0) > (rank[a] || 0) ? b : a;
  });
}

function updateRosterCountBadges() {
  const t = tAdmin();
  const validRows = rosterRows.filter(r => buildMemberNameKey(r.name).length > 0);
  const uniquePeople = countUniquePeople(validRows);
  const totalRoles = validRows.length;

  const badgeEl = document.getElementById("badgeRosterCount");
  if (badgeEl) {
    badgeEl.textContent = uniquePeople;
    badgeEl.title = t.rosterSummary(uniquePeople, totalRoles);
  }

  const summaryEl = document.getElementById("rosterStatsPill");
  if (summaryEl) {
    summaryEl.textContent = t.rosterSummary(uniquePeople, totalRoles);
  }
}

function handleRosterNameInput(realIdx, value) {
  if (!rosterRows[realIdx]) return;
  rosterRows[realIdx].name = value;
  updateRosterCountBadges();
}

function findSameDeptDuplicates(rows) {
  const seen = new Map();
  const duplicates = [];

  rows.forEach((row, idx) => {
    const name = normalizeMemberName(row.name);
    if (!name) return;
    const dept = CTEC.normalizeDeptKey(row.dept || CTEC.DEFAULT_DEPT);
    const key = `${dept}::${name.toLowerCase()}`;
    if (seen.has(key)) {
      duplicates.push(`- ${name} (${getDeptLabel(dept)})`);
    } else {
      seen.set(key, idx);
    }
  });

  return duplicates;
}

async function migrateFromWorkerSheets() {
  const t = tAdmin();
  if (!confirm(t.confirmMigrateWorker)) return;

  const btn = document.getElementById("migrateWorkerBtn");
  const icon = document.getElementById("migrateWorkerIcon");
  btn.disabled = true;
  if (icon) icon.className = "fa-solid fa-spinner fa-spin";

  try {
    const res = await fetch(`${API_BASE}/api/admin/migrate-from-sheet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    await loadAllAdminData();
    showToast(
      t.toastMigrateDone(countUniquePeople(rosterRows), countUniquePeople(fundRows)),
      "success"
    );
  } catch (err) {
    showToast(t.toastMigrateErr(err.message), "error");
  } finally {
    btn.disabled = false;
    if (icon) icon.className = "fa-solid fa-cloud-arrow-down";
  }
}

async function resetCurrentTabD1() {
  const t = tAdmin();
  const isRosterTab = !document.getElementById("panelRoster").classList.contains("hidden");
  const targetLabel = isRosterTab ? "Roster" : "Fund";

  const typed = prompt(t.promptResetD1(targetLabel));
  if (typed !== "RESET") {
    showToast(t.toastResetCancelled, "info");
    return;
  }

  const btn = document.getElementById("resetD1Btn");
  const icon = document.getElementById("resetD1Icon");
  btn.disabled = true;
  if (icon) icon.className = "fa-solid fa-spinner fa-spin";

  try {
    if (isRosterTab) {
      const res = await fetch(`${API_BASE}/api/admin/roster/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ rows: [], roster: [], members: [], allowEmpty: true })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      rosterRows = [];
      renderRosterEditor();
      showToast(t.toastResetRosterDone, "success");
    } else {
      const resetDeadlines = [0, 0, 0, 0, 0, 0, 0, 0];
      const res = await fetch(`${API_BASE}/api/admin/fund/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rows: [],
          members: [],
          fund: [],
          deadlines: resetDeadlines,
          bankInfo,
          allowEmpty: true
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      fundRows = [];
      fundDeadlines = resetDeadlines;
      renderDeadlinesEditor();
      renderFundEditor();
      showToast(t.toastResetFundDone, "success");
    }
  } catch (err) {
    showToast(t.toastResetErr(err.message), "error");
  } finally {
    btn.disabled = false;
    if (icon) icon.className = "fa-solid fa-trash-arrow-up";
  }
}

async function loadAllAdminData() {
  const icon = document.getElementById("syncAllIcon");
  if (icon) icon.classList.add("fa-spin");

  try {
    const [rosterPayload, fundPayload] = await Promise.all([
      CTEC.fetchWorkerJson("/api/roster"),
      CTEC.fetchWorkerJson("/api/fund")
    ]);

    const rosterList = rosterPayload.rows || rosterPayload.members || rosterPayload.roster || rosterPayload.data;
    if (Array.isArray(rosterList)) {
      rosterRows = rosterList.map((m, idx) => ({
        id: m.id ?? idx + 1,
        name: normalizeMemberName(m.name ?? m.full_name),
        dept: CTEC.normalizeDeptKey(m.dept || m.department || CTEC.DEFAULT_DEPT),
        role: String(m.role ?? "Member").trim(),
        status: String(m.status ?? "Official").trim()
      })).filter(r => r.name.length > 0);
    }

    const fundList = fundPayload.rows || fundPayload.members || fundPayload.fund || fundPayload.data;
    if (Array.isArray(fundList)) {
      const dedupedByPersonDept = new Map();
      fundList.forEach((m, idx) => {
        const name = normalizeMemberName(m.name ?? m.full_name);
        const nameKey = buildMemberNameKey(name);
        if (!nameKey) return;
        const dept = CTEC.normalizeDeptKey(m.dept || m.department || CTEC.DEFAULT_DEPT);
        const pairKey = `${nameKey}||${dept}`;

        const rawMonths = Array.isArray(m.months)
          ? m.months
          : [m.m0, m.m1, m.m2, m.m3, m.m4, m.m5, m.m6, m.m7];
        const months = Array.from({ length: 8 }, (_, i) => normalizeMonthStatus(rawMonths[i]));
        const note = String(m.note ?? "").trim();

        if (!dedupedByPersonDept.has(pairKey)) {
          dedupedByPersonDept.set(pairKey, {
            id: m.id ?? idx + 1,
            name,
            dept,
            months,
            note
          });
        } else {
          const prev = dedupedByPersonDept.get(pairKey);
          prev.months = mergeMonthStatusArrays(prev.months, months);
          if (note && !prev.note.includes(note)) {
            prev.note = prev.note ? `${prev.note}; ${note}` : note;
          }
        }
      });
      fundRows = Array.from(dedupedByPersonDept.values());
    }

    if (Array.isArray(fundPayload.deadlines)) {
      fundDeadlines = Array.from({ length: 8 }, (_, i) => CTEC.parseDeadlineDay(fundPayload.deadlines[i]));
    }

    const rawBankObj = fundPayload.bankInfo || fundPayload.bank_info;
    if (rawBankObj && typeof rawBankObj === "object") {
      let b = { ...rawBankObj };
      const preservedRawHtml = String(b.rawHtml || "");
      if (preservedRawHtml && !b.accountNumber && !b.stk && !b.accountNo && !b.qrHtml10k) {
        b = { ...parseTransferHtmlToObj(preservedRawHtml), ...b };
      }
      bankInfo = {
        accountNumber: b.accountNumber || b.stk || b.accountNo || "",
        accountName: b.accountName || "",
        bankName: b.bankName || "",
        qrHtml10k: b.qrHtml10k || b.qrUrl || "",
        rawHtml: preservedRawHtml
      };
    }

    renderRosterEditor();
    renderDeadlinesEditor();
    renderBankInfoEditor();
    renderFundEditorHeader();
    renderFundEditor();
  } catch (err) {
    console.error(err);
    showToast(tAdmin().toastLoadErr(err.message), "error");
  } finally {
    if (icon) icon.classList.remove("fa-spin");
  }
}

/* ================= NHẬP DỮ LIỆU TỪ GOOGLE SHEET ================= */
function openSheetImportModal(type) {
  importTargetType = type;
  const isRoster = type === "roster";
  const isEn = CTEC.getSavedLang() === "en";

  document.getElementById("sheetImportTitle").textContent = isRoster
    ? (isEn ? "Import Roster from Google Sheet" : "Nhập Roster từ Google Sheet")
    : (isEn ? "Import Club Treasury (Fund) from Google Sheet" : "Nhập Quỹ CLB (Fund) từ Google Sheet");

  document.getElementById("sheetImportHint").innerHTML = isRoster
    ? (isEn
      ? "Supports pasting directly from Google Sheets or CSV (columns: <code>No., Full Name, Department, Role, Status</code> or <code>Full Name, Department, Role, Status</code>). The same person in multiple departments is counted as 1 member."
      : "Hỗ trợ dán trực tiếp từ Google Sheets hoặc CSV (cột: <code>STT, Họ và tên, Ban, Chức vụ, Trạng thái</code> hoặc <code>Họ và tên, Ban, Chức vụ, Trạng thái</code>). Một người ở nhiều ban được tính là 1 thành viên.")
    : (isEn
      ? "Supports pasting directly from Google Sheets or CSV (columns: <code>No., Full Name, Department, Oct 26..May 27, Note</code>; auto-reads deadline row if present)."
      : "Hỗ trợ dán trực tiếp từ Google Sheets hoặc CSV (cột: <code>STT, Họ và tên, Ban, T10/26..T5/27, Ghi chú</code>; tự đọc dòng hạn đóng nếu có).");

  document.getElementById("sheetPasteArea").placeholder = isRoster
    ? "1\tNguyễn Văn A\tExecutive Board\tVice President\tOfficial\n2\tNguyễn Văn A\tBan Nội dung\tHead of Department\tOfficial"
    : "1\tNguyễn Văn A\tBan Nội dung\tPAID\tUNPAID\tUNPAID\tUNPAID\tUNPAID\tUNPAID\tUNPAID\tUNPAID\tGhi chú";
  document.getElementById("sheetImportModal").classList.remove("hidden");
}

function closeSheetImportModal() {
  document.getElementById("sheetImportModal").classList.add("hidden");
}

function convertGoogleSheetUrlToCsv(inputUrl) {
  const u = String(inputUrl ?? "").trim();
  if (!u) return "";
  const match = u.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) {
    const sheetId = match[1];
    const gidMatch = u.match(/[?&#]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : "";
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
  }
  return u;
}

// DEF-11: Thử tải qua Worker proxy trước (nếu có), sau đó fallback direct fetch và hướng dẫn dán TSV nếu bị CORS
async function fetchFromGoogleSheetUrl() {
  const rawUrl = document.getElementById("sheetUrlInput").value.trim();
  const targetUrl = convertGoogleSheetUrlToCsv(rawUrl);
  if (!targetUrl) {
    showToast(tAdmin().toastInvalidUrl, "error");
    return;
  }

  const btn = document.getElementById("fetchSheetUrlBtn");
  const icon = document.getElementById("fetchSheetUrlIcon");
  btn.disabled = true;
  icon.className = "fa-solid fa-spinner fa-spin";

  try {
    let text = "";
    let fetchedViaProxy = false;

    try {
      const proxyRes = await fetch(
        `${API_BASE}/api/admin/fetch-sheet?url=${encodeURIComponent(targetUrl)}`,
        {
          cache: "no-store"
        }
      );
      if (proxyRes.ok) {
        const contentType = proxyRes.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await proxyRes.json();
          if (json && typeof json.csv === "string") {
            text = json.csv;
            fetchedViaProxy = true;
          }
        } else {
          text = await proxyRes.text();
          fetchedViaProxy = true;
        }
      }
    } catch (_) {
      // Proxy endpoint chưa khả dụng -> thử tải trực tiếp
    }

    if (!fetchedViaProxy) {
      const res = await fetch(targetUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      text = await res.text();
    }

    if (!text || !text.trim()) {
      throw new Error("Empty sheet response");
    }

    document.getElementById("sheetPasteArea").value = text;
    showToast(tAdmin().toastFetched, "success");
  } catch (err) {
    showToast(tAdmin().toastFetchErr(err.message), "error");
  } finally {
    btn.disabled = false;
    icon.className = "fa-solid fa-cloud-arrow-down";
  }
}

function applySheetImportToDraft() {
  const rawText = document.getElementById("sheetPasteArea").value;
  const rows = CTEC.parseSheetPasteText(rawText);
  if (!rows.length) {
    showToast(tAdmin().toastNoPaste, "error");
    return;
  }

  const replaceExisting = document.getElementById("sheetReplaceMode").checked;

  if (importTargetType === "roster") {
    const parsedRoster = [];
    for (let i = 0; i < rows.length; i++) {
      const c = rows[i];
      const c0 = String(c[0] ?? "").trim();
      const c1 = String(c[1] ?? "").trim();
      const hasNoCol = /^\d+$/.test(c0) && c1.length > 0;
      const name = normalizeMemberName(hasNoCol ? c1 : c0);
      const deptRaw = hasNoCol ? c[2] : c[1];
      const roleRaw = hasNoCol ? c[3] : c[2];
      const statusRaw = hasNoCol ? c[4] : c[3];

      if (!name) continue;
      const upperName = name.toUpperCase();
      if (upperName === "NAME" || upperName === "HỌ VÀ TÊN" || upperName === "FULL NAME") continue;

      parsedRoster.push({
        id: Date.now() + i,
        name,
        dept: normalizeDeptSmart(deptRaw),
        role: normalizeRoleSmart(roleRaw),
        status: normalizeMemberStatusSmart(statusRaw)
      });
    }

    if (!parsedRoster.length) {
      showToast(tAdmin().toastNoRosterRows, "error");
      return;
    }

    rosterRows = replaceExisting ? parsedRoster : rosterRows.concat(parsedRoster);
    document.getElementById("rosterSearchInput").value = "";
    renderRosterEditor();
    closeSheetImportModal();
    showToast(
      tAdmin().toastImportedRoster(countUniquePeople(parsedRoster), parsedRoster.length),
      "success"
    );
  } else {
    const parsedFund = [];
    let importedDeadlines = null;

    for (let i = 0; i < rows.length; i++) {
      const c = rows[i];
      const firstThree = c.slice(0, 3).join(" ").toLowerCase();
      if (firstThree.includes("deadline") || firstThree.includes("hạn đóng") || firstThree.includes("kỳ hạn")) {
        // DEF-08: Dùng thống nhất CTEC.parseDeadlineDay()
        importedDeadlines = Array.from({ length: 8 }, (_, m) => CTEC.parseDeadlineDay(c[3 + m]));
        continue;
      }

      const c0 = String(c[0] ?? "").trim();
      const c1 = String(c[1] ?? "").trim();
      const hasNoCol = /^\d+$/.test(c0) && c1.length > 0;
      const name = normalizeMemberName(hasNoCol ? c1 : c0);
      const deptRaw = hasNoCol ? c[2] : c[1];
      const monthStart = hasNoCol ? 3 : 2;

      if (!name) continue;
      const upperName = name.toUpperCase();
      if (upperName === "NAME" || upperName === "HỌ VÀ TÊN" || upperName === "FULL NAME") continue;

      const months = Array.from({ length: 8 }, (_, m) => normalizeMonthStatus(c[monthStart + m]));
      const note = String(c[monthStart + 8] ?? "").trim();

      parsedFund.push({
        id: Date.now() + i,
        name,
        dept: normalizeDeptSmart(deptRaw),
        months,
        note
      });
    }

    if (!parsedFund.length) {
      showToast(tAdmin().toastNoFundRows, "error");
      return;
    }

    if (importedDeadlines) {
      fundDeadlines = importedDeadlines;
      renderDeadlinesEditor();
    }

    const combinedFund = replaceExisting ? parsedFund : fundRows.concat(parsedFund);
    const dedupedFundMap = new Map();
    combinedFund.forEach((item, idx) => {
      const nameKey = buildMemberNameKey(item.name);
      if (!nameKey) return;
      const dept = CTEC.normalizeDeptKey(item.dept || CTEC.DEFAULT_DEPT);
      const key = `${nameKey}||${dept}`;
      if (!dedupedFundMap.has(key)) {
        dedupedFundMap.set(key, {
          ...item,
          id: item.id ?? Date.now() + idx,
          dept
        });
      } else {
        const prev = dedupedFundMap.get(key);
        prev.months = mergeMonthStatusArrays(prev.months, item.months);
        if (item.note && !prev.note.includes(item.note)) {
          prev.note = prev.note ? `${prev.note}; ${item.note}` : item.note;
        }
      }
    });

    fundRows = Array.from(dedupedFundMap.values());
    document.getElementById("fundSearchInput").value = "";
    renderFundEditor();
    closeSheetImportModal();
    showToast(tAdmin().toastImportedFund(countUniquePeople(fundRows)), "success");
  }
}

/* ================= SHEET 1: ROSTER EDITOR ================= */
function renderRosterEditor() {
  const t = tAdmin();
  const lang = CTEC.getSavedLang();
  const filter = (document.getElementById("rosterSearchInput").value || "").toLowerCase().trim();
  updateRosterCountBadges();

  const tbody = document.getElementById("rosterEditorBody");
  if (!rosterRows.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-10 text-center text-sm text-slate-400">${CTEC.escapeHtml(t.emptyRoster)}</td></tr>`;
    return;
  }

  const html = [];
  rosterRows.forEach((row, realIdx) => {
    if (filter && !row.name.toLowerCase().includes(filter)) return;

    const deptOptions = DEPARTMENTS.map(d => {
      const label = lang === "en" ? d.en : d.vi;
      return `<option value="${d.value}" ${row.dept === d.value ? "selected" : ""}>${CTEC.escapeHtml(label)}</option>`;
    }).join("");

    const roleOptions = ROLES.map(r =>
      `<option value="${r}" ${row.role === r ? "selected" : ""}>${CTEC.escapeHtml(r)}</option>`
    ).join("");

    const statusOptions = MEMBER_STATUSES.map(st =>
      `<option value="${st}" ${row.status === st ? "selected" : ""}>${CTEC.escapeHtml(st)}</option>`
    ).join("");

    html.push(`
      <tr class="group hover:bg-slate-50/80 transition">
        <td class="py-2 px-3 text-center text-xs font-bold text-slate-400 border-r border-slate-100">${realIdx + 1}</td>
        <td class="sticky-name-col bg-white group-hover:bg-slate-50/80 py-1.5 px-2 border-r border-slate-200 transition">
          <input type="text" data-row-idx="${realIdx}" data-field="name" value="${CTEC.escapeHtml(row.name)}"
                 oninput="handleRosterNameInput(${realIdx}, this.value)"
                 placeholder="${CTEC.escapeHtml(t.namePlaceholder)}"
                 class="sheet-cell-input font-semibold text-slate-800">
        </td>
        <td class="py-1.5 px-2 border-r border-slate-100">
          <select onchange="rosterRows[${realIdx}].dept = this.value" class="sheet-cell-input font-medium text-slate-700 cursor-pointer">
            ${deptOptions}
          </select>
        </td>
        <td class="py-1.5 px-2 border-r border-slate-100">
          <select onchange="rosterRows[${realIdx}].role = this.value" class="sheet-cell-input font-medium text-slate-700 cursor-pointer">
            ${roleOptions}
          </select>
        </td>
        <td class="py-1.5 px-2 border-r border-slate-100">
          <select onchange="rosterRows[${realIdx}].status = this.value" class="sheet-cell-input font-semibold text-slate-700 cursor-pointer">
            ${statusOptions}
          </select>
        </td>
        <td class="py-1.5 px-2 text-center">
          <button type="button" onclick="deleteRosterRow(${realIdx})" title="${CTEC.escapeHtml(t.deleteTitle)}"
                  class="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition inline-flex items-center justify-center cursor-pointer">
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
        </td>
      </tr>
    `);
  });

  tbody.innerHTML = html.join("");
}

function addRosterRow() {
  rosterRows.push({
    id: Date.now(),
    name: "",
    dept: CTEC.DEFAULT_DEPT,
    role: "Member",
    status: "Official"
  });
  document.getElementById("rosterSearchInput").value = "";
  renderRosterEditor();
  const tbody = document.getElementById("rosterEditorBody");
  const lastInput = tbody.querySelector("tr:last-child input[type='text']");
  if (lastInput) lastInput.focus();
}

function deleteRosterRow(realIdx) {
  const target = rosterRows[realIdx];
  if (!target) return;
  if (!confirm(tAdmin().confirmDelete(target.name))) return;
  rosterRows.splice(realIdx, 1);
  renderRosterEditor();
}

async function saveRosterToD1() {
  const t = tAdmin();
  const btn = document.getElementById("saveRosterBtn");
  btn.disabled = true;

  const cleanedRows = rosterRows
    .map((r, idx) => ({
      id: r.id ?? idx + 1,
      name: normalizeMemberName(r.name),
      dept: CTEC.normalizeDeptKey(r.dept || CTEC.DEFAULT_DEPT),
      role: String(r.role ?? "Member").trim() || "Member",
      status: String(r.status ?? "Official").trim() || "Official"
    }))
    .filter(r => r.name.length > 0);

  const sameDeptDups = findSameDeptDuplicates(cleanedRows);
  if (sameDeptDups.length > 0 && !confirm(t.confirmDuplicateSameDept(sameDeptDups))) {
    btn.disabled = false;
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/roster/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ rows: cleanedRows, roster: cleanedRows, members: cleanedRows })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    rosterRows = cleanedRows;
    renderRosterEditor();
    showToast(
      t.toastSavedRoster(countUniquePeople(cleanedRows), cleanedRows.length),
      "success"
    );
  } catch (err) {
    showToast(t.toastSaveRosterErr(err.message), "error");
  } finally {
    btn.disabled = false;
  }
}

/* ================= SHEET 2: FUND EDITOR ================= */
function renderDeadlinesEditor() {
  const labels = getMonthLabels();
  const grid = document.getElementById("deadlinesGrid");
  grid.innerHTML = labels.map((label, idx) => `
    <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
      <span class="text-xs font-bold text-slate-700">${CTEC.escapeHtml(label)}</span>
      <input type="number" min="0" max="31" value="${fundDeadlines[idx] ?? 0}"
             onchange="fundDeadlines[${idx}] = Math.max(0, Math.min(31, parseInt(this.value, 10) || 0)); this.value = fundDeadlines[${idx}];"
             class="w-16 px-2 py-1 text-center text-xs font-bold bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
    </div>
  `).join("");
}

function renderBankInfoEditor() {
  document.getElementById("bankStkInput").value = bankInfo.accountNumber || "";
  document.getElementById("bankNameInput").value = bankInfo.bankName || "";
  document.getElementById("bankAccountNameInput").value = bankInfo.accountName || "";
  document.getElementById("bankQrInput").value = bankInfo.qrHtml10k || "";
}

function renderFundEditorHeader() {
  const t = tAdmin();
  const labels = getMonthLabels();
  const monthCols = labels.map(m =>
    `<th class="py-3 px-2.5 text-center border-r border-slate-800 min-w-[82px]">${CTEC.escapeHtml(m)}</th>`
  ).join("");

  document.getElementById("fundEditorHead").innerHTML = `
    <tr class="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
      <th class="py-3 px-3 text-center w-12 border-r border-slate-800">${CTEC.escapeHtml(t.colNo)}</th>
      <th class="sticky-name-col bg-slate-900 py-3 px-4 border-r border-slate-700 min-w-[165px] sm:min-w-[190px]">${CTEC.escapeHtml(t.colFullName)}</th>
      <th class="py-3 px-4 border-r border-slate-800 min-w-[190px]">${CTEC.escapeHtml(t.colDept)}</th>
      ${monthCols}
      <th class="py-3 px-3 border-r border-slate-800 min-w-[180px]">${CTEC.escapeHtml(t.colNoteFull)}</th>
      <th class="py-3 px-3 text-center w-14">${CTEC.escapeHtml(t.colDelete)}</th>
    </tr>
  `;
}

function getStatusPillClass(st) {
  if (st === "PAID") return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
  if (st === "DEBT") return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
  return "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100";
}

function renderFundEditor() {
  const t = tAdmin();
  const filter = (document.getElementById("fundSearchInput").value || "").toLowerCase().trim();
  const uniqueFundPeople = countUniquePeople(fundRows.filter(r => buildMemberNameKey(r.name).length > 0));
  const badgeFundEl = document.getElementById("badgeFundCount");
  if (badgeFundEl) {
    badgeFundEl.textContent = uniqueFundPeople;
    badgeFundEl.title = t.rosterSummary(uniqueFundPeople, fundRows.length);
  }

  const tbody = document.getElementById("fundEditorBody");
  if (!fundRows.length) {
    tbody.innerHTML = `<tr><td colspan="13" class="py-10 text-center text-sm text-slate-400">${CTEC.escapeHtml(t.emptyFund)}</td></tr>`;
    return;
  }

  const html = [];
  fundRows.forEach((row, realIdx) => {
    if (filter && !row.name.toLowerCase().includes(filter)) return;

    const monthButtons = row.months.map((st, mIdx) => `
      <td class="py-2 px-2 text-center border-r border-slate-100">
        <button type="button" onclick="cycleFundCellStatus(${realIdx}, ${mIdx})"
                class="status-pill-btn w-full py-1 px-2 rounded-full text-[11px] font-bold border cursor-pointer ${getStatusPillClass(st)}">
          ${CTEC.escapeHtml(st)}
        </button>
      </td>
    `).join("");

    html.push(`
      <tr class="group hover:bg-slate-50/80 transition">
        <td class="py-2 px-3 text-center text-xs font-bold text-slate-400 border-r border-slate-100">${realIdx + 1}</td>
        <td class="sticky-name-col bg-white group-hover:bg-slate-50/80 py-2 px-4 font-semibold text-slate-800 border-r border-slate-200 whitespace-nowrap transition">${CTEC.escapeHtml(row.name)}</td>
        <td class="py-2 px-4 border-r border-slate-100 whitespace-nowrap">${CTEC.renderDeptBadge(row.dept, getDeptLabel(row.dept))}</td>
        ${monthButtons}
        <td class="py-1.5 px-2 border-r border-slate-100">
          <input type="text" data-row-idx="${realIdx}" data-field="note" value="${CTEC.escapeHtml(row.note || "")}"
                 oninput="fundRows[${realIdx}].note = this.value"
                 placeholder="${CTEC.escapeHtml(t.notePlaceholder)}"
                 class="sheet-cell-input text-xs text-slate-600">
        </td>
        <td class="py-1.5 px-2 text-center">
          <button type="button" onclick="deleteFundRow(${realIdx})" title="${CTEC.escapeHtml(t.deleteTitle)}"
                  class="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition inline-flex items-center justify-center cursor-pointer">
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
        </td>
      </tr>
    `);
  });

  tbody.innerHTML = html.join("");
}

function deleteFundRow(realIdx) {
  const target = fundRows[realIdx];
  if (!target) return;
  if (!confirm(tAdmin().confirmDeleteFund(target.name))) return;
  fundRows.splice(realIdx, 1);
  renderFundEditor();
}

function cycleFundCellStatus(rowIdx, monthIdx) {
  const row = fundRows[rowIdx];
  if (!row) return;
  const curr = normalizeMonthStatus(row.months[monthIdx]);
  const nextIdx = (STATUS_CYCLE.indexOf(curr) + 1) % STATUS_CYCLE.length;
  row.months[monthIdx] = STATUS_CYCLE[nextIdx];
  renderFundEditor();
}

function syncMembersFromRosterToFund() {
  const pruneMissing = Boolean(document.getElementById("pruneMissingOnSyncCheckbox")?.checked);
  const existingByPair = new Map();
  const existingByName = new Map();

  fundRows.forEach(item => {
    const nameKey = buildMemberNameKey(item.name);
    if (!nameKey) return;
    const dept = CTEC.normalizeDeptKey(item.dept || CTEC.DEFAULT_DEPT);
    existingByPair.set(`${nameKey}||${dept}`, item);
    if (!existingByName.has(nameKey)) {
      existingByName.set(nameKey, item);
    }
  });

  const rosterAssignments = new Map();
  rosterRows.forEach(m => {
    const cleanName = normalizeMemberName(m.name);
    const nameKey = buildMemberNameKey(cleanName);
    if (!nameKey) return;
    const dept = CTEC.normalizeDeptKey(m.dept || CTEC.DEFAULT_DEPT);
    const pairKey = `${nameKey}||${dept}`;
    if (!rosterAssignments.has(pairKey)) {
      rosterAssignments.set(pairKey, { name: cleanName, nameKey, dept, pairKey });
    }
  });

  const merged = [];
  let idxCounter = 0;

  rosterAssignments.forEach(({ name, nameKey, dept, pairKey }) => {
    idxCounter++;
    const matched = existingByPair.get(pairKey) || existingByName.get(nameKey);
    if (matched) {
      merged.push({
        id: matched.id ?? idxCounter,
        name,
        dept,
        months: Array.from({ length: 8 }, (_, i) => normalizeMonthStatus(matched.months?.[i])),
        note: String(matched.note ?? "").trim()
      });
    } else {
      merged.push({
        id: Date.now() + idxCounter,
        name,
        dept,
        months: ["UNPAID", "UNPAID", "UNPAID", "UNPAID", "UNPAID", "UNPAID", "UNPAID", "UNPAID"],
        note: ""
      });
    }
  });

  let removedCount = 0;
  if (!pruneMissing) {
    existingByPair.forEach((item, pairKey) => {
      if (!rosterAssignments.has(pairKey)) {
        merged.push(item);
      }
    });
  } else {
    existingByPair.forEach((_, pairKey) => {
      if (!rosterAssignments.has(pairKey)) removedCount++;
    });
  }

  fundRows = merged;
  renderFundEditor();
  showToast(tAdmin().toastSyncedFund(countUniquePeople(fundRows), removedCount), "info");
}

async function saveFundToD1() {
  const t = tAdmin();
  const btn = document.getElementById("saveFundBtn");
  btn.disabled = true;

  const accountNumber = document.getElementById("bankStkInput").value.trim();
  const bankName = document.getElementById("bankNameInput").value.trim();
  const accountName = document.getElementById("bankAccountNameInput").value.trim();
  const qrHtml10k = document.getElementById("bankQrInput").value.trim();

  const hasStructuredBank = Boolean(accountNumber || bankName || accountName || qrHtml10k);
  // DEF-07: Khi đã nhập thông tin ngân hàng có cấu trúc, xóa rawHtml cũ (rawHtml: "") để không ghi đè dữ liệu mới
  const updatedBankInfo = {
    accountNumber,
    bankName,
    accountName,
    qrHtml10k,
    rawHtml: hasStructuredBank ? "" : String(bankInfo.rawHtml || "").trim()
  };

  const payloadMembers = fundRows.map((r, idx) => ({
    id: r.id ?? idx + 1,
    name: normalizeMemberName(r.name),
    dept: CTEC.normalizeDeptKey(r.dept || CTEC.DEFAULT_DEPT),
    months: Array.from({ length: 8 }, (_, i) => normalizeMonthStatus(r.months[i])),
    note: String(r.note ?? "").trim()
  })).filter(r => r.name.length > 0);

  try {
    const res = await fetch(`${API_BASE}/api/admin/fund/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        rows: payloadMembers,
        members: payloadMembers,
        fund: payloadMembers,
        deadlines: fundDeadlines,
        bankInfo: updatedBankInfo
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    bankInfo = updatedBankInfo;
    fundRows = payloadMembers;
    renderFundEditor();
    showToast(t.toastSavedFund, "success");
  } catch (err) {
    showToast(t.toastSaveFundErr(err.message), "error");
  } finally {
    btn.disabled = false;
  }
}

/* ================= KHỞI TẠO ================= */
document.addEventListener("DOMContentLoaded", async () => {
  applyAdminI18n(CTEC.getSavedLang());

  window.addEventListener("ctec:langchange", e => {
    applyAdminI18n(e.detail.lang);
  });

  await loadAllAdminData();
});
