// src/quiz/RangeMatrix.tsx
// 13×13 hand matrix + parsing of range specs (++, dashed ranges, **emphasize** blocks).
// No React import needed.

const R = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
const idx = (r: string) => R.indexOf(r);

// --- helpers to expand tokens ------------------------------------------------

// JJ+  -> [JJ,QQ,KK,AA] (order not important for highlighting)
function expandPairPlus(rank: string): string[] {
  const i = idx(rank);
  if (i < 0) return [];
  return R.slice(0, i + 1).map((r) => r + r);
}

// A5s+ -> [A5s,A6s,...,AQs,KQs? no; only lower than A]
// K5s+ -> [K5s,K6s,...,KQs]
function expandPlusCombo(high: string, low: string, suf: "s" | "o"): string[] {
  const hi = idx(high);
  const allowedLowers = R.slice(hi + 1); // ranks strictly lower than 'high'
  const posLow = allowedLowers.indexOf(low);
  if (hi < 0 || posLow < 0) return [];
  const take = allowedLowers.slice(0, posLow + 1); // from highest lower down to 'low'
  return take.map((r) => high + r + suf);
}

// A5s-A2s (same first card; walk low rank)
function expandSameFirst(
  high: string,
  lowFrom: string,
  lowTo: string,
  suf: "s" | "o"
): string[] {
  const li = idx(lowFrom);
  const lj = idx(lowTo);
  if (li < 0 || lj < 0) return [];
  const step = lj >= li ? 1 : -1;
  const out: string[] = [];
  for (let t = li; step > 0 ? t <= lj : t >= lj; t += step) {
    out.push(high + R[t] + suf);
  }
  return out;
}

// General diagonal / row range: XYs-ZWs with same suit marker
// - if first ranks equal -> walk second (row)
// - if second ranks equal -> walk first (column)
// - if both move equally -> walk diagonal (e.g., T9s-54s)
function expandDash(
  h1: string, l1: string, h2: string, l2: string, suf: "s" | "o"
): string[] {
  const hi1 = idx(h1), lo1 = idx(l1), hi2 = idx(h2), lo2 = idx(l2);
  if (hi1 < 0 || lo1 < 0 || hi2 < 0 || lo2 < 0) return [];

  if (hi1 === hi2) {
    // same first rank, walk low
    return expandSameFirst(h1, l1, l2, suf);
  }
  if (lo1 === lo2) {
    // same low rank, walk first
    const step = hi2 >= hi1 ? 1 : -1;
    const out: string[] = [];
    for (let t = hi1; step > 0 ? t <= hi2 : t >= hi2; t += step) {
      out.push(R[t] + l1 + suf);
    }
    return out;
  }
  // diagonal: both move with the same delta
  const d1 = hi2 - hi1;
  const d2 = lo2 - lo1;
  if (d1 !== d2) return []; // invalid diagonal (length mismatch)
  const out: string[] = [];
  for (let k = 0; k <= Math.abs(d1); k++) {
    out.push(R[hi1 + k] + R[lo1 + k] + suf);
  }
  return out;
}

// Normalize one token (e.g., "KQo", "A5s+", "T9s-54s", "77+")
function expandToken(raw: string): string[] {
  const tok = raw.trim().toUpperCase();
  if (!tok) return [];

  // pair +
  let m = tok.match(/^([2-9TJQKA])\1\+$/);
  if (m) return expandPairPlus(m[1]);

  // exact pair
  m = tok.match(/^([2-9TJQKA])\1$/);
  if (m) return [m[1] + m[1]];

  // suited/offsuit with +
  m = tok.match(/^([2-9TJQKA])([2-9TJQKA])(S|O)\+$/);
  if (m) return expandPlusCombo(m[1], m[2], m[3].toLowerCase() as "s" | "o");

  // dash ranges (row/column/diagonal), suit must match
  m = tok.match(
    /^([2-9TJQKA])([2-9TJQKA])(S|O)\-([2-9TJQKA])([2-9TJQKA])\3$/
  );
  if (m)
    return expandDash(
      m[1],
      m[2],
      m[4],
      m[5],
      m[3].toLowerCase() as "s" | "o"
    );

  // exact suited/offsuit
  m = tok.match(/^([2-9TJQKA])([2-9TJQKA])(S|O)$/);
  if (m) return [m[1] + m[2] + m[3].toLowerCase()];

  // allow simple "T9s" form as a fallback
  m = tok.match(/^([2-9TJQKA])([2-9TJQKA])S$/);
  if (m) return [m[1] + m[2] + "s"];
  m = tok.match(/^([2-9TJQKA])([2-9TJQKA])O$/);
  if (m) return [m[1] + m[2] + "o"];

  return []; // unknown fragment -> ignore safely
}

// Parse a plain comma-separated range (no emphasize)
function parsePlainRange(s: string | undefined | null): Set<string> {
  const set = new Set<string>();
  if (!s) return set;
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .forEach((tok) => {
      expandToken(tok).forEach((c) => set.add(c));
    });
  return set;
}

// Parse range with optional **emphasize** blocks.
// Odd segments (between **) are emphasized.
function parseRangeWithEmphasis(spec: string | undefined | null): {
  base: Set<string>;
  emph: Set<string>;
} {
  const base = new Set<string>();
  const emph = new Set<string>();
  if (!spec) return { base, emph };

  const parts = String(spec).split("**");
  parts.forEach((part, i) => {
    const cells = parsePlainRange(part);
    cells.forEach((c) => (i % 2 === 1 ? emph.add(c) : base.add(c)));
  });

  return { base, emph };
}

// --- component ---------------------------------------------------------------

export default function RangeMatrix({ spec }: { spec: string }) {
  const { base, emph } = parseRangeWithEmphasis(spec || "");

  return (
    <div
      className="inline-grid"
      style={{ gridTemplateColumns: `repeat(13, 1fr)` }}
    >
      {R.map((r1, i) =>
        R.map((r2, j) => {
          const diagonal = i === j;
          // matrix code for this cell
          const code = diagonal
            ? r1 + r1
            : i < j
            ? r1 + r2 + "s" // upper = suited
            : r2 + r1 + "o"; // lower = offsuit

          const isEmph = emph.has(code);
          const isBase = base.has(code) || isEmph;

          return (
            <div
              key={r1 + r2}
              className={[
                "w-8 h-8 grid place-items-center border border-foreground/20 text-[10px] rounded",
                isEmph
                  ? "bg-foreground/40 text-background font-semibold"
                  : isBase
                  ? "bg-foreground/20 font-semibold"
                  : "bg-background",
              ].join(" ")}
              title={code}
            >
              {diagonal ? r1 + r1 : i < j ? r1 + r2 + "s" : r2 + r1 + "o"}
            </div>
          );
        })
      )}
    </div>
  );
}
