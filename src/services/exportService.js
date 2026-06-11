// Multi-Format Export Service (PDF, Markdown, JSON Backup)

class ExportService {
  // 1. Export as JSON Backup
  exportAsJSON(book) {
    if (!book) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(book, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // 2. Export as Markdown (.md)
  exportAsMarkdown(book) {
    if (!book) return;
    let md = `# ${book.title}\n\n`;
    if (book.subtitle) md += `*${book.subtitle}*\n\n`;
    if (book.dedication) md += `> ${book.dedication}\n\n`;
    md += `---\n\n`;

    book.spreads.forEach((spread, index) => {
      md += `## Spread ${index + 1}\n\n`;
      
      // Left Page
      if (spread.leftPage) {
        md += `### Page ${spread.leftPage.pageNumber}: ${spread.leftPage.title || 'Untitled'}\n`;
        md += `*Date: ${spread.leftPage.date}*\n\n`;
        md += `${spread.leftPage.content || ''}\n\n`;
        if (spread.leftPage.notes && spread.leftPage.notes.length > 0) {
          md += `#### Editor Notes:\n`;
          spread.leftPage.notes.forEach(n => {
            md += `- **${n.authorName}**: ${n.text}\n`;
          });
          md += `\n`;
        }
      }

      // Right Page
      if (spread.rightPage) {
        md += `### Page ${spread.rightPage.pageNumber}: ${spread.rightPage.title || 'Untitled'}\n`;
        md += `*Date: ${spread.rightPage.date}*\n\n`;
        md += `${spread.rightPage.content || ''}\n\n`;
        if (spread.rightPage.notes && spread.rightPage.notes.length > 0) {
          md += `#### Editor Notes:\n`;
          spread.rightPage.notes.forEach(n => {
            md += `- **${n.authorName}**: ${n.text}\n`;
          });
          md += `\n`;
        }
      }

      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // 3. Export as Printable PDF / High-res Print Layout
  exportAsPDF(book) {
    if (!book) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to export PDF.");
      return;
    }

    let pagesHTML = '';
    book.spreads.forEach((spread) => {
      pagesHTML += `
        <div class="page-spread">
          <div class="page left">
            <div class="date">${spread.leftPage.date || ''}</div>
            <h2>${spread.leftPage.title || ''}</h2>
            <div class="content">${(spread.leftPage.content || '').replace(/\n/g, '<br/>')}</div>
            <div class="page-num">Page ${spread.leftPage.pageNumber}</div>
          </div>
          <div class="page right">
            <div class="date">${spread.rightPage.date || ''}</div>
            <h2>${spread.rightPage.title || ''}</h2>
            <div class="content">${(spread.rightPage.content || '').replace(/\n/g, '<br/>')}</div>
            <div class="page-num">Page ${spread.rightPage.pageNumber}</div>
          </div>
        </div>
      `;
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${book.title} - PDF Anthology</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: 'EB Garamond', Georgia, serif; background: #fff; color: #222; margin: 0; padding: 20px; }
          .cover { text-align: center; padding: 100px 20px; page-break-after: always; }
          .cover h1 { font-size: 42px; font-family: 'Playfair Display', serif; text-transform: uppercase; letter-spacing: 4px; }
          .cover p { font-size: 18px; font-style: italic; color: #555; }
          .page-spread { display: flex; width: 100%; height: 90vh; page-break-after: always; border: 1px solid #ccc; box-sizing: border-box; }
          .page { flex: 1; padding: 40px; box-sizing: border-box; position: relative; background: #fdfbf7; border-right: 1px solid #ddd; }
          .page.right { border-right: none; }
          .date { font-size: 12px; color: #777; text-transform: uppercase; letter-spacing: 2px; }
          h2 { font-family: 'Playfair Display', serif; font-size: 24px; margin-top: 10px; color: #111; }
          .content { font-size: 16px; line-height: 1.8; color: #333; }
          .page-num { position: absolute; bottom: 20px; left: 40px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="cover">
          <h1>${book.title}</h1>
          <p>${book.subtitle || ''}</p>
        </div>
        ${pagesHTML}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

export const exportService = new ExportService();
