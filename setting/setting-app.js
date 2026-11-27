document.addEventListener('DOMContentLoaded', () => {
  // CTECSettings do ../workspace/assets/ctec-core.js định nghĩa (bọc window.CTEC)
  const Settings = window.CTECSettings;
  if (!Settings) {
    console.error('CTECSettings chưa được nạp từ ../workspace/assets/ctec-core.js');
    return;
  }

  const SETTING_I18N = {
    vi: {
      pageTitle: 'CTEC — Cài đặt hệ thống',
      homeTitle: 'Về trang chủ CTEC',
      title: 'Cài đặt hệ thống',
      subtitle: 'Tùy chỉnh ngôn ngữ và giao diện áp dụng cho toàn bộ cổng thông tin CTEC.',
      langLabel: 'Ngôn ngữ hiển thị',
      langDesc: 'Cuộn hoặc chạm để chuyển đổi Tiếng Việt / English trên tất cả phân hệ.',
      themeLabel: 'Chế độ giao diện',
      themeDesc: 'Đồng bộ giao diện Sáng / Tối cho toàn bộ trang và các tab đang mở.',
      saved: 'Đã lưu & áp dụng toàn web',
      footerText: 'Cổng thông tin chính thức CTEC | Thực hiện bởi Nhat Minh'
    },
    en: {
      pageTitle: 'CTEC — System Settings',
      homeTitle: 'CTEC Home',
      title: 'System Settings',
      subtitle: 'Customize the language and appearance used across the entire CTEC portal.',
      langLabel: 'Display language',
      langDesc: 'Scroll or tap to switch between Tiếng Việt / English on every module.',
      themeLabel: 'Appearance',
      themeDesc: 'Sync Light / Dark mode across all pages and open tabs.',
      saved: 'Saved & applied site-wide',
      footerText: 'Official CTEC Information Portal | Crafted by Nhat Minh'
    }
  };

  function applySettingLanguage(lang) {
    const t = SETTING_I18N[lang] || SETTING_I18N.vi;
    document.documentElement.lang = lang === 'en' ? 'en' : 'vi';
    document.title = t.pageTitle;
    const home = document.getElementById('homeLink');
    if (home) home.title = t.homeTitle;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = t[el.getAttribute('data-i18n')];
      if (v !== undefined) el.textContent = v;
    });
  }

  const ITEM_HEIGHT = 48;
  const toastEl = document.getElementById('setting-toast');
  let toastTimer = null;

  function showSavedToast() {
    if (!toastEl) return;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 1600);
  }

  function createWheelPicker(containerId, initialValue, onChange) {
    const root = document.getElementById(containerId);
    if (!root) return null;

    const track = root.querySelector('.ctec-wheel-track');
    const items = Array.from(root.querySelectorAll('.ctec-wheel-item'));
    let activeIndex = Math.max(0, items.findIndex((el) => el.dataset.value === initialValue));
    let scrollEndTimer = null;
    let isDragging = false;
    let startY = 0;
    let startScrollTop = 0;

    function updateVisual3D() {
      const centerScroll = track.scrollTop;
      items.forEach((item, idx) => {
        const offset = (idx * ITEM_HEIGHT - centerScroll) / ITEM_HEIGHT;
        const clamped = Math.max(-2, Math.min(2, offset));
        const rotateX = -clamped * 26;
        const scale = 1 - Math.abs(clamped) * 0.08;
        const opacity = 1 - Math.abs(clamped) * 0.35;

        item.style.transform = `rotateX(${rotateX}deg) scale(${scale})`;
        item.style.opacity = `${Math.max(0.25, opacity)}`;
      });
    }

    function commitIndex(idx, smooth = true, triggerCallback = true) {
      const bounded = Math.max(0, Math.min(items.length - 1, idx));
      activeIndex = bounded;

      items.forEach((item, i) => {
        const selected = i === bounded;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-selected', selected ? 'true' : 'false');
      });

      track.scrollTo({
        top: bounded * ITEM_HEIGHT,
        behavior: smooth ? 'smooth' : 'instant'
      });

      updateVisual3D();

      if (triggerCallback && items[bounded]) {
        onChange(items[bounded].dataset.value);
        showSavedToast();
      }
    }

    commitIndex(activeIndex, false, false);

    track.addEventListener('scroll', () => {
      updateVisual3D();
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        const snappedIdx = Math.round(track.scrollTop / ITEM_HEIGHT);
        if (snappedIdx !== activeIndex) {
          commitIndex(snappedIdx, true, true);
        } else {
          track.scrollTo({ top: activeIndex * ITEM_HEIGHT, behavior: 'smooth' });
        }
      }, 90);
    }, { passive: true });

    items.forEach((item, idx) => {
      item.addEventListener('click', () => {
        if (!isDragging) commitIndex(idx, true, true);
      });
    });

    track.addEventListener('mousedown', (e) => {
      isDragging = false;
      startY = e.pageY;
      startScrollTop = track.scrollTop;

      const onMouseMove = (moveEvent) => {
        const dy = moveEvent.pageY - startY;
        if (Math.abs(dy) > 4) isDragging = true;
        track.scrollTop = startScrollTop - dy;
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        setTimeout(() => { isDragging = false; }, 0);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        commitIndex(activeIndex + 1, true, true);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        commitIndex(activeIndex - 1, true, true);
      }
    });

    return {
      setValue(val) {
        const idx = items.findIndex((el) => el.dataset.value === val);
        if (idx !== -1 && idx !== activeIndex) {
          commitIndex(idx, true, false);
        }
      }
    };
  }

  const langWheel = createWheelPicker('wheel-lang', Settings.getLang(), (newLang) => {
    Settings.setLang(newLang);
  });

  const themeWheel = createWheelPicker('wheel-theme', Settings.getTheme(), (newTheme) => {
    Settings.setTheme(newTheme);
  });

  applySettingLanguage(Settings.getLang());

  // Đổi từ chính trang này hoặc từ tab khác (BroadcastChannel) đều cập nhật lại giao diện + bánh xe
  window.addEventListener('ctec:settingschange', (e) => {
    const d = (e && e.detail) || {};
    if (d.lang) {
      applySettingLanguage(d.lang);
      if (langWheel) langWheel.setValue(d.lang);
    }
    if (d.theme && themeWheel) themeWheel.setValue(d.theme);
  });
});
