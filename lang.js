// FiveNodes — language selector v3 (bulletproof English restoration)
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

  // ── STATE ────────────────────────────────────────────────────────────────
  var LABELS = { en: 'EN', ar: 'AR', fr: 'FR', de: 'DE', es: 'ES', 'zh-CN': '中文', pt: 'PT' };

  // Check for the "force English" flag set by a previous switchback
  var _params = new URLSearchParams(location.search);
  var _forceEN = _params.get('_nt') === '1';
  if (_forceEN) {
    // Strip the flag from the URL cleanly
    _params.delete('_nt');
    var _clean = location.pathname + (_params.toString() ? '?' + _params.toString() : '') + location.hash;
    history.replaceState(null, '', _clean);
    localStorage.setItem('fn-site-lang', 'en');
  }

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
    ['', location.hostname, '.' + location.hostname].forEach(function (d) {
      document.cookie = 'googtrans=;expires=' + new Date(0).toUTCString() + ';path=/' + (d ? ';domain=' + d : '');
    });
  }

  function getCombo() { return document.querySelector('.goog-te-combo'); }

  function waitForCombo(callback) {
    var tries = 0, iv = setInterval(function () {
      var s = getCombo();
      if (s) { clearInterval(iv); callback(s); }
      else if (++tries > 30) clearInterval(iv);
    }, 150);
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

  // ── DROPDOWN TOGGLE ──────────────────────────────────────────────────────
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
    currentLang = lang;
    localStorage.setItem('fn-site-lang', lang);
    var dd = document.getElementById('siteLangDropdown');
    if (dd) dd.classList.remove('open');
    applyLangUI(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    if (lang === 'en') {
      clearGTCookies();

      // Strategy 1: GT internal restore() API
      try {
        var gt = window.google && window.google.translate && window.google.translate.TranslateElement;
        if (gt && gt.getInstance) { gt.getInstance().restore(); return; }
      } catch (e) {}

      // Strategy 2: combo set to '' (restore original)
      var sel = getCombo();
      if (sel) {
        sel.value = '';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        // Verify it actually reverted after 600ms; if not, force reload with flag
        setTimeout(function () {
          var s = getCombo();
          if (s && s.value !== '') {
            location.replace(location.pathname + '?_nt=1');
          }
        }, 600);
        return;
      }

      // Strategy 3: reload with ?_nt=1 flag — on reload the flag sets localStorage
      // to 'en' BEFORE googleTranslateElementInit fires, so GT never applies.
      location.replace(location.pathname + '?_nt=1');
      return;
    }

    // Non-English: use combo if ready, otherwise wait
    var sel = getCombo();
    if (sel) {
      sel.value = lang;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    waitForCombo(function (s) {
      s.value = lang;
      s.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };

  // ── GT INIT CALLBACK ─────────────────────────────────────────────────────
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
    // Only auto-translate if not force-English and a non-English lang is saved
    if (!_forceEN && currentLang && currentLang !== 'en') {
      waitForCombo(function (s) {
        // Double-check currentLang hasn't been changed to 'en' in the meantime
        if (currentLang !== 'en') {
          s.value = currentLang;
          s.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }
  };

  // ── DOM READY ────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.dir = (currentLang === 'ar' && !_forceEN) ? 'rtl' : 'ltr';
    if (currentLang === 'ar' && !_forceEN) loadCairoFont();
    applyLangUI(_forceEN ? 'en' : currentLang);
  });

})();
