// src/components/cards.tsx
import { cn } from "@/lib/utils";

type Suit = "s" | "h" | "d" | "c";

function suitFromChar(ch: string): Suit | null {
  const m = ch.toLowerCase();
  if (m === "s" || m === "♠") return "s";
  if (m === "h" || m === "♥") return "h";
  if (m === "d" || m === "♦") return "d";
  if (m === "c" || m === "♣") return "c";
  return null;
}

function suitGlyph(s: Suit) {
  return s === "s" ? "♠" : s === "h" ? "♥" : s === "d" ? "♦" : "♣";
}

function isRed(s: Suit) { return s === "h" || s === "d"; }

export function InlineCard({ rank, suit }: { rank: string; suit: Suit }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-semibold", isRed(suit) ? "text-red-600" : "text-foreground")}>
      <span>{rank}</span>
      <span aria-hidden>{suitGlyph(suit)}</span>
    </span>
  );
}

/** Accepts "Ks9s", "K♠ 9♠", "A♣ T♦", "AhKd" etc. */
export function InlineHand({ hand }: { hand: string | null | undefined }) {
  if (!hand) return null;

  const cleaned = hand.replace(/\s+/g, "");
  // Try pairs like "Ks9s" or "AhKd"
  const m = cleaned.match(/^([2-9TJQKA])([shdc♠♥♦♣])([2-9TJQKA])([shdc♠♥♦♣])$/i);
  if (m) {
    const r1 = m[1].toUpperCase();
    const s1 = suitFromChar(m[2])!;
    const r2 = m[3].toUpperCase();
    const s2 = suitFromChar(m[4])!;
    return (
      <span className="inline-flex items-center gap-1">
        <InlineCard rank={r1} suit={s1} />
        <InlineCard rank={r2} suit={s2} />
      </span>
    );
  }

  // Fallback: split by non-alnum boundaries and render best-effort
  const parts = hand.split(/[\s,]+/).filter(Boolean);
  return (
    <span className="inline-flex items-center gap-1">
      {parts.map((p, i) => {
        const mm = p.match(/^([2-9TJQKA])([shdc♠♥♦♣])$/i);
        if (mm) {
          const rr = mm[1].toUpperCase();
          const ss = suitFromChar(mm[2])!;
          return <InlineCard key={i} rank={rr} suit={ss} />;
        }
        return <span key={i} className="font-semibold">{p}</span>;
      })}
    </span>
  );
}
