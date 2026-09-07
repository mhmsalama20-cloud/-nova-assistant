/* ==========================================================================
   JUST RUN — منطق المتجر
   تحميل البيانات، شبكة المنتجات، الفلاتر، صفحة المنتج، والسلة المحلية.
   ملاحظة: لا يوجد نظام دفع متصل. السلة تُحفظ محلياً في المتصفح فقط،
   وصفحة السلة تصرّح بذلك بوضوح بدل محاكاة عملية شراء.
   ========================================================================== */

(function () {
  'use strict';

  var DATA_URL = 'assets/data/products.json';
  var catalogPromise = null;

  function loadCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetch(DATA_URL, { cache: 'no-cache' }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      });
    }
    return catalogPromise;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function priceLabel(product, meta) {
    if (product.price === null || product.price === undefined) {
      return { text: 'السعر قريباً', pending: true };
    }
    return { text: product.price + ' ' + (meta.currencyLabel || ''), pending: false };
  }

  function showDataError(container) {
    if (!container) return;
    container.innerHTML = '';
    var box = el('div', 'empty-state');
    box.appendChild(el('h3', null, 'تعذّر تحميل بيانات المنتجات'));
    box.appendChild(el('p', null,
      'هذه الصفحة تقرأ الملف assets/data/products.json عبر الشبكة. ' +
      'إذا فتحت الملف مباشرة من القرص (file://) فلن يعمل التحميل — شغّل خادماً محلياً: python3 -m http.server 8000'));
    container.appendChild(box);
  }

  /* ---------- بطاقة منتج ---------- */
  function productCard(product, meta) {
    var link = el('a', 'product-card reveal');
    link.href = 'product.html?id=' + encodeURIComponent(product.id);

    var media = el('div', 'product-card__media');
    var img = new Image();
    var first = product.images && product.images[0];
    img.src = first ? first.src : 'assets/img/product-tee.svg';
    img.alt = first ? first.alt : product.name;
    img.width = 800;
    img.height = 1000;
    img.loading = 'lazy';
    img.decoding = 'async';
    media.appendChild(img);

    var name = el('h3', 'product-card__name', product.name);
    var metaRow = el('div', 'product-card__meta');
    metaRow.appendChild(el('span', null, product.shortDescription || ''));
    var pl = priceLabel(product, meta);
    metaRow.appendChild(el('span', pl.pending ? 'price price--pending' : 'price', pl.text));

    link.appendChild(media);
    link.appendChild(name);
    link.appendChild(metaRow);
    return link;
  }

  /* ---------- الصفحة الرئيسية: المجموعات + المنتجات المختارة ---------- */
  var collectionsGrid = document.querySelector('[data-collections-grid]');
  var featuredGrid = document.querySelector('[data-featured-grid]');

  if (collectionsGrid || featuredGrid) {
    loadCatalog().then(function (data) {
      if (collectionsGrid) {
        data.collections.forEach(function (col) {
          var card = el('a', 'collection-card reveal');
          card.href = 'shop.html?collection=' + encodeURIComponent(col.id);

          var media = el('div', 'collection-card__media');
          var img = new Image();
          img.src = col.image;
          img.alt = col.imageAlt || col.title;
          img.width = 800;
          img.height = 1000;
          img.loading = 'lazy';
          img.decoding = 'async';
          media.appendChild(img);

          var body = el('div', 'collection-card__body');
          body.appendChild(el('h3', 'collection-card__title', col.title));
          body.appendChild(el('span', 'collection-card__hint', col.tagline));

          card.appendChild(media);
          card.appendChild(body);
          collectionsGrid.appendChild(card);
        });
      }

      if (featuredGrid) {
        var featured = data.products.filter(function (p) { return p.featured; });
        if (!featured.length) {
          var box = el('div', 'empty-state');
          box.appendChild(el('h3', null, 'لا توجد منتجات مختارة بعد'));
          box.appendChild(el('p', null, 'أضف منتجاتك في assets/data/products.json وفعّل الحقل featured.'));
          featuredGrid.appendChild(box);
        } else {
          featured.forEach(function (p) { featuredGrid.appendChild(productCard(p, data.meta)); });
        }
      }
      revealNew();
    }).catch(function () {
      showDataError(collectionsGrid || featuredGrid);
    });
  }

  /* ---------- صفحة المتجر ---------- */
  var shopGrid = document.querySelector('[data-shop-grid]');

  if (shopGrid) {
    var filtersBox = document.querySelector('[data-filters]');
    var sortSelect = document.querySelector('[data-sort]');
    var resultCount = document.querySelector('[data-result-count]');
    var params = new URLSearchParams(window.location.search);
    var activeCollection = params.get('collection') || 'all';

    loadCatalog().then(function (data) {
      function render() {
        shopGrid.innerHTML = '';
        var list = data.products.filter(function (p) {
          return activeCollection === 'all' || p.collection === activeCollection;
        });

        var sort = sortSelect ? sortSelect.value : 'default';
        if (sort === 'name-asc') list.sort(function (a, b) { return a.name.localeCompare(b.name, 'ar'); });
        if (sort === 'name-desc') list.sort(function (a, b) { return b.name.localeCompare(a.name, 'ar'); });

        if (resultCount) {
          resultCount.textContent = list.length === 0
            ? 'لا توجد نتائج'
            : list.length + (list.length === 1 ? ' منتج' : ' منتجات');
        }

        if (!list.length) {
          var box = el('div', 'empty-state');
          box.appendChild(el('h3', null, 'ما في منتجات في هذا التصنيف'));
          box.appendChild(el('p', null, 'جرّب تصنيفاً آخر، أو اعرض كل المنتجات.'));
          var reset = el('button', 'btn btn--ghost', 'اعرض كل المنتجات');
          reset.type = 'button';
          reset.addEventListener('click', function () {
            activeCollection = 'all';
            syncFilters();
            render();
          });
          box.appendChild(reset);
          shopGrid.appendChild(box);
          return;
        }

        list.forEach(function (p) { shopGrid.appendChild(productCard(p, data.meta)); });
        revealNew();
      }

      function syncFilters() {
        if (!filtersBox) return;
        Array.prototype.forEach.call(filtersBox.querySelectorAll('.filter-chip'), function (chip) {
          chip.setAttribute('aria-pressed', chip.dataset.collection === activeCollection ? 'true' : 'false');
        });
        var url = new URL(window.location.href);
        if (activeCollection === 'all') url.searchParams.delete('collection');
        else url.searchParams.set('collection', activeCollection);
        window.history.replaceState({}, '', url);
      }

      if (filtersBox) {
        var all = el('button', 'filter-chip', 'الكل');
        all.type = 'button';
        all.dataset.collection = 'all';
        filtersBox.appendChild(all);

        data.collections.forEach(function (col) {
          var chip = el('button', 'filter-chip', col.title);
          chip.type = 'button';
          chip.dataset.collection = col.id;
          filtersBox.appendChild(chip);
        });

        filtersBox.addEventListener('click', function (e) {
          var chip = e.target.closest('.filter-chip');
          if (!chip) return;
          activeCollection = chip.dataset.collection;
          syncFilters();
          render();
        });
      }

      if (sortSelect) sortSelect.addEventListener('change', render);

      syncFilters();
      render();
    }).catch(function () {
      showDataError(shopGrid);
    });
  }

  /* ---------- صفحة المنتج ---------- */
  var productRoot = document.querySelector('[data-product-root]');

  if (productRoot) {
    var pid = new URLSearchParams(window.location.search).get('id');

    loadCatalog().then(function (data) {
      var product = data.products.filter(function (p) { return p.id === pid; })[0];

      if (!product) {
        productRoot.innerHTML = '';
        var box = el('div', 'empty-state');
        box.appendChild(el('h3', null, 'هذا المنتج غير موجود'));
        box.appendChild(el('p', null, 'الرابط قد يكون قديماً أو المنتج أُزيل من الكتالوج.'));
        var back = el('a', 'btn btn--primary', 'عودة إلى المتجر');
        back.href = 'shop.html';
        box.appendChild(back);
        productRoot.appendChild(box);
        return;
      }

      document.title = product.name + ' — JUST RUN';
      var crumb = document.querySelector('[data-breadcrumb-name]');
      if (crumb) crumb.textContent = product.name;

      var state = { size: null, color: product.colors && product.colors.length ? product.colors[0].name : null };

      /* المعرض */
      var mainBtn = productRoot.querySelector('[data-gallery-main]');
      var mainImg = productRoot.querySelector('[data-gallery-img]');
      var thumbs = productRoot.querySelector('[data-gallery-thumbs]');
      var images = product.images && product.images.length
        ? product.images
        : [{ src: 'assets/img/product-tee.svg', alt: product.name }];

      mainImg.src = images[0].src;
      mainImg.alt = images[0].alt;

      if (images.length > 1) {
        images.forEach(function (image, index) {
          var t = el('button', 'gallery__thumb');
          t.type = 'button';
          t.setAttribute('aria-current', index === 0 ? 'true' : 'false');
          t.setAttribute('aria-label', 'عرض الصورة ' + (index + 1));
          var ti = new Image();
          ti.src = image.src;
          ti.alt = '';
          ti.loading = 'lazy';
          t.appendChild(ti);
          t.addEventListener('click', function () {
            mainImg.src = image.src;
            mainImg.alt = image.alt;
            Array.prototype.forEach.call(thumbs.children, function (child) {
              child.setAttribute('aria-current', child === t ? 'true' : 'false');
            });
          });
          thumbs.appendChild(t);
        });
      } else if (thumbs) {
        thumbs.hidden = true;
      }

      /* تكبير الصورة */
      var lightbox = document.querySelector('[data-lightbox]');
      var lightboxImg = document.querySelector('[data-lightbox-img]');
      var lightboxClose = document.querySelector('[data-lightbox-close]');
      var lastFocus = null;

      if (mainBtn && lightbox) {
        mainBtn.addEventListener('click', function () {
          lastFocus = document.activeElement;
          lightboxImg.src = mainImg.src;
          lightboxImg.alt = mainImg.alt;
          lightbox.hidden = false;
          lightboxClose.focus();
        });
        function closeLightbox() {
          lightbox.hidden = true;
          if (lastFocus && lastFocus.focus) lastFocus.focus();
        }
        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function (e) {
          if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
        });
      }

      /* النصوص */
      productRoot.querySelector('[data-product-name]').textContent = product.name;
      productRoot.querySelector('[data-product-desc]').textContent = product.description;

      var priceNode = productRoot.querySelector('[data-product-price]');
      var pl = priceLabel(product, data.meta);
      priceNode.textContent = pl.text;
      if (pl.pending) priceNode.classList.add('price--pending');

      /* المقاسات */
      var sizeGroup = productRoot.querySelector('[data-size-group]');
      var sizeList = productRoot.querySelector('[data-size-list]');
      var sizeHint = productRoot.querySelector('[data-size-hint]');

      if (product.sizes && product.sizes.length) {
        product.sizes.forEach(function (size) {
          var soldOut = (product.soldOutSizes || []).indexOf(size) !== -1;
          var btn = el('button', 'option', size);
          btn.type = 'button';
          btn.setAttribute('aria-pressed', 'false');
          if (soldOut) {
            btn.disabled = true;
            btn.setAttribute('aria-label', size + ' — غير متوفر حالياً');
          }
          btn.addEventListener('click', function () {
            state.size = size;
            Array.prototype.forEach.call(sizeList.children, function (child) {
              child.setAttribute('aria-pressed', child === btn ? 'true' : 'false');
            });
            if (sizeHint) sizeHint.textContent = 'المقاس المختار: ' + size;
          });
          sizeList.appendChild(btn);
        });
      } else if (sizeGroup) {
        sizeGroup.hidden = true;
      }

      /* الألوان */
      var colorGroup = productRoot.querySelector('[data-color-group]');
      var colorList = productRoot.querySelector('[data-color-list]');
      var colorHint = productRoot.querySelector('[data-color-hint]');

      if (product.colors && product.colors.length) {
        product.colors.forEach(function (color, index) {
          var btn = el('button', 'option', color.name);
          btn.type = 'button';
          btn.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
          btn.addEventListener('click', function () {
            state.color = color.name;
            Array.prototype.forEach.call(colorList.children, function (child) {
              child.setAttribute('aria-pressed', child === btn ? 'true' : 'false');
            });
            if (colorHint) colorHint.textContent = 'اللون المختار: ' + color.name;
          });
          colorList.appendChild(btn);
        });
        if (colorHint) colorHint.textContent = 'اللون المختار: ' + product.colors[0].name;
      } else if (colorGroup) {
        colorGroup.hidden = true;
      }

      /* الإضافة إلى السلة */
      var addBtn = productRoot.querySelector('[data-add-to-cart]');
      var feedback = productRoot.querySelector('[data-add-feedback]');

      function say(message, kind) {
        if (!feedback) return;
        feedback.hidden = false;
        feedback.className = 'notice notice--' + kind;
        feedback.textContent = message;
      }

      if (addBtn) {
        addBtn.addEventListener('click', function () {
          if (product.sizes && product.sizes.length && !state.size) {
            say('اختر المقاس أولاً.', 'error');
            var firstSize = sizeList.querySelector('.option:not([disabled])');
            if (firstSize) firstSize.focus();
            return;
          }
          if (!window.JustRunCart.storageAvailable) {
            say('متصفحك يمنع الحفظ المحلي، فما قدرنا نحفظ السلة.', 'error');
            return;
          }

          var items = window.JustRunCart.read();
          var key = product.id + '|' + (state.size || '') + '|' + (state.color || '');
          var existing = items.filter(function (i) { return i.key === key; })[0];

          if (existing) {
            existing.qty += 1;
          } else {
            items.push({
              key: key,
              id: product.id,
              name: product.name,
              size: state.size,
              color: state.color,
              price: product.price === undefined ? null : product.price,
              image: images[0].src,
              qty: 1
            });
          }

          if (window.JustRunCart.write(items)) {
            window.JustRunCart.refreshBadge();
            say('تمت الإضافة إلى السلة. السلة محفوظة في متصفحك فقط — الدفع غير مفعّل بعد.', 'success');
          } else {
            say('ما قدرنا نحفظ السلة في متصفحك. جرّب مرة ثانية.', 'error');
          }
        });
      }
    }).catch(function () {
      showDataError(productRoot);
    });
  }

  /* ---------- صفحة السلة ---------- */
  var cartRoot = document.querySelector('[data-cart-root]');

  if (cartRoot) {
    var listNode = cartRoot.querySelector('[data-cart-list]');
    var summaryNode = cartRoot.querySelector('[data-cart-summary]');
    var emptyNode = cartRoot.querySelector('[data-cart-empty]');

    var renderCart = function () {
      var items = window.JustRunCart.read();
      listNode.innerHTML = '';

      var isEmpty = items.length === 0;
      emptyNode.hidden = !isEmpty;
      summaryNode.hidden = isEmpty;
      listNode.hidden = isEmpty;
      if (isEmpty) return;

      items.forEach(function (item) {
        var row = el('article', 'cart-item');

        var media = el('div', 'cart-item__media');
        var img = new Image();
        img.src = item.image;
        img.alt = item.name;
        img.loading = 'lazy';
        media.appendChild(img);

        var body = el('div');
        body.appendChild(el('h2', 'cart-item__name', item.name));
        var opts = [];
        if (item.size) opts.push('المقاس: ' + item.size);
        if (item.color) opts.push('اللون: ' + item.color);
        body.appendChild(el('p', 'cart-item__opts', opts.join(' — ')));
        body.appendChild(el('p', 'cart-item__opts',
          item.price === null || item.price === undefined ? 'السعر قريباً' : String(item.price)));

        var side = el('div', 'cart-item__side');
        var qty = el('div', 'qty');
        var minus = el('button', null, '−');
        minus.type = 'button';
        minus.setAttribute('aria-label', 'تقليل الكمية لـ ' + item.name);
        var out = el('output', null, String(item.qty));
        var plus = el('button', null, '+');
        plus.type = 'button';
        plus.setAttribute('aria-label', 'زيادة الكمية لـ ' + item.name);

        minus.addEventListener('click', function () { changeQty(item.key, -1); });
        plus.addEventListener('click', function () { changeQty(item.key, 1); });

        qty.appendChild(minus);
        qty.appendChild(out);
        qty.appendChild(plus);

        var remove = el('button', 'text-btn', 'إزالة');
        remove.type = 'button';
        remove.setAttribute('aria-label', 'إزالة ' + item.name + ' من السلة');
        remove.addEventListener('click', function () { removeItem(item.key); });

        side.appendChild(qty);
        side.appendChild(remove);

        row.appendChild(media);
        row.appendChild(body);
        row.appendChild(side);
        listNode.appendChild(row);
      });

      var totalNode = cartRoot.querySelector('[data-cart-total]');
      var hasPrices = items.every(function (i) { return typeof i.price === 'number'; });
      if (totalNode) {
        totalNode.textContent = hasPrices
          ? items.reduce(function (sum, i) { return sum + i.price * i.qty; }, 0).toFixed(2)
          : 'غير متاح — الأسعار لم تُضف بعد';
      }
    };

    function changeQty(key, delta) {
      var items = window.JustRunCart.read();
      var item = items.filter(function (i) { return i.key === key; })[0];
      if (!item) return;
      item.qty += delta;
      if (item.qty < 1) {
        items = items.filter(function (i) { return i.key !== key; });
      }
      window.JustRunCart.write(items);
      window.JustRunCart.refreshBadge();
      renderCart();
    }

    function removeItem(key) {
      var items = window.JustRunCart.read().filter(function (i) { return i.key !== key; });
      window.JustRunCart.write(items);
      window.JustRunCart.refreshBadge();
      renderCart();
    }

    renderCart();
  }

  /* ---------- تفعيل الظهور للعناصر المضافة ديناميكياً ---------- */
  function revealNew() {
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nodes = document.querySelectorAll('.reveal:not(.is-visible)');
    if (prefersReduced || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(nodes, function (n) { n.classList.add('is-visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var node = entry.target;
        var index = node.parentElement
          ? Array.prototype.indexOf.call(node.parentElement.children, node)
          : 0;
        node.style.setProperty('--reveal-delay', Math.min(index, 5) * 70 + 'ms');
        node.classList.add('is-visible');
        obs.unobserve(node);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(nodes, function (n) { obs.observe(n); });
  }
})();
