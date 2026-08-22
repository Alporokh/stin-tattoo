/* ══════════════════════════════════════════════════════════════
   STIN Tattoo Studio — main.js
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Language toggle ─────────────────────────────────────────── */
  let currentLang = 'cs';

  function setLang(lang) {
    currentLang = lang;
    document.body.classList.remove('show-cs', 'show-en');
    document.body.classList.add('show-' + lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const isCs = btn.textContent.trim() === 'CZ';
      btn.classList.toggle('active', lang === (isCs ? 'cs' : 'en'));
    });
    try { localStorage.setItem('stin-lang', lang); } catch(e) {}
  }

  window.setLang = setLang;


  /* ── Nav: add .scrolled class on scroll ─────────────────────── */
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 48);
  }, { passive: true });


  /* ── Mobile menu ─────────────────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobOverlay = document.getElementById('mobOverlay');
  const mobClose   = document.getElementById('mobClose');

  function openMenu() {
    mobOverlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobOverlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openMenu);
  mobClose.addEventListener('click', closeMenu);

  mobOverlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobOverlay.classList.contains('open')) closeMenu();
  });


  /* ── Scroll reveal ───────────────────────────────────────────── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in', 'visible');
        io.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -28px 0px'
  });

  // Skip hero — it animates via CSS without JS (avoids LCP delay)
  document.querySelectorAll('.rv, .reveal').forEach(el => {
    if (!el.closest('#hero')) io.observe(el);
  });


  /* ── Booking form ────────────────────────────────────────────── */
  const bookForm = document.getElementById('bookForm');

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn  = form.querySelector('.submit-btn') || form.querySelector('.btn--primary');
    const successMsg = document.getElementById('form-success');

    console.log('[form] submit triggered');

    const data = {
      name:               (form.querySelector('input[type="text"]')  || {}).value || '',
      email:              (form.querySelector('input[type="email"]') || {}).value || '',
      phone:              (form.querySelector('input[type="tel"]')   || {}).value || '',
      style:              (form.querySelector('select')              || {}).value || '',
      message:            (form.querySelector('textarea')            || {}).value || '',
      consent_photos:     (form.querySelector('#f-photos')    || {}).checked ? 'yes' : 'no',
      consent_marketing:  (form.querySelector('#f-marketing') || {}).checked ? 'yes' : 'no',
    };

    console.log('[form] data collected', data);

    if (btn) {
      btn.disabled = true;
      btn.textContent = '...';
    }

    const WORKER_URL     = 'https://stin-tattoo.alporokh.workers.dev';
    const SHEETS_URL     = 'https://script.google.com/macros/s/AKfycbzWppkRNfqjAGa98HVkUl43ixOnBmo2Kjqh4Suko3cR7_UVv5CxXZAIUq2caj8e7cPu/exec';

    const text =
      `🐾 Nová rezervace / New booking!\n\n` +
      `👤 ${data.name}\n` +
      `📧 ${data.email}\n` +
      `📱 ${data.phone}\n` +
      `🎨 ${data.style}\n` +
      `💬 ${data.message}\n\n` +
      `📸 Photos consent: ${data.consent_photos}\n` +
      `📣 Marketing consent: ${data.consent_marketing}`;

    try {
      const tgRes = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const tgJson = await tgRes.json();
      console.log('[form] Telegram response', tgJson);
    } catch (err) {
      console.error('[form] Telegram error:', err);
    }

    try {
      await fetch(SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
      });
      console.log('[form] Sheets request sent');
    } catch (err) {
      console.error('[form] Sheets error:', err);
    }

    if (btn) {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText || 'Send inquiry →';
    }
    if (successMsg) {
      successMsg.style.display = 'block';
      setTimeout(() => { successMsg.style.display = 'none'; }, 5000);
    }
    form.reset();
  }

  if (bookForm) {
    bookForm.addEventListener('submit', handleSubmit);
  }


  /* ── Cookie banner ───────────────────────────────────────────── */
  function initCookieBanner() {
    const banner  = document.getElementById('cookieBanner');
    if (!banner) return;
    if (localStorage.getItem('cookie_consent') === 'accepted') {
      // Defer until after LCP to avoid blocking paint
      (window.requestIdleCallback || setTimeout)(loadClarity, 3000);
      return;
    }
    if (localStorage.getItem('cookie_consent')) return;

    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add('visible'));

    function loadClarity() {
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window,document,"clarity","script","x7g4b9hw3k");
    }

    function dismiss(choice) {
      localStorage.setItem('cookie_consent', choice);
      if (choice === 'accepted') loadClarity();
      banner.classList.remove('visible');
      banner.addEventListener('transitionend', () => { banner.hidden = true; }, { once: true });
    }

    document.getElementById('cookieAccept') .addEventListener('click', () => dismiss('accepted'));
    document.getElementById('cookieDecline').addEventListener('click', () => dismiss('declined'));
  }


  /* ── Init ────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    let saved; try { saved = localStorage.getItem('stin-lang'); } catch(e) {}
    setLang(saved || 'cs');

    const btn = document.querySelector('.submit-btn');
    if (btn) btn.dataset.originalText = btn.textContent.trim();

    initCookieBanner();
  });

})();
