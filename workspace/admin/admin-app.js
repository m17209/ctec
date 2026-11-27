/* ============================================================================
 * CTEC Administrator — admin-app.js
 * ----------------------------------------------------------------------------
 * Trình soạn thảo 2 "sheet" (Roster + Fund) chạy trên bản NHÁP trong trình duyệt,
 * sau đó mới ghi lên Cloudflare Worker / D1 khi bấm Lưu.
 *
 * Phụ thuộc : ../assets/ctec-core.js  (window.CTEC)
 * Worker API: GET  /api/roster, /api/fund
 *             GET  /api/admin/fetch-sheet?url=
 *             POST /api/admin/roster/save, /api/admin/fund/save
 *             POST /api/admin/migrate-from-sheet
 * ========================================================================== */
(() => {
  'use strict';

  if (!window.CTEC) {
    console.error('[admin-app] Thiếu window.CTEC — hãy nạp ../assets/ctec-core.js trước admin-app.js');
    return;
  }
  const CTEC = window.CTEC;

  /* ======================================================================
   * 1. HẰNG SỐ & TRẠNG THÁI
   * ==================================================================== */
  const MONTHS_EN = CTEC.FUND_MONTHS_EN;
  const MONTH_COUNT = MONTHS_EN.length;
  const MONTH_INDEX = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const FUND_STATUSES = ['UNPAID', 'PAID', 'DEBT']; // thứ tự xoay vòng khi bấm ô tháng

  const TAB_CFG = {
    roster: { btn: 'tabBtnRoster', badge: 'badgeRosterCount', on: ['bg-indigo-600', 'text-white', 'shadow-sm'] },
    fund: { btn: 'tabBtnFund', badge: 'badgeFundCount', on: ['bg-emerald-600', 'text-white', 'shadow-sm'] }
  };
  const TAB_OFF = ['text-slate-600', 'hover:text-slate-900'];
  const BADGE_ON = ['bg-white/20', 'text-white'];
  const BADGE_OFF = ['bg-slate-200', 'text-slate-700'];

  const state = {
    tab: 'roster',
    roster: [],                                   // [{uid,name,dept,role,status}]
    fund: [],                                     // [{uid,name,dept,months[8],note}]
    deadlines: new Array(MONTH_COUNT).fill(0),
    bankInfoRaw: {},                              // bankInfo gốc từ D1 (để không ghi đè mất rawHtml)
    selected: { roster: new Set(), fund: new Set() },
    anchor: { roster: null, fund: null },         // dòng mốc cho Shift + Click
    dirty: { roster: false, fund: false },
    loaded: false,                                // đã tải D1 thành công ít nhất 1 lần
    busy: false,
    importTarget: 'roster'
  };

  let uidSeq = 0;
  const newUid = () => `u${++uidSeq}`;
  const $ = (id) => document.getElementById(id);
  const esc = CTEC.escapeHtml;
  const curLang = () => CTEC.getSavedLang();

  /* ======================================================================
   * 2. I18N (vi / en)
   * ==================================================================== */
  const ADMIN_I18N = {
    vi: {
      pageTitle: 'CTEC Administrator',
      homeTitle: 'Về trang chủ CTEC',
      authModalTitle: 'Xác thực quyền quản trị',
      authModalDesc: 'Nhập ADMIN_TOKEN để mở khóa chỉnh sửa dữ liệu.',
      authTokenLabel: 'Mã quản trị (ADMIN_TOKEN)',
      authBackBtn: 'Quay lại',
      authUnlockBtn: 'Xác nhận & Mở khóa',
      lockBtnTitle: 'Đổi hoặc khóa lại mã quản trị',
      lockBtnLocked: 'Chưa xác thực',
      lockBtnUnlocked: 'Đã xác thực',
      errAuthRequired: 'Vui lòng nhập và xác thực ADMIN_TOKEN trước khi thực hiện thao tác chỉnh sửa.',
      errAuthInvalid: 'Mã quản trị (ADMIN_TOKEN) không chính xác.',
      toastAuthSuccess: 'Đã xác thực quyền quản trị.',
      tabRoster: 'Sheet 1: Nhân sự (Roster)', tabFund: 'Sheet 2: Quỹ CLB (Fund)',
      migrateWorkerBtn: 'Đồng bộ Sheet/Docs gốc', reloadD1: 'Tải lại từ D1', resetD1Btn: 'Reset D1',
      filterMemberPlaceholder: 'Lọc nhanh tên thành viên...',
      importSheetBtn: 'Nhập từ Google Sheet', addMemberBtn: 'Thêm thành viên', saveRosterBtn: 'Lưu Roster lên D1',
      clearSelectionBtn: 'Bỏ chọn',
      shiftSelectHint: '(Mẹo: Giữ Shift + Click để chọn nhanh một khoảng)',
      bulkApplyDeptBtn: 'Đổi ban', bulkApplyRoleBtn: 'Đổi chức vụ', bulkApplyStatusBtn: 'Đổi trạng thái',
      bulkDeleteBtn: 'Xóa đã chọn',
      selectAllTitle: 'Chọn tất cả dòng đang hiển thị',
      colNo: 'STT', colFullName: 'Họ và tên', colDeptFull: 'Ban (Department)', colRoleFull: 'Chức vụ (Role)',
      colStatus: 'Trạng thái', colDelete: 'Xóa', colNote: 'Ghi chú',
      deadlinesTitle: 'Cấu hình ngày hạn đóng hàng tháng (1 - 31, nhập 0 nếu chưa đặt hạn)',
      deadlinesHint: '* Khi qua ngày hạn đóng của tháng tương ứng, trạng thái <strong class="text-amber-600">UNPAID</strong> sẽ tự động hiển thị thành <strong class="text-red-600">DEBT</strong> trên trang công khai.',
      bankInfoTitle: 'Thông tin chuyển khoản (Bank Info)',
      bankStkLabel: 'Số tài khoản (STK)', bankNameLabel: 'Ngân hàng', bankHolderLabel: 'Tên chủ tài khoản',
      bankQrLabel: 'URL ảnh QR / Mã HTML QR 10K',
      fundSearchPlaceholder: 'Tìm thành viên trong bảng quỹ...',
      fundTipHtml: 'Mẹo: Bấm vào ô tháng để xoay vòng <strong class="text-amber-600">UNPAID</strong> → <strong class="text-emerald-600">PAID</strong> → <strong class="text-red-600">DEBT</strong>',
      pruneMissingLabel: 'Xóa người không có trong Roster',
      syncFromRosterBtn: 'Đồng bộ từ Roster',
      syncFromRosterTitle: 'Đồng bộ danh sách thành viên từ tab Roster sang Fund',
      saveFundBtn: 'Lưu Fund lên D1',
      bulkApplyAllMonthsBtn: 'Đặt 8 tháng cho dòng chọn',
      modalBadge: 'Tiền xử lý trước khi đẩy D1',
      modalMethod1: 'Cách 1: Tải từ Link Google Sheets (đã bật chia sẻ xem) hoặc link xuất CSV',
      modalMethod2: 'Cách 2: Dán trực tiếp từ Google Sheets (Ctrl + C trên Sheet rồi Ctrl + V vào đây)',
      modalReplaceCheck: 'Ghi đè danh sách hiện tại trong bảng nháp',
      modalCancelBtn: 'Hủy', modalApplyBtn: 'Nạp vào bảng xem trước', modalFetchBtn: 'Tải Sheet',

      // Động
      selectedRows: 'Đã chọn {n} dòng',
      rosterMembersCount: '{n} thành viên',
      rosterMembersCountRows: '{n} thành viên · {rows} dòng (có kiêm nhiệm)',
      loadingRows: 'Đang tải dữ liệu từ D1...',
      loadFailedRows: 'Không tải được dữ liệu. Bấm “Tải lại từ D1” để thử lại.',
      emptyRoster: 'Chưa có thành viên nào. Bấm “Thêm thành viên” hoặc “Nhập từ Google Sheet”.',
      emptyFund: 'Bảng quỹ đang trống. Dùng “Đồng bộ từ Roster” hoặc “Nhập từ Google Sheet”.',
      emptySearch: 'Không có dòng nào khớp với từ khóa.',
      namePlaceholder: 'Họ và tên...', notePlaceholder: 'Ghi chú...',
      deleteRowTitle: 'Xóa dòng này khỏi bảng nháp',
      overdueTitle: 'Đã quá hạn đóng — trang công khai sẽ hiển thị là DEBT',
      invalidDayTitle: 'Tháng này không có ngày {day}',
      toastBusy: 'Đang xử lý, vui lòng đợi...',
      toastLoaded: 'Đã tải {r} dòng Roster và {f} dòng Fund từ D1',
      toastLoadFail: 'Không tải được dữ liệu từ D1: {msg}',
      confirmReloadDirty: 'Bạn có thay đổi chưa lưu. Tải lại từ D1 sẽ bỏ toàn bộ thay đổi đó. Tiếp tục?',
      errNotLoaded: 'Chưa tải được dữ liệu từ D1 nên tạm khóa chức năng lưu (để tránh ghi đè mất dữ liệu). Hãy bấm “Tải lại từ D1”.',
      errEmptyRoster: 'Bảng Roster đang trống — hệ thống từ chối ghi đè D1 bằng dữ liệu rỗng. Muốn xóa sạch hãy dùng nút Reset D1.',
      errEmptyFund: 'Bảng Fund đang trống — hệ thống từ chối ghi đè D1 bằng dữ liệu rỗng. Muốn xóa sạch hãy dùng nút Reset D1.',
      confirmDup: 'Có {n} dòng bị trùng (cùng tên và cùng ban). Vẫn lưu?',
      warnBlankDropped: 'Đã bỏ qua {n} dòng trống tên.',
      toastSavedRoster: 'Đã lưu {n} thành viên lên D1.',
      toastSavedFund: 'Đã lưu {n} dòng quỹ lên D1.',
      toastSaveFail: 'Lưu thất bại: {msg}',
      errDeadlineInvalid: 'Hạn đóng {month}: tháng này không có ngày {day}.',
      errQrInvalid: 'Mã QR không hợp lệ: chỉ nhận URL https://, thẻ <img> (https hoặc base64) hoặc <svg>.',
      toastNothingSelected: 'Chưa chọn dòng nào.',
      confirmDeleteSelected: 'Xóa {n} dòng đã chọn khỏi bảng nháp? (Chỉ áp dụng lên D1 sau khi bấm Lưu)',
      toastBulkApplied: 'Đã cập nhật {n} dòng (chưa lưu).',
      toastDeleted: 'Đã xóa {n} dòng khỏi bảng nháp (chưa lưu).',
      importTitleRoster: 'Nhập Roster từ Google Sheet',
      importTitleFund: 'Nhập Fund từ Google Sheet',
      importHintRoster: 'Cột theo thứ tự: [STT] · Họ và tên · Ban · Chức vụ · Trạng thái. Dòng tiêu đề sẽ tự được bỏ qua.',
      importHintFund: 'Cột theo thứ tự: [STT] · Họ và tên · Ban · 8 cột tháng · Ghi chú. Dòng “Hạn đóng quỹ” sẽ cập nhật ngày hạn.',
      errNeedUrl: 'Hãy dán link Google Sheets trước.',
      errEmptyImport: 'Chưa có dữ liệu để nạp. Hãy tải từ link hoặc dán dữ liệu vào ô bên dưới.',
      errNoRowsParsed: 'Không đọc được dòng dữ liệu hợp lệ nào. Hãy kiểm tra lại thứ tự cột.',
      toastFetchSheetOk: 'Đã tải {n} dòng từ Google Sheet. Bấm “Nạp vào bảng xem trước” để tiếp tục.',
      toastFetchSheetFail: 'Không tải được Sheet: {msg}',
      toastImportOk: 'Đã nạp {n} dòng vào bảng nháp (chưa lưu).',
      toastImportSkippedDup: ' Bỏ qua {n} dòng đã tồn tại.',
      toastImportUnknownDept: ' {n} dòng có tên ban không nhận diện được nên được đặt thành CONTENT — hãy kiểm tra lại.',
      toastImportDeadlines: ' Đã cập nhật ngày hạn đóng.',
      confirmMigrate: 'Thao tác này sẽ GHI ĐÈ toàn bộ Roster và Fund trên D1 bằng dữ liệu từ Google Sheet/Docs gốc.\nCác thay đổi chưa lưu trong trang sẽ bị mất. Tiếp tục?',
      toastMigrateOk: 'Đã đồng bộ từ Sheet/Docs gốc: {r} nhân sự, {f} dòng quỹ.',
      toastMigrateFail: 'Đồng bộ thất bại: {msg}',
      promptReset: 'Thao tác này XÓA TOÀN BỘ dữ liệu {kind} trên D1 và không thể hoàn tác.\nGõ {word} để xác nhận:',
      toastResetCancelled: 'Đã hủy Reset D1.',
      toastResetOk: 'Đã xóa sạch bảng {kind} trên D1.',
      toastResetFail: 'Reset thất bại: {msg}',
      kindRoster: 'Roster', kindFund: 'Fund',
      resetD1Title: 'Xóa toàn bộ dữ liệu {kind} trên D1',
      toastSyncDone: 'Đồng bộ từ Roster: +{added} thêm, {moved} đổi ban, −{removed} xóa. Nhớ bấm “Lưu Fund lên D1”.',
      toastSyncNoop: 'Fund đã khớp với Roster, không có gì thay đổi.',
      errSyncEmpty: 'Roster đang trống nên không có gì để đồng bộ.',
      errNetwork: 'Không kết nối được tới máy chủ. Kiểm tra mạng/adblock; nếu mạng ổn thì có thể do CORS — hãy thêm {origin} vào ALLOWED_ORIGINS của Worker.',
      retryLoadBtn: 'Thử tải lại',
      warnUnknownDeptLoaded: ' {n} dòng trong D1 có tên ban lạ và đang hiển thị là CONTENT — hãy kiểm tra lại cột Ban.',
      toastMigrateBankKept: ' Giữ nguyên thông tin chuyển khoản đã nhập trong Admin.',
      toastMigrateUnknownDept: ' {n} dòng có tên ban lạ được đặt thành CONTENT.'
    },
    en: {
      pageTitle: 'CTEC Administrator',
      homeTitle: 'Back to CTEC Home',
      authModalTitle: 'Admin Authentication',
      authModalDesc: 'Enter ADMIN_TOKEN to unlock data editing and management.',
      authTokenLabel: 'Admin Token (ADMIN_TOKEN)',
      authBackBtn: 'Go back',
      authUnlockBtn: 'Verify & Unlock',
      lockBtnTitle: 'Change or re-lock admin token',
      lockBtnLocked: 'Locked',
      lockBtnUnlocked: 'Authenticated',
      errAuthRequired: 'Please enter and verify ADMIN_TOKEN before making any changes.',
      errAuthInvalid: 'Incorrect admin token (ADMIN_TOKEN).',
      toastAuthSuccess: 'Admin access unlocked.',
      tabRoster: 'Sheet 1: Roster', tabFund: 'Sheet 2: Club Fund',
      migrateWorkerBtn: 'Sync original Sheets/Docs', reloadD1: 'Reload from D1', resetD1Btn: 'Reset D1',
      filterMemberPlaceholder: 'Quick filter by member name...',
      importSheetBtn: 'Import from Google Sheet', addMemberBtn: 'Add member', saveRosterBtn: 'Save Roster to D1',
      clearSelectionBtn: 'Clear selection',
      shiftSelectHint: '(Tip: hold Shift + Click to select a range)',
      bulkApplyDeptBtn: 'Set department', bulkApplyRoleBtn: 'Set role', bulkApplyStatusBtn: 'Set status',
      bulkDeleteBtn: 'Delete selected',
      selectAllTitle: 'Select all visible rows',
      colNo: 'No.', colFullName: 'Full name', colDeptFull: 'Department', colRoleFull: 'Role',
      colStatus: 'Status', colDelete: 'Delete', colNote: 'Note',
      deadlinesTitle: 'Monthly due-day setup (1 - 31, enter 0 for no deadline)',
      deadlinesHint: '* Once the due day of a month has passed, <strong class="text-amber-600">UNPAID</strong> is automatically shown as <strong class="text-red-600">DEBT</strong> on the public page.',
      bankInfoTitle: 'Bank transfer info',
      bankStkLabel: 'Account number', bankNameLabel: 'Bank', bankHolderLabel: 'Account holder',
      bankQrLabel: 'QR image URL / 10K QR HTML',
      fundSearchPlaceholder: 'Search members in the fund table...',
      fundTipHtml: 'Tip: click a month cell to cycle <strong class="text-amber-600">UNPAID</strong> → <strong class="text-emerald-600">PAID</strong> → <strong class="text-red-600">DEBT</strong>',
      pruneMissingLabel: 'Remove people not in Roster',
      syncFromRosterBtn: 'Sync from Roster',
      syncFromRosterTitle: 'Sync the member list from the Roster tab into Fund',
      saveFundBtn: 'Save Fund to D1',
      bulkApplyAllMonthsBtn: 'Set all 8 months for selected rows',
      modalBadge: 'Pre-processing before pushing to D1',
      modalMethod1: 'Method 1: Load from a Google Sheets link (view sharing enabled) or a CSV export link',
      modalMethod2: 'Method 2: Paste straight from Google Sheets (Ctrl + C in the Sheet, then Ctrl + V here)',
      modalReplaceCheck: 'Overwrite the current list in the draft table',
      modalCancelBtn: 'Cancel', modalApplyBtn: 'Load into preview table', modalFetchBtn: 'Load Sheet',

      selectedRows: '{n} row(s) selected',
      rosterMembersCount: '{n} members',
      rosterMembersCountRows: '{n} members · {rows} rows (multi-department)',
      loadingRows: 'Loading data from D1...',
      loadFailedRows: 'Could not load data. Press “Reload from D1” to retry.',
      emptyRoster: 'No members yet. Press “Add member” or “Import from Google Sheet”.',
      emptyFund: 'The fund table is empty. Use “Sync from Roster” or “Import from Google Sheet”.',
      emptySearch: 'No rows match your search.',
      namePlaceholder: 'Full name...', notePlaceholder: 'Note...',
      deleteRowTitle: 'Remove this row from the draft',
      overdueTitle: 'Past due — the public page will show this as DEBT',
      invalidDayTitle: 'This month has no day {day}',
      toastBusy: 'Working, please wait...',
      toastLoaded: 'Loaded {r} Roster rows and {f} Fund rows from D1',
      toastLoadFail: 'Could not load data from D1: {msg}',
      confirmReloadDirty: 'You have unsaved changes. Reloading from D1 will discard them. Continue?',
      errNotLoaded: 'Data from D1 has not been loaded yet, so saving is locked to avoid overwriting it. Press “Reload from D1”.',
      errEmptyRoster: 'The Roster table is empty — the server refuses to overwrite D1 with empty data. Use Reset D1 to wipe it on purpose.',
      errEmptyFund: 'The Fund table is empty — the server refuses to overwrite D1 with empty data. Use Reset D1 to wipe it on purpose.',
      confirmDup: '{n} row(s) are duplicated (same name and same department). Save anyway?',
      warnBlankDropped: 'Skipped {n} row(s) with an empty name.',
      toastSavedRoster: 'Saved {n} members to D1.',
      toastSavedFund: 'Saved {n} fund rows to D1.',
      toastSaveFail: 'Save failed: {msg}',
      errDeadlineInvalid: 'Due day for {month}: this month has no day {day}.',
      errQrInvalid: 'Invalid QR value: only https:// URLs, <img> tags (https or base64) or <svg> are accepted.',
      toastNothingSelected: 'No rows selected.',
      confirmDeleteSelected: 'Remove {n} selected row(s) from the draft? (D1 only changes after you press Save)',
      toastBulkApplied: 'Updated {n} row(s) (not saved yet).',
      toastDeleted: 'Removed {n} row(s) from the draft (not saved yet).',
      importTitleRoster: 'Import Roster from Google Sheet',
      importTitleFund: 'Import Fund from Google Sheet',
      importHintRoster: 'Column order: [No.] · Full name · Department · Role · Status. A header row is skipped automatically.',
      importHintFund: 'Column order: [No.] · Full name · Department · 8 month columns · Note. A “Fund contribution deadline” row updates the due days.',
      errNeedUrl: 'Paste a Google Sheets link first.',
      errEmptyImport: 'Nothing to load yet. Fetch from a link or paste data into the box below.',
      errNoRowsParsed: 'No valid data rows could be read. Please check the column order.',
      toastFetchSheetOk: 'Fetched {n} rows from Google Sheet. Press “Load into preview table” to continue.',
      toastFetchSheetFail: 'Could not fetch the Sheet: {msg}',
      toastImportOk: 'Loaded {n} row(s) into the draft (not saved yet).',
      toastImportSkippedDup: ' Skipped {n} existing row(s).',
      toastImportUnknownDept: ' {n} row(s) had an unrecognised department and were set to CONTENT — please review.',
      toastImportDeadlines: ' Due days updated.',
      confirmMigrate: 'This will OVERWRITE the entire Roster and Fund in D1 with the original Google Sheet/Docs data.\nUnsaved changes on this page will be lost. Continue?',
      toastMigrateOk: 'Synced from the original Sheets/Docs: {r} members, {f} fund rows.',
      toastMigrateFail: 'Sync failed: {msg}',
      promptReset: 'This DELETES ALL {kind} data in D1 and cannot be undone.\nType {word} to confirm:',
      toastResetCancelled: 'Reset D1 cancelled.',
      toastResetOk: 'The {kind} table in D1 has been wiped.',
      toastResetFail: 'Reset failed: {msg}',
      kindRoster: 'Roster', kindFund: 'Fund',
      resetD1Title: 'Delete all {kind} data in D1',
      toastSyncDone: 'Synced from Roster: +{added} added, {moved} moved, −{removed} removed. Remember to press “Save Fund to D1”.',
      toastSyncNoop: 'Fund already matches the Roster — nothing changed.',
      errSyncEmpty: 'The Roster is empty, so there is nothing to sync.',
      errNetwork: 'Cannot reach the server. Check your connection/ad blocker; if the network is fine this may be CORS — add {origin} to the Worker\'s ALLOWED_ORIGINS.',
      retryLoadBtn: 'Try again',
      warnUnknownDeptLoaded: ' {n} row(s) in D1 have an unrecognised department and show as CONTENT — please review the Department column.',
      toastMigrateBankKept: ' Bank details already entered in Admin were kept.',
      toastMigrateUnknownDept: ' {n} row(s) with an unrecognised department were set to CONTENT.'
    }
  };

  const ROLE_LABELS = {
    vi: { 'President': 'Chủ tịch', 'Vice President': 'Phó Chủ tịch', 'Head of Department': 'Trưởng ban', 'Deputy Head of Department': 'Phó ban', 'Member': 'Thành viên' },
    en: { 'President': 'President', 'Vice President': 'Vice President', 'Head of Department': 'Head of Department', 'Deputy Head of Department': 'Deputy Head of Department', 'Member': 'Member' }
  };
  const STATUS_LABELS = {
    vi: { 'Official': 'Chính thức', 'Probationary': 'Thử việc', 'Inactive': 'Tạm nghỉ' },
    en: { 'Official': 'Official', 'Probationary': 'Probationary', 'Inactive': 'Inactive' }
  };

  function t(key, vars) {
    const dict = ADMIN_I18N[curLang()] || ADMIN_I18N.vi;
    let str = dict[key] ?? ADMIN_I18N.vi[key] ?? key;
    if (vars) str = str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
    return str;
  }

  function applyAdminStaticI18n() {
    const dict = ADMIN_I18N[curLang()] || ADMIN_I18N.vi;
    document.title = dict.pageTitle;
    const home = $('homeLink');
    if (home) home.title = dict.homeTitle;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = dict[el.getAttribute('data-i18n')];
      if (typeof v === 'string') el.textContent = v;
    });
    // Chuỗi HTML tĩnh do chính file này định nghĩa (đáng tin) — không lấy từ dữ liệu người dùng.
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const v = dict[el.getAttribute('data-i18n-html')];
      if (typeof v === 'string') el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const v = dict[el.getAttribute('data-i18n-placeholder')];
      if (typeof v === 'string') el.placeholder = v;
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const v = dict[el.getAttribute('data-i18n-title')];
      if (typeof v === 'string') el.title = v;
    });
    updateResetButtonTitle();
    updateRosterStats();
  }

  /* ======================================================================
   * 3. TIỆN ÍCH CHUNG (toast, busy, POST, lỗi)
   * ==================================================================== */
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
   * 6. HẠN ĐÓNG QUỸ (khớp logic trang Fund công khai: 00:00 giờ VN, UTC+7)
   * ==================================================================== */
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
    return ms !== null && Date.now() >= ms;
  };

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

  /* ======================================================================
   * 6.5 XÁC THỰC ADMIN_TOKEN CHO MỌI THAO TÁC SỬA ĐỔI
   * ==================================================================== */
  state.authenticated = false;

  function setAdminWorkspaceLocked(locked) {
    state.authenticated = !locked;
    window.__ctecAdminAuthenticated = !locked;
    const ws = $('adminWorkspace');
    if (ws) {
      ws.classList.toggle('pointer-events-none', locked);
      ws.classList.toggle('select-none', locked);
      ws.classList.toggle('opacity-40', locked);
    }
    const lockIcon = $('adminLockIcon');
    const lockLabel = $('adminLockLabel');
    const lockBtn = $('adminLockBtn');
    if (lockIcon) {
      lockIcon.className = locked
        ? 'fa-solid fa-lock text-[11px]'
        : 'fa-solid fa-lock-open text-[11px]';
    }
    if (lockLabel) {
      lockLabel.textContent = t(locked ? 'lockBtnLocked' : 'lockBtnUnlocked');
    }
    if (lockBtn) {
      lockBtn.classList.toggle('text-amber-300', locked);
      lockBtn.classList.toggle('text-emerald-300', !locked);
    }
  }

  function openAdminAuthModal(clearExisting = false) {
    if (clearExisting) {
      CTEC.setAdminToken('');
      setAdminWorkspaceLocked(true);
    }
    const modal = $('adminAuthModal');
    const input = $('adminTokenInput');
    const errEl = $('adminAuthError');
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.add('hidden');
    }
    if (input) input.value = '';
    if (modal) modal.classList.remove('hidden');
    setTimeout(() => input?.focus(), 30);
  }

  function closeAdminAuthModal() {
    $('adminAuthModal')?.classList.add('hidden');
  }

  function requireAuthenticated() {
    if (state.authenticated && CTEC.getAdminToken()) return true;
    openAdminAuthModal(false);
    showToast(t('errAuthRequired'), 'warn', 3500);
    return false;
  }

  async function verifyStoredOrProvidedToken(tokenCandidate) {
    const trimmed = String(tokenCandidate || '').trim();
    if (!trimmed) throw new Error(t('errAuthRequired'));
    const prev = CTEC.getAdminToken();
    CTEC.setAdminToken(trimmed);
    try {
      const res = await fetch(`${CTEC.API_BASE_URL}/api/admin/verify?_t=${Date.now()}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${trimmed}` },
        cache: 'no-store'
      });
      if (!res.ok) {
        CTEC.setAdminToken('');
        throw new Error(t('errAuthInvalid'));
      }
      const data = await res.json().catch(() => null);
      if (!data || data.ok === false) {
        CTEC.setAdminToken('');
        throw new Error(data?.error || t('errAuthInvalid'));
      }
      setAdminWorkspaceLocked(false);
      closeAdminAuthModal();
      return true;
    } catch (err) {
      if (prev && prev !== trimmed) CTEC.setAdminToken('');
      throw err;
    }
  }

  async function submitAdminAuthForm(e) {
    e?.preventDefault();
    const input = $('adminTokenInput');
    const errEl = $('adminAuthError');
    const btn = $('adminAuthSubmitBtn');
    const icon = $('adminAuthSubmitIcon');
    const token = input?.value || '';

    if (errEl) errEl.classList.add('hidden');
    if (btn) btn.disabled = true;
    if (icon) icon.className = 'fa-solid fa-spinner fa-spin';

    try {
      await verifyStoredOrProvidedToken(token);
      showToast(t('toastAuthSuccess'), 'success', 2500);
      if (!state.loaded) {
        await loadAllAdminData(true);
      }
    } catch (err) {
      if (errEl) {
        errEl.textContent = errMsg(err);
        errEl.classList.remove('hidden');
      }
      input?.focus();
      input?.select();
    } finally {
      if (btn) btn.disabled = false;
      if (icon) icon.className = 'fa-solid fa-unlock-keyhole';
    }
  }

  async function initAdminAuthGate() {
    setAdminWorkspaceLocked(true);
    const saved = CTEC.getAdminToken();
    if (saved) {
      try {
        await verifyStoredOrProvidedToken(saved);
        await loadAllAdminData(true);
        return;
      } catch (_) {
        // Token cũ không còn hợp lệ -> mở modal yêu cầu nhập lại
      }
    }
    openAdminAuthModal(false);
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

        state.deadlines = Array.from({ length: MONTH_COUNT }, (_, i) => CTEC.parseDeadlineDay(fundPayload.deadlines?.[i]));
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

  function renderDeadlines() {
    const grid = $('deadlinesGrid');
    if (!grid) return;
    grid.innerHTML = monthLabels(curLang()).map((label, i) => `
      <label class="block">
        <span class="block text-[11px] font-bold text-slate-500 mb-1">${esc(label)}</span>
        <input type="number" min="0" max="31" step="1" inputmode="numeric" data-deadline="${i}" value="${state.deadlines[i]}"
               class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500">
      </label>`).join('');
    for (let i = 0; i < MONTH_COUNT; i++) markDeadlineValidity(i);
  }

  function markDeadlineValidity(i) {
    const el = $('deadlinesGrid')?.querySelector(`[data-deadline="${i}"]`);
    if (!el) return;
    const day = state.deadlines[i];
    const bad = day > 0 && day > daysInMonth(i);
    el.classList.toggle('border-red-400', bad);
    el.classList.toggle('ring-2', bad);
    el.classList.toggle('ring-red-300', bad);
    el.title = bad ? t('invalidDayTitle', { day }) : '';
  }

  function renderAll() {
    fillBulkSelects();
    renderRosterEditor();
    renderFundHead();
    renderFundEditor();
    renderDeadlines();
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
    if (!requireAuthenticated()) return;
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
    if (!requireAuthenticated()) return;
    const rows = selectedRows('fund');
    if (!rows.length) return;
    const value = $('bulkFundStatusSelect').value;
    rows.forEach((r) => { r.months = new Array(MONTH_COUNT).fill(value); });
    setDirty('fund');
    renderFundEditor();
    showToast(t('toastBulkApplied', { n: rows.length }), 'info', 2500);
  }

  function deleteSelected(kind) {
    if (!requireAuthenticated()) return;
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
    if (!requireAuthenticated()) return;
    state[kind] = state[kind].filter((r) => r.uid !== uid);
    state.selected[kind].delete(uid);
    setDirty(kind);
    renderKind(kind);
  }

  function addRosterRow() {
    if (!requireAuthenticated()) return;
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
   * 10. SỰ KIỆN TRÊN BẢNG (event delegation)
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
      if (!requireAuthenticated()) return;
      const el = e.target;
      if (el.tagName !== 'INPUT' || el.dataset.field !== 'name') return;
      const row = findRow('roster', el);
      if (!row) return;
      row.name = el.value;
      setDirty('roster');
      updateRosterStats();
    });
    rb.addEventListener('change', (e) => {
      if (!requireAuthenticated()) return;
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
      if (!requireAuthenticated()) return;
      const el = e.target;
      if (el.tagName !== 'INPUT' || !el.dataset.field) return;
      const row = findRow('fund', el);
      if (!row) return;
      row[el.dataset.field] = el.value;
      setDirty('fund');
    });
    fb.addEventListener('change', (e) => {
      if (!requireAuthenticated()) return;
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
        if (!requireAuthenticated()) return;
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

    /* ----- Hạn đóng quỹ ----- */
    const grid = $('deadlinesGrid');
    grid.addEventListener('input', (e) => {
      if (!requireAuthenticated()) return;
      const el = e.target.closest('[data-deadline]');
      if (!el) return;
      const i = parseInt(el.dataset.deadline, 10);
      const n = parseInt(el.value, 10);
      state.deadlines[i] = Number.isInteger(n) ? Math.min(31, Math.max(0, n)) : 0;
      markDeadlineValidity(i);
      setDirty('fund');
      renderFundEditor(); // cập nhật dấu đồng hồ "quá hạn" trên các ô UNPAID
    });
    grid.addEventListener('change', (e) => {
      const el = e.target.closest('[data-deadline]');
      if (el) el.value = String(state.deadlines[parseInt(el.dataset.deadline, 10)]);
    });

    /* ----- Bank info ----- */
    ['bankStkInput', 'bankNameInput', 'bankAccountNameInput', 'bankQrInput'].forEach((id) => {
      $(id)?.addEventListener('input', () => { if (!requireAuthenticated()) return; setDirty('fund'); });
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
    if (!requireAuthenticated()) return;
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
    if (!requireAuthenticated()) return;
    if (!state.loaded) return showToast(t('errNotLoaded'), 'error');

    // Hạn đóng: ngày không tồn tại (vd 30/2) sẽ bị trang công khai bỏ qua âm thầm → chặn ngay tại đây
    for (let i = 0; i < MONTH_COUNT; i++) {
      const day = state.deadlines[i];
      if (day > 0 && day > daysInMonth(i)) {
        $('deadlinesGrid')?.querySelector(`[data-deadline="${i}"]`)?.focus();
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
    if (!requireAuthenticated()) return;
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
        deadlines = Array.from({ length: MONTH_COUNT }, (_, m) => CTEC.parseDeadlineDay(c[off + 2 + m]));
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
    if (!requireAuthenticated()) return;
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
      renderDeadlines();
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
    if (!requireAuthenticated()) return;
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
    if (!requireAuthenticated()) return;
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
    renderDeadlines();
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

    initAdminAuthGate();
  }

  // Các hàm được gọi trực tiếp từ thuộc tính onclick/oninput/onchange trong index.html
  Object.assign(window, {
    openAdminAuthModal,
    closeAdminAuthModal,
    submitAdminAuthForm,
    requireAdminAuth: requireAuthenticated,
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
