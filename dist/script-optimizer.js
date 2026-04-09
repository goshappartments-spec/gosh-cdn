/**
 * CDN Script Optimizer for gosh.rent
 * Handles lazy-loading, preconnection, and deferred script loading
 * Version: 1.0.0
 */

(function() {
  'use strict';

  const DEFER_TIMEOUT = 3000; // 3 seconds before loading deferred scripts
  const THIRD_PARTY_SCRIPTS = ['bitrix24', 'votpusk', '101hotels'];

  /**
   * Add preconnect hints for external resources
   */
  function addPreconnects() {
    const preconnects = [
      'https://static.tildacdn.com',
      'https://ru-ibe.tlintegration.ru',
      'https://mc.yandex.ru'
    ];

    preconnects.forEach(url => {
      if (!document.querySelector(`link[rel="preconnect"][href="${url}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Lazy-load iframes using IntersectionObserver
   */
  function lazyLoadIframes() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers - load all iframes immediately
      document.querySelectorAll('iframe[data-src]').forEach(iframe => {
        iframe.src = iframe.dataset.src;
        iframe.removeAttribute('data-src');
      });
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          if (iframe.dataset.src) {
            iframe.src = iframe.dataset.src;
            iframe.removeAttribute('data-src');
            obs.unobserve(iframe);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });

    document.querySelectorAll('iframe[data-src]').forEach(iframe => {
      observer.observe(iframe);
    });
  }

  /**
   * Convert iframe src to data-src for lazy loading
   * Call this early, before scripts run
   */
  function prepareIframesForLazyLoad() {
    // TravelLine widgets and other iframes
    document.querySelectorAll('iframe').forEach(iframe => {
      if (iframe.src && !iframe.dataset.src) {
        iframe.dataset.src = iframe.src;
        iframe.src = ''; // Clear src to prevent immediate load
      }
    });
  }

  /**
   * Defer non-critical third-party scripts
   */
  function deferThirdPartyScripts() {
    const scripts = document.querySelectorAll('script[src]');
    
    scripts.forEach(script => {
      const src = script.src || '';
      const shouldDefer = THIRD_PARTY_SCRIPTS.some(name => src.includes(name));
      
      if (shouldDefer && script.type !== 'module') {
        script.type = 'text/plain';
        script.dataset.defer = 'true';
      }
    });

    // Restore deferred scripts after timeout
    setTimeout(() => {
      document.querySelectorAll('script[data-defer="true"]').forEach(script => {
        if (script.type === 'text/plain') {
          script.type = 'text/javascript';
        }
      });
    }, DEFER_TIMEOUT);
  }

  /**
   * Add content-visibility to below-fold sections
   */
  function optimizeBelowFoldContent() {
    // Mark sections for performance optimization
    const sections = document.querySelectorAll('.t-rec, section, [data-content-visibility]');
    let belowFold = false;

    sections.forEach((section, index) => {
      // First few sections are likely above fold
      if (index > 2) {
        belowFold = true;
      }

      if (belowFold && !section.style.contentVisibility) {
        section.style.contentVisibility = 'auto';
        section.style.containIntrinsicSize = 'auto 500px';
      }
    });
  }

  /**
   * Register Service Worker (non-critical, wrapped in try/catch)
   */
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const swPath = '/dist/sw.js';
      navigator.serviceWorker.register(swPath, { scope: '/' })
        .then(reg => {
          console.log('[gosh-cdn] Service Worker registered:', reg.scope);
        })
        .catch(err => {
          console.log('[gosh-cdn] Service Worker registration failed:', err.message);
        });
    } catch (e) {
      // Silently fail - SW is optional
      console.log('[gosh-cdn] Service Worker setup skipped:', e.message);
    }
  }

  /**
   * Initialize all optimizations
   */
  function init() {
    // Run prepareIframesForLazyLoad as early as possible
    if (document.readyState === 'loading') {
      prepareIframesForLazyLoad();
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    addPreconnects();
    deferThirdPartyScripts();
    lazyLoadIframes();
    optimizeBelowFoldContent();
    registerServiceWorker();
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
