* ============================================================================
 * CTEC Schedule — schedule-app.js
 * ----------------------------------------------------------------------------
 * Lịch trình sự kiện với calendar grid, event countdown & event description.
 * Dữ liệu sự kiện được lưu trên Worker (Cloudflare D1) qua Admin.
 *
 * Phụ thuộc: ../assets/ctec-core.js (window.CTEC)
 * Worker API: GET /api/events
 * ========================================================================== */
(() => {
  'use strict';
  const CTEC = window.CTEC;
  if (!CTEC) {
    console.error('[schedule-app] Thiếu window.CTEC');
    return;
  }
  /* ======================================================================
   * 1. STATE
   * ==================================================================== */
  const EVENTS_STORAGE_KEY = 'ctec_events';
  let events = [];          // [{date:'YYYY-MM-DD', title:'...', description:'...'}]
  let currentYear = 2026;
  let currentMonth = 11;    // 1-based (Nov 2026)
  let selectedDate = null;  // 'YYYY-MM-DD'
  let countdownInterval = null;
  /* ======================================================================
   * 2. I18N
   * ==================================================================== */
  const SCHEDULE_I18N = {
    vi: {
      pageTitle: 'Lịch trình sự kiện - CTEC',
      heroBadge: 'Lịch trình sự kiện',
      heroTitle: 'Lịch trình hoạt động CTEC',
      heroDesc: 'Theo dõi các sự kiện, hoạt động và mốc thời gian quan trọng của câu lạc bộ từ tháng 8/2026 đến tháng 12/2027.',
      countdownLabel: 'Event Countdown',
      eventDetailLabel: 'Chi tiết sự kiện',
      selectDayHint: 'Chọn một ngày trên lịch để xem chi tiết sự kiện',
      noUpcoming: 'Chưa có sự kiện sắp tới',
      noEventOnDay: 'Không có sự kiện vào ngày này',
      wheelHint: 'Cuộn hoặc kéo để chọn',
      wheelOk: 'OK',
