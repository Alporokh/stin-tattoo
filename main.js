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
    const btnCs = document.getElementById('btn-cs');
    const btnEn = document.getElementById('btn-en');
    if (btnCs) btnCs.classList.toggle('active', lang === 'cs');
    if (btnEn) btnEn.classList.toggle('active', lang === 'en');
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

  document.querySelectorAll('.rv, .reveal').forEach(el => io.observe(el));

  // Hero elements reveal immediately on load
  document.querySelectorAll('#hero .rv').forEach((el, i) => {
    setTimeout(() => el.classList.add('in', 'visible'), 60 + i * 70);
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
      name:    (form.querySelector('input[type="text"]')  || {}).value || '',
      email:   (form.querySelector('input[type="email"]') || {}).value || '',
      phone:   (form.querySelector('input[type="tel"]')   || {}).value || '',
      style:   (form.querySelector('select')              || {}).value || '',
      message: (form.querySelector('textarea')            || {}).value || '',
    };

    console.log('[form] data collected', data);

    if (btn) {
      btn.disabled = true;
      btn.textContent = '...';
    }

    const TELEGRAM_TOKEN = '8928919620:AAE17qh6UoRyAKJdBcdxoaxh8LYYRpjRVvo';
    const CHAT_ID        = '539368260';
    const SHEETS_URL     = 'https://script.google.com/macros/s/AKfycbwz3E0udM-YYhAHFW0d7U_fGYpAjNfyhPVHkJHMhIk07PTn4OxwhEPMtcPqNQOQJMFL/exec';

    const text =
      `🐾 Nová rezervace / New booking!\n\n` +
      `👤 ${data.name}\n` +
      `📧 ${data.email}\n` +
      `📱 ${data.phone}\n` +
      `🎨 ${data.style}\n` +
      `💬 ${data.message}`;

    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text })
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
        headers: { 'Content-Type': 'application/json' },
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


  /* ── Init ────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    setLang('cs');

    const btn = document.querySelector('.submit-btn');
    if (btn) btn.dataset.originalText = btn.textContent.trim();
  });

})();
