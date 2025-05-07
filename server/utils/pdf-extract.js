import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import fs from "fs";

export async function extractTextFromPDF( _filePath ) {
  const pdfData = new Uint8Array(fs.readFileSync( _filePath ));
  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;
  const maxPages = pdf.numPages;
  let pdfText = '';

  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str || '').join(' ');
    pdfText += pageText + '\n';
  }

  return pdfText;
}

