/** Best-effort close of a truncated JSON string. */
function repairJSON(s: string): string {
  let inStr = false;
  let esc = false;
  const stack: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
    } else {
      if (c === '"') inStr = true;
      else if (c === "{" || c === "[") stack.push(c);
      else if (c === "}" || c === "]") stack.pop();
    }
  }
  let out = s;
  out = out.replace(/\\+$/, "");
  if (inStr) out += '"';
  out = out.replace(/[\s,]+$/, "");
  if (/:\s*$/.test(out)) out += "null";
  out = out.replace(/([{\[,])\s*"[^"]*"$/, "$1");
  out = out.replace(/[\s,]+$/, "");
  for (let i = stack.length - 1; i >= 0; i--) {
    out += stack[i] === "{" ? "}" : "]";
  }
  return out;
}

export function extractJSON<T = unknown>(t: string | null | undefined): T | null {
  if (!t) return null;
  let s = String(t).trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    return JSON.parse(s) as T;
  } catch {
    /* continue */
  }
  const start = s.indexOf("{");
  if (start < 0) return null;
  const sub = s.slice(start);
  try {
    return JSON.parse(sub) as T;
  } catch {
    /* continue */
  }
  const repaired = repairJSON(sub);
  try {
    return JSON.parse(repaired) as T;
  } catch {
    return null;
  }
}
