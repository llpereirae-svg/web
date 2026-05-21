/* =================================================================
   PDF BROCHURE GENERATOR — TributaSoft
   Genera un PDF de 1 pagina con el header corporativo
   (foquito + Tributa Soft ... Todo Bajo Control) embebido como PNG
   renderizado en canvas con las fuentes oficiales (Avenida + Lobster).
   Body con Helvetica nativa de jsPDF (texto seleccionable).
   Footer con linea separadora + nombre del documento + paginacion.

   Uso: definir window.BROCHURE_DATA en la pagina HTML antes de cargar
   este script, luego llamar window.generateBrochurePDF().
   ================================================================= */
(function () {
  'use strict';

  // ---------- Cargar jsPDF desde CDN si no esta ----------
  function loadJsPDF() {
    return new Promise((resolve, reject) => {
      if (window.jspdf && window.jspdf.jsPDF) return resolve();
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('No se pudo cargar jsPDF'));
      document.head.appendChild(script);
    });
  }

  // ---------- Esperar a que carguen las fuentes Avenida + Lobster ----------
  async function ensureFontsReady() {
    if (!('fonts' in document)) return;
    try {
      await document.fonts.load('44px Avenida');
      await document.fonts.load('44px Lobster');
      await document.fonts.load('22px Lobster');
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font load issue:', e);
    }
  }

  // ---------- Cargar logo como Image() ----------
  function loadLogo() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = 'assets/img/logo.png';
    });
  }

  // ---------- Renderizar header en canvas 794x80 @ 2x ----------
  async function renderHeaderCanvas() {
    await ensureFontsReady();
    const logo = await loadLogo();

    const W = 794, H = 80, SCALE = 2;
    const canvas = document.createElement('canvas');
    canvas.width = W * SCALE;
    canvas.height = H * SCALE;
    const ctx = canvas.getContext('2d');
    ctx.scale(SCALE, SCALE);

    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Logo a la izq, 56px de alto manteniendo aspect
    const LOGO_H = 56;
    const LOGO_X = 50;
    const LOGO_Y = 6;
    const aspect = logo.width / logo.height;
    const LOGO_W = LOGO_H * aspect;
    ctx.drawImage(logo, LOGO_X, LOGO_Y, LOGO_W, LOGO_H);

    // Texto: Tributa | Soft | ...todo bajo control, alineados al baseline 44
    let x = LOGO_X + LOGO_W + 14;
    const BASELINE = 44;
    ctx.textBaseline = 'alphabetic';

    // "Tributa" en Avenida, 44px, color celeste claro #c9dee9
    ctx.font = '44px Avenida, "DM Sans", sans-serif';
    ctx.fillStyle = '#c9dee9';
    ctx.fillText('Tributa', x, BASELINE);
    x += ctx.measureText('Tributa').width;

    // "Soft" en Lobster, 44px, naranja #EF7306
    ctx.font = '44px Lobster, cursive';
    ctx.fillStyle = '#EF7306';
    ctx.fillText('Soft', x, BASELINE);
    x += ctx.measureText('Soft').width + 18;

    // "...todo bajo control" en Lobster pequeña, gris medio #6b7280
    ctx.font = '22px Lobster, cursive';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('...todo bajo control', x, BASELINE);

    // Linea separadora navy debajo
    ctx.strokeStyle = '#00236f';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(50, 70);
    ctx.lineTo(W - 50, 70);
    ctx.stroke();

    return canvas.toDataURL('image/png');
  }

  // ---------- Footer reusable ----------
  function drawFooter(doc, pageNum, totalPages, nombreDoc) {
    const PAGE_W = 210, PAGE_H = 297, MARGIN_X = 18;
    const RIGHT = PAGE_W - MARGIN_X;
    const footY = PAGE_H - 22;

    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_X, footY, RIGHT, footY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(0, 35, 111);
    doc.text(nombreDoc, MARGIN_X, footY + 5.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`Pagina ${pageNum} de ${totalPages}`, RIGHT, footY + 5.2, { align: 'right' });
  }

  // ---------- Funcion principal ----------
  async function generateBrochurePDF() {
    const data = window.BROCHURE_DATA;
    if (!data) {
      console.error('window.BROCHURE_DATA no definido');
      return;
    }

    try {
      await loadJsPDF();
      const { jsPDF } = window.jspdf;

      // Render header canvas
      const headerPng = await renderHeaderCanvas();

      // Crear PDF A4 portrait
      const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
      });

      // Embed header: ancho completo de la pagina (210mm), alto proporcional
      // canvas 794x80 -> en 210mm: 210 * 80 / 794 = 21.16mm
      doc.addImage(headerPng, 'PNG', 0, 6, 210, 21.16);

      // BODY - empieza a partir de y = 35mm
      const MARGIN_X = 18;
      const CONTENT_W = 210 - MARGIN_X * 2;
      let y = 38;

      // Eyebrow
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(74, 96, 128);
      doc.text((data.eyebrow || '').toUpperCase(), MARGIN_X, y);
      y += 6;

      // Titulo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      const titleLines = doc.splitTextToSize(data.title, CONTENT_W);
      doc.text(titleLines, MARGIN_X, y);
      y += titleLines.length * 8 + 2;

      // Subtitle / lead
      if (data.lead) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(75, 85, 99);
        const leadLines = doc.splitTextToSize(data.lead, CONTENT_W);
        doc.text(leadLines, MARGIN_X, y);
        y += leadLines.length * 5 + 8;
      }

      // Linea separadora
      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.3);
      doc.line(MARGIN_X, y, 210 - MARGIN_X, y);
      y += 7;

      // Steps / items
      if (data.steps && data.steps.length) {
        data.steps.forEach((step) => {
          // Numero
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(16);
          doc.setTextColor(239, 115, 6);
          doc.text(step.num, MARGIN_X, y);

          // Titulo del step
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11.5);
          doc.setTextColor(40, 40, 40);
          doc.text(step.title, MARGIN_X + 14, y - 1);

          // Lead del step
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(75, 85, 99);
          const stepLines = doc.splitTextToSize(step.lead, CONTENT_W - 14);
          doc.text(stepLines, MARGIN_X + 14, y + 4);
          y += Math.max(8, stepLines.length * 4.2 + 6);
        });
      }

      // CTA Box al final (opcional)
      if (data.cta) {
        y += 2;
        doc.setFillColor(253, 118, 26);
        doc.roundedRect(MARGIN_X, y, CONTENT_W, 16, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text(data.cta.title, 105, y + 6, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(data.cta.subtitle, 105, y + 12, { align: 'center' });
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages, data.docName);
      }

      // Guardar
      doc.save(`${data.docName}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('No se pudo generar el PDF. Revisa la consola para mas detalles.');
    }
  }

  // Exponer al window
  window.generateBrochurePDF = generateBrochurePDF;
})();
