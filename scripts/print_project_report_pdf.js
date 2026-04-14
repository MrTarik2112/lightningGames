const path = require('path');
const fs = require('fs');
const { app, BrowserWindow } = require('electron');

const [, , htmlPathArg, pdfPathArg] = process.argv;
if (!htmlPathArg || !pdfPathArg) {
  console.error('Usage: electron print_project_report_pdf.js <htmlPath> <pdfPath>');
  process.exit(1);
}

const htmlPath = path.resolve(htmlPathArg);
const pdfPath = path.resolve(pdfPathArg);

async function run() {
  const win = new BrowserWindow({
    width: 1400,
    height: 1900,
    show: false,
    backgroundColor: '#07111f',
    webPreferences: { sandbox: true }
  });

  await win.loadFile(htmlPath);
  await win.webContents.executeJavaScript(`
    new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 200)));
  `);

  const pdf = await win.webContents.printToPDF({
    printBackground: true,
    pageSize: 'A4',
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    landscape: false,
    preferCSSPageSize: true
  });

  fs.writeFileSync(pdfPath, pdf);
  await win.close();
  app.quit();
}

app.whenReady().then(run).catch((error) => {
  console.error(error);
  process.exitCode = 1;
  app.quit();
});
