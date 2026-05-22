/* ══════════════════════════════════════════════════════════════
   STIN Tattoo Studio — main.js
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

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

  // Close on any nav link click
  mobOverlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobOverlay.classList.contains('open')) closeMenu();
  });


  /* ── Scroll reveal ───────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.rv');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -28px 0px'
  });

  revealEls.forEach(el => io.observe(el));

  // Hero elements reveal immediately on load
  const heroEls = document.querySelectorAll('#hero .rv');
  heroEls.forEach((el, i) => {
    setTimeout(() => el.classList.add('in'), 60 + i * 70);
  });


  /* ── Booking form ────────────────────────────────────────────── */
  const bookForm = document.getElementById('bookForm');

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;

    const data = {
      name:    form.querySelector('input[type="text"]').value,
      email:   form.querySelector('input[type="email"]').value,
      phone:   form.querySelector('input[type="tel"]').value,
      style:   form.querySelector('select').value,
      message: form.querySelector('textarea').value,
    };

    const TELEGRAM_TOKEN = '8928919620:AAGp9MmCcpGCjiIh3vgmreLQoCWS7E4skj0';
    const CHAT_ID        = '539368260';
    const SHEETS_URL     = 'https://script.google.com/macros/s/AKfycbwz3E0udM-YYhAHFW0d7U_fGYpAjNfyhPVHkJHMhIk07PTn4OxwhEPMtcPqNQOQJMFL/exec';

    const text = `🐾 New booking!\n\n👤 ${data.name}\n📧 ${data.email}\n📱 ${data.phone}\n🎨 ${data.style}\n💬 ${data.message}`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text })
    });

    await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    document.getElementById('form-success').style.display = 'block';
    form.reset();
    setTimeout(() => {
      document.getElementById('form-success').style.display = 'none';
    }, 5000);
  }

  if (bookForm) {
    bookForm.addEventListener('submit', handleSubmit);
  }

})();
