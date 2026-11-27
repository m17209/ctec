/* ============================================================================
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
   * 1. HẰNG SỐ & TRẠNG THÁI
   * ==================================================================== */
  const EVENTS_STORAGE_KEY = 'ctec_events';
  const MIN_YEAR = 2026;
  const MIN_MONTH = 8;   // Tháng 8/2026
  const MAX_YEAR = 2027;
  const MAX_MONTH = 12;  // Tháng 12/2027
  const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

  let events = [];          // [{ id, date:'YYYY-MM-DD', title:'...', description:'...' }]
  let currentYear = 2026;
  let currentMonth = 11;    // 1-based (Nov 2026)
  let selectedDate = null;  // 'YYYY-MM-DD'
  let countdownInterval = null;
  let nearestEventDate = null;

  const $ = (id) => document.getElementById(id);
  const esc = CTEC.escapeHtml;
  const curLang = () => CTEC.getSavedLang();

  /* ======================================================================
   * 2. I18N (vi / en)
   * ==================================================================== */
  const SCHEDULE_I18N = {
    vi: {
      pageTitle: 'Lịch trình sự kiện - CTEC',
      homeTitle: 'Về trang chủ CTEC',
      syncTitle: 'Đồng bộ lịch sự kiện mới nhất',
      refreshFull: 'Làm mới dữ liệu',
      refreshShort: 'ĐỒNG BỘ',
      heroBadge: 'Lịch trình sự kiện',
      heroTitle: 'Lịch trình hoạt động CTEC',
      heroDesc: 'Theo dõi các sự kiện, hoạt động và mốc thời gian quan trọng của câu lạc bộ từ tháng 8/2026 đến tháng 12/2027.',
      countdownLabel: 'Event Countdown',
      eventDetailLabel: 'Chi tiết sự kiện',
      selectDayHint: 'Chọn một ngày trên lịch để xem chi tiết sự kiện',
      noUpcoming: 'Chưa có sự kiện sắp tới',
      noUpcomingDesc: 'Các mốc hoạt động mới của câu lạc bộ sẽ được cập nhật sớm.',
      noEventOnDay: 'Không có sự kiện vào ngày này',
      wheelHint: 'Cuộn hoặc kéo để chọn',
      wheelOk: 'OK',
      unitDays: 'Ngày',
      unitHours: 'Giờ',
      unitMinutes: 'Phút',
      unitSeconds: 'Giây',
      jumpToEventBtn: 'Xem trên lịch',
      todayBtn: 'Hôm nay',
      legendToday: 'Hôm nay',
      legendHasEvent: 'Có sự kiện',
      legendSelected: 'Đang chọn',
      upcomingListTitle: 'Sự kiện sắp tới',
      happeningTodayBadge: 'Diễn ra hôm nay',
      eventsOnDayCount: '{n} sự kiện',
      noDescription: 'Chưa có mô tả chi tiết cho sự kiện này.',
      loadingText: 'Đang đồng bộ lịch sự kiện qua hệ thống CTEC...',
      errorTitle: 'Không thể tải dữ liệu sự kiện!',
      errorDesc: 'Vui lòng thử lại sau ít phút hoặc kiểm tra kết nối mạng.',
      footerText: 'Lịch trình hoạt động chính thức CTEC | Thực hiện bởi Nhat Minh',
      weekdays: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      monthLabel: (m, y) => `Tháng ${m} / ${y}`
    },
    en: {
      pageTitle: 'Event Schedule - CTEC',
      homeTitle: 'Back to CTEC Home',
      syncTitle: 'Sync latest event schedule',
      refreshFull: 'Refresh Data',
      refreshShort: 'SYNC',
      heroBadge: 'Event Schedule',
      heroTitle: 'CTEC Activity Calendar',
      heroDesc: 'Keep track of club events, activities, and key milestones from August 2026 to December 2027.',
      countdownLabel: 'Event Countdown',
      eventDetailLabel: 'Event Details',
      selectDayHint: 'Select a day on the calendar to view event details',
      noUpcoming: 'No upcoming events yet',
      noUpcomingDesc: 'New club activities and milestones will be posted here soon.',
      noEventOnDay: 'No events scheduled on this day',
      wheelHint: 'Scroll or drag to select',
      wheelOk: 'OK',
      unitDays: 'Days',
      unitHours: 'Hours',
      unitMinutes: 'Mins',
      unitSeconds: 'Secs',
      jumpToEventBtn: 'View on calendar',
      todayBtn: 'Today',
      legendToday: 'Today',
      legendHasEvent: 'Has event',
      legendSelected: 'Selected',
      upcomingListTitle: 'Upcoming Events',
      happeningTodayBadge: 'Happening Today',
      eventsOnDayCount: '{n} event(s)',
      noDescription: 'No detailed description provided for this event.',
      loadingText: 'Synchronizing event schedule via CTEC system...',
      errorTitle: 'Unable to load event schedule!',
      errorDesc: 'Please try again in a moment or check your network connection.',
      footerText: 'Official CTEC Activity Calendar | Crafted by Nhat Minh',
      weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      monthLabel: (m, y) => {
        const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${names[m - 1]} ${y}`;
      }
    }
  };

  function t(key, vars) {
    const dict = SCHEDULE_I18N[curLang()] || SCHEDULE_I18N.vi;
    const val = dict[key] ?? SCHEDULE_I18N.vi[key] ?? key;
    if (typeof val === 'function') return val;
    if (!vars) return val;
    return String(val).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
  }

  /* ======================================================================
   * 3. TIỆN ÍCH NGÀY THÁNG (Múi giờ Việt Nam UTC+7)
   * ==================================================================== */
  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function formatYmd(year, month, day) {
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  function parseYmd(ymd) {
    const m = String(ymd || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const year = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    const day = parseInt(m[3], 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return { year, month, day };
  }

  // Ngày hôm nay theo giờ Việt Nam (dùng đồng hồ máy chủ X-Server-Time nếu đã đồng bộ)
  function getTodayVnParts() {
    const vnDate = new Date(CTEC.getServerNowMs() + VN_OFFSET_MS);
    return {
      year: vnDate.getUTCFullYear(),
      month: vnDate.getUTCMonth() + 1,
      day: vnDate.getUTCDate(),
      ymd: formatYmd(vnDate.getUTCFullYear(), vnDate.getUTCMonth() + 1, vnDate.getUTCDate())
    };
  }

  // Mốc 00:00:00 giờ VN của ngày YYYY-MM-DD tính ra UTC ms
  function eventStartUtcMs(ymd) {
    const p = parseYmd(ymd);
    if (!p) return null;
    return Date.UTC(p.year, p.month - 1, p.day, 0, 0, 0, 0) - VN_OFFSET_MS;
  }

  function formatDisplayDate(ymd, lang = curLang()) {
    const p = parseYmd(ymd);
    if (!p) return ymd || '--';
    const dt = new Date(Date.UTC(p.year, p.month - 1, p.day));
    if (lang === 'en') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[dt.getUTCDay()]}, ${months[p.month - 1]} ${p.day}, ${p.year}`;
    }
    const daysVi = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${daysVi[dt.getUTCDay()]}, ${pad2(p.day)}/${pad2(p.month)}/${p.year}`;
  }

  function clampYearMonth(year, month) {
    const idx = year * 12 + (month - 1);
    const minIdx = MIN_YEAR * 12 + (MIN_MONTH - 1);
    const maxIdx = MAX_YEAR * 12 + (MAX_MONTH - 1);
    const clamped = Math.max(minIdx, Math.min(maxIdx, idx));
    return {
      year: Math.floor(clamped / 12),
      month: (clamped % 12) + 1
    };
  }

  function getMonthWheelOptions(lang = curLang()) {
    const dict = SCHEDULE_I18N[lang] || SCHEDULE_I18N.vi;
    const opts = [];
    for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
      const mStart = y === MIN_YEAR ? MIN_MONTH : 1;
      const mEnd = y === MAX_YEAR ? MAX_MONTH : 12;
      for (let m = mStart; m <= mEnd; m++) {
        opts.push({
          value: `${y}-${pad2(m)}`,
          label: dict.monthLabel(m, y)
        });
      }
    }
    return opts;
  }

  /* ======================================================================
   * 4. I18N TĨNH
   * ==================================================================== */
  function applyScheduleStaticI18n(lang = curLang()) {
    const dict = SCHEDULE_I18N[lang] || SCHEDULE_I18N.vi;
    document.title = dict.pageTitle;
    const homeLink = $('homeLink');
    if (homeLink) homeLink.title = dict.homeTitle;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (typeof dict[key] === 'string') el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (typeof dict[key] === 'string') el.title = dict[key];
    });

    CTEC.updateWheelOptions('monthYearWheelPicker', getMonthWheelOptions(lang), true);
  }

  /* ======================================================================
   * 5. ĐỒNG BỘ DỮ LIỆU TỪ WORKER (/api/events)
   * ==================================================================== */
  function normalizeEventsList(rawList) {
    if (!Array.isArray(rawList)) return [];
    return rawList
      .map((item) => {
        const date = String(item?.date ?? item?.event_date ?? '').trim();
        const title = String(item?.title ?? '').trim();
        const description = String(item?.description ?? '').trim();
        if (!parseYmd(date) || !title) return null;
        return { id: item?.id ?? null, date, title, description };
      })
      .filter(Boolean)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function loadCachedEvents() {
    try {
      const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (!raw) return null;
      return normalizeEventsList(JSON.parse(raw));
    } catch (_) {
      return null;
    }
  }

  function saveCachedEvents(list) {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(list));
    } catch (_) { /* bỏ qua nếu bị chặn storage */ }
  }

  async function refreshEventsData() {
    const reloadBtn = $('reloadBtn');
    const reloadIcon = $('reloadIcon');
    const loadingState = $('loadingState');
    const errorState = $('errorState');

    if (reloadBtn) reloadBtn.disabled = true;
    if (reloadIcon) reloadIcon.classList.add('fa-spin');
    errorState?.classList.add('hidden');
    if (!events.length) loadingState?.classList.remove('hidden');

    try {
      const payload = await CTEC.fetchWorkerJson('/api/events');
      const rawList = payload.events || payload.rows || payload.data;
      if (!Array.isArray(rawList)) {
        throw new Error(payload?.error || 'Invalid D1 events payload');
      }

      events = normalizeEventsList(rawList);
      saveCachedEvents(events);
      loadingState?.classList.add('hidden');

      if (!selectedDate) {
        pickInitialSelection();
      }
      renderAllScheduleUI();
    } catch (err) {
      console.error('[schedule-app] Load /api/events failed:', err);
      loadingState?.classList.add('hidden');

      const cached = loadCachedEvents();
      if (cached && cached.length) {
        events = cached;
        if (!selectedDate) pickInitialSelection();
        renderAllScheduleUI();
      } else {
        errorState?.classList.remove('hidden');
        renderAllScheduleUI();
      }
    } finally {
      if (reloadBtn) reloadBtn.disabled = false;
      if (reloadIcon) reloadIcon.classList.remove('fa-spin');
    }
  }

  function pickInitialSelection() {
    const today = getTodayVnParts();
    const todayEvents = events.filter((e) => e.date === today.ymd);
    if (todayEvents.length) {
      const clamped = clampYearMonth(today.year, today.month);
      currentYear = clamped.year;
      currentMonth = clamped.month;
      selectedDate = today.ymd;
      return;
    }

    const upcoming = events.find((e) => e.date >= today.ymd);
    if (upcoming) {
      const p = parseYmd(upcoming.date);
      if (p) {
        const clamped = clampYearMonth(p.year, p.month);
        currentYear = clamped.year;
        currentMonth = clamped.month;
        selectedDate = upcoming.date;
        return;
      }
    }

    const clamped = clampYearMonth(today.year, today.month);
    currentYear = clamped.year;
    currentMonth = clamped.month;
    selectedDate = today.ymd;
  }

  /* ======================================================================
   * 6. COUNTDOWN SỰ KIỆN GẦN NHẤT
   * ==================================================================== */
  function startCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    const titleEl = $('countdownEventTitle');
    const metaEl = $('countdownEventMeta');
    const jumpBtn = $('jumpNearestBtn');
    const cdDays = $('cdDays');
    const cdHours = $('cdHours');
    const cdMinutes = $('cdMinutes');
    const cdSeconds = $('cdSeconds');

    const updateTick = () => {
      const nowMs = CTEC.getServerNowMs();
      const today = getTodayVnParts();

      // Tìm sự kiện đang diễn ra hôm nay hoặc sắp tới gần nhất
      const nextEv = events.find((ev) => ev.date >= today.ymd) || null;
      if (!nextEv) {
        nearestEventDate = null;
        if (titleEl) titleEl.textContent = t('noUpcoming');
        if (metaEl) metaEl.textContent = t('noUpcomingDesc');
        if (jumpBtn) {
          jumpBtn.classList.add('hidden');
          jumpBtn.classList.remove('inline-flex');
        }
        if (cdDays) cdDays.textContent = '--';
        if (cdHours) cdHours.textContent = '--';
        if (cdMinutes) cdMinutes.textContent = '--';
        if (cdSeconds) cdSeconds.textContent = '--';
        return;
      }

      nearestEventDate = nextEv.date;
      if (titleEl) titleEl.textContent = nextEv.title;
      if (jumpBtn) {
        jumpBtn.classList.remove('hidden');
        jumpBtn.classList.add('inline-flex');
      }

      const targetMs = eventStartUtcMs(nextEv.date);
      const diffMs = targetMs !== null ? targetMs - nowMs : 0;

      if (nextEv.date === today.ymd || diffMs <= 0) {
        if (metaEl) {
          metaEl.innerHTML =
            `<span>${esc(formatDisplayDate(nextEv.date))}</span>` +
            `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">${esc(t('happeningTodayBadge'))}</span>`;
        }
        if (cdDays) cdDays.textContent = '00';
        if (cdHours) cdHours.textContent = '00';
        if (cdMinutes) cdMinutes.textContent = '00';
        if (cdSeconds) cdSeconds.textContent = '00';
        return;
      }

      if (metaEl) {
        metaEl.textContent = formatDisplayDate(nextEv.date);
      }

      const totalSec = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      if (cdDays) cdDays.textContent = pad2(days);
      if (cdHours) cdHours.textContent = pad2(hours);
      if (cdMinutes) cdMinutes.textContent = pad2(minutes);
      if (cdSeconds) cdSeconds.textContent = pad2(seconds);
    };

    updateTick();
    countdownInterval = setInterval(updateTick, 1000);
  }

  /* ======================================================================
   * 7. RENDER LỊCH THÁNG & CHI TIẾT SỰ KIỆN
   * ==================================================================== */
  function navigateToMonth(year, month) {
    const clamped = clampYearMonth(year, month);
    currentYear = clamped.year;
    currentMonth = clamped.month;
    CTEC.setWheelValue('monthYearWheelPicker', `${currentYear}-${pad2(currentMonth)}`);
    renderCalendar();
  }

  function jumpToDate(ymd) {
    const p = parseYmd(ymd);
    if (!p) return;
    selectedDate = ymd;
    navigateToMonth(p.year, p.month);
    renderEventDetail();
  }

  function renderCalendar() {
    const weekdaysEl = $('calWeekdays');
    const gridEl = $('calDaysGrid');
    const prevBtn = $('prevMonthBtn');
    const nextBtn = $('nextMonthBtn');
    if (!weekdaysEl || !gridEl) return;

    const dict = SCHEDULE_I18N[curLang()] || SCHEDULE_I18N.vi;
    weekdaysEl.innerHTML = dict.weekdays
      .map((w) => `<div class="cal-header-cell">${esc(w)}</div>`)
      .join('');

    const isAtMin = currentYear === MIN_YEAR && currentMonth === MIN_MONTH;
    const isAtMax = currentYear === MAX_YEAR && currentMonth === MAX_MONTH;
    if (prevBtn) prevBtn.disabled = isAtMin;
    if (nextBtn) nextBtn.disabled = isAtMax;

    CTEC.setWheelValue('monthYearWheelPicker', `${currentYear}-${pad2(currentMonth)}`);

    // Map ngày -> danh sách sự kiện
    const eventsByDate = new Map();
    for (const ev of events) {
      if (!eventsByDate.has(ev.date)) eventsByDate.set(ev.date, []);
      eventsByDate.get(ev.date).push(ev);
    }

    const todayYmd = getTodayVnParts().ymd;
    const firstDow = new Date(Date.UTC(currentYear, currentMonth - 1, 1)).getUTCDay(); // 0=Sun..6=Sat
    const leadingBlanks = (firstDow + 6) % 7; // Chuyển sang Mon=0..Sun=6
    const daysInMonth = new Date(Date.UTC(currentYear, currentMonth, 0)).getUTCDate();
    const prevMonthDays = new Date(Date.UTC(currentYear, currentMonth - 1, 0)).getUTCDate();

    const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;
    const cellsHtml = [];

    for (let i = 0; i < totalCells; i++) {
      if (i < leadingBlanks) {
        const dayNum = prevMonthDays - leadingBlanks + i + 1;
        cellsHtml.push(
          `<div class="cal-day is-outside" aria-hidden="true"><span class="cal-day-num">${dayNum}</span></div>`
        );
        continue;
      }

      const dayNum = i - leadingBlanks + 1;
      if (dayNum > daysInMonth) {
        const nextDayNum = dayNum - daysInMonth;
        cellsHtml.push(
          `<div class="cal-day is-outside" aria-hidden="true"><span class="cal-day-num">${nextDayNum}</span></div>`
        );
        continue;
      }

      const ymd = formatYmd(currentYear, currentMonth, dayNum);
      const dayEvents = eventsByDate.get(ymd) || [];
      const isToday = ymd === todayYmd;
      const isSelected = ymd === selectedDate;
      const hasEvent = dayEvents.length > 0;

      const classes = ['cal-day'];
      if (isToday) classes.push('is-today');
      if (hasEvent) classes.push('has-event');
      if (isSelected) classes.push('is-selected');

      const dotCount = Math.min(dayEvents.length, 3);
      const dotsHtml = dotCount > 0
        ? `<div class="cal-event-dots">${'<span class="cal-event-dot"></span>'.repeat(dotCount)}</div>`
        : `<div class="cal-event-dots"></div>`;

      const titleAttr = hasEvent ? ` title="${esc(dayEvents.map((e) => e.title).join(' • '))}"` : '';

      cellsHtml.push(
        `<button type="button" data-date="${ymd}" class="${classes.join(' ')}"${titleAttr}>` +
          `<span class="cal-day-num">${dayNum}</span>` +
          dotsHtml +
        `</button>`
      );
    }

    gridEl.innerHTML = cellsHtml.join('');
  }

  function renderEventDetail() {
    const badgeEl = $('selectedDateBadge');
    const bodyEl = $('eventDetailBody');
    if (!bodyEl) return;

    if (!selectedDate) {
      if (badgeEl) badgeEl.textContent = '--';
      bodyEl.innerHTML =
        `<p class="text-sm text-slate-400 py-6 text-center">${esc(t('selectDayHint'))}</p>`;
      return;
    }

    if (badgeEl) badgeEl.textContent = selectedDate;

    const dayEvents = events.filter((ev) => ev.date === selectedDate);
    if (!dayEvents.length) {
      bodyEl.innerHTML =
        `<div class="py-5 text-center space-y-1.5">` +
          `<div class="text-xs font-semibold text-slate-500">${esc(formatDisplayDate(selectedDate))}</div>` +
          `<p class="text-sm text-slate-400">${esc(t('noEventOnDay'))}</p>` +
        `</div>`;
      return;
    }

    const headerHtml =
      `<div class="flex items-center justify-between gap-2 mb-3">` +
        `<span class="text-xs font-semibold text-slate-500">${esc(formatDisplayDate(selectedDate))}</span>` +
        `<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">` +
          `${esc(t('eventsOnDayCount', { n: dayEvents.length }))}` +
        `</span>` +
      `</div>`;

    const cardsHtml = dayEvents
      .map((ev) => {
        const desc = ev.description
          ? `<p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">${esc(ev.description)}</p>`
          : `<p class="mt-1.5 text-xs italic text-slate-400">${esc(t('noDescription'))}</p>`;
        return (
          `<article class="p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/80 dark:border-slate-700/80">` +
            `<h4 class="text-sm sm:text-base font-bold text-slate-900 leading-snug">${esc(ev.title)}</h4>` +
            desc +
          `</article>`
        );
      })
      .join('');

    bodyEl.innerHTML = `${headerHtml}<div class="space-y-3">${cardsHtml}</div>`;
  }

  function renderUpcomingList() {
    const listEl = $('upcomingListBody');
    const badgeEl = $('upcomingCountBadge');
    if (!listEl) return;

    const todayYmd = getTodayVnParts().ymd;
    const upcoming = events.filter((ev) => ev.date >= todayYmd);
    if (badgeEl) badgeEl.textContent = String(upcoming.length);

    if (!upcoming.length) {
      listEl.innerHTML =
        `<p class="text-xs sm:text-sm text-slate-400 py-5 text-center">${esc(t('noUpcoming'))}</p>`;
      return;
    }

    listEl.innerHTML = upcoming
      .map((ev) => {
        const isSelected = ev.date === selectedDate;
        const activeCls = isSelected
          ? 'border-indigo-400 bg-indigo-50 dark:!border-indigo-400/80 dark:!bg-indigo-950/75 ring-1 ring-indigo-400/25'
          : 'border-slate-200 bg-slate-50 hover:border-amber-400 dark:!border-slate-700/80 dark:!bg-slate-800/80 dark:hover:!border-amber-400/80 dark:hover:!bg-slate-800';
        return (
          `<button type="button" data-jump-date="${esc(ev.date)}" ` +
                  `class="w-full text-left p-3 rounded-xl border ${activeCls} transition flex items-start justify-between gap-3 cursor-pointer">` +
            `<div class="min-w-0">` +
              `<div class="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">${esc(ev.title)}</div>` +
              (ev.description
                ? `<div class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">${esc(ev.description)}</div>`
                : '') +
            `</div>` +
            `<span class="px-2 py-0.5 rounded-md bg-white dark:!bg-slate-900 border border-slate-200 dark:!border-slate-700 text-[11px] font-mono font-bold text-slate-700 dark:!text-slate-200 shrink-0">` +
              `${esc(ev.date)}` +
            `</span>` +
          `</button>`
        );
      })
      .join('');
  }

  function renderAllScheduleUI() {
    startCountdown();
    renderCalendar();
    renderEventDetail();
    renderUpcomingList();
  }

  /* ======================================================================
   * 8. KHỞI TẠO
   * ==================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    const today = getTodayVnParts();
    const initialYm = clampYearMonth(today.year, today.month);
    currentYear = initialYm.year;
    currentMonth = initialYm.month;

    const initLang = curLang();
    CTEC.createWheelPicker({
      id: 'monthYearWheelPicker',
      listId: 'monthYearDrumList',
      labelId: 'monthYearWheelLabel',
      options: getMonthWheelOptions(initLang),
      onSelect: (val) => {
        const [yStr, mStr] = String(val).split('-');
        const y = parseInt(yStr, 10);
        const m = parseInt(mStr, 10);
        if (Number.isInteger(y) && Number.isInteger(m)) {
          currentYear = y;
          currentMonth = m;
          renderCalendar();
        }
      }
    });

    applyScheduleStaticI18n(initLang);
    CTEC.setWheelValue('monthYearWheelPicker', `${currentYear}-${pad2(currentMonth)}`);

    $('prevMonthBtn')?.addEventListener('click', () => {
      const m = currentMonth === 1 ? 12 : currentMonth - 1;
      const y = currentMonth === 1 ? currentYear - 1 : currentYear;
      navigateToMonth(y, m);
    });

    $('nextMonthBtn')?.addEventListener('click', () => {
      const m = currentMonth === 12 ? 1 : currentMonth + 1;
      const y = currentMonth === 12 ? currentYear + 1 : currentYear;
      navigateToMonth(y, m);
    });

    $('todayBtn')?.addEventListener('click', () => {
      const nowToday = getTodayVnParts();
      jumpToDate(nowToday.ymd);
      renderUpcomingList();
    });

    $('jumpNearestBtn')?.addEventListener('click', () => {
      if (!nearestEventDate) return;
      jumpToDate(nearestEventDate);
      renderUpcomingList();
    });

    $('calDaysGrid')?.addEventListener('click', (e) => {
      const cell = e.target.closest('button[data-date]');
      if (!cell) return;
      selectedDate = cell.dataset.date;
      renderCalendar();
      renderEventDetail();
      renderUpcomingList();
    });

    $('upcomingListBody')?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-jump-date]');
      if (!btn) return;
      jumpToDate(btn.dataset.jumpDate);
      renderUpcomingList();
    });

    window.addEventListener('ctec:langchange', (e) => {
      applyScheduleStaticI18n(e.detail.lang);
      renderAllScheduleUI();
    });

    renderAllScheduleUI();
    refreshEventsData();
  });

  window.refreshEventsData = refreshEventsData;
})();
