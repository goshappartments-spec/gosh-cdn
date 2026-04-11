/*
 * GOSH.RENT Attribution Bridge v1.2.0
 * TL sourceUrl → roistat param → Bitrix24 UF_CRM_ROISTAT_PARAMETERS
 * 12.04.2026
 */
(function() {
  'use strict';
  var NAMESPACE = 'gr_attribution';
  var VERSION = '1.2.0';
  var DEBUG = false;

  function log() {
    if (DEBUG && window.console) {
      var args = ['[GR-attr ' + VERSION + ']'].concat([].slice.call(arguments));
      console.log.apply(console, args);
    }
  }
  function getCookie(name) {
    var v = document.cookie.match('(^|;)\s*' + name + '\s*=\s*([^;]+)');
    return v ? decodeURIComponent(v.pop()) : '';
  }
  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }
  function getStored(key) {
    try { return sessionStorage.getItem(NAMESPACE + '_' + key) || ''; } catch(e) { return ''; }
  }
  function setStored(key, value) {
    try { sessionStorage.setItem(NAMESPACE + '_' + key, value); } catch(e) {}
  }

  function collectAttribution() {
    var utmKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
    var utms = {};
    utmKeys.forEach(function(k) {
      var fromUrl = getQueryParam(k);
      if (fromUrl) { setStored(k, fromUrl); utms[k] = fromUrl; }
      else { utms[k] = getStored(k); }
    });
    var roistatVisit = getCookie('roistat_visit') || getCookie('_ros_visit') || getQueryParam('roistat') || '';
    var ymUid = getCookie('_ym_uid') || '';
    var gaRaw = getCookie('_ga') || '';
    var gaCid = gaRaw ? gaRaw.split('.').slice(-2).join('.') : '';
    if (!getStored('first_landing')) setStored('first_landing', window.location.href);
    if (!getStored('first_referrer')) setStored('first_referrer', document.referrer || 'direct');
    if (!getStored('first_seen_at')) setStored('first_seen_at', new Date().toISOString());
    return {
      roistat_visit: roistatVisit, ym_uid: ymUid, ga_cid: gaCid,
      utm_source: utms.utm_source, utm_medium: utms.utm_medium,
      utm_campaign: utms.utm_campaign, utm_content: utms.utm_content,
      utm_term: utms.utm_term, referrer: getStored('first_referrer'),
      landing_url: getStored('first_landing'), first_seen_at: getStored('first_seen_at'),
      current_url: window.location.href
    };
  }

  // [v1.2] КЛЮЧЕВОЙ МЕТОД: добавляем roistat в URL страницы
  // TL захватывает этот URL как sourceUrl брони
  // sync.py парсит sourceUrl и пишет visit_id в Bitrix24
  function injectRoistatIntoPageUrl(roistatVisit) {
    if (!roistatVisit || !window.history || !window.history.replaceState) return;
    try {
      var url = new URL(window.location.href);
      if (!url.searchParams.get('roistat') && !url.searchParams.get('roistat_visit')) {
        url.searchParams.set('roistat', roistatVisit);
        window.history.replaceState(null, '', url.toString());
        log('roistat→pageURL:', roistatVisit);
      }
    } catch(e) { log('injectRoistatIntoPageUrl error', e); }
  }

  function findTLIframes() {
    var sels = ['iframe[src*="travelline.ru"]','iframe[src*="tlintegration.ru"]',
      'iframe[src*="ibe.tlintegration"]','iframe[id*="tl-"]','iframe[class*="tl-"]'];
    var found = [];
    sels.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(n) {
        if (found.indexOf(n) === -1) found.push(n);
      });
    });
    return found;
  }

  function injectIntoIframe(iframe, attr) {
    if (!iframe || !iframe.src || iframe.dataset.grInjected === '1') return false;
    try {
      var url = new URL(iframe.src);
      var changed = false;
      Object.keys(attr).forEach(function(k) {
        var v = attr[k];
        if (v && v.length > 0 && v.length < 500) { url.searchParams.set('gr_' + k, v); changed = true; }
      });
      if (changed) { iframe.src = url.toString(); iframe.dataset.grInjected = '1'; log('iframe updated'); return true; }
    } catch(e) {}
    return false;
  }

  function postToIframe(iframe, attr) {
    if (!iframe || !iframe.contentWindow) return;
    try { iframe.contentWindow.postMessage({type:'gr_attribution',version:VERSION,payload:attr},'*'); } catch(e) {}
  }

  var attribution = null;

  function processIframes() {
    if (!attribution) return;
    findTLIframes().forEach(function(iframe) {
      injectIntoIframe(iframe, attribution);
      try {
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') postToIframe(iframe, attribution);
        else iframe.addEventListener('load', function() { postToIframe(iframe, attribution); });
      } catch(e) {}
    });
  }

  function initialize() {
    attribution = collectAttribution();
    window.__GR_ATTRIBUTION__ = attribution;
    if (attribution.roistat_visit) injectRoistatIntoPageUrl(attribution.roistat_visit);
    if (window.dataLayer) window.dataLayer.push({event:'gr_attribution_ready',attribution:attribution});
    processIframes();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();

  if (typeof MutationObserver !== 'undefined') {
    var obs = new MutationObserver(function(mutations) {
      for (var i=0; i<mutations.length; i++) {
        var m = mutations[i];
        if ((m.type==='childList' && m.addedNodes.length) ||
            (m.type==='attributes' && m.attributeName==='src' && m.target.tagName==='IFRAME')) {
          processIframes(); break;
        }
      }
    });
    var startObs = function() {
      obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
    };
    if (document.body) startObs();
    else document.addEventListener('DOMContentLoaded', startObs);
  }

  var nFast = 0;
  var tFast = setInterval(function() {
    processIframes();
    if (++nFast >= 20) {
      clearInterval(tFast);
      var nSlow = 0;
      var tSlow = setInterval(function() {
        processIframes();
        if (++nSlow >= 10) clearInterval(tSlow);
      }, 1000);
    }
  }, 300);

  window.GR_Attribution = {
    version: VERSION,
    get: function() { return attribution; },
    reinject: function() { processIframes(); },
    debug: function(on) { DEBUG = !!on; }
  };
  log('ready');
})();
