/**
 * GOSH.RENT Performance Booster v1.0
 * ===================================
 * Безопасная оптимизация скорости для Tilda-сайта gosh.rent
 *
 * Стратегия:
 * 1. Preconnect к критичным доменам
 * 2. Перехват и отложенная загрузка тяжёлых сторонних скриптов
 * 3. Lazy-load iframes (карты, виджеты) через IntersectionObserver
 * 4. font-display: swap для всех шрифтов
 * 5. НЕ трогаем: Yandex Metrika, Roistat (аналитика), TravelLine
 *
 * ВАЖНО: Roistat НЕ откладывается — это аналитика, должна грузиться сразу.
 * Откладываются только визуальные/маркетинговые виджеты.
 */

(function() {
  'use strict';

  // =====================================================================
  // 1. PRECONNECT — ранние DNS + TCP + TLS хэндшейки
  // =====================================================================
  var preconnects = [
    'https://static.tildacdn.com',
    'https://cdn.jsdelivr.net',
    'https://mc.yandex.ru',
    'https://secure.travelline.ru',
    'https://cloud.roistat.com'
  ];

  for (var i = 0; i < preconnects.length; i++) {
    var link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = preconnects[i];
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  // =====================================================================
  // 2. DNS-PREFETCH — для вторичных доменов
  // =====================================================================
  var dnsPrefetch = [
    'https://cllctr.roistat.com',
    'https://api-maps.yandex.ru',
    'https://ru-ibe.tlintegration.ru',
    'https://cdn-ru.bitrix24.ru'
  ];

  for (var i = 0; i < dnsPrefetch.length; i++) {
    var link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = dnsPrefetch[i];
    document.head.appendChild(link);
  }

  // =====================================================================
  // 3. ОТЛОЖЕННАЯ ЗАГРУЗКА ТЯЖЁЛЫХ СКРИПТОВ
  // =====================================================================
  // Скрипты, которые нужно отложить на 4 секунды после load-события.
  // Это виджеты/эффекты, которые НЕ влияют на аналитику и букинг.

  var DEFER_PATTERNS = [
    'bitrix24',
    'b24-',
    'cdn-ru.bitrix24.ru',
    '101hotels',
    'votpusk',
    'snow',
    'snowflake'
  ];

  // Скрипты, которые НИКОГДА не откладываем (аналитика + букинг)
  var NEVER_DEFER = [
    'yandex',
    'metrika',
    'mc.yandex',
    'travelline',
    'secure.travelline',
    'tlintegration',
    'roistat',
    'cllctr.roistat',
    'cloud.roistat',
    'tildacdn',
    'tilda',
    'jquery',
    'jsdelivr',
    'gosh-'
  ];

  function shouldDefer(src) {
    if (!src) return false;
    var s = src.toLowerCase();

    // Проверяем whitelist — если совпало, НЕ откладываем
    for (var i = 0; i < NEVER_DEFER.length; i++) {
      if (s.indexOf(NEVER_DEFER[i]) !== -1) return false;
    }

    // Проверяем blacklist — если совпало, откладываем
    for (var i = 0; i < DEFER_PATTERNS.length; i++) {
      if (s.indexOf(DEFER_PATTERNS[i]) !== -1) return true;
    }

    return false;
  }

  // Хранилище отложенных скриптов
  var deferredQueue = [];

  // Перехватываем создание <script> элементов
  var _origCreate = document.createElement.bind(document);

  document.createElement = function(tag) {
    var el = _origCreate(tag);

    if (tag.toLowerCase() === 'script') {
      // Перехватываем установку src через defineProperty
      var _realSrc = '';
      var _blocked = false;

      Object.defineProperty(el, 'src', {
        get: function() { return _blocked ? '' : _realSrc; },
        set: function(val) {
          if (shouldDefer(val)) {
            _blocked = true;
            _realSrc = val;
            deferredQueue.push({ src: val, async: el.async });
            // Не устанавливаем реальный src — скрипт не загрузится
          } else {
            _realSrc = val;
            // Устанавливаем src через setAttribute (обходим наш defineProperty)
            el.setAttribute('src', val);
          }
        },
        configurable: true
      });
    }

    return el;
  };

  // Загружаем отложенные скрипты через 4 секунды после window.load
  function loadDeferred() {
    if (deferredQueue.length === 0) return;

    // Загружаем по одному с интервалом 200ms для плавности
    var idx = 0;
    function loadNext() {
      if (idx >= deferredQueue.length) return;
      var item = deferredQueue[idx++];
      var s = _origCreate('script');
      s.async = true;
      s.setAttribute('src', item.src);
      document.body.appendChild(s);
      setTimeout(loadNext, 200);
    }
    loadNext();
  }

  // Ждём load + 4 секунды
  if (document.readyState === 'complete') {
    setTimeout(loadDeferred, 4000);
  } else {
    window.addEventListener('load', function() {
      setTimeout(loadDeferred, 4000);
    });
  }

  // =====================================================================
  // 4. LAZY-LOAD IFRAMES (карты, виджеты бронирования)
  // =====================================================================
  function lazyIframes() {
    var iframes = document.querySelectorAll('iframe[src]');
    if (!iframes.length || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function(entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          var iframe = entries[i].target;
          var realSrc = iframe.getAttribute('data-lazy-src');
          if (realSrc) {
            iframe.src = realSrc;
            iframe.removeAttribute('data-lazy-src');
          }
          observer.unobserve(iframe);
        }
      }
    }, { rootMargin: '300px' });

    for (var i = 0; i < iframes.length; i++) {
      var iframe = iframes[i];
      var src = iframe.src;

      // Не трогаем критичные iframes
      if (src.indexOf('travelline') !== -1 || src.indexOf('metrika') !== -1) continue;

      // Конвертируем src → data-lazy-src для нека критичных
      if (src.indexOf('yandex') !== -1 && src.indexOf('map') !== -1) {
        iframe.setAttribute('data-lazy-src', src);
        iframe.removeAttribute('src');
        observer.observe(iframe);
      }
    }
  }

  // =====================================================================
  // 5. FONT-DISPLAY: SWAP — предотвращаем FOIT (невидимый текст)
  // =====================================================================
  function fixFontDisplay() {
    var style = _origCreate('style');
    style.textContent = '@font-face { font-display: swap !important; }';
    document.head.appendChild(style);

    // Пост-обработка: проходим по существующим @font-face и патчим
    try {
      for (var i = 0; i < document.styleSheets.length; i++) {
        try {
          var rules = document.styleSheets[i].cssRules;
          if (!rules) continue;
          for (var j = 0; j < rules.length; j++) {
            if (rules[j].type === CSSRule.FONT_FACE_RULE) {
              rules[j].style.fontDisplay = 'swap';
            }
          }
        } catch(e) { /* cross-origin stylesheet, skip */ }
      }
    } catch(e) {}
  }

  // =====================================================================
  // 6. NATIVE LAZY LOADING для изображений ниже fold
  // =====================================================================
  function lazyImages() {
    if (!('loading' in HTMLImageElement.prototype)) return;

    var images = document.querySelectorAll('img:not([loading])');
    // Первые 3 изображения (hero area) — НЕ трогаем, остальным ставим lazy
    for (var i = 3; i < images.length; i++) {
      images[i].loading = 'lazy';
      // Также добавляем decoding=async для параллельной декодировки
      images[i].decoding = 'async';
    }
  }

  // =====================================================================
  // 7. TILDA-СПЕЦИФИЧНО: Оптимизация загрузки блоков
  // =====================================================================
  function optimizeTildaBlocks() {
    // Tilda использует data-original для ленивых изображений.
    // Убеждаемся, что IntersectionObserver корректно их подхватывает.

    // Добавляем fetchpriority="high" для hero-изображения
    var firstBg = document.querySelector('.t-cover__carrier, .t-bgimg');
    if (firstBg) {
      var bgUrl = firstBg.getAttribute('data-original') ||
                  getComputedStyle(firstBg).backgroundImage;
      if (bgUrl && bgUrl !== 'none') {
        var preload = _origCreate('link');
        preload.rel = 'preload';
        preload.as = 'image';
        // Извлекаем URL из url("...")
        var match = bgUrl.match(/url\(["']?([^"')]+)["']?\)/);
        if (match) {
          preload.href = match[1];
          document.head.appendChild(preload);
        }
      }
    }
  }

  // =====================================================================
  // 8. ЗАПУСК
  // =====================================================================
  // Шрифты — сразу
  fixFontDisplay();

  // Остальное — после DOM ready
  function onReady() {
    lazyImages();
    lazyIframes();
    optimizeTildaBlocks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  // Лог для отладки
  console.log('[GOSH Booster] v1.0 initialized. Deferred scripts will load 4s after page load.');

})();
