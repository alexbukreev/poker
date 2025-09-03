// src/lib/parseRange.ts
// Parse "PokerStove-like" range strings into cell keys: AA, AKs, AJo, 77, ...

const RANKS = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"] as const;
type Rank = typeof RANKS[number];

function idx(r: string) { return RANKS.indexOf(r.toUpperCase() as Rank); }
function isRank(x: string): x is Rank { return RANKS.includes(x.toUpperCase() as Rank); }

function pairKey(r: string) { return `${r}${r}`; }
function suitedKey(hi: string, lo: string) { return `${hi}${lo}s`; }
function offKey(hi: string, lo: string) { return `${hi}${lo}o`; }

function expandPairPlus(rr: string, out: Set<string>) {
  const i = idx(rr[0]);
  for (let k = i; k >= 0; k--) out.add(pairKey(RANKS[k]));
}
function expandSuitedPlus(hi: string, lo: string, out: Set<string>) {
  const iHi = idx(hi), iLo = idx(lo);
  for (let j = iLo; j > iHi; j--) out.add(suitedKey(hi, RANKS[j]));
}
function expandOffPlus(hi: string, lo: string, out: Set<string>) {
  const iHi = idx(hi), iLo = idx(lo);
  for (let j = iLo; j > iHi; j--) out.add(offKey(hi, RANKS[j]));
}

function expandPairDash(start: string, end: string, out: Set<string>) {
  const s = idx(start[0]), e = idx(end[0]);
  for (let k = s; k >= e; k--) out.add(pairKey(RANKS[k]));
}
function expandDiagDash(hi1: string, lo1: string, hi2: string, lo2: string, suited: boolean, out: Set<string>) {
  let iHi = idx(hi1), iLo = idx(lo1);
  const iHiEnd = idx(hi2), iLoEnd = idx(lo2);
  // Step diagonally down: T9s, 98s, 87s, ...
  while (iHi >= iHiEnd && iLo >= iLoEnd) {
    if (iLo <= iHi) break; // safety: only valid where lo is strictly lower rank
    const key = suited ? suitedKey(RANKS[iHi], RANKS[iLo]) : offKey(RANKS[iHi], RANKS[iLo]);
    out.add(key);
    iHi++; iLo++; // move "down-right" in our rank order (indices grow toward lower ranks)
  }
}
function expandColDash(hi: string, loStart: string, loEnd: string, suited: boolean, out: Set<string>) {
  const iHi = idx(hi), s = idx(loStart), e = idx(loEnd);
  for (let j = s; j >= e; j--) {
    if (j <= iHi) break;
    const key = suited ? suitedKey(hi, RANKS[j]) : offKey(hi, RANKS[j]);
    out.add(key);
  }
}

function addToken(raw: string, out: Set<string>) {
  const t = raw.trim().toUpperCase();
  if (!t) return;

  // Single tokens: "77", "AKS", "AJO"
  if (/^[AKQJT98765432]{2}$/.test(t) && t[0] === t[1]) { out.add(t); return; }
  if (/^[AKQJT98765432]{2}[SO]$/.test(t)) {
    const [hi, lo, k] = [t[0], t[1], t[2]];
    if (hi !== lo && isRank(hi) && isRank(lo)) out.add(k === "S" ? suitedKey(hi, lo) : offKey(hi, lo));
    return;
  }

  // "77+" / "K5S+" / "A9O+"
  if (/^[AKQJT98765432]{2}\+$/.test(t) && t[0] === t[1]) { expandPairPlus(t.slice(0,2), out); return; }
  if (/^[AKQJT98765432]{2}S\+$/.test(t)) { const [hi,lo]=[t[0],t[1]]; if (hi!==lo) expandSuitedPlus(hi,lo,out); return; }
  if (/^[AKQJT98765432]{2}O\+$/.test(t)) { const [hi,lo]=[t[0],t[1]]; if (hi!==lo) expandOffPlus(hi,lo,out); return; }

  // Ranges with dash:
  // pairs "66-99"
  if (/^[AKQJT98765432]{2}-[AKQJT98765432]{2}$/.test(t) && t[0]===t[1] && t[3]===t[4]) {
    expandPairDash(t.slice(0,2), t.slice(3,5), out); return;
  }
  // suited "T9S-54S", offsuit "KQO-KTO"
  if (/^[AKQJT98765432]{2}[SO]-[AKQJT98765432]{2}[SO]$/.test(t)) {
    const hi1=t[0], lo1=t[1], k1=t[2], hi2=t[4], lo2=t[5], k2=t[6];
    if (k1!==k2) return; // invalid mixed
    if (hi1===lo1 || hi2===lo2) return; // invalid (pairs with s/o)
    // If same high rank → simple column slice (e.g. KQo-KTo)
    if (hi1 === hi2) { expandColDash(hi1, lo1, lo2, k1==="S", out); return; }
    // Otherwise treat as diagonal (e.g. T9s-54s)
    expandDiagDash(hi1, lo1, hi2, lo2, k1==="S", out); return;
  }
}

function parseBlock(block: string): Set<string> {
  const set = new Set<string>();
  // split by comma or any whitespace
  const tokens = block.split(/[\s,]+/g).filter(Boolean);
  for (const tok of tokens) addToken(tok, set);
  return set;
}

/** Parse full spec with optional **emphasize** block. */
export function parseRangeSpec(spec: string): { base: Set<string>, emph: Set<string> } {
  const m = spec.match(/\*\*(.*?)\*\*/s);
  const emph = m ? parseBlock(m[1]) : new Set<string>();
  const baseStr = m ? (spec.slice(0, m.index) + spec.slice((m.index ?? 0) + m[0].length)) : spec;
  const base = parseBlock(baseStr);
  // ensure emphasized hands are also in base (overlay paints over base)
  for (const k of emph) base.add(k);
  return { base, emph };
}

/** Helpers to compute matrix keys by cell coordinates. */
export function keyFromRanks(rowRank: Rank, colRank: Rank): string {
  if (rowRank === colRank) return `${rowRank}${colRank}`;
  // In our matrix top-right is suited (row index < col index)
  const ri = idx(rowRank), ci = idx(colRank);
  const tag = ri < ci ? "s" : "o";
  return `${rowRank}${colRank}${tag}`;
}
