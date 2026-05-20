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

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  const reveals = $$('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', 'true');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    // Fallback: si no hay IntersectionObserver, mostrar todo al toque
    reveals.forEach((el) => el.setAttribute('data-visible', 'true'));
  }

})();
