/* ============================================================
   TributaSoft — main.js
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

  /* ---------- Header sticky: agrega borde y fondo al hacer scroll ---------- */
  const header = $('#site-header');
  if (header) {
    const onScroll = () => {
      const scrolled = window.scrollY > 8;
      header.setAttribute('data-scrolled', scrolled ? 'true' : 'false');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Smooth scroll para anchors internos ---------- */
  // El CSS ya tiene scroll-behavior: smooth, pero respetamos prefers-reduced-motion
  // y ajustamos para que el header sticky no tape la sección destino.
  const HEADER_OFFSET = 80;
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
      // Cierra drawer si esta abierto
      closeDrawer();
      // Foco accesible
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
    // Foco al primer link del panel
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
  drawer?.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer(); // click en backdrop
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  const reveals = $$('.reveal');
  if (reveals.length) {
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
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Form RUC: validacion ligera ---------- */
  const rucForm  = $('#ruc-form-el');
  const rucInput = $('#ruc-input');
  const rucHelp  = $('#ruc-help');

  /**
   * Validacion basica de RUC ecuatoriano:
   *  - 13 digitos numericos
   *  - Establecimiento (digitos 11-13) valido: 001, 002, ... (numero > 0)
   *  - Provincia (digitos 1-2): 01 a 24, o 30 (no residentes)
   * La validacion del digito verificador (modulo 10/11) se hace en el portal
   * de registro existente, no aqui (evita duplicar logica).
   */
  function validateRuc(value) {
    if (!/^\d{13}$/.test(value)) {
      return { ok: false, msg: 'Debe tener 13 dígitos numéricos.' };
    }
    const provincia = parseInt(value.substring(0, 2), 10);
    if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) {
      return { ok: false, msg: 'El código de provincia no es válido (01-24, o 30 para no residentes).' };
    }
    const establecimiento = parseInt(value.substring(10, 13), 10);
    if (establecimiento < 1) {
      return { ok: false, msg: 'El RUC debe terminar en 001 o superior.' };
    }
    return { ok: true };
  }

  function setRucError(msg) {
    if (!rucInput || !rucHelp) return;
    rucInput.setAttribute('aria-invalid', 'true');
    rucHelp.setAttribute('role', 'alert');
    rucHelp.textContent = msg;
  }

  function clearRucError() {
    if (!rucInput || !rucHelp) return;
    rucInput.removeAttribute('aria-invalid');
    rucHelp.removeAttribute('role');
    rucHelp.textContent = 'Debe tener 13 dígitos y terminar en 001, 002, etc.';
  }

  rucInput?.addEventListener('input', (e) => {
    // Solo digitos
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 13);
    if (cleaned !== e.target.value) e.target.value = cleaned;
    clearRucError();
  });

  rucForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = rucInput?.value?.trim() || '';
    const result = validateRuc(value);
    if (!result.ok) {
      setRucError(result.msg);
      rucInput?.focus();
      return;
    }
    // OK -> redirigir al portal de registro existente, pasando el RUC como query
    // (el flujo de registro completo lo continua /tributasoft local o el ERP).
    const target = new URL('https://tbc.tributasoft.ec/Erp-web/');
    target.searchParams.set('ruc', value);
    // Telemetria minima (opcional, sin librerias)
    if (window.dataLayer) window.dataLayer.push({ event: 'ruc_submit', ruc_prefix: value.slice(0, 4) });
    window.location.assign(target.toString());
  });

})();
