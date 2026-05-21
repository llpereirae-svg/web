/* ============================================================
   TributaSoft — main.js (v2 Editorial)
   Vanilla JS, sin dependencias externas.
   ============================================================ */
(() => {
  'use strict';

  /* ---------- Util ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Footer year auto ---------- */
  const yearEl = $('#footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header sticky: agrega borde al hacer scroll ---------- */
  const header = $('#site-header');
  if (header) {
    const onScroll = () => {
      header.setAttribute('data-scrolled', window.scrollY > 8 ? 'true' : 'false');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Smooth scroll para anchors internos ----------
     Compensa altura del header sticky para que la seccion no quede oculta. */
  const HEADER_OFFSET = 72;
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
      closeDrawer();
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- Mobile drawer ---------- */
  const drawer       = $('#mobile-drawer');
  const drawerToggle = $('#menu-toggle');
  const drawerClose  = $('#drawer-close');

  function openDrawer() {
    if (!drawer) return;
    drawer.setAttribute('data-open', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    drawerToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const firstLink = drawer.querySelector('a, button');
    setTimeout(() => firstLink?.focus(), 50);
  }

  function closeDrawer() {
    if (!drawer || drawer.getAttribute('data-open') !== 'true') return;
    drawer.setAttribute('data-open', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    drawerToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    drawerToggle?.focus();
  }

  drawerToggle?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawer?.addEventListener('click', (e) => { if (e.target === drawer) closeDrawer(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  /* ---------- Flow modals (generico, data-open-modal / data-close-modal) ---------- */
  let lastFocused = null;

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.setAttribute('data-open', 'true');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('flow-modal-open');
    // Reset animaciones reactivando data-open (forzar reflow)
    const panel = modal.querySelector('.flow-modal__panel');
    if (panel) {
      panel.style.animation = 'none';
      // eslint-disable-next-line no-unused-expressions
      panel.offsetHeight;
      panel.style.animation = '';
    }
    // Focus al primer elemento interactivo
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    setTimeout(() => focusable?.focus(), 80);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute('data-open', 'false');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('flow-modal-open');
    lastFocused?.focus?.();
  }

  $$('[data-open-modal]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(trigger.getAttribute('data-open-modal'));
    });
  });

  $$('.flow-modal').forEach((modal) => {
    modal.querySelectorAll('[data-close-modal]').forEach((closer) => {
      closer.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(modal);
      });
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openOne = document.querySelector('.flow-modal[data-open="true"]');
    if (openOne) closeModal(openOne);
  });

  /* ---------- Reveal on scroll (IntersectionObserver) ----------
     Soporta:
     - .reveal              -> fade-up
     - .reveal.reveal--left -> slide-from-left
     - .reveal.reveal--right -> slide-from-right
     - .reveal.reveal--down -> slide-from-top
     - .reveal.reveal--scale -> zoom-in
     - .feature-list[data-reveal] -> stagger automatico de cada <li>
     - data-stagger="0..8"  -> retraso escalonado */
  const revealEls = $$('.reveal, [data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', 'true');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.setAttribute('data-visible', 'true'));
  }

  /* ---------- Header parallax ligero al hacer scroll ----------
     El brand del header sube/baja muy sutilmente segun el scroll (efecto premium). */
  const brandIcon = $('.site-header .brand__icon');
  if (brandIcon && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let lastScroll = 0;
    let ticking = false;
    const handleScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScroll;
      if (Math.abs(delta) > 2 && !ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          // Sutil rotacion segun direccion del scroll
          const rotate = Math.max(-8, Math.min(8, delta * 0.15));
          brandIcon.style.transform = `rotate(${rotate}deg)`;
          // Volver a 0 despues
          clearTimeout(brandIcon._rt);
          brandIcon._rt = setTimeout(() => { brandIcon.style.transform = 'rotate(0deg)'; }, 200);
          lastScroll = y;
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

})();
