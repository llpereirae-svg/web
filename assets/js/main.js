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

  /* ---------- Auto-aplicar .reveal a elementos clave (no marcados explicitamente) ---------- */
  const autoTargets = $$(
    'main section h1:not(.reveal), main section h2:not(.reveal), ' +
    'main section h3:not(.reveal), main section p.brochure-hero__lead:not(.reveal), ' +
    'main section .editorial-block__lead:not(.reveal), main section .qmv-card:not(.reveal), ' +
    'main section .reason:not(.reveal), main section .chapter:not(.reveal), ' +
    'main section .service-card:not(.reveal), main section .nav-card:not(.reveal), ' +
    'main section .brochure-step:not(.reveal), main section .brochure-benefit:not(.reveal), ' +
    'main section .social-link:not(.reveal), main section .maps-block:not(.reveal), ' +
    'main section .tutorials-block:not(.reveal), main section .pioneer-badge:not(.reveal), ' +
    'main section .cta-editorial__title:not(.reveal), main section .cta-editorial__lead:not(.reveal), ' +
    'main section .cta-editorial__actions:not(.reveal)'
  );
  autoTargets.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger automatico para hijos hermanos (cards en grid)
    const siblings = el.parentElement ? Array.from(el.parentElement.children).filter(c => c === el || c.classList.contains(el.classList[0])) : [];
    const idx = siblings.indexOf(el);
    if (idx >= 0 && idx < 6 && !el.hasAttribute('data-stagger')) {
      el.setAttribute('data-stagger', String(idx));
    }
  });

  /* ---------- Reveal on scroll (IntersectionObserver, re-trigger en ambas direcciones) ---------- */
  const revealEls = $$('.reveal, [data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    // Track de direccion del scroll para variar efecto
    let lastY = window.scrollY;
    let scrollDir = 'down';
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      scrollDir = y > lastY ? 'down' : 'up';
      lastY = y;
    }, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', 'true');
            entry.target.setAttribute('data-scroll-dir', scrollDir);
          } else {
            // Reset siempre que salga del viewport -> reanimacion al volver
            entry.target.setAttribute('data-visible', 'false');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -12% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.setAttribute('data-visible', 'true'));
  }

  /* ---------- Header parallax: brand icon rota segun scroll ---------- */
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
          const rotate = Math.max(-10, Math.min(10, delta * 0.2));
          brandIcon.style.transform = `rotate(${rotate}deg) scale(${1 + Math.min(0.05, Math.abs(delta) * 0.002)})`;
          clearTimeout(brandIcon._rt);
          brandIcon._rt = setTimeout(() => { brandIcon.style.transform = 'rotate(0deg) scale(1)'; }, 220);
          lastScroll = y;
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /* ---------- Parallax suave en hero sections (cover-hero, brochure-hero) ---------- */
  const heroSections = $$('.cover-hero, .brochure-hero');
  if (heroSections.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking2 = false;
    const onScrollHero = () => {
      if (ticking2) return;
      ticking2 = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        heroSections.forEach((hero) => {
          const rect = hero.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;
          const title = hero.querySelector('h1');
          const lead = hero.querySelector('p');
          if (title) title.style.transform = `translateY(${y * 0.12}px)`;
          if (lead) lead.style.transform = `translateY(${y * 0.06}px)`;
        });
        ticking2 = false;
      });
    };
    window.addEventListener('scroll', onScrollHero, { passive: true });
  }

})();
