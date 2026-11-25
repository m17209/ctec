


Biểu tượng JS
admin-app
const TOKEN_STORAGE_KEY = "ctec_admin_secret_token";

const EXECUTIVE_DEPT = "EXCUTIVE BOARD";

const DEPARTMENTS = [
  { value: EXECUTIVE_DEPT, vi: "Ban Chủ nhiệm (Executive Board)", en: "Executive Board" },
  { value: "PUBLIC RELATIONS DEPARTMENT", vi: "Ban Truyền thông (PR)", en: "Public Relations Department" },
  { value: "DESIGN DEPARTMENT", vi: "Ban Thiết kế (Design)", en: "Design Department" },
  { value: "CONTENT DEPARTMENT", vi: "Ban Nội dung (Content)", en: "Content Department" },
  { value: "HUMAN RESOURCES DEPARTMENT", vi: "Ban Nhân sự (HR)", en: "Human Resources Department" },
  { value: "EVENT & EXTERNAL RELATIONS DEPARTMENT", vi: "Ban Đối ngoại (Event & External)", en: "Event & External Relations" }
];

const ROLES = [
  "President",
  "Vice President",
  "Head of Department",
  "Deputy Head of Department",
  "Member"
];

const MEMBER_STATUSES = [
  "Official",
  "Probationary",
  "Inactive"
];

const FUND_MONTH_LABELS_VI = ["T10/26", "T11/26", "T12/26", "T1/27", "T2/27", "T3/27", "T4/27", "T5/27"];
const FUND_MONTH_LABELS_EN = ["Oct 26", "Nov 26", "Dec 26", "Jan 27", "Feb 27", "Mar 27", "Apr 27", "May 27"];
const STATUS_CYCLE = ["UNPAID", "PAID", "DEBT"];

const ADMIN_I18N = {
  vi: {
    pageTitle: "CTEC Administrator",
    homeTitle: "Về trang chủ CTEC",
    navViewRosterFull: "XEM ROSTER",
    navViewRosterShort: "DS",
    navViewFundFull: "XEM FUND",
    navViewFundShort: "QUỸ",
    navLockFull: "KHÓA",
    navLockShort: "KHÓA",
    gateTitle: "Xác thực Quản trị viên",
    gateDesc: 'Nhập <code class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-xs">ADMIN_SECRET_TOKEN</code> để mở khóa bảng điều khiển dữ liệu D1 của CTEC.',
    tokenPlaceholder: "Nhập mã bảo mật quản trị...",
    unlockBtn: "Mở khóa CTEC Administrator",
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
    toastVerified: "Đã xác thực quyền quản trị thành công!",
    toastAuthFail: (msg) => `Xác thực thất bại: ${msg}`,
    toastLocked: "Đã khóa phiên quản trị.",
    toastLoadErr: (msg) => `Lỗi tải dữ liệu: ${msg}`,
    toastInvalidUrl: "Vui lòng nhập đường dẫn Google Sheets hợp lệ.",
    toastFetched: "Đã tải dữ liệu từ Google Sheet. Kiểm tra rồi nhấn Nạp vào bảng xem trước.",
    toastFetchErr: (msg) => `Không tải được link Sheet (hãy kiểm tra quyền chia sẻ công khai): ${msg}`,
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
    navLockFull: "LOCK",
    navLockShort: "LOCK",
    gateTitle: "Administrator Verification",
    gateDesc: 'Enter <code class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-xs">ADMIN_SECRET_TOKEN</code> to unlock the CTEC D1 control panel.',
    tokenPlaceholder: "Enter admin secret token...",
    unlockBtn: "Unlock CTEC Administrator",
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
    toastVerified: "Administrator verified successfully!",
    toastAuthFail: (msg) => `Verification failed: ${msg}`,
    toastLocked: "Administrator session locked.",
    toastLoadErr: (msg) => `Data load error: ${msg}`,
    toastInvalidUrl: "Please enter a valid Google Sheets URL.",
    toastFetched: "Loaded data from Google Sheet. Review and click Load into Preview Table.",
    toastFetchErr: (msg) => `Failed to fetch Sheet link (check public view sharing): ${msg}`,
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

const API_BASE = window.CTEC?.API_BASE_URL || "https://nameless-mud-298a.minhlesynhat.workers.dev";

let adminToken = "";
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
  const lang = CTEC.getSavedLang();
  const found = DEPARTMENTS.find(d => d.value === deptKey);
  return found ? (lang === "en" ? found.en : found.vi) : deptKey;
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
  el.className = `fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold flex items-center gap-2.5 ${styles[type] || styles.info}`;
  el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${CTEC.escapeHtml(message)}</span>`;
  el.classList.remove("hidden");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add("hidden"), 3800);
}

function toggleTokenVisibility() {
  const input = document.getElementById("adminTokenInput");
  const icon = document.getElementById("eyeIcon");
  if (input.type === "password") {
    input.type = "text";
    icon.className = "fa-regular fa-eye-slash";
  } else {
    input.type = "password";
    icon.className = "fa-regular fa-eye";
  }
}

async function verifyTokenWithServer(token) {
  const res = await fetch(`${API_BASE}/api/admin/verify`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  if (data && data.ok === false) {
    throw new Error(data.error || "Unauthorized");
  }
  return data;
}

async function handleVerify(e) {
  e.preventDefault();
  const input = document.getElementById("adminTokenInput");
  const btn = document.getElementById("verifySubmitBtn");
  const spinner = document.getElementById("verifySpinner");
  const errBox = document.getElementById("authErrorBox");
  const errText = document.getElementById("authErrorText");

  const candidate = input.value.trim();
  if (!candidate) return;

  btn.disabled = true;
  spinner.className = "fa-solid fa-spinner fa-spin";
  errBox.classList.add("hidden");

  try {
    await verifyTokenWithServer(candidate);
    adminToken = candidate;
    sessionStorage.setItem(TOKEN_STORAGE_KEY, adminToken);
    unlockWorkspace();
    await loadAllAdminData();
    showToast(tAdmin().toastVerified, "success");
  } catch (err) {
    const msg = tAdmin().toastAuthFail(err.message);
    errText.textContent = msg;
    errBox.classList.remove("hidden");
    showToast(msg, "error");
  } finally {
    btn.disabled = false;
    spinner.className = "fa-solid fa-unlock-keyhole";
  }
}

function unlockWorkspace() {
  document.getElementById("authGate").classList.add("hidden");
  document.getElementById("adminWorkspace").classList.remove("hidden");
  document.getElementById("logoutBtn").classList.remove("hidden");
}

function logoutAdmin() {
  adminToken = "";
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  document.getElementById("adminTokenInput").value = "";
  document.getElementById("adminWorkspace").classList.add("hidden");
  document.getElementById("logoutBtn").classList.add("hidden");
  document.getElementById("authGate").classList.remove("hidden");
  showToast(tAdmin().toastLocked, "info");
}

function switchAdminTab(tab) {
  const isRoster = tab === "roster";
  document.getElementById("panelRoster").classList.toggle("hidden", !isRoster);
  document.getElementById("panelFund").classList.toggle("hidden", isRoster);

  const btnR = document.getElementById("tabBtnRoster");
  const btnF = document.getElementById("tabBtnFund");

  if (isRoster) {
    btnR.className = "px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 bg-indigo-600 text-white shadow-sm cursor-pointer";
    btnF.className = "px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer";
  } else {
    btnF.className = "px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 bg-emerald-600 text-white shadow-sm cursor-pointer";
    btnR.className = "px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 text-slate-600 hover:text-slate-900 cursor-pointer";
  }
}

function normalizeMonthStatus(val) {
  const up = String(val ?? "").trim().toUpperCase();
  if (up === "PAID" || up.includes("ĐÃ ĐÓNG")) return "PAID";
  if (up === "DEBT" || up.includes("NỢ") || up.includes("OVERDUE")) return "DEBT";
  return "UNPAID";
}

function normalizeDeptSmart(rawDept) {
  return CTEC.normalizeDeptKey(rawDept || "CONTENT DEPARTMENT");
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
  return CTEC.normalizeMemberName
    ? CTEC.normalizeMemberName(name)
    : String(name ?? "").trim().replace(/\s+/g, " ");
}

function buildMemberNameKey(name) {
  return CTEC.buildMemberNameKey
    ? CTEC.buildMemberNameKey(name)
    : normalizeMemberName(name).toLowerCase();
}

function countUniquePeople(rows) {
  if (CTEC.countUniquePeople) return CTEC.countUniquePeople(rows);
  const unique = new Set();
  if (!Array.isArray(rows)) return 0;
  for (let i = 0; i < rows.length; i++) {
    const key = buildMemberNameKey(rows[i]?.name ?? rows[i]?.full_name);
    if (key) unique.add(key);
  }
  return unique.size;
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
    const dept = CTEC.normalizeDeptKey(row.dept || "CONTENT DEPARTMENT");
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
        "Authorization": `Bearer ${adminToken}`,
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
          "Authorization": `Bearer ${adminToken}`,
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
          "Authorization": `Bearer ${adminToken}`,
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
        dept: CTEC.normalizeDeptKey(m.dept || m.department || "CONTENT DEPARTMENT"),
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
        const dept = CTEC.normalizeDeptKey(m.dept || m.department || "CONTENT DEPARTMENT");
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
      fundDeadlines = Array.from({ length: 8 }, (_, i) => Math.max(0, Math.min(31, parseInt(fundPayload.deadlines[i], 10) || 0)));
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
    const res = await fetch(targetUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
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
        importedDeadlines = Array.from({ length: 8 }, (_, m) => parseInt(String(c[3 + m] ?? "").replace(/\D/g, ""), 10) || 0);
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
      const dept = CTEC.normalizeDeptKey(item.dept || "CONTENT DEPARTMENT");
      const key = `${nameKey}||${dept}`;
      if (!dedupedFundMap.has(key)) {
        dedupedFundMap.set(key, { ...item, dept, id: item.id ?? Date.now() + idx });
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

/* ================= ROSTER EDITOR ================= */
function renderRosterEditor() {
  const t = tAdmin();
  const lang = CTEC.getSavedLang();
  const q = document.getElementById("rosterSearchInput").value.toLowerCase().trim();
  updateRosterCountBadges();

  const tbody = document.getElementById("rosterEditorBody");
  const html = [];

  for (let realIdx = 0; realIdx < rosterRows.length; realIdx++) {
    const row = rosterRows[realIdx];
    if (q) {
      const hay = `${row.name} ${row.dept} ${row.role}`.toLowerCase();
      if (!hay.includes(q)) continue;
    }

    const deptOptions = DEPARTMENTS.map(d =>
      `<option value="${d.value}" ${row.dept === d.value ? "selected" : ""}>${CTEC.escapeHtml(lang === "en" ? d.en : d.vi)}</option>`
    ).join("");

    const roleLower = row.role.toLowerCase();
    const roleOptions = ROLES.map(r =>
      `<option value="${r}" ${roleLower === r.toLowerCase() ? "selected" : ""}>${CTEC.escapeHtml(r)}</option>`
    ).join("");
    const hasCustomRole = !ROLES.some(r => r.toLowerCase() === roleLower);

    const statusLower = row.status.toLowerCase();
    const statusOptions = MEMBER_STATUSES.map(s =>
      `<option value="${s}" ${statusLower === s.toLowerCase() ? "selected" : ""}>${CTEC.escapeHtml(s)}</option>`
    ).join("");

    html.push(
      `<tr class="hover:bg-slate-50/80">` +
        `<td class="py-2 px-3 text-center text-xs font-bold text-slate-400 border-r border-slate-100">${realIdx + 1}</td>` +
        `<td class="py-1.5 px-2 border-r border-slate-100">` +
          `<input type="text" data-row-idx="${realIdx}" data-field="roster-name" value="${CTEC.escapeHtml(row.name)}" ` +
                 `oninput="handleRosterNameInput(${realIdx}, this.value)" ` +
                 `placeholder="${CTEC.escapeHtml(t.namePlaceholder)}" ` +
                 `class="sheet-cell-input font-semibold text-slate-800">` +
        `</td>` +
        `<td class="py-1.5 px-2 border-r border-slate-100">` +
          `<select onchange="rosterRows[${realIdx}].dept = this.value" class="sheet-cell-input font-medium text-slate-700 cursor-pointer">${deptOptions}</select>` +
        `</td>` +
        `<td class="py-1.5 px-2 border-r border-slate-100">` +
          `<select onchange="rosterRows[${realIdx}].role = this.value" class="sheet-cell-input font-medium text-slate-700 cursor-pointer">` +
            `${hasCustomRole && row.role ? `<option value="${CTEC.escapeHtml(row.role)}" selected>${CTEC.escapeHtml(row.role)}</option>` : ""}` +
            `${roleOptions}` +
          `</select>` +
        `</td>` +
        `<td class="py-1.5 px-2 border-r border-slate-100">` +
          `<select onchange="rosterRows[${realIdx}].status = this.value" class="sheet-cell-input font-semibold text-slate-700 cursor-pointer">${statusOptions}</select>` +
        `</td>` +
        `<td class="py-1.5 px-2 text-center">` +
          `<button type="button" onclick="deleteRosterRow(${realIdx})" title="${CTEC.escapeHtml(t.deleteTitle)}" ` +
                  `class="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition inline-flex items-center justify-center cursor-pointer">` +
            `<i class="fa-solid fa-trash-can text-xs"></i>` +
          `</button>` +
        `</td>` +
      `</tr>`
    );
  }

  tbody.innerHTML = html.length
    ? html.join("")
    : `<tr><td colspan="6" class="py-10 text-center text-sm text-slate-400">${CTEC.escapeHtml(t.emptyRoster)}</td></tr>`;
}

function addRosterRow() {
  rosterRows.push({
    id: Date.now(),
    name: "",
    dept: "CONTENT DEPARTMENT",
    role: "Member",
    status: "Official"
  });
  document.getElementById("rosterSearchInput").value = "";
  renderRosterEditor();
  const tbody = document.getElementById("rosterEditorBody");
  const lastInput = tbody.querySelector("tr:last-child input");
  if (lastInput) lastInput.focus();
}

function deleteRosterRow(idx) {
  const target = rosterRows[idx];
  if (!target) return;
  if (!confirm(tAdmin().confirmDelete(target.name))) return;
  rosterRows.splice(idx, 1);
  renderRosterEditor();
}

async function saveRosterToD1() {
  const cleaned = [];
  for (let idx = 0; idx < rosterRows.length; idx++) {
    const r = rosterRows[idx];
    const name = normalizeMemberName(r.name);
    if (!name) continue;
    const dept = CTEC.normalizeDeptKey(r.dept);
    cleaned.push({
      sort_order: cleaned.length + 1,
      name,
      full_name: name,
      dept,
      department: dept,
      role: String(r.role ?? "Member").trim() || "Member",
      status: String(r.status ?? "Official").trim() || "Official"
    });
  }

  const sameDeptDupes = findSameDeptDuplicates(cleaned);
  if (sameDeptDupes.length > 0 && !confirm(tAdmin().confirmDuplicateSameDept(sameDeptDupes))) {
    return;
  }

  const btn = document.getElementById("saveRosterBtn");
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/admin/roster/save`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ rows: cleaned, roster: cleaned, members: cleaned, allowEmpty: cleaned.length === 0 })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    rosterRows = cleaned;
    renderRosterEditor();
    showToast(
      tAdmin().toastSavedRoster(countUniquePeople(cleaned), cleaned.length),
      "success"
    );
  } catch (err) {
    showToast(tAdmin().toastSaveRosterErr(err.message), "error");
  } finally {
    btn.disabled = false;
  }
}

/* ================= FUND EDITOR ================= */
function renderDeadlinesEditor() {
  const grid = document.getElementById("deadlinesGrid");
  if (!grid) return;
  const labels = getMonthLabels();
  grid.innerHTML = labels.map((label, idx) => `
    <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
      <span class="text-xs font-bold text-slate-700">${label}</span>
      <input type="number" min="0" max="31" value="${fundDeadlines[idx] || 0}"
             onchange="fundDeadlines[${idx}] = Math.max(0, Math.min(31, parseInt(this.value, 10) || 0)); this.value = fundDeadlines[${idx}];"
             class="w-14 px-2 py-1 text-center text-xs font-extrabold rounded border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
  const head = document.getElementById("fundEditorHead");
  if (!head) return;
  const t = tAdmin();
  const labels = getMonthLabels();
  const mCols = labels.map(m =>
    `<th class="py-3 px-2.5 text-center border-r border-slate-800 min-w-[92px]">${CTEC.escapeHtml(m)}</th>`
  ).join("");
  head.innerHTML =
    `<tr class="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">` +
      `<th class="py-3 px-3 text-center w-12 border-r border-slate-800">${CTEC.escapeHtml(t.colNo)}</th>` +
      `<th class="sticky-name-col bg-slate-900 py-3 px-4 border-r border-slate-700 min-w-[180px]">${CTEC.escapeHtml(t.colFullName)}</th>` +
      `<th class="py-3 px-4 border-r border-slate-800 min-w-[200px]">${CTEC.escapeHtml(t.colDept)}</th>` +
      `${mCols}` +
      `<th class="py-3 px-4 border-r border-slate-800 min-w-[200px]">${CTEC.escapeHtml(t.colNoteFull)}</th>` +
      `<th class="py-3 px-3 text-center w-16">${CTEC.escapeHtml(t.colDelete)}</th>` +
    `</tr>`;
}

function getStatusPillStyle(status) {
  if (status === "PAID") {
    return {
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
      label: "PAID"
    };
  }
  if (status === "DEBT") {
    return {
      cls: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
      label: "DEBT"
    };
  }
  return {
    cls: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100",
    label: "UNPAID"
  };
}

function cycleFundMonthStatus(rowIdx, monthIdx) {
  const current = fundRows[rowIdx].months[monthIdx] || "UNPAID";
  const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
  fundRows[rowIdx].months[monthIdx] = next;

  const btn = document.getElementById(`fund-cell-${rowIdx}-${monthIdx}`);
  if (btn) {
    const st = getStatusPillStyle(next);
    btn.className = `status-pill-btn inline-flex items-center justify-center w-20 py-1 rounded-full text-[11px] font-bold border cursor-pointer ${st.cls}`;
    btn.textContent = st.label;
  }
}

function deleteFundRow(idx) {
  const target = fundRows[idx];
  if (!target) return;
  if (!confirm(tAdmin().confirmDeleteFund(target.name))) return;
  fundRows.splice(idx, 1);
  renderFundEditor();
}

function renderFundEditor() {
  const t = tAdmin();
  const q = document.getElementById("fundSearchInput").value.toLowerCase().trim();
  document.getElementById("badgeFundCount").textContent = countUniquePeople(fundRows);

  const tbody = document.getElementById("fundEditorBody");
  const html = [];

  for (let realIdx = 0; realIdx < fundRows.length; realIdx++) {
    const row = fundRows[realIdx];
    const rowDept = CTEC.normalizeDeptKey(row.dept || "CONTENT DEPARTMENT");
    const personDepts = [rowDept];

    if (q) {
      const hay = `${row.name} ${personDepts.join(" ")} ${row.note || ""}`.toLowerCase();
      if (!hay.includes(q)) continue;
    }

    const deptBadgesHtml = personDepts
      .map(d => CTEC.renderDeptBadge(d, getDeptLabel(d)))
      .join(" ");

    const monthCells = row.months.map((stCode, mIdx) => {
      const st = getStatusPillStyle(stCode);
      return `<td class="py-2 px-2 text-center border-r border-slate-100">` +
        `<button id="fund-cell-${realIdx}-${mIdx}" type="button" ` +
                `onclick="cycleFundMonthStatus(${realIdx}, ${mIdx})" ` +
                `class="status-pill-btn inline-flex items-center justify-center w-20 py-1 rounded-full text-[11px] font-bold border cursor-pointer ${st.cls}">${st.label}</button>` +
      `</td>`;
    }).join("");

    html.push(
      `<tr class="group hover:bg-slate-50 border-b border-slate-100">` +
        `<td class="py-2.5 px-3 text-center text-xs font-bold text-slate-400 border-r border-slate-100">${realIdx + 1}</td>` +
        `<td class="sticky-name-col bg-white group-hover:bg-slate-50 py-2.5 px-4 font-semibold text-slate-800 border-r border-slate-200 whitespace-nowrap">${CTEC.escapeHtml(row.name)}</td>` +
        `<td class="py-2.5 px-4 border-r border-slate-100 whitespace-nowrap"><div class="flex flex-wrap items-center gap-1">${deptBadgesHtml}</div></td>` +
        `${monthCells}` +
        `<td class="py-1.5 px-2 border-r border-slate-100">` +
          `<input type="text" data-row-idx="${realIdx}" data-field="fund-note" value="${CTEC.escapeHtml(row.note || "")}" ` +
                 `oninput="fundRows[${realIdx}].note = this.value" ` +
                 `placeholder="${CTEC.escapeHtml(t.notePlaceholder)}" ` +
                 `class="sheet-cell-input text-xs text-slate-600">` +
        `</td>` +
        `<td class="py-1.5 px-2 text-center">` +
          `<button type="button" onclick="deleteFundRow(${realIdx})" title="${CTEC.escapeHtml(t.deleteTitle)}" ` +
                  `class="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition inline-flex items-center justify-center cursor-pointer">` +
            `<i class="fa-solid fa-trash-can text-xs"></i>` +
          `</button>` +
        `</td>` +
      `</tr>`
    );
  }

  tbody.innerHTML = html.length
    ? html.join("")
    : `<tr><td colspan="13" class="py-10 text-center text-sm text-slate-400">${CTEC.escapeHtml(t.emptyFund)}</td></tr>`;
}

function syncMembersFromRosterToFund() {
  const pruneMissing = Boolean(document.getElementById("pruneMissingOnSyncCheckbox")?.checked);
  const existingByPersonDept = new Map();
  const statusByPerson = new Map();

  for (let i = 0; i < fundRows.length; i++) {
    const name = normalizeMemberName(fundRows[i].name);
    const nameKey = buildMemberNameKey(name);
    if (!nameKey) continue;
    const dept = CTEC.normalizeDeptKey(fundRows[i].dept || "CONTENT DEPARTMENT");
    const pairKey = `${nameKey}||${dept}`;
    const months = Array.from({ length: 8 }, (_, m) => normalizeMonthStatus(fundRows[i].months?.[m]));
    const note = String(fundRows[i].note ?? "").trim();

    if (!existingByPersonDept.has(pairKey)) {
      existingByPersonDept.set(pairKey, {
        ...fundRows[i],
        name,
        dept,
        months,
        note
      });
    } else {
      const prev = existingByPersonDept.get(pairKey);
      prev.months = mergeMonthStatusArrays(prev.months, months);
      if (note && !prev.note.includes(note)) {
        prev.note = prev.note ? `${prev.note}; ${note}` : note;
      }
    }

    if (!statusByPerson.has(nameKey)) {
      statusByPerson.set(nameKey, { months: [...months], note });
    } else {
      const prevPerson = statusByPerson.get(nameKey);
      prevPerson.months = mergeMonthStatusArrays(prevPerson.months, months);
      if (note && !prevPerson.note.includes(note)) {
        prevPerson.note = prevPerson.note ? `${prevPerson.note}; ${note}` : note;
      }
    }
  }

  const merged = [];
  const seenKeys = new Set();

  for (let idx = 0; idx < rosterRows.length; idx++) {
    const r = rosterRows[idx];
    const name = normalizeMemberName(r.name);
    const nameKey = buildMemberNameKey(name);
    if (!nameKey) continue;
    const dept = CTEC.normalizeDeptKey(r.dept || "CONTENT DEPARTMENT");
    const pairKey = `${nameKey}||${dept}`;
    if (seenKeys.has(pairKey)) continue;

    seenKeys.add(pairKey);
    const oldRow = existingByPersonDept.get(pairKey);
    const personFallback = statusByPerson.get(nameKey);

    if (oldRow) {
      oldRow.name = name;
      oldRow.dept = dept;
      merged.push(oldRow);
      existingByPersonDept.delete(pairKey);
    } else {
      merged.push({
        id: Date.now() + idx,
        name,
        dept,
        months: personFallback ? [...personFallback.months] : ["UNPAID", "UNPAID", "UNPAID", "UNPAID", "UNPAID", "UNPAID", "UNPAID", "UNPAID"],
        note: personFallback?.note || ""
      });
    }
  }

  const removedCount = pruneMissing ? existingByPersonDept.size : 0;
  if (!pruneMissing) {
    existingByPersonDept.forEach(leftover => merged.push(leftover));
  }

  fundRows = merged;
  renderFundEditor();
  showToast(tAdmin().toastSyncedFund(countUniquePeople(fundRows), removedCount), "info");
}

async function saveFundToD1() {
  const accountNumber = document.getElementById("bankStkInput").value.trim();
  const bankName = document.getElementById("bankNameInput").value.trim();
  const accountName = document.getElementById("bankAccountNameInput").value.trim();
  const qrHtml10k = document.getElementById("bankQrInput").value.trim();
  const preservedRawHtml = String(bankInfo?.rawHtml || "");

  const hasStructuredBank = Boolean(accountNumber || bankName || accountName || qrHtml10k);
  const currentBankInfo = hasStructuredBank
    ? {
        accountNumber,
        bankName,
        accountName,
        qrHtml10k,
        ...(preservedRawHtml ? { rawHtml: preservedRawHtml } : {})
      }
    : preservedRawHtml
      ? { rawHtml: preservedRawHtml }
      : {
          accountNumber: "",
          bankName: "",
          accountName: "",
          qrHtml10k: ""
        };
  bankInfo = {
    accountNumber,
    bankName,
    accountName,
    qrHtml10k,
    rawHtml: preservedRawHtml
  };

  const cleanedMembers = [];
  for (let idx = 0; idx < fundRows.length; idx++) {
    const f = fundRows[idx];
    const name = normalizeMemberName(f.name);
    if (!name) continue;
    const dept = CTEC.normalizeDeptKey(f.dept);
    const months = Array.from({ length: 8 }, (_, m) => normalizeMonthStatus(f.months[m]));
    cleanedMembers.push({
      sort_order: cleanedMembers.length + 1,
      name,
      full_name: name,
      dept,
      department: dept,
      months,
      m0: months[0],
      m1: months[1],
      m2: months[2],
      m3: months[3],
      m4: months[4],
      m5: months[5],
      m6: months[6],
      m7: months[7],
      note: String(f.note ?? "").trim()
    });
  }

  const normalizedDeadlines = fundDeadlines.map(d => Math.max(0, Math.min(31, parseInt(d, 10) || 0)));

  const payload = {
    rows: cleanedMembers,
    members: cleanedMembers,
    fund: cleanedMembers,
    deadlines: normalizedDeadlines,
    bankInfo: currentBankInfo,
    bank_info: currentBankInfo,
    allowEmpty: cleanedMembers.length === 0
  };

  const btn = document.getElementById("saveFundBtn");
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/admin/fund/save`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    showToast(tAdmin().toastSavedFund, "success");
  } catch (err) {
    showToast(tAdmin().toastSaveFundErr(err.message), "error");
  } finally {
    btn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  applyAdminI18n(CTEC.getSavedLang());
  window.addEventListener("ctec:langchange", e => applyAdminI18n(e.detail.lang));

  const savedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (savedToken) {
    try {
      await verifyTokenWithServer(savedToken);
      adminToken = savedToken;
      unlockWorkspace();
      await loadAllAdminData();
    } catch (_) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }
});
Processed and analyzed in code
