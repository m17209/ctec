:root {
  --page-bg: #f8fafc;
  --surface-bg: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --border-subtle: #e2e8f0;
  --hero-gradient-start: #e0f2fe;
  --hero-gradient-mid: #f0f9ff;
  --hero-gradient-end: var(--page-bg);
  --ctec-header-bg: linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%);
  --ctec-header-text: #ffffff;
  --ctec-surface: #ffffff;
  --ctec-surface-muted: #f8fafc;
  --ctec-border: #e2e8f0;
  --ctec-text: #0f172a;
  --ctec-text-muted: #64748b;
}

html.dark {
  --page-bg: #0b1120;
  --surface-bg: #111827;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-subtle: #1e293b;
  --hero-gradient-start: #0f2942;
  --hero-gradient-mid: #0d192e;
  --hero-gradient-end: var(--page-bg);
  --ctec-header-bg: linear-gradient(135deg, #020617 0%, #0f172a 60%, #1e1b4b 100%);
  --ctec-header-text: #f8fafc;
  --ctec-surface: #0f172a;
  --ctec-surface-muted: #1e293b;
  --ctec-border: #334155;
  --ctec-text: #f1f5f9;
  --ctec-text-muted: #94a3b8;
}

html, body {
  max-width: 100%;
  overflow-x: clip;
}

body {
  font-family: 'Be Vietnam Pro', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  background-color: var(--ctec-surface-muted);
  color: var(--ctec-text);
}

h1, h2, h3, .ctec-brand-title, .font-display {
  font-family: 'Plus Jakarta Sans', 'Be Vietnam Pro', sans-serif;
}

/* Header & Navigation */
.ctec-header {
  background: var(--ctec-header-bg);
  color: var(--ctec-header-text);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ctec-nav-btn {
  min-height: 38px;
}

.ctec-btn-label-short {
  display: none;
}

.ctec-btn-label-full {
  display: inline;
}

@media (max-width: 767.98px) {
  .ctec-btn-label-full {
    display: none;
  }
  .ctec-btn-label-short {
    display: inline;
  }
}

/* DEF-04: Vùng nền trắng bảo toàn độ tương phản cho mã QR trong Dark Mode */
.qr-safe-surface {
  background-color: #ffffff !important;
  color: #0f172a !important;
}

/* Sticky Name Column (Light & Dark Mode) */
.sticky-name-col {
  position: sticky;
  left: 0;
  z-index: 10;
  background-color: #ffffff;
  box-shadow: 2px 0 6px -2px rgba(15, 23, 42, 0.12);
}

thead .sticky-name-col {
  background-color: #0f172a !important;
  z-index: 20;
}

tr:hover .sticky-name-col,
tr.group:hover .sticky-name-col {
  background-color: #f8fafc;
}

html.dark .sticky-name-col {
  background-color: #162032 !important;
  box-shadow: 2px 0 8px -2px rgba(0, 0, 0, 0.55);
}

html.dark thead .sticky-name-col {
  background-color: #0f172a !important;
}

html.dark tr:hover .sticky-name-col,
html.dark tr.group:hover .sticky-name-col {
  background-color: #1e293b !important;
}

/* Dark Mode Surface Layering (tránh bẹt màu) */
html.dark body {
  background-color: #020617;
  color: #e2e8f0;
}

html.dark .bg-white {
  background-color: #0f172a !important;
}

html.dark .bg-white\/90 {
  background-color: rgba(15, 23, 42, 0.92) !important;
}

html.dark .bg-slate-50 {
  background-color: #1e293b !important;
}

html.dark .bg-slate-100 {
  background-color: #334155 !important;
}

html.dark tr:hover,
html.dark .hover\:bg-slate-50:hover,
html.dark .hover\:bg-slate-50\/80:hover {
  background-color: rgba(30, 41, 59, 0.72) !important;
}

html.dark .text-slate-900,
html.dark .text-slate-800 {
  color: #f8fafc !important;
}

html.dark .text-slate-700,
html.dark .text-slate-600 {
  color: #cbd5e1 !important;
}

html.dark .text-slate-500,
html.dark .text-slate-400 {
  color: #94a3b8 !important;
}

html.dark .border-slate-300,
html.dark .border-slate-200,
html.dark .border-slate-200\/90,
html.dark .border-slate-100 {
  border-color: #334155 !important;
}

html.dark .divide-slate-100 > :not([hidden]) ~ :not([hidden]) {
  border-color: #1e293b !important;
}

/* Dark Mode Badges & Status Pills */
html.dark .bg-indigo-50 {
  background-color: rgba(79, 70, 229, 0.22) !important;
}
html.dark .text-indigo-700, html.dark .text-indigo-600, html.dark .text-indigo-900 {
  color: #a5b4fc !important;
}
html.dark .border-indigo-200, html.dark .border-indigo-100 {
  border-color: rgba(99, 102, 241, 0.38) !important;
}

html.dark .bg-sky-50 {
  background-color: rgba(2, 132, 199, 0.22) !important;
}
html.dark .text-sky-700, html.dark .text-sky-600 {
  color: #7dd3fc !important;
}
html.dark .border-sky-200, html.dark .border-sky-100 {
  border-color: rgba(14, 165, 233, 0.38) !important;
}

html.dark .bg-red-50 {
  background-color: rgba(220, 38, 38, 0.22) !important;
}
html.dark .text-red-700, html.dark .text-red-600 {
  color: #fca5a5 !important;
}
html.dark .border-red-200 {
  border-color: rgba(239, 68, 68, 0.38) !important;
}

html.dark .bg-amber-50 {
  background-color: rgba(217, 119, 6, 0.22) !important;
}
html.dark .text-amber-800, html.dark .text-amber-700, html.dark .text-amber-600, html.dark .text-amber-900 {
  color: #fcd34d !important;
}
html.dark .border-amber-200, html.dark .border-amber-100 {
  border-color: rgba(245, 158, 11, 0.38) !important;
}

html.dark .bg-emerald-50 {
  background-color: rgba(5, 150, 105, 0.22) !important;
}
html.dark .text-emerald-700, html.dark .text-emerald-600, html.dark .text-emerald-900 {
  color: #6ee7b7 !important;
}
html.dark .border-emerald-200, html.dark .border-emerald-100 {
  border-color: rgba(16, 185, 129, 0.38) !important;
}

html.dark .bg-pink-50 {
  background-color: rgba(219, 39, 119, 0.22) !important;
}
html.dark .text-pink-700 {
  color: #f9a8d4 !important;
}
html.dark .border-pink-200 {
  border-color: rgba(236, 72, 153, 0.38) !important;
}

html.dark .bg-violet-50 {
  background-color: rgba(124, 58, 237, 0.22) !important;
}
html.dark .text-violet-700, html.dark .text-violet-600 {
  color: #c4b5fd !important;
}
html.dark .border-violet-100 {
  border-color: rgba(139, 92, 246, 0.38) !important;
}

html.dark .bg-blue-50 {
  background-color: rgba(37, 99, 235, 0.22) !important;
}
html.dark .border-blue-100 {
  border-color: rgba(59, 130, 246, 0.38) !important;
}

/* Form Controls in Dark Mode */
html.dark input:not([type="checkbox"]):not([type="radio"]),
html.dark select,
html.dark textarea {
  background-color: #1e293b;
  color: #f1f5f9;
  border-color: #334155;
}

html.dark select option {
  background-color: #0f172a;
  color: #f1f5f9;
}

html.dark input::placeholder,
html.dark textarea::placeholder {
  color: #64748b;
}

/* Wheel Picker & Mobile Overflow Protection (DEF-12) */
.wheel-picker-wrap {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.wheel-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 38px;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--ctec-border);
  background: var(--ctec-surface-muted);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ctec-text);
  cursor: pointer;
}

.wheel-popover {
  display: none;
  position: absolute;
  right: 0;
  z-index: 40;
  margin-top: 0.375rem;
  width: min(14.5rem, calc(100vw - 2rem));
  min-width: 12.5rem;
  max-width: calc(100vw - 2rem);
  border-radius: 0.75rem;
  background: var(--ctec-surface);
  border: 1px solid var(--ctec-border);
  box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.25);
  overflow: hidden;
}

.wheel-popover.wheel-align-left {
  left: 0;
  right: auto;
}

.wheel-popover.open {
  display: block;
}

@media (max-width: 639.98px) {
  .wheel-popover {
    width: min(14rem, calc(100vw - 2rem));
  }
  input:not([type="checkbox"]):not([type="radio"]),
  select,
  textarea {
    font-size: 16px !important;
  }
}

.wheel-drum-viewport {
  position: relative;
  height: 9rem;
  overflow: hidden;
  touch-action: none;
  overscroll-behavior: contain;
  user-select: none;
}

.wheel-center-highlight {
  pointer-events: none;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 2rem;
  border-top: 1px solid rgba(99, 102, 241, 0.35);
  border-bottom: 1px solid rgba(99, 102, 241, 0.35);
  background: rgba(99, 102, 241, 0.08);
}

.wheel-drum-list {
  position: relative;
  width: 100%;
  height: 100%;
}

.wheel-item {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  margin-top: -1rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  will-change: transform, opacity;
}

.wheel-item.active-item {
  color: #4f46e5;
  font-weight: 700;
}

html.dark .wheel-item.active-item {
  color: #818cf8;
}

.wheel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.625rem;
  border-top: 1px solid var(--ctec-border);
  background: var(--ctec-surface-muted);
  font-size: 0.6875rem;
  color: var(--ctec-text-muted);
}

.wheel-confirm-btn {
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: #4f46e5;
  color: #ffffff;
  cursor: pointer;
}

/* Vùng hero / header gradient tệp màu đáy liền mạch xuống nền bên dưới */
.hero-gradient,
.page-hero,
.ctec-hero-bg {
  position: relative;
  background: linear-gradient(
    180deg,
    var(--hero-gradient-start) 0%,
    var(--hero-gradient-mid) 58%,
    var(--hero-gradient-end) 100%
  );
  border-bottom: none !important;
  box-shadow: none !important;
}

.hero-gradient::after,
.page-hero::after,
.ctec-hero-bg::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 48px;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, var(--page-bg) 100%);
}

html.dark .hero-gradient::after,
html.dark .page-hero::after,
html.dark .ctec-hero-bg::after {
  background: linear-gradient(180deg, rgba(11, 17, 32, 0) 0%, var(--page-bg) 100%);
}

/* Đảm bảo tương phản badge số lượng trong Dark Mode */
html.dark #badgeFundCount,
html.dark #badgeRosterCount {
  background-color: #1e293b !important;
  color: #e2e8f0 !important;
  border: 1px solid #334155;
}
