// FiveNodes — language selector v4
// Simple reliable approach: cookies + reload for all changes.
// For English: skip GT initialization entirely so it can never re-apply.
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

  // ── FORCE-ENGLISH FLAG ───────────────────────────────────────────────────
  // When user switches to English we reload with ?_nt=1.
  // This flag is read before GT initializes — we then skip creating the
  // TranslateElement entirely so GT cannot translate the page.
  var _params = new URLSearchParams(location.search);
  var _forceEN = _params.get('_nt') === '1';
  if (_forceEN) {
    _params.delete('_nt');
    history.replaceState(null, '', location.pathname + (_params.toString() ? '?' + _params : '') + location.hash);
    localStorage.setItem('fn-site-lang', 'en');
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

  function clearGTCookies() {
    // Clear under every possible domain variant
    ['', location.hostname, '.' + location.hostname, 'www.' + location.hostname].forEach(function (d) {
      document.cookie = 'googtrans=;expires=' + new Date(0).toUTCString() + ';path=/' + (d ? ';domain=' + d : '');
    });
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

    localStorage.setItem('fn-site-lang', lang);
    clearGTCookies();

    if (lang === 'en') {
      // Reload with ?_nt=1 — googleTranslateElementInit will be skipped on reload
      location.replace(location.pathname + '?_nt=1');
      return;
    }

    // Set the googtrans cookie so GT translates on reload
    document.cookie = 'googtrans=/en/' + lang + ';path=/;domain=.' + location.hostname;
    document.cookie = 'googtrans=/en/' + lang + ';path=/';
    location.reload();
  };

  // ── GT INIT CALLBACK ─────────────────────────────────────────────────────
  // When _forceEN is true we return immediately — GT widget is never created
  // so it cannot translate the page regardless of any stored state.
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
