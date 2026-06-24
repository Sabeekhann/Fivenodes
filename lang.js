// FiveNodes — shared language selector + Google Translate integration
(function () {
  'use strict';

  // ── 1. SUPPRESS GOOGLE TRANSLATE BANNER ─────────────────────────────────
  var _style = document.createElement('style');
  _style.textContent =
    '.skiptranslate{display:none!important}' +
    'body{top:0!important;position:static!important}' +
    '#goog-gt-tt,#google_translate_element{display:none!important}' +
    '.goog-te-banner-frame{display:none!important}' +
    'iframe.skiptranslate{display:none!important}';
  document.head.appendChild(_style);

  new MutationObserver(function () {
    document.querySelectorAll('iframe.skiptranslate,.goog-te-banner-frame').forEach(function (el) {
      el.style.display = 'none';
    });
    if (document.body && document.body.style.top && document.body.style.top !== '0px') {
      document.body.style.top = '0';
    }
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

  // ── 2. STATE ─────────────────────────────────────────────────────────────
  var LABELS = { en: 'EN', ar: 'AR', fr: 'FR', de: 'DE', es: 'ES', 'zh-CN': '中文', pt: 'PT' };
  var currentLang = localStorage.getItem('fn-site-lang') || 'en';

  // ── 3. ARABIC FONT ───────────────────────────────────────────────────────
  function loadCairoFont() {
    if (document.getElementById('cairo-font')) return;
    var l = document.createElement('link');
    l.id = 'cairo-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(l);
  }

  // ── 4. CLEAR ALL GOOGTRANS COOKIES ───────────────────────────────────────
  function clearGTCookies() {
    ['', location.hostname, '.' + location.hostname].forEach(function (domain) {
      document.cookie = 'googtrans=;expires=' + new Date(0).toUTCString() +
        ';path=/' + (domain ? ';domain=' + domain : '');
    });
  }

  // ── 5. UPDATE DROPDOWN UI ────────────────────────────────────────────────
  function applyLangUI(lang) {
    var labelEl = document.getElementById('siteLangLabel');
    if (labelEl) labelEl.textContent = LABELS[lang] || lang.toUpperCase();
    document.querySelectorAll('#siteLangDropdown .lang-option').forEach(function (btn) {
      var m = (btn.getAttribute('onclick') || '').match(/translateSite\('([^']+)'\)/);
      if (m) btn.classList.toggle('active', m[1] === lang);
    });
    if (lang === 'ar') loadCairoFont();
  }

  // ── 6. WAIT FOR GT COMBO BOX ─────────────────────────────────────────────
  function waitForCombo(callback) {
    var tries = 0;
    var iv = setInterval(function () {
      var sel = document.querySelector('.goog-te-combo');
      if (sel) { clearInterval(iv); callback(sel); return; }
      if (++tries > 25) clearInterval(iv); // give up after ~4s
    }, 150);
  }

  // ── 7. TOGGLE DROPDOWN ───────────────────────────────────────────────────
  window.toggleSiteLang = function () {
    var dd = document.getElementById('siteLangDropdown');
    if (dd) dd.classList.toggle('open');
  };

  document.addEventListener('click', function (e) {
    var wrap = document.querySelector('.lang-wrap');
    var dd = document.getElementById('siteLangDropdown');
    if (dd && wrap && !wrap.contains(e.target)) dd.classList.remove('open');
  });

  // ── 8. MAIN TRANSLATE FUNCTION ───────────────────────────────────────────
  // KEY FIX: Never reload for English. Use the GT combo box to restore the
  // original content instantly. Reloading is unreliable because GT's script
  // reads its own session state and re-applies the previous language even
  // after cookies are cleared.
  window.translateSite = function (lang) {
    currentLang = lang;
    localStorage.setItem('fn-site-lang', lang);

    var dd = document.getElementById('siteLangDropdown');
    if (dd) dd.classList.remove('open');

    applyLangUI(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    var sel = document.querySelector('.goog-te-combo');

    if (lang === 'en') {
      clearGTCookies();
      if (sel) {
        // Set combo to blank → GT restores original content, no reload
        sel.value = '';
        sel.dispatchEvent(new Event('change'));
      } else {
        // GT not loaded yet — just reload clean (first visit, no translation active)
        location.reload();
      }
      return;
    }

    if (sel) {
      sel.value = lang;
      sel.dispatchEvent(new Event('change'));
      return;
    }

    // GT not loaded yet — wait for it
    waitForCombo(function (sel) {
      sel.value = lang;
      sel.dispatchEvent(new Event('change'));
    });
  };

  // ── 9. GOOGLE TRANSLATE INIT CALLBACK ────────────────────────────────────
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
    // After GT loads, apply any saved non-English language via combo
    if (currentLang && currentLang !== 'en') {
      waitForCombo(function (sel) {
        sel.value = currentLang;
        sel.dispatchEvent(new Event('change'));
      });
    }
  };

  // ── 10. INIT ─────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    if (currentLang === 'ar') loadCairoFont();
    applyLangUI(currentLang);
  });

})();
