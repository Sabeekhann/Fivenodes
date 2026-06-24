// FiveNodes — language selector v5
// Reliable GT translation: cookie + cache-busting URL to prevent BFCache stale state.
(function () {
  'use strict';

  // ── SUPPRESS GT BANNER ───────────────────────────────────────────────────
  var _s = document.createElement('style');
  _s.textContent =
    '.skiptranslate{display:none!important}body{top:0!important;position:static!important}' +
    '#goog-gt-tt,#google_translate_element{display:none!important}' +
    '.goog-te-banner-frame,iframe.skiptranslate{display:none!important}';
  document.head.appendChild(_s);
  new MutationObserver(function () {
    document.querySelectorAll('iframe.skiptranslate,.goog-te-banner-frame').forEach(function (el) { el.style.display = 'none'; });
    if (document.body && document.body.style.top && document.body.style.top !== '0px') document.body.style.top = '0';
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

  // ── URL PARAM FLAGS ──────────────────────────────────────────────────────
  // ?_nt=1  → force English (skip GT init entirely)
  // ?_gl=xx → set GT cookie for language xx, then clean URL
  var _params = new URLSearchParams(location.search);
  var _forceEN = _params.get('_nt') === '1';
  var _glParam = _params.get('_gl');

  function _cleanUrl() {
    _params.delete('_nt');
    _params.delete('_gl');
    var qs = _params.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  if (_forceEN) {
    _cleanUrl();
    localStorage.setItem('fn-site-lang', 'en');
  } else if (_glParam) {
    // Set the GT cookie from the URL param, then clean URL
    _setGTCookie(_glParam);
    localStorage.setItem('fn-site-lang', _glParam);
    _cleanUrl();
  }

  function _setGTCookie(lang) {
    var val = 'googtrans=/en/' + lang;
    var exp = ';path=/';
    document.cookie = val + exp + ';domain=.' + location.hostname;
    document.cookie = val + exp;
  }

  function _clearGTState() {
    // Clear cookies under all domain variants
    ['', location.hostname, '.' + location.hostname, 'www.' + location.hostname].forEach(function (d) {
      document.cookie = 'googtrans=;expires=' + new Date(0).toUTCString() + ';path=/' + (d ? ';domain=' + d : '');
    });
    // Clear any GT localStorage state
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf('googtrans') !== -1 || k.indexOf('goog-') !== -1) localStorage.removeItem(k);
      });
    } catch (e) {}
  }

  // ── STATE ────────────────────────────────────────────────────────────────
  var LABELS = { en: 'EN', ar: 'AR', fr: 'FR', de: 'DE', es: 'ES', 'zh-CN': '中文', pt: 'PT' };
  var currentLang = localStorage.getItem('fn-site-lang') || 'en';

  // ── HELPERS ──────────────────────────────────────────────────────────────
  function loadCairoFont() {
    if (document.getElementById('cairo-font')) return;
    var l = document.createElement('link');
    l.id = 'cairo-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(l);
  }

  function applyLangUI(lang) {
    var el = document.getElementById('siteLangLabel');
    if (el) el.textContent = LABELS[lang] || lang.toUpperCase();
    document.querySelectorAll('#siteLangDropdown .lang-option').forEach(function (btn) {
      var m = (btn.getAttribute('onclick') || '').match(/translateSite\('([^']+)'\)/);
      if (m) btn.classList.toggle('active', m[1] === lang);
    });
    if (lang === 'ar') loadCairoFont();
  }

  // ── DROPDOWN ─────────────────────────────────────────────────────────────
  window.toggleSiteLang = function () {
    var dd = document.getElementById('siteLangDropdown');
    if (dd) dd.classList.toggle('open');
  };
  document.addEventListener('click', function (e) {
    var wrap = document.querySelector('.lang-wrap');
    var dd = document.getElementById('siteLangDropdown');
    if (dd && wrap && !wrap.contains(e.target)) dd.classList.remove('open');
  });

  // ── TRANSLATE ────────────────────────────────────────────────────────────
  window.translateSite = function (lang) {
    var dd = document.getElementById('siteLangDropdown');
    if (dd) dd.classList.remove('open');

    if (lang === currentLang) return; // already on this language

    _clearGTState();

    if (lang === 'en') {
      localStorage.setItem('fn-site-lang', 'en');
      // Use ?_nt=1 to skip GT init entirely on reload
      location.replace(location.pathname + '?_nt=1');
      return;
    }

    localStorage.setItem('fn-site-lang', lang);
    // Use ?_gl=xx URL param so the fresh page load picks up the language
    // reliably regardless of BFCache. The param is cleaned up on load.
    var cleanPath = location.pathname;
    location.replace(cleanPath + '?_gl=' + encodeURIComponent(lang));
  };

  // ── GT INIT CALLBACK ─────────────────────────────────────────────────────
  // _forceEN → return immediately so GT never runs (English stays native).
  // _glParam already set the cookie above; GT reads it and translates.
  window.googleTranslateElementInit = function () {
    if (_forceEN) return;
    new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
  };

  // ── DOM READY ────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    var lang = _forceEN ? 'en' : currentLang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (lang === 'ar') loadCairoFont();
    applyLangUI(lang);
  });

})();
