/**
 * GOSH.RENT Performance Booster v2.0
 * ===================================
 * Агрессивная оптимизация для мобильных: цель FCP < 1с
 *
 * Стратегия:
 * - Preconnect к критичным доменам
 * - НЕМЕДЛЕННО откладываем: Bitrix24, 101Hotels, vOtpusk, снежинки (4с после load)
 * - LAZY-SCROLL: TravelLine IBE + Яндекс Карты грузятся ТОЛЬКО когда юзер скроллит к ним
 * - НЕ трогаем: Yandex Metrika, Roistat (аналитика должна работать с первой секунды)
 * - Lazy images + font-display: swap + hero preload
 */

(function() {
  'use strict';

  // =====================================================================
  // 1. PRECONNECT + DNS-PREFETCH
  // =====================================================================
  var hints = [
    ['preconnect', 'https://static.tildacdn.com'],
    ['preconnect', 'https://cdn.jsdelivr.net'],
    ['preconnect', 'https://mc.yandex.ru'],
    ['preconnect', 'https://cloud.roistat.com'],
    ['dns-prefetch', 'https://cllctr.roistat.com'],
    ['dns-prefetch', 'https://api-maps.yandex.ru'],
    ['dns-prefetch', 'https://ru-ibe.tlintegration.ru'],
    ['dns-prefetch', 'https://secure.travelline.ru']
  ];

  for (var i = 0; i < hints.length; i++) {
    var link = document.createElement('link');
    link.rel = hints[i][0];
    link.href = hints[i][1];
    if (hints[i][0] === 'preconnect') link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  // =====================================================================
  // 2. FONT-DISPLAY: SWAP (сразу, чтобы текст был виден мгновенно)
  // =====================================================================
  var fontStyle = document.createElement('style');
  fontStyle.textContent = '@font-face { font-display: swap !important; }';
  document.head.appendChild(fontStyle);

  // =====================================================================
  // 3. SCRIPT DEFERRAL — MutationObserver перехватывает тяжёлые скрипты
  // =====================================================================

  // Категория A: полностью откладываем на 4с после load (маркетинг/эффекты)
  var DEFER_ALWAYS = [
    'bitrix24', 'b24-', 'cdn-ru.bitrix24.ru',
    '101hotels', 'votpusk', 'snow', 'snowflake'
  ];

  // Категория B: откладываем до скролла к секции (тяжёлые виджеты ниже fold)
  var DEFER_SCROLL = [
    'tlintegration.ru',       // TravelLine IBE виджет
    'travelline.ru/loader',   // TravelLine loader
    'api-maps.yandex.ru'      // Яндекс Карты API
  ];

  function matchPatterns(src, patterns) {
    if (!src) return false;
    var s = src.toLowerCase();
    for (var i = 0; i < patterns.length; i++) {
      if (s.indexOf(patterns[i].toLowerCase()) !== -1) return true;
    }
    return false;
  }

  var deferredAlways = [];  // загрузим через 4с после load
  var deferredScroll = [];  // загрузим когда юзер доскроллит

  // MutationObserver перехватывает скрипты при вставке в DOM
  var scriptObserver = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var nodes = mutations[i].addedNodes;
      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        if (node.tagName !== 'SCRIPT' || !node.src) continue;

        if (matchPatterns(node.src, DEFER_ALWAYS)) {
          deferredAlways.push(node.src);
          node.parentNode.removeChild(node);
        } else if (matchPatterns(node.src, DEFER_SCROLL)) {
          deferredScroll.push(node.src);
          node.parentNode.removeChild(node);
        }
      }
    }
  });

  scriptObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Также перехватываем iframes (TravelLine IBE грузит кучу iframe-ов)
  var iframeObserver = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var nodes = mutations[i].addedNodes;
      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        // Перехватываем TravelLine iframes
        if (node.tagName === 'IFRAME' && node.src &&
            (node.src.indexOf('travelline') !== -1 || node.src.indexOf('tlintegration') !== -1)) {
          // Заменяем src на data-lazy-src для отложенной загрузки
          node.setAttribute('data-lazy-src', node.src);
          node.removeAttribute('src');
        }
      }
    }
  });

  // =====================================================================
  // 4. ЗАГРУЗКА ОТЛОЖЕННЫХ СКРИПТОВ
  // =====================================================================

  function loadScriptList(list, callback) {
    var idx = 0;
    function next() {
      if (idx >= list.length) {
        if (callback) callback();
        return;
      }
      var s = document.createElement('script');
      s.async = true;
      s.src = list[idx++];
      s.onload = s.onerror = function() { setTimeout(next, 100); };
      document.body.appendChild(s);
    }
    next();
  }

  // Категория A: грузим через 4с после load
  function loadDeferredAlways() {
    scriptObserver.disconnect();
    if (deferredAlways.length > 0) {
      loadScriptList(deferredAlways);
    }
  }

  // Категория B: грузим когда юзер скроллил ≥ 30% страницы ИЛИ через 8с после load
  var scrollLoaded = false;
  function loadDeferredScroll() {
    if (scrollLoaded) return;
    scrollLoaded = true;

    // Отключаем iframe observer — больше не нужен
    iframeObserver.disconnect();

    if (deferredScroll.length > 0) {
      loadScriptList(deferredScroll, function() {
        // После загрузки скриптов, активируем lazy iframes
        var lazyIframes = document.querySelectorAll('iframe[data-lazy-src]');
        for (var i = 0; i < lazyIframes.length; i++) {
          lazyIframes[i].src = lazyIframes[i].getAttribute('data-lazy-src');
          lazyIframes[i].removeAttribute('data-lazy-src');
        }
      });
    }
  }

  // Слушаем скролл — грузим тяжёлые виджеты когда юзер прокрутил 25% страницы
  function onScroll() {
    var scrolled = window.scrollY || window.pageYOffset;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0 && scrolled / docHeight > 0.15) {
      window.removeEventListener('scroll', onScroll);
      loadDeferredScroll();
    }
  }

  // Также слушаем касание на мобильных (первый touch = начало взаимодействия)
  function onFirstInteraction() {
    window.removeEventListener('touchstart', onFirstInteraction);
    window.removeEventListener('mousedown', onFirstInteraction);
    // Даём небольшую задержку после первого взаимодействия
    setTimeout(loadDeferredScroll, 1500);
  }

  if (document.readyState === 'complete') {
    setTimeout(loadDeferredAlways, 4000);
    setTimeout(loadDeferredScroll, 8000); // fallback
  } else {
    window.addEventListener('load', function() {
      setTimeout(loadDeferredAlways, 4000);
      setTimeout(loadDeferredScroll, 8000); // fallback: грузим через 8с даже без скролла
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('touchstart', onFirstInteraction, { passive: true });
  window.addEventListener('mousedown', onFirstInteraction, { passive: true });

  // =====================================================================
  // 5. LAZY IMAGES + HERO PRELOAD
  // =====================================================================
  function lazyImages() {
    if (!('loading' in HTMLImageElement.prototype)) return;

    var images = document.querySelectorAll('img:not([loading])');
    // Первые 2 изображения (hero) — fetchpriority=high, остальные — lazy
    for (var i = 0; i < images.length; i++) {
      if (i < 2) {
        images[i].fetchPriority = 'high';
      } else {
        images[i].loading = 'lazy';
        images[i].decoding = 'async';
      }
    }
  }

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
          preload.fetchPriority = 'high';
          document.head.appendChild(preload);
        }
      }
    }
  }

  // =====================================================================
  // 6. ОТКЛЮЧЕНИЕ НЕНУЖНЫХ TILDA СКРИПТОВ (анимации, эффекты)
  // =====================================================================
  function disableHeavyTildaFeatures() {
    // Tilda загружает анимационные скрипты — помечаем их как defer
    var scripts = document.querySelectorAll('script[src*="tilda-animation"], script[src*="tilda-zero"]');
    // Не удаляем — просто добавляем defer
    for (var i = 0; i < scripts.length; i++) {
      scripts[i].defer = true;
    }
  }

  // =====================================================================
  // 7. ЗАПУСК
  // =====================================================================
  function onReady() {
    lazyImages();
    preloadHero();
    disableHeavyTildaFeatures();
    iframeObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  console.log('[GOSH Booster] v2.0 — aggressive mobile optimization. TravelLine + Maps load on scroll.');

})();
