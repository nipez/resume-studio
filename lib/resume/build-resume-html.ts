import type {
  ResumeData,
  ResumeEducation,
  ResumeExperience,
  ResumeVersionInput,
  TemplateStyle,
} from "@/lib/types/resume";

const CORAL = "#ff5c38";
const CORAL_L = "#ff8a5c";
const INK = "#231a2e";

const PRINT_BASE =
  "@page{size:letter;margin:0}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}";

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fontLink(): string {
  return '<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Instrument+Sans:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">';
}

function printScript(forPrint: boolean): string {
  return forPrint
    ? '<script>window.addEventListener("load",function(){setTimeout(function(){try{window.focus();}catch(e){}window.print();},450);});</script>'
    : "";
}

function contactParts(d: ResumeData): string[] {
  return [d.phone, d.email, d.location, d.linkedin].filter(Boolean).map(esc);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function splitName(name: string): { first: string; last: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: name.trim(), last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function skillMeterWidth(index: number): number {
  return [92, 85, 78, 70, 88, 74, 82][index % 7];
}

function skillLevel(index: number): string {
  return ["Expert", "Expert", "Advanced", "Advanced", "Proficient"][
    index % 5
  ];
}

function bullets(items: string[] | undefined): string {
  return (items || [])
    .filter(Boolean)
    .map((b) => `<div class="r-li">${esc(b)}</div>`)
    .join("");
}

function buildClassicHTML(d: ResumeData): { css: string; body: string } {
  const contact = contactParts(d);
  const skills = d.skills || [];
  const exp = d.experience || [];
  const edu = d.education || [];

  const css =
    "*{box-sizing:border-box}body{margin:0;font-family:'Instrument Sans',Arial,sans-serif;color:#48414f;font-size:9.5pt;line-height:1.45}" +
    `.page{max-width:8.5in;margin:0 auto;min-height:11in;padding:.55in .58in 0}` +
    `.classic{font-family:'Newsreader',Georgia,serif}` +
    `.head{text-align:center;border-bottom:1.5px solid #1a1420;padding-bottom:12px}` +
    `.r-name{font-size:26pt;font-weight:700;letter-spacing:.02em;color:#1a1420;line-height:1}` +
    `.r-role{color:${CORAL};font-size:10.5pt;font-weight:600;letter-spacing:.22em;text-transform:uppercase;margin-top:6px;font-family:'Instrument Sans',sans-serif}` +
    `.contact{font-size:9pt;color:#6c6675;margin-top:8px;letter-spacing:.02em;font-family:'Instrument Sans',sans-serif}` +
    `.sec{margin-top:16px}` +
    `.r-h{font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#1a1420;font-family:'Instrument Sans',sans-serif;border-bottom:1px solid rgba(40,20,30,.18);padding-bottom:4px;margin-bottom:8px}` +
    `.row{display:flex;justify-content:space-between;align-items:baseline;gap:12px;min-height:1.2em}` +
    `.r-job{font-weight:700;color:#1a1420;font-size:10.5pt;white-space:nowrap}` +
    `.r-co{color:${CORAL};font-weight:600;font-size:9.5pt;font-family:'Instrument Sans',sans-serif;white-space:nowrap}` +
    `.r-date{color:#9a93a3;font-weight:500;font-size:9pt;font-family:'Instrument Sans',sans-serif;white-space:nowrap}` +
    `.r-li{position:relative;color:#48414f;font-size:9.5pt;line-height:1.5;padding-left:11px;margin-top:4px;font-family:'Instrument Sans',sans-serif}` +
    `.r-li::before{content:'';position:absolute;left:0;top:.45em;width:3px;height:3px;border-radius:50%;background:${CORAL}}` +
    `.r-p{color:#48414f;font-size:9.5pt;line-height:1.55;font-family:'Instrument Sans',sans-serif}` +
    `.skills{display:flex;flex-wrap:wrap;gap:5px}` +
    `.chip{font-size:8.5pt;font-family:'Instrument Sans',sans-serif;color:#48414f;background:#f4eee9;border-radius:4px;padding:3px 7px;white-space:nowrap}` +
    `.exp{margin-bottom:12px}` +
    `.exp+.exp{margin-top:10px}` +
    PRINT_BASE;

  const expH = exp
    .map(
      (e: ResumeExperience) =>
        `<div class="exp">` +
        `<div class="row">${e.title ? `<span class="r-job">${esc(e.title)}</span>` : ""}${e.dates ? `<span class="r-date">${esc(e.dates)}</span>` : ""}</div>` +
        (e.company ? `<div class="r-co">${esc(e.company)}</div>` : "") +
        (e.blurb ? `<div class="r-p" style="margin-top:4px;font-style:italic">${esc(e.blurb)}</div>` : "") +
        bullets(e.bullets) +
        `</div>`
    )
    .join("");

  const eduH = edu
    .map(
      (e: ResumeEducation) =>
        `<div class="exp">` +
        `<div class="row">${e.degree ? `<span class="r-job">${esc(e.degree)}</span>` : ""}${e.year ? `<span class="r-date">${esc(e.year)}</span>` : ""}</div>` +
        (e.school ? `<div class="r-co">${esc(e.school)}</div>` : "") +
        `</div>`
    )
    .join("");

  const body =
    `<div class="page"><div class="classic">` +
    `<div class="head">` +
    `<div class="r-name">${esc(d.name)}</div>` +
    (d.headline ? `<div class="r-role">${esc(d.headline)}</div>` : "") +
    (contact.length
      ? `<div class="contact">${contact.join(" · ")}</div>`
      : "") +
    `</div>` +
    (d.summary
      ? `<div class="sec"><div class="r-h">Summary</div><div class="r-p">${esc(d.summary)}</div></div>`
      : "") +
    (expH
      ? `<div class="sec"><div class="r-h">Experience</div>${expH}</div>`
      : "") +
    (eduH
      ? `<div class="sec"><div class="r-h">Education</div>${eduH}</div>`
      : "") +
    (skills.length
      ? `<div class="sec"><div class="r-h">Skills</div><div class="skills">${skills.map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div></div>`
      : "") +
    `</div></div>`;

  return { css, body };
}

function buildTwocolHTML(d: ResumeData): { css: string; body: string } {
  const contact = contactParts(d);
  const skills = d.skills || [];
  const exp = d.experience || [];
  const edu = d.education || [];
  const ini = initials(d.name);

  const css =
    "*{box-sizing:border-box}body{margin:0;font-family:'Instrument Sans',Arial,sans-serif;color:#48414f;font-size:9.5pt;line-height:1.45}" +
    `.wrap{max-width:8.5in;margin:0 auto;min-height:11in;display:grid;grid-template-columns:38% 1fr}` +
    `.side{background:${INK};color:#fff;padding:.52in .36in}` +
    `.avatar{width:.68in;height:.68in;border-radius:50%;background:linear-gradient(135deg,${CORAL},${CORAL_L});display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:17pt;color:#fff;margin:0 auto}` +
    `.side .r-h{color:#ff9a72;font-size:8.5pt;font-weight:700;text-transform:uppercase;letter-spacing:.14em;margin:18px 0 7px}` +
    `.side .txt{font-size:9pt;line-height:1.7;color:#d9d2e0}` +
    `.side .sk{font-size:9pt;color:#e8e3ee;display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px}` +
    `.meter{width:52px;height:3px;border-radius:2px;background:rgba(255,255,255,.18);overflow:hidden;flex-shrink:0}` +
    `.meter span{display:block;height:100%;background:${CORAL}}` +
    `.main{padding:.52in .44in}` +
    `.r-name{font-size:21pt;font-weight:700;font-family:'Space Grotesk',sans-serif;color:#1a1420;line-height:1;letter-spacing:-.01em}` +
    `.r-role{color:${CORAL};font-size:9.5pt;font-weight:600;letter-spacing:.16em;text-transform:uppercase;margin-top:5px}` +
    `.main .r-h{font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#1a1420;margin:16px 0 7px}` +
    `.main .r-h:first-of-type{margin-top:14px}` +
    `.r-p{color:#48414f;font-size:9.5pt;line-height:1.6}` +
    `.row{display:flex;justify-content:space-between;align-items:baseline;gap:10px;min-height:1.2em}` +
    `.r-job{font-weight:700;color:#1a1420;font-size:10pt;white-space:nowrap}` +
    `.r-co{color:${CORAL};font-weight:600;font-size:9pt;white-space:nowrap}` +
    `.r-date{color:#9a93a3;font-weight:500;font-size:8.5pt;white-space:nowrap}` +
    `.r-li{position:relative;color:#48414f;font-size:9pt;line-height:1.5;padding-left:11px;margin-top:4px}` +
    `.r-li::before{content:'';position:absolute;left:0;top:.45em;width:3px;height:3px;border-radius:50%;background:${CORAL}}` +
    `.exp{margin-bottom:11px}` +
    PRINT_BASE;

  const skillsH = skills
    .map(
      (s, i) =>
        `<div class="sk"><span>${esc(s)}</span><span class="meter"><span style="width:${skillMeterWidth(i)}%"></span></span></div>`
    )
    .join("");

  const eduH = edu
    .map(
      (e) =>
        `<div class="txt" style="margin-bottom:10px">` +
        (e.school ? `<b style="color:#fff">${esc(e.school)}</b><br>` : "") +
        (e.degree ? `${esc(e.degree)}<br>` : "") +
        (e.year ? esc(e.year) : "") +
        `</div>`
    )
    .join("");

  const expH = exp
    .map(
      (e: ResumeExperience) =>
        `<div class="exp">` +
        `<div class="row">${e.title ? `<span class="r-job">${esc(e.title)}</span>` : ""}${e.dates ? `<span class="r-date">${esc(e.dates)}</span>` : ""}</div>` +
        (e.company ? `<div class="r-co">${esc(e.company)}</div>` : "") +
        (e.blurb ? `<div class="r-p" style="margin-top:4px;font-style:italic">${esc(e.blurb)}</div>` : "") +
        bullets(e.bullets) +
        `</div>`
    )
    .join("");

  const body =
    `<div class="wrap">` +
    `<div class="side">` +
    `<div class="avatar">${esc(ini)}</div>` +
    (contact.length
      ? `<div class="r-h">Contact</div><div class="txt">${contact.join("<br>")}</div>`
      : "") +
    (skillsH ? `<div class="r-h">Skills</div>${skillsH}` : "") +
    (eduH ? `<div class="r-h">Education</div>${eduH}` : "") +
    `</div>` +
    `<div class="main">` +
    `<div class="r-name">${esc(d.name)}</div>` +
    (d.headline ? `<div class="r-role">${esc(d.headline)}</div>` : "") +
    (d.summary
      ? `<div class="r-h">Profile</div><div class="r-p">${esc(d.summary)}</div>`
      : "") +
    (expH ? `<div class="r-h">Experience</div>${expH}` : "") +
    `</div></div>`;

  return { css, body };
}

function buildEditorialHTML(d: ResumeData): { css: string; body: string } {
  const skills = d.skills || [];
  const exp = d.experience || [];
  const edu = d.education || [];
  const { first, last } = splitName(d.name);
  const ini = initials(d.name);
  const chips = skills.slice(0, 4);

  const css =
    "*{box-sizing:border-box}body{margin:0;font-family:'Instrument Sans',Arial,sans-serif;color:#48414f;font-size:9.5pt;line-height:1.45}" +
    `.page{max-width:8.5in;margin:0 auto;min-height:11in;padding:.55in .58in 0}` +
    `.topbar{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}` +
    `.r-name{font-family:'Space Grotesk',sans-serif;font-size:28pt;line-height:.95;letter-spacing:-.02em;color:${CORAL};font-weight:700}` +
    `.r-name b{display:block;color:#1a1420;font-weight:700}` +
    `.badge{width:34px;height:34px;border-radius:8px;background:${INK};color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:11pt;display:flex;align-items:center;justify-content:center;flex-shrink:0}` +
    `.r-role{font-size:9pt;letter-spacing:.2em;text-transform:uppercase;color:#6c6675;margin-top:8px;font-weight:600}` +
    `.rule{height:2px;background:#1a1420;margin:12px 0}` +
    `.chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px}` +
    `.chip{font-size:8pt;font-weight:600;color:#fff;background:${CORAL};border-radius:100px;padding:4px 10px;white-space:nowrap}` +
    `.chip.alt{background:${INK}}` +
    `.cols{display:grid;grid-template-columns:1.35fr 1fr;gap:16px}` +
    `.r-h{font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:${CORAL};margin-bottom:7px}` +
    `.row{display:flex;justify-content:space-between;align-items:baseline;gap:10px;min-height:1.2em}` +
    `.r-job{font-weight:700;color:#1a1420;font-size:10pt;white-space:nowrap}` +
    `.r-co{font-size:9pt;color:#6c6675;font-weight:500;white-space:nowrap}` +
    `.r-date{font-size:8.5pt;color:#9a93a3;font-weight:500;white-space:nowrap}` +
    `.r-p{color:#48414f;font-size:9.5pt;line-height:1.55}` +
    `.r-li{position:relative;color:#48414f;font-size:9.5pt;line-height:1.5;padding-left:11px;margin-top:4px}` +
    `.r-li::before{content:'';position:absolute;left:0;top:.45em;width:3px;height:3px;border-radius:50%;background:${CORAL}}` +
    `.ed-blk{margin-bottom:12px}` +
    `.side .r-p{margin-bottom:10px}` +
    `.skill-row{display:flex;justify-content:space-between;font-size:9pt;color:#48414f;padding:4px 0;border-bottom:1px solid rgba(40,20,30,.08);white-space:nowrap;gap:10px}` +
    `.skill-row:last-child{border:none}` +
    PRINT_BASE;

  const expH = exp
    .map(
      (e: ResumeExperience) =>
        `<div class="ed-blk">` +
        `<div class="row">${e.title ? `<span class="r-job">${esc(e.title)}</span>` : ""}${e.dates ? `<span class="r-date">${esc(e.dates)}</span>` : ""}</div>` +
        (e.company ? `<div class="r-co">${esc(e.company)}</div>` : "") +
        (e.blurb ? `<div class="r-p" style="margin-top:4px;font-style:italic">${esc(e.blurb)}</div>` : "") +
        bullets(e.bullets) +
        `</div>`
    )
    .join("");

  const eduH = edu
    .map(
      (e: ResumeEducation) =>
        `<div class="ed-blk">` +
        `<div class="row">${e.degree ? `<span class="r-job">${esc(e.degree)}</span>` : ""}${e.year ? `<span class="r-date">${esc(e.year)}</span>` : ""}</div>` +
        (e.school ? `<div class="r-co">${esc(e.school)}</div>` : "") +
        `</div>`
    )
    .join("");

  const skillsH = skills
    .map(
      (s, i) =>
        `<div class="skill-row"><span>${esc(s)}</span><span>${skillLevel(i)}</span></div>`
    )
    .join("");

  const chipsH = chips
    .map((_, i) => {
      const alt = i === 1 || i === 2 ? " alt" : "";
      return `<span class="chip${alt}">${esc(chips[i])}</span>`;
    })
    .join("");

  const body =
    `<div class="page">` +
    `<div class="topbar">` +
    `<div class="r-name">${esc(first)}${last ? `<b>${esc(last)}</b>` : ""}</div>` +
    `<div class="badge">${esc(ini)}</div>` +
    `</div>` +
    (d.headline ? `<div class="r-role">${esc(d.headline)}</div>` : "") +
    `<div class="rule"></div>` +
    (chipsH ? `<div class="chips">${chipsH}</div>` : "") +
    `<div class="cols">` +
    `<div class="lead">` +
    (expH
      ? `<div class="ed-blk"><div class="r-h">Experience</div>${expH}</div>`
      : "") +
    (eduH
      ? `<div class="ed-blk"><div class="r-h">Education</div>${eduH}</div>`
      : "") +
    `</div>` +
    `<div class="side">` +
    (d.summary
      ? `<div class="r-h">Profile</div><div class="r-p">${esc(d.summary)}</div>`
      : "") +
    (skillsH ? `<div class="r-h">Top Skills</div>${skillsH}` : "") +
    `</div>` +
    `</div></div>`;

  return { css, body };
}

export function buildResumeHTML(
  version: ResumeVersionInput,
  forPrint = false
): string {
  const d = version.data;
  const style = version.templateStyle || "classic";

  let built: { css: string; body: string };
  if (style === "twocol") {
    built = buildTwocolHTML(d);
  } else if (style === "editorial") {
    built = buildEditorialHTML(d);
  } else {
    built = buildClassicHTML(d);
  }

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(d.name)} — Resume</title>${fontLink()}<style>html,body{background:#fff;color-scheme:light;}${built.css}</style></head><body>${built.body}${printScript(forPrint)}</body></html>`;
}

export function templateLabel(style: TemplateStyle): string {
  if (style === "twocol") return "Two-Column";
  if (style === "editorial") return "Editorial";
  return "Classic";
}
