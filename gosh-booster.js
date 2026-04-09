/**
 * GOSH.RENT Performance Booster v1.1
 * ===================================
 * Безопасная оптимизация скорости для Tilda-сайта gosh.rent
 *
 * Подход: MutationObserver перехватывает тяжёлые скрипты при вставке в DOM,
 * удаляет их и загружает с задержкой 4 секунды после window.load.
 *
 * НЕ трогаем: Yandex Metrika, Roistat, TravelLine, Tilda CDN, jQuery, наши скрипты.
 * Откладываем: Bitrix24, 101Hotels, vOtpusk, снежинки.
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

  // DNS-prefetch для вторичных доменов
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
  // 2. ОТЛОЖЕННАЯ ЗАГРУЗКА ТЯЖЁЛЫХ СКРИПТОВ (MutationObserver)
  // =====================================================================

  // Паттерны для отложения (только маркетинговые виджеты/эффекты)
  var DEFER_PATTERNS = [
    'bitrix24',
    'b24-',
    'cdn-ru.bitrix24.ru',
    '101hotels',
    'votpusk',
    'snow',
    'snowflake'
  ];

  function shouldDefer(src) {
    if (!src) return false;
    var s = src.toLowerCase();
    for (var i = 0; i < DEFER_PATTERNS.length; i++) {
      if (s.indexOf(DEFER_PATTERNS[i]) !== -1) return true;
    }
    return false;
  }

  var deferredScripts = [];

  // MutationObserver перехватывает скрипты при вставке в DOM
  var observer = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var addedNodes = mutations[i].addedNodes;
      for (var j = 0; j < addedNodes.length; j++) {
        var node = addedNodes[j];
        if (node.tagName === 'SCRIPT' && node.src && shouldDefer(node.src)) {
          // Сохраняем src и удаляем скрипт из DOM
          deferredScripts.push(node.src);
          node.parentNode.removeChild(node);
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Загружаем отложенные скрипты через 4 секунды после load
  function loadDeferred() {
    observer.disconnect(); // Отключаем observer чтобы не перехватывать повторно

    if (deferredScripts.length === 0) return;

    var idx = 0;
    function loadNext() {
      if (idx >= deferredScripts.length) return;
      var s = document.createElement('script');
      s.async = true;
      s.src = deferredScripts[idx++];
      document.body.appendChild(s);
      setTimeout(loadNext, 200);
    }
    loadNext();
  }

  if (document.readyState === 'complete') {
    setTimeout(loadDeferred, 4000);
  } else {
    window.addEventListener('load', function() {
      setTimeout(loadDeferred, 4000);
    });
  }

  // =====================================================================
  // 3. FONT-DISPLAY: SWAP — предотвращаем FOIT (невидимый текст)
  // =====================================================================
  var fontStyle = document.createElement('style');
  fontStyle.textContent = '@font-face { font-display: swap !important; }';
  document.head.appendChild(fontStyle);

  // =====================================================================
  // 4. LAZY LOADING для изображений ниже fold
  // =====================================================================
  function lazyImages() {
    if (!('loading' in HTMLImageElement.prototype)) return;

    var images = document.querySelectorAll('img:not([loading])');
    // Первые 3 изображения (hero) — НЕ трогаем
    for (var i = 3; i < images.length; i++) {
      images[i].loading = 'lazy';
      images[i].decoding = 'async';
    }
  }

  // =====================================================================
  // 5. PRELOAD HERO IMAGE
  // =====================================================================
  function preloadHero() {
    var firstBg = document.querySelector('.t-cover__carrier, .t-bgimg');
    if (firstBg) {
      var bgUrl = firstBg.getAttribute('data-original') ||
                  getComputedStyle(firstBg).backgroundImage;
      if (bgUrl && bgUrl !== 'none') {
        var match = bgUrl.match(/url\(["']?([^"')]+)["']?\)/);
        if (match) {
          var preload = document.createElement('link');
          preload.rel = 'preload';
          preload.as = 'image';
          preload.href = match[1];
          document.head.appendChild(preload);
        }
      }
    }
  }

  // =====================================================================
  // 6. ЗАПУСК
  // =====================================================================
  function onReady() {
    lazyImages();
    preloadHero();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  console.log('[GOSH Booster] v1.1 initialized. Deferred scripts will load 4s after page load.');

})();
