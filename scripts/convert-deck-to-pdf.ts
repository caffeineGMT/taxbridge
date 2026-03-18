import puppeteer from 'puppeteer';
import * as path from 'path';

async function convertToPDF() {
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await browser.newPage();

  const htmlPath = path.join(process.cwd(), 'public', 'TaxBridge_Enterprise_Deck.html');
  const pdfPath = path.join(process.cwd(), 'public', 'TaxBridge_Enterprise_Deck.pdf');

  console.log('📄 Loading HTML file...');
  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0',
  });

  console.log('🖨️  Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    landscape: true,
    printBackground: true,
    preferCSSPageSize: true,
  });

  await browser.close();

  console.log('✅ PDF generated successfully at:', pdfPath);
}

convertToPDF().catch(console.error);
