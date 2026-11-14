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


  /* ── Portfolio · circular carousel ───────────────────────────
     Lifts the portfolio grid into a 3D ring: momentum drag, snapping,
     click to focus, and card faces that bend onto the cylinder while
     the ring is spinning. The grid markup is untouched and stays the
     fallback for no-JS, old browsers and reduced-motion visitors. */
  (function portfolioRing() {
    const stage = document.getElementById('portStage');
    if (!stage) return;

    const grid = stage.querySelector('.portfolio-grid');
    if (!grid) return;

    const cards = Array.prototype.slice.call(grid.querySelectorAll('.port-item'));
    const n = cards.length;
    if (n < 6) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const can3d = window.CSS && CSS.supports &&
      (CSS.supports('transform-style', 'preserve-3d') ||
       CSS.supports('-webkit-transform-style', 'preserve-3d'));
    if (!can3d) return;

    const SLICES   = 7;     // strips a card face is split into
    const theta    = 360 / n;
    const BEND_REST = theta * 1.4;  // resting curve: the cards wrap the drum
    const BEND_MAX  = 52;   // degrees of arc at full speed
    const BEND_VEL  = 4.5;  // ring speed (deg/frame) that reaches full bend
    const FRONT     = 1.1;  // the card at the front sits proud of the rest
    const SPACING   = 1.18; // > 1 so the far side shows through the gaps

    // One spring does every move - a release, a click, a button, a key.
    // The landing card is picked once, when the gesture ends, and the
    // spring carries the release velocity, so nothing ever hands off
    // mid-flight. K/FR give ~420-620ms whatever the distance, and the
    // ring never speeds up after you let go.
    const SPRING   = 0.06;  // stiffness
    const DAMP     = 0.66;  // velocity kept per frame
    const PROJECT  = 9;     // how far a flick is predicted to carry
    const VEL_MAX  = 18;    // deg/frame, about 14 cards on the hardest fling
    const REST     = 0.05;  // deg: close enough to call it stopped

    const DRIFT    = 0.086; // deg/frame: the ring turns one card every ~2.8s
    const RESUME   = 2400;  // ms of quiet after a gesture before it drifts again

    /* ── build the ring ──────────────────────────────────────── */
    const inner = document.createElement('div');
    inner.className = 'ring-inner';
    cards.forEach(card => {
      card.classList.remove('rv', 'd1', 'd2', 'd3');
      io.unobserve(card);
      inner.appendChild(card);
    });
    const fog = document.createElement('div');
    fog.className = 'ring-fog';
    grid.appendChild(inner);
    grid.appendChild(fog);
    stage.classList.add('is-ring');

    grid.tabIndex = 0;
    grid.setAttribute('aria-label', 'Tattoo portfolio — drag or use the arrow keys');

    const ui    = stage.querySelector('.ring-ui');
    const hint  = stage.querySelector('.ring-hint');
    const idxEl = stage.querySelector('.ring-idx');
    const totEl = stage.querySelector('.ring-total');
    const labEl = stage.querySelector('.ring-label');
    if (ui)   ui.hidden = false;
    if (hint) hint.hidden = false;
    if (totEl) totEl.textContent = String(n);

    /* ── geometry ────────────────────────────────────────────── */
    let cardW = 320, cardH = 420, radius = 1000, degPerPx = 0.06;
    const base = [];        // each card's own place on the drum

    function place(i) {
      cards[i].style.transform = base[i] + (i === front ? ' scale(' + FRONT + ')' : '');
    }

    function measure() {
      const cs = getComputedStyle(stage);
      cardW = parseFloat(cs.getPropertyValue('--card-w')) || 320;
      cardH = parseFloat(cs.getPropertyValue('--card-h')) || 420;
      // the chord of one segment is narrower than a card, so they overlap
      radius = Math.round((cardW * SPACING / 2) / Math.tan(Math.PI / n));
      // a short focal length is what makes the ring read as a ring
      grid.style.perspective = Math.round(Math.max(430, cardW * 3.6)) + 'px';
      cards.forEach((card, i) => {
        base[i] = 'rotateY(' + (i * theta).toFixed(3) + 'deg) translateZ(' + radius + 'px)';
        place(i);
      });
      // dragging a card's width moves the ring by roughly one card
      degPerPx = theta / (cardW * 0.85);
    }

    function render() {
      inner.style.transform = 'translateZ(' + (-radius) + 'px) rotateY(' + rot.toFixed(3) + 'deg)';
    }

    /* ── the bend: place the strips on an arc of `deg` total ──── */
    function applyBend(deg) {
      const B  = deg * Math.PI / 180;
      const sw = cardW / SLICES;
      for (let k = 0; k < SLICES; k++) {
        const s = (k + 0.5) / SLICES - 0.5;   // -0.5 … 0.5 across the card
        let x, z, a;
        if (Math.abs(B) < 1e-4) {
          x = s * cardW; z = 0; a = 0;
        } else {
          const r = cardW / B;                // bend radius
          a = s * B;
          x = r * Math.sin(a);
          z = r * Math.cos(a) - r;            // centre stays at z = 0
        }
        inner.style.setProperty('--t' + k,
          'translate3d(' + (cardW / 2 + x - sw / 2).toFixed(2) + 'px,0,' + z.toFixed(2) + 'px)' +
          ' rotateY(' + (a * 180 / Math.PI).toFixed(2) + 'deg)');
      }
    }

    /* ── slice a card face, once its photo has decoded ────────── */
    function buildSlices(card) {
      if (card._built) return true;
      const img = card.querySelector('.port-img');
      if (!img || !img.complete || !img.naturalWidth) return false;

      const src = (img.currentSrc || img.src).replace(/"/g, '%22');
      const sc  = Math.max(cardW / img.naturalWidth, cardH / img.naturalHeight);
      const bw  = img.naturalWidth * sc;       // same framing as object-fit: cover
      const bh  = img.naturalHeight * sc;
      const ox  = (cardW - bw) / 2;
      const oy  = (cardH - bh) / 2;
      const sw  = cardW / SLICES;

      const layer = document.createElement('div');
      layer.className = 'ring-bend';
      for (let k = 0; k < SLICES; k++) {
        const sl = document.createElement('i');
        sl.className = 'ring-sl';
        // 1px overlap hides the seams; the last strip keeps its true edge
        // so the rounded corner sits exactly on the corner of the card
        sl.style.width = (sw + (k < SLICES - 1 ? 1 : 0)) + 'px';
        sl.style.backgroundImage = 'url("' + src + '")';
        sl.style.backgroundSize = bw.toFixed(2) + 'px ' + bh.toFixed(2) + 'px';
        sl.style.backgroundPosition = (ox - k * sw).toFixed(2) + 'px ' + oy.toFixed(2) + 'px';
        layer.appendChild(sl);
      }
      card.appendChild(layer);
      card.classList.add('has-bend');
      card._built = true;
      return true;
    }

    const idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 60); };

    function queueBuild() {
      let i = 0;
      (function step() {
        idle(function () {
          let budget = 3;
          while (i < n && budget > 0) {
            const card = cards[i];
            if (!buildSlices(card)) {
              const img = card.querySelector('.port-img');
              if (img) img.addEventListener('load', function () { buildSlices(card); }, { once: true });
            }
            i++; budget--;
          }
          if (i < n) step();
        });
      })();
    }

    /* ── state ───────────────────────────────────────────────── */
    let rot = 0, vel = 0, bend = BEND_REST, lastBend = -1, raf = 0, target = 0, front = -1;
    let mode = 'idle';   // idle | drag | wheel | goto

    // Autoplay. It only runs while the ring is on screen, the tab is in
    // front, the pointer is elsewhere, the lightbox is shut and the visitor
    // has not pressed pause - and it eases in and out instead of snapping on.
    let drift = 0, autoOn = true, inView = false, hovering = false;
    let resumeAt = 0, driftTimer = 0;

    const now = () => (window.performance ? performance.now() : Date.now());

    function driftAllowed() {
      return autoOn && inView && !hovering && !document.hidden &&
             !document.body.classList.contains('lb-open') && mode === 'idle';
    }

    // Called whenever the visitor touches the ring: hold off, then come back.
    function hold(ms) {
      const wait = ms === undefined ? RESUME : ms;
      resumeAt = now() + wait;
      clearTimeout(driftTimer);
      driftTimer = setTimeout(start, wait + 40);
    }

    function frontIndex() {
      return ((Math.round(-rot / theta) % n) + n) % n;
    }

    function rotFor(i) {                       // shortest way round to card i
      const cur = -rot / theta;
      let d = ((i - cur) % n + n) % n;
      if (d > n / 2) d -= n;
      return -(cur + d) * theta;
    }

    function updateFront() {
      const i = frontIndex();
      if (i === front) return;
      const was = front;
      if (was >= 0) cards[was].classList.remove('is-front');
      front = i;
      cards[i].classList.add('is-front');
      if (was >= 0 && base[was]) place(was);
      if (base[i]) place(i);
      if (idxEl) idxEl.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
      if (labEl) {
        const cap = cards[i].querySelector('.port-caption');
        labEl.textContent = cap ? cap.textContent.trim() : '';
      }
      cards.forEach((card, k) => {
        let d = ((k - i) % n + n) % n;
        if (d > n / 2) d = n - d;
        card.classList.toggle('is-back', d * theta > 88);
      });
    }

    function start() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function setBend(deg) {
      if (Math.abs(deg - lastBend) < 0.12) return;
      applyBend(deg);
      lastBend = deg;
    }

    function tick() {
      if (mode === 'goto') {
        const d = target - rot;
        vel += d * SPRING;
        vel *= DAMP;
        rot += vel;
        if (Math.abs(d) < REST && Math.abs(vel) < REST) {
          rot = target; vel = 0; mode = 'idle';
        }
      }

      // Idle drift, eased in and out so it never starts or stops abruptly.
      // It is only ever applied while the ring is otherwise idle - during a
      // drag or a spring it must not touch rot or vel, or it would creep and
      // clobber the velocity the fling is measured from.
      const wantDrift = (driftAllowed() && now() >= resumeAt) ? DRIFT : 0;
      if (wantDrift === 0 && drift > 0.004 && mode === 'idle') {
        // Stopping - pause pressed, pointer arrived, lightbox opened, scrolled
        // away. Settle onto the nearest photo rather than halting mid-turn.
        drift = 0;
        goTo(rotFor(frontIndex()));
      } else {
        drift += (wantDrift - drift) * (wantDrift > drift ? 0.05 : 0.14);
        if (drift < 0.0015) drift = 0;
        if (drift && mode === 'idle') { rot -= drift; vel = -drift; }
      }

      // The faces curl quickly past their resting curve and uncurl slowly,
      // which reads as the ring settling rather than snapping shut. Writing
      // the strip variables invalidates every strip, so setBend only does it
      // when the curve has actually moved - most frames of a glide skip it
      // and cost one composited transform on the ring itself.
      const want = BEND_REST +
        Math.min(1, Math.abs(vel) / BEND_VEL) * (BEND_MAX - BEND_REST);
      bend += (want - bend) * (want > bend ? 0.35 : 0.12);
      setBend(bend);

      render();
      updateFront();

      if (mode === 'idle' && drift === 0 && Math.abs(bend - BEND_REST) < 0.08) {
        bend = BEND_REST;
        setBend(bend);
        raf = 0;
        // Stopping with drift still wanted means we are inside the quiet
        // window after a gesture, so wake up again when it expires.
        if (driftAllowed()) hold(Math.max(0, resumeAt - now()));
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function goTo(rotTarget) { hold(); target = rotTarget; mode = 'goto'; start(); }
    function snapTo(i) { goTo(rotFor(i)); }

    /* ── drag ────────────────────────────────────────────────── */
    let pid = null, lastX = 0, lastT = 0, moved = 0, wasDrag = false;

    // No setPointerCapture here: capturing retargets the follow-up click
    // to the grid, which would kill click-to-focus on a card.
    grid.addEventListener('pointerdown', e => {
      if (e.button) return;
      pid = e.pointerId;
      lastX = e.clientX;
      lastT = e.timeStamp;
      moved = 0;
      vel = 0;
      mode = 'drag';
      hold();
      grid.classList.add('is-dragging');
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);
      start();
    });

    function onMove(e) {
      if (pid === null || e.pointerId !== pid) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      const dt = Math.max(8, e.timeStamp - lastT);
      lastT = e.timeStamp;
      const d = dx * degPerPx;
      rot += d;
      vel = vel * 0.6 + (d * 16 / dt) * 0.4;
    }

    function endDrag(e) {
      if (pid === null) return;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      pid = null;
      grid.classList.remove('is-dragging');
      wasDrag = moved > 6;

      // A finger that came to rest before lifting should not throw the ring
      if (e && e.timeStamp - lastT > 90) vel = 0;
      vel = Math.max(-VEL_MAX, Math.min(VEL_MAX, vel));

      // where the momentum is heading, rounded to the nearest card
      const landing = Math.round(-(rot + vel * PROJECT) / theta);
      goTo(-landing * theta);
    }
    // a mouse drag over a photo would otherwise start a native image drag
    grid.addEventListener('dragstart', e => e.preventDefault());

    /* ── click a card to bring it forward ────────────────────── */
    cards.forEach((card, i) => {
      card.addEventListener('click', e => {
        // stop here so the lightbox, which listens on the same figure,
        // does not treat the end of a drag as a click on a photo
        if (wasDrag) { wasDrag = false; e.preventDefault(); e.stopImmediatePropagation(); return; }
        snapTo(i);
      });
    });

    /* ── buttons, keys, horizontal wheel ─────────────────────── */
    if (ui) {
      // [data-dir] only - the pause button shares the .ring-btn styling
      ui.querySelectorAll('.ring-btn[data-dir]').forEach(btn => {
        btn.addEventListener('click', () => {
          const dir = parseInt(btn.getAttribute('data-dir'), 10) || 1;
          snapTo(((frontIndex() + dir) % n + n) % n);
        });
      });
    }

    grid.addEventListener('keydown', e => {
      let i = null;
      if (e.key === 'ArrowRight')     i = (frontIndex() + 1) % n;
      else if (e.key === 'ArrowLeft') i = (frontIndex() - 1 + n) % n;
      else if (e.key === 'Home')      i = 0;
      else if (e.key === 'End')       i = n - 1;
      if (i === null) return;
      e.preventDefault();
      snapTo(i);
    });

    let wheelT;
    grid.addEventListener('wheel', e => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
      if (!dx) return;                       // plain vertical wheel scrolls the page
      e.preventDefault();
      const d = -dx * degPerPx * 0.8;
      rot += d;
      vel = d;
      mode = 'wheel';
      start();
      clearTimeout(wheelT);
      wheelT = setTimeout(() => {
        vel = Math.max(-VEL_MAX, Math.min(VEL_MAX, vel));
        goTo(-Math.round(-(rot + vel * PROJECT) / theta) * theta);
      }, 140);
    }, { passive: false });

    /* ── what starts and stops the drift ────────────────── */
    grid.addEventListener('pointerenter', () => { hovering = true; start(); });
    grid.addEventListener('pointerleave', () => { hovering = false; hold(700); });
    grid.addEventListener('focusin',  () => { hovering = true; start(); });
    grid.addEventListener('focusout', () => { hovering = false; hold(700); });

    document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });

    // only animate while the section is actually on screen
    const seen = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView) start();
    }, { threshold: 0.15 });
    seen.observe(grid);

    const autoBtn = stage.querySelector('.ring-auto');
    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        autoOn = !autoOn;
        autoBtn.setAttribute('data-paused', autoOn ? 'false' : 'true');
        autoBtn.setAttribute('aria-label', autoOn ? 'Pause the carousel' : 'Play the carousel');
        if (autoOn) { resumeAt = 0; start(); }
      });
    }

    // the lightbox drives the ring so the photo it shows stays centred
    grid.addEventListener('lb:focus', e => {
      const i = cards.indexOf(e.target);
      if (i >= 0) snapTo(i);
    });
    grid.addEventListener('lb:closed', () => hold(600));

    /* ── resize: the cards change size, so the arc and strips do ── */
    let rzT;
    window.addEventListener('resize', () => {
      clearTimeout(rzT);
      rzT = setTimeout(() => {
        cards.forEach(card => {
          const layer = card.querySelector('.ring-bend');
          if (layer) layer.remove();
          card.classList.remove('has-bend');
          card._built = false;
        });
        measure();
        lastBend = -1;
        setBend(bend);
        render();
        queueBuild();
      }, 220);
    }, { passive: true });

    /* ── go ──────────────────────────────────────────────────── */
    measure();
    setBend(bend);
    render();
    updateFront();
    queueBuild();
  })();


  /* ── Portfolio lightbox ────────────────────────────
     Click any photo to see it big. Bound to the figures themselves, so it
     works on the 3D ring and on the plain grid fallback alike. */
  (function portfolioLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb) return;

    const figures = Array.prototype.slice.call(
      document.querySelectorAll('#portfolio .port-item'));
    if (!figures.length) return;

    const img      = lb.querySelector('.lb-img');
    const styleEl  = lb.querySelector('.lb-style');
    const countEl  = lb.querySelector('.lb-count');
    const closeBtn = lb.querySelector('.lb-close');
    const grid     = document.querySelector('#portfolio .portfolio-grid');

    let current = -1, lastFocus = null, hideTimer = 0;

    function show(i) {
      current = ((i % figures.length) + figures.length) % figures.length;
      const fig    = figures[current];
      const source = fig.querySelector('.port-img');
      const cap    = fig.querySelector('.port-caption');
      if (!source) return;
      img.src = source.currentSrc || source.src;
      img.alt = source.alt || '';
      styleEl.textContent = cap ? cap.textContent.trim() : '';
      countEl.textContent = (current + 1) + ' / ' + figures.length;
      // keep the ring in step, so closing leaves this photo at the front
      fig.dispatchEvent(new CustomEvent('lb:focus', { bubbles: true }));
    }

    function open(i) {
      lastFocus = document.activeElement;
      clearTimeout(hideTimer);
      show(i);
      lb.hidden = false;
      document.body.classList.add('lb-open');
      // two frames, so the browser has the element laid out before it animates
      requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('is-on')));
      closeBtn.focus();
      document.addEventListener('keydown', onKey, true);
    }

    function close() {
      lb.classList.remove('is-on');
      document.body.classList.remove('lb-open');
      document.removeEventListener('keydown', onKey, true);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        lb.hidden = true;
        img.removeAttribute('src');
      }, 340);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      if (grid) grid.dispatchEvent(new CustomEvent('lb:closed'));
    }

    function onKey(e) {
      if (e.key === 'Escape')          { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
      else if (e.key === 'ArrowLeft')  { e.preventDefault(); show(current - 1); }
      else if (e.key === 'Tab') {
        const stops = lb.querySelectorAll('button');
        const first = stops[0], last = stops[stops.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    figures.forEach((fig, i) => fig.addEventListener('click', () => open(i)));
    closeBtn.addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', () => show(current - 1));
    lb.querySelector('.lb-next').addEventListener('click', () => show(current + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
  })();


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
      artist:             (form.querySelector('#f-artist') || {}).value || '',
      style:              (form.querySelector('#f-style')  || {}).value || '',
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
      `🖊 ${data.artist}\n` +
      `🎨 ${data.style}\n` +
      `💬 ${data.message}\n\n` +
      `📸 Photos consent: ${data.consent_photos}\n` +
      `📣 Marketing consent: ${data.consent_marketing}`;

    let delivered = false;
    try {
      const tgRes = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const tgJson = await tgRes.json().catch(() => ({}));
      console.log('[form] Telegram response', tgJson);
      delivered = tgRes.ok && tgJson.ok !== false;
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

    // Count a lead only when the enquiry actually reached Telegram
    if (delivered && typeof gtag === 'function') {
      gtag('event', 'generate_lead', {
        form_id: 'bookForm',
        form_name: 'booking_inquiry',
        tattoo_style: data.style || 'not_selected',
        currency: 'CZK',
        value: 3000
      });
      // Google Ads conversion for the same delivered enquiry
      gtag('event', 'conversion', {
        send_to: 'AW-18404683250/3JAVCPCt94wdEPLbhMhE',
        value: 1.0,
        currency: 'CZK'
      });
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


  /* ── Map: load Google Maps only after the visitor asks for it ─── */
  const mapButton = document.querySelector('.map-consent');

  if (mapButton) {
    mapButton.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = mapButton.dataset.mapSrc;
      iframe.title = 'STIN Tattoo Studio — Google Maps';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      mapButton.replaceWith(iframe);
    });
  }


  /* ── Init ────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    let saved; try { saved = localStorage.getItem('stin-lang'); } catch(e) {}
    setLang(saved || 'cs');

    const btn = document.querySelector('.submit-btn');
    if (btn) btn.dataset.originalText = btn.textContent.trim();
  });

})();
