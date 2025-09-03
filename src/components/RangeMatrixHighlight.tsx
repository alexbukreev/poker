// src/components/RangeMatrixHighlight.tsx
import { useMemo } from "react";

export type CellStyleFn = (code: string) => React.CSSProperties;

const R = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
const idx = (r: string) => R.indexOf(r);

// --- expand helpers ---------------------------------------------------------
function expandPairPlus(rank: string) {
  const i = idx(rank);
  return i < 0 ? [] : R.slice(0, i + 1).map((x) => x + x);
}
function expandPlusCombo(high: string, low: string, suf: "s" | "o") {
  const hi = idx(high);
  const lowers = R.slice(hi + 1);
  const pos = lowers.indexOf(low);
  return hi < 0 || pos < 0 ? [] : lowers.slice(0, pos + 1).map((r) => high + r + suf);
}
function expandDash(h1: string, l1: string, h2: string, l2: string, suf: "s" | "o") {
  const hi1 = idx(h1), lo1 = idx(l1), hi2 = idx(h2), lo2 = idx(l2);
  if (hi1 < 0 || lo1 < 0 || hi2 < 0 || lo2 < 0) return [];
  // same high rank (A5s-A2s) or same low rank (KQo-KTo)
  if (hi1 === hi2) {
    const a = idx(l1), b = idx(l2), step = b >= a ? 1 : -1;
    const out: string[] = [];
    for (let t = a; step > 0 ? t <= b : t >= b; t += step) out.push(h1 + R[t] + suf);
    return out;
  }
  if (lo1 === lo2) {
    const a = idx(h1), b = idx(h2), step = b >= a ? 1 : -1;
    const out: string[] = [];
    for (let t = a; step > 0 ? t <= b : t >= b; t += step) out.push(R[t] + l1 + suf);
    return out;
  }
  // diagonal like T9s-54s
  const d1 = hi2 - hi1, d2 = lo2 - lo1;
  if (d1 !== d2) return [];
  const out: string[] = [];
  for (let k = 0; k <= Math.abs(d1); k++) out.push(R[hi1 + k] + R[lo1 + k] + suf);
  return out;
}
function expandToken(tok: string) {
  const t = tok.trim().toUpperCase();
  if (!t) return [] as string[];
  let m = t.match(/^([2-9TJQKA])\1\+$/);
  if (m) return expandPairPlus(m[1]);
  m = t.match(/^([2-9TJQKA])\1$/);
  if (m) return [m[1] + m[1]];
  m = t.match(/^([2-9TJQKA])([2-9TJQKA])(S|O)\+$/);
  if (m) return expandPlusCombo(m[1], m[2], m[3].toLowerCase() as "s" | "o");
  m = t.match(/^([2-9TJQKA])([2-9TJQKA])(S|O)\-([2-9TJQKA])([2-9TJQKA])\3$/);
  if (m) return expandDash(m[1], m[2], m[4], m[5], m[3].toLowerCase() as "s" | "o");
  m = t.match(/^([2-9TJQKA])([2-9TJQKA])(S|O)$/);
  if (m) return [m[1] + m[2] + m[3].toLowerCase()];
  return [];
}
function parsePlainRange(s: string | undefined | null) {
  const set = new Set<string>();
  if (!s) return set;
  s.split(",").map((x) => x.trim()).filter(Boolean).forEach((tok) => {
    expandToken(tok).forEach((c) => set.add(c));
  });
  return set;
}
function parseWithEmphasis(spec: string | undefined | null) {
  const base = new Set<string>(), emph = new Set<string>();
  if (!spec) return { base, emph };
  const parts = String(spec).split("**");
  parts.forEach((p, i) => {
    parsePlainRange(p).forEach((c) => (i % 2 === 1 ? emph : base).add(c));
  });
  return { base, emph };
}

// --- public API --------------------------------------------------------------
export function useRangeHighlight(
  spec: string,
  opts?: { baseColor?: string; emphasizeColor?: string }
): CellStyleFn {
  const { base, emph } = useMemo(() => parseWithEmphasis(spec || ""), [spec]);
  const baseColor = opts?.baseColor ?? "rgba(0,0,0,0.16)";
  const emphasizeColor = opts?.emphasizeColor ?? "rgba(0,0,0,0.34)";
  return (code) => {
    if (emph.has(code)) return { backgroundColor: emphasizeColor, color: "var(--background)", fontWeight: 600 };
    if (base.has(code)) return { backgroundColor: baseColor, fontWeight: 600 };
    return {};
  };
}

// Default export for backward compatibility
export default useRangeHighlight;
