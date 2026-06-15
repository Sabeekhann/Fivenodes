// FiveNodes — shared language selector + Google Translate integration
(function () {
  'use strict';

  // ── 1. SUPPRESS GOOGLE TRANSLATE BANNER ─────────────────────────────────
  // Inject CSS that kills the Google bar and undoes the body offset it creates
  const style = document.createElement('style');
  style.textContent =
    '.skiptranslate{display:none!important}' +
    'body{top:0!important;position:static!important}' +
    '#goog-gt-tt,#goog-gt-,#google_translate_element{display:none!important}' +
    '.goog-te-banner-frame{display:none!important}' +
    '.goog-te-menu-value:hover{text-decoration:none}' +
    'iframe.skiptranslate{display:none!important}';
  document.head.appendChild(style);

  // MutationObserver: Google injects the bar dynamically, so watch for it and remove it
  const _obs = new MutationObserver(function () {
    // Kill the banner iframe
    document.querySelectorAll('iframe.skiptranslate, .goog-te-banner-frame').forEach(function (el) {
      el.style.display = 'none';
    });
    // Reset body top offset that Google sets
    if (document.body && document.body.style.top && document.body.style.top !== '0px') {
      document.body.style.top = '0';
    }
  });
  _obs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

  // ── 2. CONSTANTS ─────────────────────────────────────────────────────────
  var LABELS = { en: 'EN', ar: 'AR', fr: 'FR', de: 'DE', es: 'ES', 'zh-CN': '中文', pt: 'PT' };
  var currentLang = localStorage.getItem('fn-site-lang') || 'en';

  // ── 3. ARABIC FONT ───────────────────────────────────────────────────────
  function loadCairoFont() {
    if (document.getElementById('cairo-font')) return;
    var l = document.createElement('link');
    l.id = 'cairo-font';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(l);
  }

  // ── 4. APPLY RTL / LABEL ─────────────────────────────────────────────────
  function applyLangUI(lang) {
    var labelEl = document.getElementById('siteLangLabel');
    if (labelEl) labelEl.textContent = LABELS[lang] || lang.toUpperCase();

    document.querySelectorAll('#siteLangDropdown .lang-option').forEach(function (btn) {
      var m = (btn.getAttribute('onclick') || '').match(/translateSite\('([^']+)'\)/);
      if (m) btn.classList.toggle('active', m[1] === lang);
    });

    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      loadCairoFont();
    } else {
      document.documentElement.dir = 'ltr';
    }
  }

  // ── 5. TOGGLE DROPDOWN ───────────────────────────────────────────────────
  window.toggleSiteLang = function () {
    var dd = document.getElementById('siteLangDropdown');
    if (dd) dd.classList.toggle('open');
  };

  document.addEventListener('click', function (e) {
    var wrap = document.querySelector('.lang-wrap');
    var dd = document.getElementById('siteLangDropdown');
    if (dd && wrap && !wrap.contains(e.target)) dd.classList.remove('open');
  });

  // ── 6. TRANSLATE ─────────────────────────────────────────────────────────
  window.translateSite = function (lang) {
    currentLang = lang;
    localStorage.setItem('fn-site-lang', lang);

    var dd = document.getElementById('siteLangDropdown');
    if (dd) dd.classList.remove('open');

    applyLangUI(lang);

    if (lang === 'en') {
      // Clear Google Translate cookie and reload to restore English
      ['', '.' + location.hostname].forEach(function (domain) {
        document.cookie = 'googtrans=;expires=' + new Date(0).toUTCString() + ';path=/' + (domain ? ';domain=' + domain : '');
      });
      location.reload();
      return;
    }

    // Try the combo box first (already-loaded GT)
    var sel = document.querySelector('.goog-te-combo');
    if (sel) {
      sel.value = lang;
      sel.dispatchEvent(new Event('change'));
      return;
    }

    // Fallback: set cookie and reload
    var d = location.hostname;
    document.cookie = 'googtrans=/en/' + lang + ';path=/;domain=.' + d;
    document.cookie = 'googtrans=/en/' + lang + ';path=/';
    location.reload();
  };

  // ── 7. GOOGLE TRANSLATE INIT CALLBACK ────────────────────────────────────
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');

    // After GT loads, re-apply the saved language without reloading
    if (currentLang && currentLang !== 'en') {
      var attempt = 0;
      var iv = setInterval(function () {
        var sel = document.querySelector('.goog-te-combo');
        if (sel) {
          sel.value = currentLang;
          sel.dispatchEvent(new Event('change'));
          clearInterval(iv);
        } else if (++attempt > 20) {
          clearInterval(iv);
        }
      }, 150);
    }
  };

  // ── 8. INIT ON LOAD ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    // Only apply RTL if Google Translate is actually active for Arabic.
    // Check the googtrans cookie — if it's not set to /en/ar, force LTR to
    // prevent a stale localStorage value from mis-applying RTL layout on English pages.
    var gtCookie = document.cookie.split(';').map(function(c){ return c.trim(); })
      .find(function(c){ return c.startsWith('googtrans='); });
    var isArabicActive = gtCookie && gtCookie.indexOf('/en/ar') !== -1;

    if (currentLang === 'ar' && !isArabicActive) {
      // Stale localStorage — reset to English so layout is never broken
      currentLang = 'en';
      localStorage.setItem('fn-site-lang', 'en');
    }

    applyLangUI(currentLang);
  });

})();
