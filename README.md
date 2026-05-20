# TributaSoft — Homepage (rediseño 2026)

Homepage estática para `tributasoft.com.ec`, construida con **HTML5 + CSS3 + JS vanilla**.
Sin librerías, sin bundlers, sin frameworks. Funciona abriendo `index.html` desde un
servidor estático.

> Diseño basado en `tributasoft_core/DESIGN.md` (paleta navy + naranja del logo).
> Estructura inspirada en el mockup oficial `_stitch_ref/landing_page_updated_branding`.

---

## Cómo correrlo localmente

```powershell
cd tributasoft-home

# Opción 1 — Python
python -m http.server 8080

# Opción 2 — Node
npx serve . -l 8080
```

Abre <http://localhost:8080>. No requiere build.

---

## Estructura

```
tributasoft-home/
├── index.html                  Estructura semántica (~12 KB)
├── README.md
└── assets/
    ├── css/
    │   ├── tokens.css          Variables del design system (colores, tipo, espacios)
    │   └── main.css            Layout responsive + componentes
    ├── js/
    │   └── main.js             Mobile menu, smooth scroll, reveal on scroll, validación RUC
    ├── img/
    │   ├── logo.svg            Logo isotipo (foco, 1.2 KB)
    │   └── logo.png            Logo fallback (281 KB)
    └── fonts/                  Auto-host (no Google Fonts CDN)
        ├── DMSans-Regular.woff2
        ├── DMSans-SemiBold.woff2
        ├── DMSans-Bold.woff2
        ├── Inter-Regular.woff2
        ├── Inter-Medium.woff2
        ├── Inter-SemiBold.woff2
        └── Inter-Bold.woff2
```

**Tamaño total del sitio:** ~180 KB (todo incluido — HTML + CSS + JS + fuentes + logos).

---

## Design System aplicado

Tokens en `assets/css/tokens.css`:

| Token | Valor | Uso |
|---|---|---|
| `--ts-navy` | `#1e3a8a` | Headlines, links, navegación |
| `--ts-orange` | `#fd761a` | CTA primario (color del logo) |
| `--ts-teal` | `#3cddc7` | Accents, iconos (color del logo) |
| `--ts-bg` | `#f9f9f9` | Fondo global off-white |
| `--ts-surface` | `#ffffff` | Cards, formularios |

- **Tipografía:** DM Sans (display) + Inter (body), auto-host
- **Espaciado:** escala 8px (4, 8, 12, 16, 24, 32, 48, 64, 80, 96)
- **Radius:** 12px botones/inputs · 16px inputs grandes · 24px cards
- **Sombras:** tinted con navy `rgba(30, 58, 138, 0.08)`

---

## Secciones de la homepage

1. **Header sticky** — logo · nav · Login · CTA "Empezar gratis"
2. **Hero** — pill "Nuevo cliente · 300 gratis" + headline "Empieza a facturar electrónicamente en *2 minutos*" + trust badges + **formulario de captura de RUC** (lado derecho)
3. **3 pasos** — "Facturar nunca fue tan fácil"
4. **Vertical: Urbanizaciones** — alícuotas, cobros, reportes
5. **Vertical: BPO Contable** — nómina, ATS, viáticos, pagos automáticos
6. **Testimonio** — Andrea Salazar (placeholder, reemplazable)
7. **CTA final** — "Empezar gratis" + "Hablar por WhatsApp"
8. **Footer** — 4 columnas (Producto · Contacto · Legal · Redes)
9. **FAB WhatsApp** — botón flotante esquina inferior derecha

---

## ⚠️ Placeholders a reemplazar antes de publicar

Busca y reemplaza estos tokens en `index.html`:

| Placeholder | Reemplazar con |
|---|---|
| `{PENDIENTE-TELEFONO}` | Teléfono comercial (formato `+593 X XXX XXXX`) |
| `{PENDIENTE-WHATSAPP}` | Número WhatsApp **sin `+` ni espacios** (ej: `593999999999`) |
| `{PENDIENTE-EMAIL}` | Email general (ej: `info@tributasoft.com.ec`) |
| `{PENDIENTE-EMAIL-SOPORTE}` | Email de soporte (ej: `soporte@tributasoft.com.ec`) |
| `{PENDIENTE-DIRECCION}` | Dirección física (ej: `Av. 6 de Diciembre N32-50, Quito`) |

Búsqueda rápida en PowerShell:

```powershell
Select-String -Path index.html -Pattern '\{PENDIENTE-'
```

---

## Comportamientos JS

`assets/js/main.js` implementa:

- **Header sticky inteligente** — agrega borde y fondo opaco al hacer scroll
- **Mobile drawer** — menú lateral en pantallas `< 900px`, con focus trap básico, cierra con Escape o click en backdrop
- **Smooth scroll** — anchors internos con offset del header sticky, respeta `prefers-reduced-motion`
- **Reveal on scroll** — animación sutil al entrar viewport vía `IntersectionObserver`
- **Validación RUC ligera** — 13 dígitos, código de provincia (01-24, 30), establecimiento ≥ 001. La validación profunda (dígito verificador módulo 10/11) corre en el portal de registro existente
- **Auto-año en footer** — JS pone el año actual

---

## Responsive — Breakpoints

- **Móvil:** `< 640px` — stack vertical, drawer lateral, padding 16px
- **Tablet:** `640–1024px` — grid 2 col en algunas secciones, padding 24px
- **Desktop:** `≥ 1024px` — grid completo, padding 40px, container 1280px máx

Toda la tipografía y espacios escalan con custom properties.

---

## Accesibilidad

- HTML semántico (`<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<aside>`, `<footer>`)
- ARIA labels en navegación, drawer, formulario, redes sociales
- `prefers-reduced-motion` desactiva animaciones
- Contraste AA verificado en navy/blanco, naranja/blanco
- Focus visible con `:focus-visible`
- `aria-invalid` + `role="alert"` en validación de formulario
- Skip link implícito por `<a href="#top">` del logo

---

## Performance

- **0 librerías externas** — JS, CSS y fuentes 100% locales
- **Preload** de fuentes críticas above-the-fold (DM Sans Bold, Inter Regular)
- **`font-display: swap`** — FOUT sobre FOIT
- **SVG inline** para iconos pequeños (sin sprites HTTP)
- **`loading=lazy`** disponible si agregas más imágenes
- **CSS sin selectors caros** — solo clases, sin `*` ni descendientes profundos

---

## Integración con el flujo de registro existente

El formulario del hero (campo RUC) **redirige al portal** existente al validar:

```
https://tbc.tributasoft.ec/Erp-web/?ruc={RUC}
```

Si quieres que continúe en el prototipo local (`/Session/tributasoft/`), cambia la
URL en `assets/js/main.js` (busca `target = new URL(...)`).

---

## Próximos pasos sugeridos

- [ ] Reemplazar los 5 placeholders de contacto (búsqueda `{PENDIENTE-`)
- [ ] Si tienes logos de clientes (Heineken, Colgate, etc.), agregar sección "Confían en nosotros" antes del testimonio
- [ ] Generar `og-image.png` real (1200×630) y reemplazar `og:image` del `<head>`
- [ ] Configurar `robots.txt` y `sitemap.xml` cuando se publique
- [ ] (Opcional) Optimizar `logo.png` con `squoosh` — de 281 KB a ~30 KB en WebP

---

## Stack y decisiones de diseño

- **No frameworks:** sin React, sin Vue, sin Tailwind. CSS custom properties + clases utilitarias controladas
- **No bundlers:** archivos servibles tal cual, ideal para hosting estático (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3)
- **No Google Fonts CDN:** fuentes auto-host (privacidad GDPR, sin DNS extra, mejor performance)
- **No tracking:** sin Google Analytics, sin Meta Pixel. Si se agrega, declarar en política de privacidad

---

Generado el 2026-05-20.
