# TributaSoft — Sitio web

Sitio institucional de TributaSoft S.A. (Ecuador), construido con **HTML5 + CSS3 + JS vanilla**.
Sin librerías, sin bundlers, sin build step. Se sirve estáticamente.

**Producción:** https://llpereirae-svg.github.io/web/
**Repo:** https://github.com/llpereirae-svg/web

---

## Cómo correrlo localmente

Pre-requisito: **Python**, **Node** o cualquier servidor HTTP estático.

```powershell
# Clonar (solo la primera vez)
git clone https://github.com/llpereirae-svg/web.git tributasoft-home
cd tributasoft-home

# Levantar servidor — Opción 1: Python
python -m http.server 8080

# Levantar servidor — Opción 2: Node
npx serve . -l 8080

# Levantar servidor — Opción 3: VS Code
# Instalar la extensión "Live Server" → click derecho en index.html → "Open with Live Server"
```

Abrir <http://localhost:8080> en el navegador. Listo.

### Editar y ver cambios

1. Editar cualquier `.html`, `.css` o `.js`.
2. **Ctrl + Shift + R** en el navegador para forzar recarga sin caché.
3. Deploy a producción: `git add -A && git commit -m "..." && git push` → GitHub Pages publica en 1–2 minutos.

---

## Estructura del proyecto

```
tributasoft-home/
├── index.html                    Landing principal
├── servicios.html                Hub de 6 servicios (cards)
│
├── servicio-facturacion.html       1) Facturación electrónica
├── bpo-viaticos.html               2) Gastos de Viaje
├── bpo-ats.html                    3) ATS
├── bpo-facturacion-masiva.html     4) Facturación Electrónica Automática
├── bpo-integraciones-erp.html      5) Integraciones a otros ERP
├── servicio-urbanizaciones.html    6) Urbanizaciones
│
├── nosotros.html
├── contacto.html
├── tutoriales.html
├── politica-de-privacidad.html
├── politica-de-cookies.html
├── terminos-de-servicio.html
│
├── README.md
├── .gitignore
│
└── assets/
    ├── css/
    │   ├── tokens.css            Variables del design system
    │   └── main.css              Layout + componentes
    ├── js/
    │   └── main.js               Mobile drawer, smooth scroll, reveal on scroll
    ├── img/
    │   ├── logo.png
    │   └── logo.svg
    └── fonts/
        ├── PlayfairDisplay-VAR.woff2          Display (con tildes y ñ)
        ├── PlayfairDisplay-Italic-VAR.woff2
        └── (fallbacks: Fraunces, Inter, DM Sans)
```

Existen también algunos archivos `.html` legacy (`bpo-inventarios`, `bpo-rol-pagos`, `servicio-bpo`, `servicio-consultoria`, `servicio-desarrollo`, `brochure-*`) que **ya no están enlazados desde el menú principal**. Se mantienen en el repo por compatibilidad con URLs viejas; pueden eliminarse cuando se quiera.

---

## Los 6 servicios activos

Toda la navegación entra por `servicios.html`, que es el hub. Cada card lleva a su página de detalle:

| # | Servicio | Archivo | Foco |
|---|---|---|---|
| 1 | Facturación electrónica | `servicio-facturacion.html` | Plataforma autorizada SRI, columnas Funciones + Beneficios |
| 2 | Gastos de Viaje | `bpo-viaticos.html` | Cupos por vendedor y categoría, docs físicos + electrónicos |
| 3 | ATS | `bpo-ats.html` | Generación del XML del Anexo Transaccional Simplificado |
| 4 | Facturación Electrónica Automática | `bpo-facturacion-masiva.html` | Facturación masiva por plantilla de clientes |
| 5 | Integraciones a otros ERP | `bpo-integraciones-erp.html` | Control de retenciones recibidas + transmisión al SRI |
| 6 | Urbanizaciones | `servicio-urbanizaciones.html` | Alícuotas, cobros, morosidad |

---

## Datos de contacto (centralizados)

Si cambian, hay que actualizarlos en todos los HTML que los usan (principalmente `contacto.html`, `index.html`, y los enlaces WhatsApp de cada servicio).

| Dato | Valor actual |
|---|---|
| Horario | Lun–Vie · 08:30–17:00 |
| Dirección | Daule, Urb. Villas del Rey, Etapa Princesa Diana, Ecuador |
| Google Maps | https://maps.app.goo.gl/pLGTSvi3JHrjRAYZ9 |
| Teléfono primario | +593 99 634 5284 |
| Teléfono secundario | +593 99 842 9901 |
| Email comercial | tributasoftsa@gmail.com |
| Email soporte técnico | soporte@tributasoft.ec |

### WhatsApp links

Todos los enlaces "Solicitar propuesta" de los 5 servicios BPO/Integraciones siguen el mismo formato URL-encoded:

```
https://wa.me/593996345284?text=<mensaje URL-encoded>
```

El mensaje incluye campos: **Razón social**, **RUC**, datos específicos del servicio, **Fecha y hora preferida para reunión virtual (demo)**, y la nota `[Recuerde que nuestro horario de atención personalizada y humana es de 08:30-17:00]`.

---

## Design System

Tokens en `assets/css/tokens.css`. Se usan en `main.css` vía `var(--ts-*)`.

- **Tipografía display:** Playfair Display (variable font, woff2 auto-host con soporte de tildes y ñ).
  Fallback: Fraunces, Georgia, Times New Roman, serif.
- **Tipografía body:** Inter.
- **Color principal:** navy/azul oscuro. Naranja y teal del logo como acentos.
- **Espaciado:** escala de 8 px (`--ts-space-1` a `--ts-space-12`).
- **Radius / sombras:** definidos como tokens `--ts-radius-*` y `--ts-shadow-*`.

Para cambiar la identidad visual, editar solamente `tokens.css`.

---

## Comportamientos JS (assets/js/main.js)

- **Header sticky** que cambia opacidad al hacer scroll.
- **Mobile drawer** lateral en pantallas pequeñas (toggle por botón hamburguesa, cierre con backdrop o Escape).
- **Smooth scroll** para anchors internos respetando `prefers-reduced-motion`.
- **Reveal on scroll** vía `IntersectionObserver` para animaciones sutiles.
- **Auto-año en footer** (`#footer-year`).

---

## Cache busting

Cada release sube la versión en la query string de los assets:

```html
<link rel="stylesheet" href="assets/css/tokens.css?v=20260520n" />
<link rel="stylesheet" href="assets/css/main.css?v=20260520n" />
<script src="assets/js/main.js?v=20260520n" defer></script>
```

**Versión actual:** `v=20260520n`. Cuando edites CSS/JS, sube la letra final (`n` → `o` → `p`...) en **todos** los HTML para invalidar el caché del navegador del visitante.

Bump rápido en PowerShell:

```powershell
Get-ChildItem *.html | ForEach-Object {
  (Get-Content $_.FullName) -replace 'v=20260520n','v=20260520o' | Set-Content $_.FullName
}
```

O en bash/git-bash:

```bash
sed -i 's|v=20260520n|v=20260520o|g' *.html
```

---

## Convenciones de escritura

- **Español neutro ecuatoriano.** Evitar regionalismos argentinos, colombianos, mexicanos o peruanos.
- **Tercera persona del singular** al describir los servicios — TributaSoft desarrolla el módulo, no presta el servicio. Ejemplo correcto: *"El módulo detecta inconsistencias"*. Ejemplo incorrecto: *"Detectamos inconsistencias"*.
- **Segunda persona ("tú")** sí está permitida cuando el sitio se dirige al lector ("Tu primera factura, en minutos").
- **Tildes y ñ** siempre escritas correctamente (la fuente las renderiza bien).

---

## Hosting y deploy

- **Hosting:** GitHub Pages, sirviendo desde la rama `main`, carpeta raíz.
- **Deploy:** automático al hacer `git push` a `main`. Tarda 1–2 min.
- **URL:** https://llpereirae-svg.github.io/web/

Si alguna vez el sitio cae con 404 en todas las páginas: revisar
`https://github.com/llpereirae-svg/web/settings/pages` y verificar que
Pages siga apuntando a `main` / `/ (root)`.

---

## URLs externas referenciadas

| Botón / sección | Destino |
|---|---|
| "Empezar aquí" | https://llpereirae-svg.github.io/Ts/ (signup) |
| "Iniciar sesión" | https://tbc.tributasoft.ec/Erp-web/... (ERP en producción) |
| FAB WhatsApp | wa.me/593996345284 (soporte general) |

---

## Stack y decisiones

- **0 dependencias externas en runtime** — JS, CSS y fuentes 100 % auto-host.
- **No frameworks** — sin React, Vue, Tailwind. CSS custom properties + clases utilitarias controladas.
- **No bundlers** — los archivos se sirven tal cual.
- **No Google Fonts CDN** — fuentes auto-host (privacidad GDPR, sin DNS extra, mejor performance).
- **No tracking** — sin Google Analytics, sin Meta Pixel. Si se agrega, declarar en la política de privacidad.
