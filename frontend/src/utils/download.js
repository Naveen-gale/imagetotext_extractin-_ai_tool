/**
 * Download utilities — all happen in-browser, no server needed
 */

export function downloadTxt(text, filename) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = sanitize(filename) + ".txt";
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadPdf(text, filename) {
  const { default: html2pdf } = await import("html2pdf.js");
  const el = document.createElement("div");
  el.style.cssText =
    "font-family:Arial,sans-serif;font-size:13px;line-height:1.9;color:#111;" +
    "padding:28px 32px;max-width:700px;white-space:pre-wrap;";
  el.textContent = text;
  document.body.appendChild(el);
  await html2pdf()
    .set({
      margin: [18, 18, 18, 18],
      filename: sanitize(filename) + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(el)
    .save();
  document.body.removeChild(el);
}

export async function downloadDocx(text, filename) {
  const { Document, Paragraph, TextRun, Packer, HeadingLevel } = await import("docx");
  const { saveAs } = await import("file-saver");
  const lines = text.split(/\r?\n/);
  const children = lines.map((line) => {
    const isPageHeader = /^={3,}/.test(line) || /^Page \d+:/.test(line);
    return new Paragraph({
      children: [
        new TextRun({
          text: line || " ",
          font: "Arial",
          size: isPageHeader ? 28 : 24,
          bold: isPageHeader,
        }),
      ],
      spacing: { after: isPageHeader ? 200 : 120 },
      ...(isPageHeader ? { heading: HeadingLevel.HEADING_2 } : {}),
    });
  });
  const doc = new Document({ sections: [{ properties: {}, children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, sanitize(filename) + ".docx");
}

/**
 * Build a merged document from multiple results (maintains page order)
 * results: [{ fileName, text }]
 * Returns a single string with page separators
 */
export function buildCombinedText(results) {
  return results
    .map((r, i) =>
      [
        `${"=".repeat(60)}`,
        `Page ${i + 1}: ${r.fileName}`,
        `${"=".repeat(60)}`,
        r.text || "[NO TEXT FOUND]",
        "",
      ].join("\n")
    )
    .join("\n");
}

function sanitize(name) {
  return name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_\-\s]/gi, "_");
}
