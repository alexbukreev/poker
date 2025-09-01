// src/quiz/RangeMatrix.tsx
// Simple 13x13 hand matrix with BW highlighting from a PokerStove-like range string.
// No React import needed.
const R = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
const idx = (r:string) => R.indexOf(r);

function expandPlusPair(rank:string){ // "JJ+"
  const i = idx(rank); return R.slice(0, i+1).map(r=>r+r);
}
function expandPlusCombo(high:string, low:string, suf:"s"|"o"){ // "AJs+","KJo+"
  const i = idx(low); return R.slice(0, i+1).map(r => high + r + suf);
}
function expandDashAx(high:string, from:string, to:string, suf:"s"|"o"){ // "A5s-A2s"
  const a = idx(from), b = idx(to); const lo = Math.min(a,b), hi = Math.max(a,b);
  return R.slice(lo, hi+1).map(r => high + r + suf);
}

function normalizeToken(tok:string): string[] {
  tok = tok.trim();
  if (!tok) return [];
  // pair
  const mPairPlus = tok.match(/^([2-9TJQKA])\1\+$/);
  if (mPairPlus) return expandPlusPair(mPairPlus[1]);
  const mPair = tok.match(/^([2-9TJQKA])\1$/);
  if (mPair) return [mPair[1]+mPair[1]];

  // suited/offsuit with +
  const mPlus = tok.match(/^([2-9TJQKA])([2-9TJQKA])([so])\+$/);
  if (mPlus) return expandPlusCombo(mPlus[1], mPlus[2], mPlus[3] as any);

  // suited/offsuit exact
  const mExact = tok.match(/^([2-9TJQKA])([2-9TJQKA])([so])$/);
  if (mExact) return [mExact[1]+mExact[2]+mExact[3]];

  // Ax dash like A5s-A2s (same first)
  const mAx = tok.match(/^([2-9TJQKA])([2-9TJQKA])([so])\-([2-9TJQKA])([so])$/);
  if (mAx && mAx[3]===mAx[5]) return expandDashAx(mAx[1], mAx[2], mAx[4], mAx[3] as any);

  // simple connectors like "T9s"
  const mConn = tok.match(/^([2-9TJQKA])([2-9TJQKA])s$/);
  if (mConn) return [mConn[1]+mConn[2]+"s"];

  // fallback: ignore unknown fragments
  return [];
}

function parseRange(range:string): Set<string> {
  const set = new Set<string>();
  range.split(",").forEach(tok => normalizeToken(tok).forEach(x => set.add(x)));
  return set;
}

export default function RangeMatrix({ range }: { range: string }) {
  const S = parseRange(range);

  return (
    <div className="inline-grid" style={{ gridTemplateColumns: `repeat(13, 1fr)` }}>
      {R.map((r1, i) =>
        R.map((r2, j) => {
          const diagonal = i===j;
          let code = "";
          if (diagonal) code = r1+r1;
          else if (i<j) code = r1+r2+"s"; // upper triangle = suited
          else code = r2+r1+"o";          // lower triangle = offsuit

          const picked = S.has(code);
          return (
            <div
              key={r1+r2}
              className={`w-8 h-8 border border-foreground/20 text-[10px] grid place-items-center ${
                picked ? "bg-foreground/20 font-semibold" : "bg-background"
              }`}
              title={code}
            >
              {diagonal ? r1+r1 : (i<j ? r1+r2+"s" : r2+r1+"o")}
            </div>
          );
        })
      )}
    </div>
  );
}
