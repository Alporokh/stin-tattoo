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

  if (bookForm) {
    bookForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const btn = this.querySelector('.btn--primary');
      const originalText = btn.textContent;

      // Disable while "sending"
      btn.disabled = true;
      btn.textContent = 'Sending…';

      // Simulate async send (replace with real fetch to your endpoint)
      setTimeout(() => {
        btn.textContent = 'Sent ✓  We\'ll be in touch soon';
        btn.style.background = '#2d4a2d';
        btn.style.borderColor = '#2d4a2d';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.disabled = false;
          bookForm.reset();
        }, 5000);
      }, 800);
    });
  }

})();
