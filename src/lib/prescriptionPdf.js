import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const NAVY = rgb(0.012, 0.102, 0.278);
const TEAL = rgb(0.008, 0.427, 0.427);
const INK = rgb(0.086, 0.196, 0.247);
const MUTED = rgb(0.369, 0.431, 0.463);
const LINE = rgb(0.882, 0.906, 0.918);
const SOFT = rgb(0.957, 0.969, 0.973);
const WHITE = rgb(1, 1, 1);

// the built-in PDF fonts only cover Latin characters, so anything else prints as "?"
const clean = (s) => String(s ?? '').replace(/[^\n\x20-\x7E\xA0-\xFF]/g, '?');
const oneLine = (s) => clean(s).replace(/\s+/g, ' ').trim();

function breakWord(word, font, size, maxWidth) {
  const parts = [];
  let current = '';
  for (const ch of word) {
    if (current && font.widthOfTextAtSize(current + ch, size) > maxWidth) {
      parts.push(current);
      current = ch;
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function wrap(text, font, size, maxWidth) {
  const out = [];
  String(text).split(/\r?\n/).forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) { out.push(''); return; }

    let line = '';
    words.forEach((word) => {
      const pieces = font.widthOfTextAtSize(word, size) > maxWidth ? breakWord(word, font, size, maxWidth) : [word];
      pieces.forEach((piece) => {
        const test = line ? `${line} ${piece}` : piece;
        if (font.widthOfTextAtSize(test, size) <= maxWidth) {
          line = test;
        } else {
          if (line) out.push(line);
          line = piece;
        }
      });
    });
    out.push(line);
  });
  return out;
}

export async function buildPrescriptionPdf(rx) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Prescription - ${oneLine(rx.patient_name)}`);
  pdf.setAuthor('Sam Healthcare Hospital');

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const W = 595.28;
  const H = 841.89;
  const M = 48;
  const CONTENT_W = W - M * 2;

  let page = pdf.addPage([W, H]);
  let y = H - M;

  const draw = (text, x, yy, size, font, color) =>
    page.drawText(oneLine(text), { x, y: yy, size, font, color });

  const newPage = () => { page = pdf.addPage([W, H]); y = H - M; };
  const ensure = (needed) => { if (y - needed < M + 28) newPage(); };

  /* header band */
  page.drawRectangle({ x: 0, y: H - 92, width: W, height: 92, color: NAVY });
  draw('Sam Healthcare Hospital', M, H - 44, 20, bold, WHITE);
  draw('Prescription', M, H - 66, 11, regular, rgb(0.78, 0.9, 0.9));

  const issued = new Date(rx.created_at).toLocaleDateString('en-GB', {
    timeZone: 'Asia/Karachi', day: 'numeric', month: 'long', year: 'numeric',
  });
  const issuedText = `Issued ${issued}`;
  const rxNo = `RX-${String(rx.id).slice(0, 8).toUpperCase()}`;
  draw(issuedText, W - M - regular.widthOfTextAtSize(issuedText, 10), H - 44, 10, regular, WHITE);
  draw(rxNo, W - M - bold.widthOfTextAtSize(rxNo, 10), H - 62, 10, bold, WHITE);

  y = H - 92 - 32;

  /* patient and doctor details */
  const field = (label, value, x, width, topY) => {
    draw(label.toUpperCase(), x, topY, 8, bold, MUTED);
    const lines = wrap(oneLine(value) || '-', bold, 11, width);
    lines.forEach((ln, i) => draw(ln, x, topY - 15 - i * 14, 11, bold, INK));
    return 15 + lines.length * 14;
  };

  const half = CONTENT_W / 2;
  let h1 = field('Patient', rx.patient_name, M, half - 12, y);
  let h2 = field('Phone', rx.patient_phone || '-', M + half, half - 12, y);
  y -= Math.max(h1, h2) + 14;

  h1 = field('Prescribed by', rx.doctor_name || '-', M, half - 12, y);
  h2 = field('Diagnosis', rx.diagnosis || '-', M + half, half - 12, y);
  y -= Math.max(h1, h2) + 12;

  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: LINE });
  y -= 26;

  /* medicines table */
  draw('Medicines', M, y, 13, bold, TEAL);
  y -= 20;

  const cols = [
    { key: 'name', label: 'Medicine', w: 195, font: bold },
    { key: 'dosage', label: 'Dosage', w: 80, font: regular },
    { key: 'frequency', label: 'Frequency', w: 125, font: regular },
    { key: 'duration', label: 'Duration', w: CONTENT_W - 400, font: regular },
  ];

  const drawHeader = () => {
    page.drawRectangle({ x: M, y: y - 20, width: CONTENT_W, height: 24, color: SOFT });
    let x = M + 8;
    cols.forEach((c) => { draw(c.label, x, y - 12, 9, bold, MUTED); x += c.w; });
    y -= 28;
  };

  drawHeader();

  const meds = Array.isArray(rx.medicines) ? rx.medicines : [];
  if (meds.length === 0) {
    draw('No medicines listed.', M + 8, y - 8, 10, regular, MUTED);
    y -= 24;
  }

  meds.forEach((m, i) => {
    const cells = cols.map((c) => {
      const raw = c.key === 'name' ? `${i + 1}. ${m.name || ''}` : (m[c.key] || '-');
      return wrap(oneLine(raw) || '-', c.font, 10, c.w - 14);
    });
    const lines = Math.max(...cells.map((cell) => cell.length));
    const rowH = lines * 13 + 14;

    if (y - rowH < M + 28) { newPage(); drawHeader(); }

    let x = M + 8;
    cells.forEach((cell, ci) => {
      cell.forEach((ln, li) => draw(ln, x, y - 12 - li * 13, 10, cols[ci].font, INK));
      x += cols[ci].w;
    });
    y -= rowH;
    page.drawLine({ start: { x: M, y: y + 2 }, end: { x: W - M, y: y + 2 }, thickness: 0.6, color: LINE });
  });

  /* instructions */
  if (rx.instructions) {
    y -= 18;
    ensure(60);
    draw('Instructions', M, y, 13, bold, TEAL);
    y -= 20;
    wrap(clean(rx.instructions), regular, 10.5, CONTENT_W).forEach((ln) => {
      ensure(16);
      draw(ln, M, y, 10.5, regular, INK);
      y -= 15;
    });
  }

  /* footer on every page */
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: M + 12 }, end: { x: W - M, y: M + 12 }, thickness: 0.6, color: LINE });
    p.drawText('Computer-generated prescription. Take medicines only as your doctor advised.', {
      x: M, y: M - 2, size: 8, font: regular, color: MUTED,
    });
    const label = `Page ${i + 1} of ${pages.length}`;
    p.drawText(label, { x: W - M - regular.widthOfTextAtSize(label, 8), y: M - 2, size: 8, font: regular, color: MUTED });
  });

  return pdf.save();
}