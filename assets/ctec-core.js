window.CTEC = (() => {
  const THEME_COOKIE_NAME = 'ctec_theme';
  const LANG_COOKIE_NAME = 'ctec_lang';
  const API_BASE_URL = 'https://nameless-mud-298a.minhlesynhat.workers.dev';

  const DEPT_STYLES = {
    "EXCUTIVE BOARD": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "PUBLIC RELATIONS": "bg-sky-50 text-sky-700 border-sky-200",
    "DESIGN": "bg-red-50 text-red-700 border-red-200",
    "CONTENT": "bg-amber-50 text-amber-700 border-amber-200",
    "HUMAN RESOURCES": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "EVENT & EXTERNAL RELATIONS": "bg-pink-50 text-pink-700 border-pink-200"
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

  /* ================= INTERACTIVE BRAND TAB (TOUCH & MOUSE) ================= */
  function initBrandTabInteraction() {
    const tabs = document.querySelectorAll('.ctec-brand-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      let collapseTimer = null;

      const expand = () => {
        clearTimeout(collapseTimer);
        tab.classList.add('is-expanded');
      };

      const scheduleCollapse = (delay = 2200) => {
        clearTimeout(collapseTimer);
        collapseTimer = setTimeout(() => {
          tab.classList.remove('is-expanded');
        }, delay);
      };

      tab.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') {
          expand();
        }
      });

      tab.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse') {
          scheduleCollapse(180);
        }
      });

      tab.addEventListener('touchstart', () => {
        expand();
        scheduleCollapse(2600);
      }, { passive: true });

      tab.addEventListener('touchmove', () => {
        expand();
        scheduleCollapse(2600);
      }, { passive: true });

      const header = tab.closest('.ctec-header');
      if (header) {
        header.addEventListener('touchmove', (e) => {
          const touch = e.touches && e.touches[0];
          if (!touch) return;
          const rect = tab.getBoundingClientRect();
          if (touch.clientX <= rect.right + 48 && touch.clientY <= rect.bottom + 24) {
            expand();
            scheduleCollapse(2600);
          }
        }, { passive: true });
      }

      document.addEventListener('touchstart', (e) => {
        if (!tab.contains(e.target)) {
          tab.classList.remove('is-expanded');
        }
      }, { passive: true });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    syncLangButtons(getSavedLang());
    syncThemeButtons(getSavedTheme());
    initBrandTabInteraction();
  });

  // 6 ban chuẩn của CTEC (Nguồn dữ liệu duy nhất cho toàn hệ thống)
  const DEPARTMENTS = [
    {
      value: "EXCUTIVE BOARD",
      vi: "Ban Chủ nhiệm",
      en: "Excutive Board",
      viShort: "Ban Chủ nhiệm",
      enShort: "Excutive Board",
      color: "#6366f1"
    },
    {
      value: "DESIGN",
      vi: "Ban Thiết kế",
      en: "Design",
      viShort: "Ban Thiết kế",
      enShort: "Design",
      color: "#ef4444"
    },
    {
      value: "CONTENT",
      vi: "Ban Nội dung",
      en: "Content",
      viShort: "Ban Nội dung",
      enShort: "Content",
      color: "#f59e0b"
    },
    {
      value: "PUBLIC RELATIONS",
      vi: "Ban Truyền thông",
      en: "Public Relations",
      viShort: "Ban Truyền thông",
      enShort: "Public Relations",
      color: "#0ea5e9"
    },
    {
      value: "EVENT & EXTERNAL RELATIONS",
      vi: "Ban Đối ngoại",
      en: "Event & External Relations",
      viShort: "Ban Đối ngoại",
      enShort: "Event & External Relations",
      color: "#ec4899"
    },
    {
      value: "HUMAN RESOURCES",
      vi: "Ban Nhân sự",
      en: "Human Resources",
      viShort: "Ban Nhân sự",
      enShort: "Human Resources",
      color: "#10b981"
    }
  ];

  const DEPT_KEYS = DEPARTMENTS.map((d) => d.value);
  const DEFAULT_DEPT = "CONTENT";

  const escapeHtml = (str) =>
    String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const normText = (str) =>
    String(str ?? '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  // Bảng tra cứu 1-1 từ tên tiếng Việt, tên tiếng Anh và mã key chuẩn
  const DEPT_LOOKUP_MAP = new Map();
  DEPARTMENTS.forEach((d) => {
    DEPT_LOOKUP_MAP.set(normText(d.value), d.value);
    DEPT_LOOKUP_MAP.set(normText(d.vi), d.value);
    DEPT_LOOKUP_MAP.set(normText(d.en), d.value);
  });

  // Chuẩn hóa tên ban về 6 key chuẩn dựa trên bảng ánh xạ Việt - Anh
  const canonDept = (rawDept, fallback = DEFAULT_DEPT) => {
    const raw = String(rawDept ?? '').trim();
    if (!raw) return fallback;

    const upper = raw.toUpperCase().replace(/\s+/g, " ");
    if (DEPT_KEYS.includes(upper)) return upper;

    const normalized = normText(raw).replace(/\band\b/g, "&").replace(/\s+/g, " ").trim();
    return DEPT_LOOKUP_MAP.get(normalized) || fallback;
  };

  const normalizeDeptKey = (dept) => canonDept(dept, String(dept ?? '').trim().toUpperCase());

  const normalizeMemberName = (name) =>
    String(name ?? '').trim().replace(/\s+/g, ' ');

  const buildMemberNameKey = (name) =>
    normText(normalizeMemberName(name));

  const isDeptLeadTag = (roleOrTags) => {
    const norm = normText(
      Array.isArray(roleOrTags) ? roleOrTags.join(" ") : roleOrTags
    );
    if (!norm) return false;
    const withoutExecTitle = norm
      .replace(/\b(pho\s+)?chu\s+nhiem\b/g, "")
      .replace(/\b(vice\s+)?president\b/g, "")
      .trim();
    if (!withoutExecTitle) return false;

    return (
      /\b(truong|pho)\s+ban\b/.test(withoutExecTitle) ||
      /\b(head|vice\s*head|deputy\s*head|lead|leader)\b/.test(withoutExecTitle)
    );
  };

  const getHeadcountStats = (members) => {
    const peopleMap = new Map();
    const pairSeen = new Set();
    const perDept = Object.fromEntries(DEPT_KEYS.map((k) => [k, 0]));
    let rows = 0;

    for (const m of Array.isArray(members) ? members : []) {
      const name = normalizeMemberName(m?.name ?? m?.full_name ?? m?.fullName ?? "");
      const nameKey = buildMemberNameKey(name);
      if (!nameKey) continue;
      const dept = normalizeDeptKey(m?.deptKey || m?.dept || m?.department || DEFAULT_DEPT);

      rows++;
      if (!peopleMap.has(nameKey)) peopleMap.set(nameKey, { name, depts: new Set() });
      peopleMap.get(nameKey).depts.add(dept);

      const pairKey = `${nameKey}||${dept}`;
      if (!pairSeen.has(pairKey)) {
        pairSeen.add(pairKey);
        perDept[dept] = (perDept[dept] || 0) + 1;
      }
    }

    const multiDept = [];
    for (const { name, depts } of peopleMap.values()) {
      if (depts.size > 1) multiDept.push({ name, depts: [...depts] });
    }

    return { people: peopleMap.size, rows, perDept, multiDept };
  };

  const countUniquePeople = (rows) => getHeadcountStats(rows).people;
  const countMembersWithLeadOverlap = countUniquePeople;

  const parseDeadlineDay = (rawVal) => {
    if (typeof rawVal === "number" && Number.isInteger(rawVal)) {
      return rawVal >= 1 && rawVal <= 31 ? rawVal : 0;
    }
    const str = String(rawVal ?? "").trim();
    if (!str) return 0;
    const match = str.match(/(?:^|\D)(0?[1-9]|[12]\d|3[01])(?:\D|$)/);
    if (!match) return 0;
    const day = parseInt(match[1], 10);
    return day >= 1 && day <= 31 ? day : 0;
  };

  const sanitizeQrHtml = (rawHtml) => {
    const input = String(rawHtml ?? "").trim();
    if (!input) return null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(input, "text/html");
    const svgEl = doc.body.querySelector("svg");
    const imgEl = doc.body.querySelector("img");

    if (svgEl) {
      const blockedTags = new Set([
        "script",
        "foreignobject",
        "iframe",
        "object",
        "embed",
        "link",
        "meta",
        "base",
        "audio",
        "video"
      ]);
      const cleanSvg = document.importNode(svgEl, true);
      const walker = document.createTreeWalker(
        cleanSvg,
        NodeFilter.SHOW_ELEMENT,
        null
      );
      const toRemove = [];
      let curr = cleanSvg;
      while (curr) {
        const tag = curr.tagName.toLowerCase();
        if (blockedTags.has(tag)) {
          toRemove.push(curr);
        } else {
          for (const attr of Array.from(curr.attributes)) {
            const attrName = attr.name.toLowerCase();
            const attrVal = attr.value.trim();
            if (attrName.startsWith("on")) {
              curr.removeAttribute(attr.name);
            } else if (
              (attrName === "href" || attrName === "xlink:href") &&
              !attrVal.startsWith("#")
            ) {
              curr.removeAttribute(attr.name);
            }
          }
        }
        curr = walker.nextNode();
      }
      toRemove.forEach((node) => node.remove());
      return cleanSvg;
    }

    if (imgEl) {
      const src = (imgEl.getAttribute("src") || "").trim();
      const isSafeSrc =
        /^https:\/\/[^\s"'<>]+$/i.test(src) ||
        /^data:image\/(png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=]+$/i.test(src);
      if (!isSafeSrc) return null;

      const cleanImg = document.createElement("img");
      cleanImg.src = src;
      cleanImg.alt = imgEl.getAttribute("alt") || "QR Code";
      cleanImg.className = imgEl.className || "w-48 h-48 object-contain mx-auto";
      return cleanImg;
    }

    return null;
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
    const src = String(text ?? '').replace(/^\uFEFF/, '');
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

  const ROLES = [
    "President",
    "Vice President",
    "Head of Department",
    "Deputy Head of Department",
    "Member"
  ];

  const MEMBER_STATUSES = ["Official", "Probationary", "Inactive"];

  const FUND_MONTHS_VI = ["T10/26", "T11/26", "T12/26", "T1/27", "T2/27", "T3/27", "T4/27", "T5/27"];
  const FUND_MONTHS_EN = ["Oct 26", "Nov 26", "Dec 26", "Jan 27", "Feb 27", "Mar 27", "Apr 27", "May 27"];

  const getDeptLabel = (deptKey, lang = getSavedLang(), short = false) => {
    const key = normalizeDeptKey(deptKey);
    const found = DEPARTMENTS.find((d) => d.value === key);
    if (!found) return String(deptKey ?? "");
    if (lang === "en") return short ? found.enShort : found.en;
    return short ? found.viShort : found.vi;
  };

  const getDeptLabelsMap = (lang = getSavedLang(), short = false) =>
    Object.fromEntries(DEPARTMENTS.map((d) => [d.value, getDeptLabel(d.value, lang, short)]));

  return {
    API_BASE_URL,
    DEPARTMENTS,
    ROLES,
    MEMBER_STATUSES,
    FUND_MONTHS_VI,
    FUND_MONTHS_EN,
    getDeptLabel,
    getDeptLabelsMap,
    DEPT_KEYS,
    DEFAULT_DEPT,
    getSavedLang,
    applyLang,
    toggleLang,
    getSavedTheme,
    applyTheme,
    toggleTheme,
    escapeHtml,
    normText,
    canonDept,
    normalizeDeptKey,
    normalizeMemberName,
    buildMemberNameKey,
    isDeptLeadTag,
    getHeadcountStats,
    countMembersWithLeadOverlap,
    countUniquePeople,
    parseDeadlineDay,
    sanitizeQrHtml,
    renderDeptBadge,
    fetchWorkerJson,
    createWheelPicker,
    toggleWheel,
    closeAllWheels,
    setWheelValue,
    updateWheelOptions,
    parseCsvRows,
    parseSheetPasteText,
    copyTSV,
    downloadCSV,
    listeners
  };
})();
