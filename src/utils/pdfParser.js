import { PDFDocument } from 'pdf-lib';

export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  const text = await Promise.all(pages.map(p => p.getTextContent()));
  return text.map(tc => tc.items.map(i => i.str).join(' ')).join('\n');
}
