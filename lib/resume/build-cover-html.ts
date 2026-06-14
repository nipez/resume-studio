function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

type CoverContact = {
  name: string;
  phone?: string;
  email?: string;
  location?: string;
};

export function buildCoverHTML(text: string, contact: CoverContact): string {
  const contactLine = [contact.phone, contact.email, contact.location]
    .filter(Boolean)
    .map(esc)
    .join(" &nbsp;·&nbsp; ");
  const css =
    "*{box-sizing:border-box}body{margin:0;font-family:'Source Sans 3',Arial,sans-serif;color:#222;font-size:11pt;line-height:1.7}" +
    ".page{max-width:8.5in;margin:0 auto;padding:.8in .9in}" +
    ".nm{font-size:22pt;font-weight:700;color:#111;letter-spacing:.3px}" +
    ".ct{font-size:9.6pt;color:#555;margin-top:5px;border-bottom:1.5px solid #222;padding-bottom:12px}" +
    ".body{white-space:pre-wrap;margin-top:22px}" +
    "@page{size:letter;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}";
  const fontLink =
    '<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">';
  const printScript =
    '<script>window.addEventListener("load",function(){setTimeout(function(){try{window.focus();}catch(e){}window.print();},450);});</script>';

  return (
    "<!doctype html><html><head><meta charset=\"utf-8\"><title>" +
    esc(contact.name) +
    " — Cover Letter</title>" +
    fontLink +
    "<style>html,body{background:#fff;color-scheme:light;}" +
    css +
    "</style></head><body><div class=\"page\"><div class=\"nm\">" +
    esc(contact.name) +
    "</div><div class=\"ct\">" +
    contactLine +
    "</div><div class=\"body\">" +
    esc(text) +
    "</div></div>" +
    printScript +
    "</body></html>"
  );
}

export function openPrintHtml(html: string) {
  const w = window.open("", "_blank");
  if (!w) {
    throw new Error("Allow pop-ups to export the PDF");
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
