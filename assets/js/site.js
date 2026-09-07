/* ==========================================================================
   JUST RUN — سلوك عام لكل الصفحات
   الهيدر، قائمة الموبايل، ظهور العناصر عند التمرير، عدّاد السلة.
   ========================================================================== */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. حالة الهيدر عند التمرير ---------- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var ticking = false;
    var updateHeader = function () {
      header.dataset.scrolled = window.scrollY > 12 ? 'true' : 'false';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateHeader);
      }
    }, { passive: true });
    updateHeader();
  }

  /* ---------- 2. قائمة الموبايل ---------- */
  var menu = document.querySelector('[data-menu]');
  var openBtn = document.querySelector('[data-menu-open]');
  var closeBtn = document.querySelector('[data-menu-close]');
  var lastFocused = null;

  function focusableIn(el) {
    return Array.prototype.slice.call(
      el.querySelectorAll('a[href], button:not([disabled])')
    ).filter(function (node) { return node.offsetParent !== null; });
  }

  function openMenu() {
    if (!menu) return;
    lastFocused = document.activeElement;
    menu.hidden = false;
    // إعادة رسم قبل بدء الحركة حتى تعمل الترانزيشن
    window.requestAnimationFrame(function () {
      menu.dataset.open = 'true';
    });
    document.body.dataset.menuOpen = 'true';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    var items = focusableIn(menu);
    if (items.length) items[0].focus();
  }

  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.dataset.open = 'false';
    document.body.dataset.menuOpen = 'false';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    var hide = function () { menu.hidden = true; };
    if (prefersReduced) hide();
    else window.setTimeout(hide, 380);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (openBtn) openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (e) {
    if (!menu || menu.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      return;
    }
    if (e.key === 'Tab') {
      var items = focusableIn(menu);
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  /* ---------- 3. الرابط النشط في التنقل ---------- */
  var current = window.location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('[data-nav-link]'), function (link) {
    var target = link.getAttribute('href').split('?')[0];
    if (target === current) link.setAttribute('aria-current', 'page');
  });

  /* ---------- 4. ظهور العناصر عند التمرير ---------- */
  function revealAll() {
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) {
      el.classList.add('is-visible');
    });
  }

  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var group = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.setProperty('--reveal-delay', Math.min(group, 5) * 70 + 'ms');
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) {
      observer.observe(el);
    });

    // شبكة أمان: أي عنصر داخل الشاشة عند التحميل يظهر فوراً،
    // حتى لو تأخّر المراقب أو فشل لأي سبب — المحتوى لا يبقى مخفياً أبداً.
    window.addEventListener('load', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.reveal:not(.is-visible)'), function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('is-visible');
        }
      });
    });
  }

  /* ---------- 5. عدّاد السلة ---------- */
  window.JustRunCart = window.JustRunCart || {};
  var CART_KEY = 'justrun.cart.v1';

  function readCart() {
    try {
      var raw = window.localStorage.getItem(CART_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function writeCart(items) {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
      return true;
    } catch (err) {
      return false;
    }
  }

  function countItems() {
    return readCart().reduce(function (sum, item) { return sum + (item.qty || 0); }, 0);
  }

  function refreshBadge() {
    var badge = document.querySelector('[data-cart-count]');
    if (!badge) return;
    var total = countItems();
    badge.textContent = String(total);
    badge.hidden = total === 0;
    var label = document.querySelector('[data-cart-label]');
    if (label) label.textContent = total === 0 ? 'السلة فارغة' : 'السلة: ' + total + ' قطعة';
  }

  window.JustRunCart.read = readCart;
  window.JustRunCart.write = writeCart;
  window.JustRunCart.count = countItems;
  window.JustRunCart.refreshBadge = refreshBadge;
  window.JustRunCart.storageAvailable = (function () {
    try {
      window.localStorage.setItem('justrun.test', '1');
      window.localStorage.removeItem('justrun.test');
      return true;
    } catch (err) {
      return false;
    }
  })();

  refreshBadge();
})();
