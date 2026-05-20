"""Genera PDFs de los brochures con encabezado personalizado en cada pagina.

Uso:
  pip install playwright
  python -m playwright install chromium
  python tools/gen-pdf.py

Resultado:
  pdf/brochure-facturacion.pdf
  pdf/brochure-urbanizaciones.pdf
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).parent.parent
TOOLS = Path(__file__).parent
OUT = ROOT / "pdf"
OUT.mkdir(exist_ok=True)

# Logo thumb (60x60) ya pre-generado en tools/
with open(TOOLS / "logo-thumb.b64") as f:
    LOGO_B64 = f.read().strip()

HEADER_TEMPLATE = f"""
<div style="width: 100%; padding: 4mm 16mm 2mm 16mm; box-sizing: border-box;
            font-family: Georgia, 'Times New Roman', serif;
            border-bottom: 1px solid #ddd;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;">
  <div style="display: flex; align-items: center; gap: 6pt;">
    <img src="data:image/png;base64,{LOGO_B64}" style="width: 18pt; height: 18pt;" />
    <span style="font-size: 14pt; color: #2b3f5e; letter-spacing: 0.02em;">Tributa</span><span style="font-size: 17pt; color: #b8530a; font-style: italic; margin-left: 1pt; font-family: 'Brush Script MT', cursive;">Soft</span><span style="font-size: 11pt; color: #6a8aab; font-style: italic; margin-left: 8pt; font-family: 'Brush Script MT', cursive;">... Todo Bajo Control</span>
  </div>
</div>
"""

FOOTER_TEMPLATE = """
<div style="width: 100%; padding: 0 16mm; font-size: 8pt; color: #888;
            font-family: Georgia, serif; text-align: right;
            -webkit-print-color-adjust: exact;">
  Pagina <span class="pageNumber"></span> de <span class="totalPages"></span>
</div>
"""

BROCHURES = [
    "brochure-facturacion.html",
    "brochure-urbanizaciones.html",
]


def gen_pdf(html_path: Path, pdf_path: Path):
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page()
        page.goto(html_path.as_uri(), wait_until="networkidle")
        page.pdf(
            path=str(pdf_path),
            format="A4",
            print_background=True,
            display_header_footer=True,
            header_template=HEADER_TEMPLATE,
            footer_template=FOOTER_TEMPLATE,
            margin={
                "top": "26mm",
                "bottom": "16mm",
                "left": "0mm",
                "right": "0mm",
            },
        )
        browser.close()
        print(f"OK -> {pdf_path} ({pdf_path.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    for name in BROCHURES:
        gen_pdf(ROOT / name, OUT / name.replace(".html", ".pdf"))
