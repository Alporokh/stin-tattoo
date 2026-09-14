/* ══════════════════════════════════════════════════════════════
   STIN Tattoo Studio — consent.js
   Cookie banner for Google Consent Mode v2 and Microsoft Clarity.
   Each page's <head> sets the consent default (analytics denied until
   accepted) before the Google tag config; this file asks, stores the
   choice and applies it. Any [data-cookie-settings] link reopens it.
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Keep in sync with the consent default in each page's <head>
  var STORAGE_KEY = 'stin_consent_v2';
  var CLARITY_ID = 'x7g4b9hw3k';

  var TEXT = {
    cs: {
      message: 'Používáme analytické cookies (Google Analytics a Microsoft Clarity), abychom viděli, jak web používáte a které stránky vedou k rezervaci. Spustíme je jen s vaším souhlasem.',
      accept: 'Přijmout',
      decline: 'Odmítnout'
    },
    en: {
      message: 'We use analytics cookies (Google Analytics and Microsoft Clarity) to see how the site is used and which pages lead to bookings. They only run if you agree.',
      accept: 'Accept',
      decline: 'Decline'
    }
  };

  // Style pages don't load style.css, so the banner carries its own styles
  var CSS =
    '.stin-consent{position:fixed;left:50%;bottom:24px;z-index:1000;box-sizing:border-box;' +
    'width:calc(100% - 40px);max-width:680px;display:flex;align-items:center;justify-content:space-between;' +
    'gap:24px;padding:16px 24px;background:#1C1A18;border:1px solid #3A3835;color:#C8C2BA;' +
    "font-family:'JetBrains Mono','Courier New',monospace;opacity:0;transform:translate(-50%,12px);" +
    'transition:opacity .25s ease,transform .25s ease}' +
    '.stin-consent.is-visible{opacity:1;transform:translate(-50%,0)}' +
    '.stin-consent[hidden]{display:none}' +
    '.stin-consent p{margin:0;font-size:10px;letter-spacing:.08em;line-height:1.7}' +
    '.stin-consent__actions{display:flex;gap:8px;flex-shrink:0}' +
    '.stin-consent button{font:inherit;font-size:9px;letter-spacing:.14em;text-transform:uppercase;' +
    'padding:8px 14px;border:1px solid #3A3835;background:transparent;color:#C8C2BA;cursor:pointer;' +
    'transition:background .2s,color .2s,border-color .2s}' +
    '.stin-consent button[data-choice="accepted"]{background:#fff;color:#1C1A18;border-color:#fff}' +
    '.stin-consent button[data-choice="accepted"]:hover{background:#C8C2BA;border-color:#C8C2BA}' +
    '.stin-consent button[data-choice="declined"]:hover{border-color:#C8C2BA;color:#fff}' +
    '.stin-consent button:focus-visible{outline:2px solid #fff;outline-offset:2px}' +
    '[data-cookie-settings]{text-decoration:underline;text-underline-offset:3px;cursor:pointer}' +
    '@media (max-width:600px){.stin-consent{flex-direction:column;align-items:flex-start;gap:12px;bottom:16px}}' +
    '@media (prefers-reduced-motion:reduce){.stin-consent{transition:none}}';

  var banner, messageEl, acceptBtn, declineBtn;

  function getChoice() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function loadClarity() {
    if (window.__stinClarityLoaded) return;
    window.__stinClarityLoaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  function clearAnalyticsCookies() {
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';')
      .map(function (c) { return c.split('=')[0].trim(); })
      .filter(function (name) { return /^(_ga|_gid|_gat|_clck|_clsk)/.test(name); })
      .forEach(function (name) {
        ['', host, '.' + host].forEach(function (domain) {
          document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
        });
      });
  }

  function currentLang() {
    return document.body.classList.contains('show-en') ? 'en' : 'cs';
  }

  function renderText() {
    var t = TEXT[currentLang()];
    messageEl.textContent = t.message;
    acceptBtn.textContent = t.accept;
    declineBtn.textContent = t.decline;
  }

  function makeButton(choice) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-choice', choice);
    btn.addEventListener('click', function () { applyChoice(choice); });
    return btn;
  }

  function buildBanner() {
    banner = document.createElement('div');
    banner.className = 'stin-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookies');
    banner.hidden = true;

    messageEl = document.createElement('p');
    acceptBtn = makeButton('accepted');
    declineBtn = makeButton('declined');

    var actions = document.createElement('div');
    actions.className = 'stin-consent__actions';
    actions.appendChild(acceptBtn);
    actions.appendChild(declineBtn);

    banner.appendChild(messageEl);
    banner.appendChild(actions);
    document.body.appendChild(banner);
    renderText();

    // Follow the CZ/EN toggle, which switches the body class
    new MutationObserver(renderText).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  function showBanner() {
    if (!banner) buildBanner();
    banner.hidden = false;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.classList.add('is-visible'); });
    });
  }

  function hideBanner() {
    banner.classList.remove('is-visible');
    setTimeout(function () { banner.hidden = true; }, 250);
  }

  function applyChoice(choice) {
    try { localStorage.setItem(STORAGE_KEY, choice); } catch (e) {}
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: choice === 'accepted' ? 'granted' : 'denied' });
    }
    hideBanner();

    if (choice === 'accepted') {
      loadClarity();
    } else {
      clearAnalyticsCookies();
      // Clarity can't be stopped once running; a reload starts the page without it
      if (window.__stinClarityLoaded) location.reload();
    }
  }

  function init() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var choice = getChoice();
    if (choice === 'accepted') {
      // Wait for an idle moment so Clarity doesn't compete with first paint
      if ('requestIdleCallback' in window) requestIdleCallback(loadClarity, { timeout: 3000 });
      else setTimeout(loadClarity, 3000);
    } else if (!choice) {
      showBanner();
    }

    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('[data-cookie-settings]')) return;
      e.preventDefault();
      showBanner();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
