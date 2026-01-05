export function generatePDF() {
  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');

  if (!printWindow) {
    alert('Bitte erlauben Sie Pop-ups für diese Seite, um den Lebenslauf herunterzuladen.');
    return;
  }

  // Get CV HTML content from hidden div
  const cvElement = document.getElementById('cv-print-content');

  if (!cvElement) {
    alert('CV-Inhalt nicht gefunden.');
    return;
  }

  // Clone the element to avoid modifying the original
  const cvClone = cvElement.cloneNode(true) as HTMLElement;

  // Create the HTML document for printing
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lebenslauf</title>
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 20mm;
            background-color: #ffffff;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1a1a1a;
          }
          @media print {
            body {
              margin: 0;
              padding: 20mm;
            }
            @page {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        ${cvClone.innerHTML}
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then trigger print dialog
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
}


