document.addEventListener('DOMContentLoaded', () => {
  if (!window.CTECSettings) {
    console.error('CTECSettings chưa được nạp từ ../assets/ctec-core.js');
    return;
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
        behavior: smooth ? 'smooth' : 'auto'
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

  const langWheel = createWheelPicker('wheel-lang', CTECSettings.getLang(), (newLang) => {
    CTECSettings.setLang(newLang);
  });

  const themeWheel = createWheelPicker('wheel-theme', CTECSettings.getTheme(), (newTheme) => {
    CTECSettings.setTheme(newTheme);
  });

  window.addEventListener('ctec:settingschange', (e) => {
    if (langWheel && e.detail.lang) langWheel.setValue(e.detail.lang);
    if (themeWheel && e.detail.theme) themeWheel.setValue(e.detail.theme);
  });
});
