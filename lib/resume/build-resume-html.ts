import type { ResumeVersionInput, TemplateStyle } from "@/lib/types/resume";

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fontLink(style: TemplateStyle): string {
  if (style === "editorial") {
    return '<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">';
  }
  if (style === "twocol") {
    return '<link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">';
  }
  return '<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">';
}

function printScript(forPrint: boolean): string {
  return forPrint
    ? '<script>window.addEventListener("load",function(){setTimeout(function(){try{window.focus();}catch(e){}window.print();},450);});</script>'
    : "";
}

export function buildResumeHTML(
  version: ResumeVersionInput,
  forPrint = false
): string {
  const d = version.data;
  const contactParts = [d.phone, d.email, d.location, d.linkedin]
    .filter(Boolean)
    .map(esc);
  const skills = d.skills || [];
  const exp = d.experience || [];
  const edu = d.education || [];
  const style = version.templateStyle || "classic";

  let css = "";
  let body = "";

  if (style === "twocol") {
    css =
      "*{box-sizing:border-box}body{margin:0;font-family:'Public Sans',Arial,sans-serif;color:#1f2430;font-size:10.4pt;line-height:1.45}" +
      ".wrap{max-width:8.5in;margin:0 auto;min-height:11in;display:grid;grid-template-columns:2.55in 1fr}" +
      ".side{background:#0E1116;color:#cfd6e0;padding:.5in .34in}" +
      ".side .nm{color:#fff;font-size:19pt;font-weight:800;line-height:1.05;letter-spacing:-.4px}" +
      ".side .hl{color:#7FA6FF;font-size:9.8pt;font-weight:600;margin-top:7px;line-height:1.35}" +
      ".side h3{font-size:8.4pt;text-transform:uppercase;letter-spacing:1.5px;color:#8A93A3;margin:22px 0 8px;font-weight:700}" +
      ".side .ci{font-size:9.3pt;margin-bottom:5px;color:#e6eaf0;word-break:break-word}" +
      ".side .sk{font-size:9.2pt;padding:3.5px 0;border-bottom:1px solid rgba(255,255,255,.08);color:#dde3ec}" +
      ".side .edu{font-size:9.3pt;margin-bottom:9px;color:#cfd6e0}.side .edu b{color:#fff;display:block;font-size:9.6pt}" +
      ".main{padding:.5in .45in}.main h3{font-size:9.2pt;text-transform:uppercase;letter-spacing:1.5px;color:#2F6BFF;font-weight:800;margin:0 0 9px}" +
      ".sm{font-size:10.2pt;color:#33394a;margin-bottom:18px;line-height:1.5}" +
      ".exp{margin-bottom:13px}.exp .co{font-weight:800;font-size:11pt;color:#141821}.exp .ti{font-size:9.7pt;color:#2F6BFF;font-weight:700}" +
      ".exp .dt{float:right;font-size:8.8pt;color:#8a90a0;font-weight:600}.exp .bl{font-size:9.5pt;color:#4a5161;margin:3px 0;font-style:italic}" +
      ".main ul{margin:4px 0 0;padding-left:15px}.main li{font-size:9.6pt;margin-bottom:3px;color:#2b3140}" +
      "@page{size:letter;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}";

    const eduH = edu
      .map(
        (e) =>
          `<div class="edu"><b>${esc(e.degree)}</b>${esc(e.school)}${e.year ? ` · ${esc(e.year)}` : ""}</div>`
      )
      .join("");
    const expH = exp
      .map(
        (e) =>
          `<div class="exp">${e.dates ? `<span class="dt">${esc(e.dates)}</span>` : ""}<div class="co">${esc(e.company)}</div>${e.title ? `<div class="ti">${esc(e.title)}</div>` : ""}${e.blurb ? `<div class="bl">${esc(e.blurb)}</div>` : ""}${e.bullets?.length ? `<ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}</div>`
      )
      .join("");

    body =
      `<div class="wrap"><div class="side"><div class="nm">${esc(d.name)}</div>` +
      (d.headline ? `<div class="hl">${esc(d.headline)}</div>` : "") +
      `<h3>Contact</h3>${contactParts.map((c) => `<div class="ci">${c}</div>`).join("")}` +
      (skills.length
        ? `<h3>Skills</h3>${skills.map((s) => `<div class="sk">${esc(s)}</div>`).join("")}`
        : "") +
      (eduH ? `<h3>Education</h3>${eduH}` : "") +
      `</div><div class="main"><h3>Profile</h3><div class="sm">${esc(d.summary)}</div><h3>Experience</h3>${expH}</div></div>`;
  } else if (style === "editorial") {
    css =
      "*{box-sizing:border-box}body{margin:0;font-family:'Source Sans 3',Arial,sans-serif;color:#262626;font-size:10.6pt;line-height:1.5}" +
      ".page{max-width:7.8in;margin:0 auto;padding:.62in .8in}" +
      ".nm{font-family:'Source Serif 4',Georgia,serif;font-size:31pt;font-weight:600;text-align:center;letter-spacing:.4px;margin:0;color:#1a1a1a}" +
      ".hl{text-align:center;font-family:'Source Serif 4',serif;font-style:italic;font-size:12pt;color:#555;margin:7px 0 0}" +
      ".ct{text-align:center;font-size:9.3pt;letter-spacing:.5px;color:#666;margin-top:10px}" +
      ".rule{height:1px;background:#1a1a1a;margin:16px 0 0}" +
      ".sec{margin-top:20px}.sh{font-family:'Source Serif 4',serif;font-size:13pt;font-weight:600;color:#1a1a1a;margin-bottom:9px;border-bottom:1px solid #ddd;padding-bottom:4px}" +
      ".sk{columns:2;column-gap:30px;font-size:10pt}.sk span{display:block;margin-bottom:3px;color:#333}.sk span::before{content:'— ';color:#aaa}" +
      ".exp{margin-bottom:13px}.eh{display:flex;justify-content:space-between;align-items:baseline;gap:12px}" +
      ".co{font-weight:700;font-size:11.2pt;color:#1a1a1a}.ti{color:#444;font-size:10.2pt}.dt{font-size:9.2pt;color:#888;font-style:italic;white-space:nowrap}" +
      ".bl{font-size:10pt;color:#444;margin:3px 0 2px;font-style:italic}ul{padding-left:17px;margin:4px 0 0}li{font-size:10pt;margin-bottom:3px;color:#333}" +
      ".edu{font-size:10.2pt;margin-bottom:3px}.edu b{font-weight:700}" +
      "@page{size:letter;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}";

    const expH = exp
      .map(
        (e) =>
          `<div class="exp"><div class="eh"><div><span class="co">${esc(e.company)}</span>${e.title ? ` <span class="ti">— ${esc(e.title)}</span>` : ""}</div>${e.dates ? `<div class="dt">${esc(e.dates)}</div>` : ""}</div>${e.blurb ? `<div class="bl">${esc(e.blurb)}</div>` : ""}${e.bullets?.length ? `<ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}</div>`
      )
      .join("");
    const eduH = edu
      .map(
        (e) =>
          `<div class="edu"><b>${esc(e.school)}</b> — ${esc(e.degree)}${e.year ? `, ${esc(e.year)}` : ""}</div>`
      )
      .join("");

    body =
      `<div class="page"><div class="nm">${esc(d.name)}</div>` +
      (d.headline ? `<div class="hl">${esc(d.headline)}</div>` : "") +
      `<div class="ct">${contactParts.join(" &nbsp;·&nbsp; ")}</div><div class="rule"></div>` +
      `<div class="sec"><div class="sh">Summary</div><div>${esc(d.summary)}</div></div>` +
      (skills.length
        ? `<div class="sec"><div class="sh">Core Skills</div><div class="sk">${skills.map((s) => `<span>${esc(s)}</span>`).join("")}</div></div>`
        : "") +
      `<div class="sec"><div class="sh">Experience</div>${expH}</div>` +
      (eduH ? `<div class="sec"><div class="sh">Education</div>${eduH}</div>` : "") +
      `</div>`;
  } else {
    css =
      "*{box-sizing:border-box}body{margin:0;font-family:'Source Sans 3',Arial,sans-serif;color:#1a1a1a;font-size:10.7pt;line-height:1.42}" +
      ".page{max-width:8.5in;margin:0 auto;padding:.52in .62in}" +
      ".nm{font-size:23pt;font-weight:700;letter-spacing:.4px;margin:0;color:#111}" +
      ".hl{font-size:11pt;color:#3b3b3b;margin:3px 0 6px;font-weight:600}" +
      ".ct{font-size:9.5pt;color:#555}" +
      ".sec{margin-top:15px}.sh{font-size:10.3pt;font-weight:700;text-transform:uppercase;letter-spacing:1.3px;color:#111;border-bottom:1.5px solid #222;padding-bottom:3px;margin-bottom:8px}" +
      ".sk{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px 18px;font-size:9.6pt}.sk span::before{content:'▪ ';color:#999}" +
      ".exp{margin-bottom:11px}.eh{display:flex;justify-content:space-between;align-items:baseline;gap:10px}" +
      ".co{font-weight:700;font-size:11pt}.ti{font-style:italic;color:#333;font-weight:600;font-size:10.2pt}.dt{font-size:9.2pt;color:#666;white-space:nowrap;font-weight:600}" +
      ".bl{font-size:9.7pt;color:#333;margin:2px 0 2px}ul{margin:3px 0 0;padding-left:16px}li{margin-bottom:2.5px;font-size:9.8pt}" +
      ".edu{font-size:10pt;margin-bottom:2px}.edu b{font-weight:700}" +
      "@page{size:letter;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}";

    const expH = exp
      .map(
        (e) =>
          `<div class="exp"><div class="eh"><div><span class="co">${esc(e.company)}</span>${e.title ? ` <span class="ti">— ${esc(e.title)}</span>` : ""}</div>${e.dates ? `<div class="dt">${esc(e.dates)}</div>` : ""}</div>${e.blurb ? `<div class="bl">${esc(e.blurb)}</div>` : ""}${e.bullets?.length ? `<ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}</div>`
      )
      .join("");
    const eduH = edu
      .map(
        (e) =>
          `<div class="edu"><b>${esc(e.school)}</b> — ${esc(e.degree)}${e.year ? `, ${esc(e.year)}` : ""}</div>`
      )
      .join("");

    body =
      `<div class="page"><div class="nm">${esc(d.name)}</div>` +
      (d.headline ? `<div class="hl">${esc(d.headline)}</div>` : "") +
      `<div class="ct">${contactParts.join(" &nbsp;•&nbsp; ")}</div>` +
      `<div class="sec"><div class="sh">Summary</div><div>${esc(d.summary)}</div></div>` +
      (skills.length
        ? `<div class="sec"><div class="sh">Core Skills</div><div class="sk">${skills.map((s) => `<span>${esc(s)}</span>`).join("")}</div></div>`
        : "") +
      `<div class="sec"><div class="sh">Professional Experience</div>${expH}</div>` +
      (eduH ? `<div class="sec"><div class="sh">Education</div>${eduH}</div>` : "") +
      `</div>`;
  }

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(d.name)} — Resume</title>${fontLink(style)}<style>html,body{background:#fff;color-scheme:light;}${css}</style></head><body>${body}${printScript(forPrint)}</body></html>`;
}

export function templateLabel(style: TemplateStyle): string {
  if (style === "twocol") return "Two-Column";
  if (style === "editorial") return "Editorial";
  return "Classic";
}
