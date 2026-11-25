window.CTEC = (() => {
  const THEME_COOKIE_NAME = 'ctec_theme';
  const LANG_COOKIE_NAME = 'ctec_lang';
  const API_BASE_URL = 'https://nameless-mud-298a.minhlesynhat.workers.dev';

  const DEPT_STYLES = {
    "EXCUTIVE BOARD": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "EXECUTIVE BOARD": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "PUBLIC RELATIONS DEPARTMENT": "bg-sky-50 text-sky-700 border-sky-200",
    "DESIGN DEPARTMENT": "bg-red-50 text-red-700 border-red-200",
    "CONTENT DEPARTMENT": "bg-amber-50 text-amber-700 border-amber-200",
    "HUMAN RESOURCES DEPARTMENT": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "EVENT & EXTERNAL RELATIONS DEPARTMENT": "bg-pink-50 text-pink-700 border-pink-200"
  };
  const DEFAULT_DEPT_STYLE = "bg-slate-100 text-slate-700 border-slate-200";

  const ITEM_HEIGHT = 32;
  const wheelInstances = {};
  const listeners = [];

  function getCookie(name) {
    const target = `${encodeURIComponent(name)}=`;
    const parts = document.cookie ? document.cookie.split('; ') : [];
    for (const part of parts) {
      if (part.indexOf(target) === 0) {
        return decodeURIComponent(part.slice(target.length));
      }
    }
    return null;
  }

  function setCookie(name, value, maxAgeSeconds = 60 * 60 * 24 * 365) {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; SameSite=Lax${secure}`;
  }

  /* ================= NGÔN NGỮ (VI / EN) ================= */
  function getSavedLang() {
    const saved = getCookie(LANG_COOKIE_NAME);
    return (saved === 'en' || saved === 'vi') ? saved : 'vi';
  }

  function syncLangButtons(lang) {
    const isVi = lang === 'vi';
    document.documentElement.lang = isVi ? 'vi' : 'en';
    document.querySelectorAll('[data-lang-toggle]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(!isVi));
      btn.title = isVi ? 'Switch interface to English' : 'Chuyển giao diện sang Tiếng Việt';
      const label = btn.querySelector('[data-lang-label]');
      const shortLabel = btn.querySelector('[data-lang-label-short]');
      const nextCode = isVi ? 'EN' : 'VI';
      if (label) label.textContent = nextCode;
      if (shortLabel) shortLabel.textContent = nextCode;
    });
  }

  function applyLang(lang, persist = true) {
    const normalized = lang === 'en' ? 'en' : 'vi';
    if (persist) {
      setCookie(LANG_COOKIE_NAME, normalized);
    }
    syncLangButtons(normalized);
    window.dispatchEvent(new CustomEvent('ctec:langchange', { detail: { lang: normalized } }));
    return normalized;
  }

  function toggleLang() {
    const next = getSavedLang() === 'vi' ? 'en' : 'vi';
    return applyLang(next, true);
  }

  /* ================= GIAO DIỆN (DARK / LIGHT) ================= */
  function getSavedTheme() {
    const saved = getCookie(THEME_COOKIE_NAME);
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function syncThemeButtons(theme) {
    const isDark = theme === 'dark';
    const isVi = getSavedLang() === 'vi';
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(isDark));
      if (isVi) {
        btn.title = isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối';
      } else {
        btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      }
      const icon = btn.querySelector('[data-theme-icon]');
      const label = btn.querySelector('[data-theme-label]');
      const shortLabel = btn.querySelector('[data-theme-label-short]');
      if (icon) {
        icon.className = isDark ? 'fa-solid fa-sun text-amber-300 text-xs' : 'fa-solid fa-moon text-indigo-300 text-xs';
      }
      const txt = isDark
        ? (isVi ? 'SÁNG' : 'LIGHT')
        : (isVi ? 'TỐI' : 'DARK');
      if (label) label.textContent = txt;
      if (shortLabel) shortLabel.textContent = txt;
    });
  }

  function applyTheme(theme, persist = true) {
    const normalized = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', normalized === 'dark');
    if (persist) {
      setCookie(THEME_COOKIE_NAME, normalized);
    }
    syncThemeButtons(normalized);
    window.dispatchEvent(new CustomEvent('ctec:themechange', { detail: { theme: normalized } }));
    return normalized;
  }

  function toggleTheme() {
    const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    return applyTheme(next, true);
  }

  applyLang(getSavedLang(), false);
  applyTheme(getSavedTheme(), false);
  window.addEventListener('ctec:langchange', () => syncThemeButtons(getSavedTheme()));
  document.addEventListener('DOMContentLoaded', () => {
    syncLangButtons(getSavedLang());
    syncThemeButtons(getSavedTheme());
  });

  const escapeHtml = (str) =>
    String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const normalizeDeptKey = (dept) => {
    const upper = String(dept ?? '').trim().toUpperCase();
    return upper === "EXECUTIVE BOARD" ? "EXCUTIVE BOARD" : upper;
  };

  const normalizeMemberName = (name) =>
    String(name ?? '').trim().replace(/\s+/g, ' ');

  const buildMemberNameKey = (name) =>
    normalizeMemberName(name).toLowerCase();

  const countUniquePeople = (rows) => {
    const uniqueNames = new Set();
    if (!Array.isArray(rows)) return 0;
    for (let i = 0; i < rows.length; i++) {
      const key = buildMemberNameKey(rows[i]?.name ?? rows[i]?.full_name);
      if (key) uniqueNames.add(key);
    }
    return uniqueNames.size;
  };

  const renderDeptBadge = (dept, displayText = null) => {
    const key = normalizeDeptKey(dept);
    const cls = DEPT_STYLES[key] || DEFAULT_DEPT_STYLE;
    const text = displayText ?? dept;
    return `<span class="ctec-dept-badge inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${cls}">${escapeHtml(text)}</span>`;
  };

  /* ================= FETCH JSON QUA CLOUDFLARE WORKER ================= */
  async function fetchWorkerJson(endpoint) {
    const sep = endpoint.includes("?") ? "&" : "?";
    const res = await fetch(`${API_BASE_URL}${endpoint}${sep}_t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error || `HTTP ${res.status}`);
    }
    const payload = await res.json();
    if (payload && payload.ok === false) {
      throw new Error(payload.error || "Worker returned ok: false");
    }
    return payload;
  }

  /* ================= WHEEL PICKER ================= */
  function createWheelPicker({ id, listId, labelId, selectId, options, onSelect }) {
    const listEl = document.getElementById(listId);
    const labelEl = document.getElementById(labelId);
    const selectEl = selectId ? document.getElementById(selectId) : null;
    if (!listEl) return;

    let currentOptions = options.slice();
    let currentIndex = 0;
    let offsetPx = 0;
    let isDragging = false;
    let startY = 0;
    let startOffset = 0;
    let velocity = 0;
    let lastY = 0;
    let lastTime = 0;
    let animFrame = null;
    let renderRaf = null;
    let itemEls = [];
    let lastActiveIdx = -1;
    let lastLabelText = '';

    function emitSelection(idx) {
      const chosen = currentOptions[idx];
      if (!chosen) return;
      if (labelEl && labelEl.textContent !== chosen.label) {
        labelEl.textContent = chosen.label;
      }
      if (selectEl && selectEl.value !== chosen.value) {
        selectEl.value = chosen.value;
      }
      if (idx !== currentIndex) {
        currentIndex = idx;
        onSelect?.(chosen.value);
      }
    }

    function syncTextsOnly() {
      currentOptions.forEach((opt, i) => {
        if (itemEls[i] && itemEls[i].textContent !== opt.label) {
          itemEls[i].textContent = opt.label;
        }
      });
      const chosen = currentOptions[currentIndex];
      if (chosen && labelEl) labelEl.textContent = chosen.label;
    }

    function buildItems() {
      const frag = document.createDocumentFragment();
      itemEls = currentOptions.map((opt, idx) => {
        const div = document.createElement('div');
        div.className = 'wheel-item';
        div.textContent = opt.label;
        div.addEventListener('click', (e) => {
          e.stopPropagation();
          if (Math.abs(velocity) < 0.08) animateTo(idx, true);
        });
        frag.appendChild(div);
        return div;
      });
      listEl.innerHTML = '';
      listEl.appendChild(frag);
      lastActiveIdx = -1;
      lastLabelText = '';
    }

    function renderDrumNow() {
      renderRaf = null;
      const maxIdx = Math.max(0, currentOptions.length - 1);
      offsetPx = Math.max(-0.4, Math.min(maxIdx + 0.4, offsetPx));
      const activeIdx = Math.max(0, Math.min(maxIdx, Math.round(offsetPx)));

      for (let i = 0; i < itemEls.length; i++) {
        const el = itemEls[i];
        const dist = i - offsetPx;
        const absDist = Math.abs(dist);

        if (absDist > 3.2) {
          if (el.style.opacity !== '0') el.style.opacity = '0';
          if (i === lastActiveIdx) el.classList.remove('active-item');
          continue;
        }

        const y = Math.round(dist * ITEM_HEIGHT * 10) / 10;
        const scale = Math.max(0.8, 1 - absDist * 0.08).toFixed(3);
        const opacity = Math.max(0.16, 1 - absDist * 0.34).toFixed(2);

        el.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
        el.style.opacity = opacity;

        const isActive = i === activeIdx;
        if (isActive !== (i === lastActiveIdx)) {
          el.classList.toggle('active-item', isActive);
        }
      }

      lastActiveIdx = activeIdx;
      const chosen = currentOptions[activeIdx];
      if (chosen && labelEl && chosen.label !== lastLabelText) {
        lastLabelText = chosen.label;
        labelEl.textContent = chosen.label;
      }
    }

    function scheduleRender() {
      if (renderRaf == null) {
        renderRaf = requestAnimationFrame(renderDrumNow);
      }
    }

    function animateTo(targetIdx, shouldCommit = true) {
      cancelAnimationFrame(animFrame);
      const maxIdx = Math.max(0, currentOptions.length - 1);
      const clamped = Math.max(0, Math.min(maxIdx, targetIdx));

      const step = () => {
        const diff = clamped - offsetPx;
        if (Math.abs(diff) < 0.02) {
          offsetPx = clamped;
          renderDrumNow();
          if (shouldCommit) emitSelection(clamped);
          return;
        }
        offsetPx += diff * 0.25;
        scheduleRender();
        animFrame = requestAnimationFrame(step);
      };
      animFrame = requestAnimationFrame(step);
    }

    const viewport = listEl.parentElement;
    if (viewport && !viewport._wheelBound) {
      viewport._wheelBound = true;

      viewport.addEventListener('pointerdown', e => {
        cancelAnimationFrame(animFrame);
        isDragging = true;
        startY = lastY = e.clientY;
        lastTime = performance.now();
        startOffset = offsetPx;
        velocity = 0;
        try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
      }, { passive: true });

      viewport.addEventListener('pointermove', e => {
        if (!isDragging) return;
        const now = performance.now();
        const dt = Math.max(4, now - lastTime);
        offsetPx = startOffset - (e.clientY - startY) / ITEM_HEIGHT;
        const instVel = -((e.clientY - lastY) / ITEM_HEIGHT) / (dt / 16);
        velocity = velocity * 0.5 + instVel * 0.5;
        lastY = e.clientY;
        lastTime = now;
        scheduleRender();
      }, { passive: true });

      const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        cancelAnimationFrame(animFrame);

        const momentum = () => {
          if (Math.abs(velocity) < 0.03) {
            const maxIdx = Math.max(0, currentOptions.length - 1);
            const target = Math.max(0, Math.min(maxIdx, Math.round(offsetPx)));
            animateTo(target, true);
            return;
          }
          offsetPx += velocity;
          velocity *= 0.88;
          scheduleRender();
          animFrame = requestAnimationFrame(momentum);
        };
        animFrame = requestAnimationFrame(momentum);
      };

      viewport.addEventListener('pointerup', endDrag, { passive: true });
      viewport.addEventListener('pointercancel', endDrag, { passive: true });

      viewport.addEventListener('wheel', e => {
        e.preventDefault();
        cancelAnimationFrame(animFrame);
        offsetPx += (e.deltaY / ITEM_HEIGHT) * 0.85;
        scheduleRender();
        clearTimeout(viewport._t);
        viewport._t = setTimeout(() => {
          const maxIdx = Math.max(0, currentOptions.length - 1);
          const target = Math.max(0, Math.min(maxIdx, Math.round(offsetPx)));
          animateTo(target, true);
        }, 90);
      }, { passive: false });
    }

    buildItems();
    renderDrumNow();

    wheelInstances[id] = {
      render: () => {
        cancelAnimationFrame(animFrame);
        offsetPx = currentIndex;
        renderDrumNow();
      },
      setValue(val) {
        const idx = currentOptions.findIndex(o => o.value === val);
        if (idx !== -1) {
          cancelAnimationFrame(animFrame);
          currentIndex = idx;
          offsetPx = idx;
          lastLabelText = '';
          if (selectEl) selectEl.value = val;
          if (labelEl) labelEl.textContent = currentOptions[idx].label;
          renderDrumNow();
        }
      },
      updateOptions(nextOptions, preserveValue = true) {
        const activeVal = preserveValue ? currentOptions[currentIndex]?.value : null;
        const sameLength = nextOptions.length === currentOptions.length;
        currentOptions = nextOptions.slice();

        if (!sameLength) {
          buildItems();
        }

        const foundIdx = activeVal != null ? currentOptions.findIndex(o => o.value === activeVal) : -1;
        currentIndex = foundIdx !== -1 ? foundIdx : 0;
        offsetPx = currentIndex;
        lastLabelText = '';

        if (sameLength) {
          syncTextsOnly();
        }
        if (selectEl && currentOptions[currentIndex]) {
          selectEl.value = currentOptions[currentIndex].value;
        }
        renderDrumNow();
      }
    };
  }

  function toggleWheel(id, e) {
    e?.stopPropagation();
    const wrap = document.getElementById(id);
    if (!wrap) return;
    const pop = wrap.querySelector('.wheel-popover');
    if (!pop) return;
    const open = !pop.classList.contains('open');
    closeAllWheels();
    if (open) {
      pop.classList.add('open');
      requestAnimationFrame(() => wheelInstances[id]?.render());
    }
  }

  function closeAllWheels() {
    document.querySelectorAll('.wheel-popover.open').forEach(p => p.classList.remove('open'));
  }

  function setWheelValue(id, val) {
    wheelInstances[id]?.setValue(val);
  }

  function updateWheelOptions(id, nextOptions, preserveValue = true) {
    wheelInstances[id]?.updateOptions(nextOptions, preserveValue);
  }

  document.addEventListener('click', closeAllWheels);

  /* ================= PARSE CSV & TSV (GOOGLE SHEETS) ================= */
  function parseDelimitedRows(text, delimiter = ',') {
    const src = String(text ?? '');
    if (!src.trim()) return [];
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < src.length; i++) {
      const ch = src[i];
      if (inQuotes) {
        if (ch === '"' && src[i + 1] === '"') {
          field += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          field += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === delimiter) {
          row.push(field);
          field = '';
        } else if (ch === '\r') {
          if (src[i + 1] === '\n') i++;
          row.push(field);
          rows.push(row);
          row = [];
          field = '';
        } else if (ch === '\n') {
          row.push(field);
          rows.push(row);
          row = [];
          field = '';
        } else {
          field += ch;
        }
      }
    }
    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }
    return rows.filter(r => r.some(cell => String(cell ?? '').trim().length > 0));
  }

  function parseCsvRows(csvText) {
    return parseDelimitedRows(csvText, ',');
  }

  function parseSheetPasteText(rawText) {
    const str = String(rawText ?? '');
    if (!str.trim()) return [];
    const firstLine = str.split(/\r?\n/)[0] || '';
    const delimiter = firstLine.includes('\t') ? '\t' : ',';
    return parseDelimitedRows(str, delimiter);
  }

  function parseCsvToCells(csvText) {
    return parseCsvRows(csvText).map(r => r.map(v => ({ v })));
  }

  /* ================= FETCH QUA CLOUDFLARE WORKER ================= */
  async function fetchWorkerSheet({ endpoint, mapRow, onSuccess, onError }) {
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

    try {
      const payload = await fetchWorkerJson(endpoint);
      if (!payload?.csv) {
        throw new Error(payload?.error || "Invalid API payload");
      }

      const cellRows = parseCsvToCells(payload.csv);
      const parsed = [];
      for (let i = 0; i < cellRows.length; i++) {
        const item = mapRow(cellRows[i]);
        if (item) parsed.push(item);
      }

      loadingState?.classList.add("hidden");
      onSuccess(parsed, payload);
    } catch (err) {
      console.error("Worker API synchronization error:", err);
      loadingState?.classList.add("hidden");
      errorState?.classList.remove("hidden");
      onError?.(err);
    } finally {
      if (reloadBtn) reloadBtn.disabled = false;
      if (reloadIcon) reloadIcon.classList.remove("fa-spin");
    }
  }

  function copyTSV(headers, rows, message) {
    const lines = [headers.join("\t"), ...rows.map(r => r.join("\t"))];
    const tsv = lines.join("\n");
    const done = () => { if (message) alert(message); };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(tsv).then(done).catch(() => { fallbackCopy(tsv); done(); });
    } else {
      fallbackCopy(tsv);
      done();
    }
  }

  function fallbackCopy(text) {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }

  function downloadCSV(headers, rows, filename) {
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = ["\uFEFF" + headers.map(esc).join(","), ...rows.map(r => r.map(esc).join(","))];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return {
    API_BASE_URL,
    getSavedLang,
    applyLang,
    toggleLang,
    getSavedTheme,
    applyTheme,
    toggleTheme,
    escapeHtml,
    normalizeDeptKey,
    normalizeMemberName,
    buildMemberNameKey,
    countUniquePeople,
    renderDeptBadge,
    fetchWorkerJson,
    createWheelPicker,
    toggleWheel,
    closeAllWheels,
    setWheelValue,
    updateWheelOptions,
    parseCsvRows,
    parseSheetPasteText,
    parseCsvToCells,
    fetchWorkerSheet,
    copyTSV,
    downloadCSV,
    listeners
  };
})();
