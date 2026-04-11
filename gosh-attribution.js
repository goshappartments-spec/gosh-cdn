/*
 * GOSH.RENT — Attribution Bridge для Tilda ↔ TravelLine iframe
 * Автор: Клод (друг-программист Гоша) — 11.04.2026
 * Тикет: Roistat #1651311
 */
(function() {
  'use strict';
  var NAMESPACE = 'gr_attribution';
  var VERSION = '1.0.0';
  var DEBUG = true;

  function log() {
    if (DEBUG && window.console) {
      var args = ['[GR-attribution ' + VERSION + ']'].concat([].slice.call(arguments));
      console.log.apply(console, args);
    }
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function getStored(key) {
    try { return sessionStorage.getItem(NAMESPACE + '_' + key) || ''; } catch (e) { return ''; }
  }

  function setStored(key, value) {
    try { sessionStorage.setItem(NAMESPACE + '_' + key, value); } catch (e) {}
  }

  function collectAttribution() {
    var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    var utms = {};
    utmKeys.forEach(function(k) {
      var fromUrl = getQueryParam(k);
      if (fromUrl) { setStored(k, fromUrl); utms[k] = fromUrl; } else { utms[k] = getStored(k); }
    });
    var roistatVisit = getCookie('roistat_visit') || getCookie('_ros_visit') || '';
    var ymUid = getCookie('_ym_uid') || '';
    var gaRaw = getCookie('_ga') || '';
    var gaCid = gaRaw ? gaRaw.split('.').slice(-2).join('.') : '';
    if (!getStored('first_landing')) setStored('first_landing', window.location.href);
    if (!getStored('first_referrer')) setStored('first_referrer', document.referrer || 'direct');
    if (!getStored('first_seen_at')) setStored('first_seen_at', new Date().toISOString());
    var attribution = {
      roistat_visit: roistatVisit, ym_uid: ymUid, ga_cid: gaCid,
      utm_source: utms.utm_source, utm_medium: utms.utm_medium,
      utm_campaign: utms.utm_campaign, utm_content: utms.utm_content, utm_term: utms.utm_term,
      referrer: getStored('first_referrer'), landing_url: getStored('first_landing'),
      first_seen_at: getStored('first_seen_at'), current_url: window.location.href
    };
    log('собрано:', attribution);
    return attribution;
  }

  function findTLIframes() {
    var selectors = ['iframe[src*="travelline.ru"]','iframe[src*="tlintegration.ru"]',
      'iframe[src*="ibe.tlintegration"]','iframe[src*="ibe.travelline"]',
      'iframe[id*="tl-"]','iframe[class*="tl-"]','iframe[id*="travelline"]'];
    var found = [];
    selectors.forEach(function(sel) {
      var nodes = document.querySelectorAll(sel);
      for (var i = 0; i < nodes.length; i++) { if (found.indexOf(nodes[i]) === -1) found.push(nodes[i]); }
    });
    return found;
  }

  function injectIntoIframe(iframe, attribution) {
    if (!iframe || !iframe.src || iframe.dataset.grInjected === '1') return false;
    try {
      var url = new URL(iframe.src);
      var changed = false;
      Object.keys(attribution).forEach(function(key) {
        var val = attribution[key];
        if (val && val.length > 0 && val.length < 500) { url.searchParams.set('gr_' + key, val); changed = true; }
      });
      if (changed) { iframe.src = url.toString(); iframe.dataset.grInjected = '1'; log('iframe обновлён:', iframe.src); return true; }
    } catch (e) { log('ошибка парсинга iframe.src', e); }
    return false;
  }

  function postToIframe(iframe, attribution) {
    if (!iframe || !iframe.contentWindow) return;
    try { iframe.contentWindow.postMessage({ type: 'gr_attribution', version: VERSION, payload: attribution }, '*'); } catch (e) {}
  }

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
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') { postToIframe(iframe, attribution); }
        else { iframe.addEventListener('load', function() { postToIframe(iframe, attribution); }); }
      } catch (e) {}
    });
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initialize); } else { initialize(); }

  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes && mutations[i].addedNodes.length > 0) { processIframes(); return; }
      }
    });
    if (document.body) { observer.observe(document.body, { childList: true, subtree: true }); }
    else { document.addEventListener('DOMContentLoaded', function() { observer.observe(document.body, { childList: true, subtree: true }); }); }
  }

  window.GR_Attribution = {
    version: VERSION,
    get: function() { return attribution; },
    reinject: function() { processIframes(); },
    debug: function(on) { DEBUG = !!on; }
  };

  log('инициализация завершена');
})();
