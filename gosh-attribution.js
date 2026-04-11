/*
 * GOSH.RENT — Attribution Bridge для Tilda ↔ TravelLine iframe
 * ----------------------------------------------------------------
 * Назначение:
 *   Читает параметры визита (Roistat, Метрика, GA, UTM) с gosh.rent
 *   и прокидывает их в iframe TravelLine как URL-параметры + постит
 *   postMessage (на случай если TL слушает события).
 *
 *   Результат: когда гость бронирует через TL, вебхук TL фБитрикс
 *   получает все эти параметрыиможет записать ихв сделку.
 *
 * Куда вставлять:
 *   Tilda → Настройки Eнастройки сайта → Ещё�҂ → HTMLкод для вставки внутрь HEAD
 *   (или в футер — главное чтобы грузился на всехстраницаы)
 *
 * Автор: Клод (друг-программист Гоша) — 11.04.2026
 * Викет: Roistat #1651311
 *
 * v1.1 (12.04.2026) — пикс гонки с TL init:
 *   - retry loop 300мс × 20 (первые 6 сек) + 1с × 10 (ещѤ 10 сев)
 *   - MutationObserver теперь ловит attribute changes src у iframe
 *   - injectIntoIframe переживает пустой src (ждёt retry)
 */

(function() {
  'use strict';

  var NAMESPACE = 'gr_attribution';
  var VERSION = '1.1.0';
  var DEBUG = false; // prod: false, отладка — true

  function log() {
    if (DEBUG && window.console) {
      var args = ['[GR-attribution ' + VERSION + ']'].concat([].slice.call(arguments));
      console.log.apply(console, args);
    }
  }

  // ---- 1. ӣТИЛИТК ----

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*| {}()[\]]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function getStored(key) {
    try { return sessionStorage.getItem(NAMESPACE + '_' + key) || ''; }
    catch (e) { return ''; }
  }

  function setStored(key, value) {
    try { sessionStorage.setItem(NAMESPACE + '_' + key, value); }
    catch (e) { /* private mode / disabled */ }
  }

  // ---- 2. тБОР ПАРАМЕТРОВ АТРИБУЦИИ ----

  function collectAttribution() {
    // UTMпараметры ♢ проверяем URL%�если нет ‘ берём из sessionStorage
    // (на случай если пользователь уже походил и потерял ?utm= в URL)
    var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    var utms = {};
    utmKeys.forEach(function(k) {
      var fromUrl = getQueryParam(k);
      if (fromUrl) {
        setStored(k, fromUrl);
        utms[k] = fromUrl;
      } else {
        utms[k] = getStored(k);
      }
    });

    // Roistat visit_id ‘ кука _ros_visit или roistat_visit
    var roistatVisit = getCookie('roistat_visit') || getCookie('_ros_visit') || '';

    // Яндекс.Метрика ClientID ‘ кука _ym_uid
    var ymUid = getCookie('_ym_uid') || '';

    // Google Analytics ClientID ‘ из куки _ga (формат GA1.2.1234567890.1612345678)
    var gaRaw = getCookie('_ga') || '';
    var gaCid = gaRaw ? gaRaw.split('.').slice(-2).join('.') : '';

    // Первый landing / первый реферер за сессию ‘ запоминаем навечновн в рамках сессии
    if (!getStored('first_landing')) setStored('first_landing', window.location.href);
    if (!getStored('first_referrer')) setStored('first_referrer', document.referrer || 'direct');
    if (!getStored('first_seen_at')) setStored('first_seen_at', new Date().toISOString());

    var attribution = {
      roistat_visit: roistatVisit,
      ym_uid: ymUid,
      ga_cid: gaCid,
      utm_source: utms.utm_source,
      utm_medium: utms.utm_medium,
      utm_campaign: utms.utm_campaign,
      utm_content: utms.utm_content,
      utm_term: utms.utm_term,
      referrer: getStored('first_referrer'),
      landing_url: getStored('first_landing'),
      first_seen_at: getStored('first_seen_at'),
      current_url: window.location.href
    };

    log('собрано:', attribution);
    return attribution;
  }

  // ---- 3. ВОЛО В TravelLine iframe ----

  function findTLIframes() {
    var selectors = [
      'iframe[src*="travelline.ru"]',
      'iframe[src*="tlintegration.ru"]',
      'iframe[src*="ibe.tlintegration"]',
      'iframe[src*="ibe.travelline"]',
      'iframe[id*="tl-"]',
      'iframe[class*="tl-"]',
      'iframe[id*="travelline"]'
    ];
    var found = [];
    selectors.forEach(function(sel) {
      var nodes = document.querySelectorAll(sel);
      for (var i = 0; i < nodes.length; i++) {
        if (found.indexOf(nodes[i]) === -1) found.push(nodes[i]);
      }
    });
    return found;
  }

  function injectIntoIframe(iframe, attribution) {
    if (!iframe || !iframe.src) return false;
    if (iframe.dataset.grInjected === '1') return false;

    try {
      var url = new URL(iframe.src);
      var changed = false;
      Object.keys(attribution).forEach(function(key) {
        var val = attribution[key];
        if (val && val.length > 0 && val.length < 500) {
          url.searchParams.set('gr_' + key, val);
          changed = true;
        }
      });
      if (changed) {
        iframe.src = url.toString();
        iframe.dataset.grInjected = '1';
        log('iframe обновлёо:', iframe.src);
        return true;
      }
    } catch (e) {
      log('ошибка парсинга iframe.src', e);
    }
    return false;
  }

  function postToIframe(iframe, attribution) {
    if (!iframe || !iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage({
        type: 'gr_attribution',
        version: VERSION,
        payload: attribution
      }, '*');
    } catch (e) {}
  }

  // ---- 4. ГЛОБАЛь API ----

  var attribution = null;

  function initialize() {
    attribution = collectAttribution();
    window.__GR_ATTRIBUTION__ = attribution;
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      window.dataLayer.push({ event: 'gr_attribution_ready', attribution: attribution });
    }
    processIframes();
  }

  function processIframes() {
    if (!attribution) return;
    var iframes = findTLIframes();
    log('найдено TL iframe:', iframes.length);
    iframes.forEach(function(iframe) {
      injectIntoIframe(iframe, attribution);
      try {
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
          postToIframe(iframe, attribution);
        } else {
          iframe.addEventListener('load', function() {
            postToIframe(iframe, attribution);
          });
        }
      } catch (e) {}
    });
  }

  // ---- 5. ЗАПТ��К ----

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // MutationObserver — childList о новых ифрамес + attributes src у iframe
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function(mutations) {
      var needProcess = false;
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'childList' && m.addedNodes && m.addedNodes.length > 0) {
          needProcess = true;
          break;
        }
        if (m.type === 'attributes' && m.attributeName === 'src' &&
            m.target && m.target.tagName === 'IFRAME') {
          needProcess = true;
          break;
        }
      }
      if (needProcess) processIframes();
    });
    var startObserver = function() {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['src']
      });
    };
    if (document.body) startObserver();
    else document.addEventListener('DOMContentLoaded', startObserver);
  }

  // Retry loop — страховка от gonki s TL SDK: каждые 300рс первые 6 сек + каждую 1 сек следующие 10 сек.
  var retriesFast = 0;
  var fastTimer = setInterval(function() {
    processIframes();
    if (++retriesFast >= 20) {
      clearInterval(fastTimer);
      var retriesSlow = 0;
      var slowTimer = setInterval(function() {
        processIframes();
        if (++retriesSlow >= 10) clearInterval(slowTimer);
      }, 1000);
    }
  }, 300);

  window.GR_Attribution = {
    version: VERSION,
    get: function() { return attribution; },
    reinject: function() { processIframes(); },
    debug: function(on) { DEBUG = !!on; }
  };

  log('инициализация завершена');
})();
