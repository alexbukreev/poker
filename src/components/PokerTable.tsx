// src/components/PokerTable.tsx
export type SeatPos = "UTG" | "HJ" | "CO" | "BTN" | "SB" | "BB";
export type Contribs = Partial<Record<SeatPos, number>>;

export interface PokerTableProps {
  heroSeat: SeatPos;                     // логическая позиция героя; визуально всегда снизу-справа
  stacks: Record<SeatPos, number>;       // базовые стеки
  contribs?: Contribs;                   // любые вложения (блайнд/колл/рейз) — один бейдж на место
  dealerSeat?: SeatPos;                  // реальный BTN (для "D")
  pot?: number | null;                   // опционально; иначе = сумма contribs
  heroCards?: string | null;             // плейсхолдер карт
}

/** Геометрия стола (визуальные координаты) */
const ORDER: SeatPos[] = ["HJ", "CO", "BTN", "SB", "BB", "UTG"];
const COORDS: Record<SeatPos, { left: string; top: string }> = {
  BTN: { left: "68%", top: "8%"  },
  SB:  { left: "91%", top: "48%" },
  BB:  { left: "68%", top: "78%" },
  UTG: { left: "28%", top: "78%" },
  HJ:  { left: "8%",  top: "48%" },
  CO:  { left: "28%", top: "8%"  },
};
const HERO_ANCHOR: SeatPos = "BB";

/** ⬇️ ВОТ ТУТ РУКАМИ ДВИЖЕШЬ ПЛАШКИ.
 *  dx/dy — пиксели от центра фишки ( +x вправо, +y вниз ).
 *  По умолчанию тяну их к центру стола. Меняй как нужно. */
export const BADGE_OFFSET_VEC: Record<SeatPos, { dx: number; dy: number }> = {
  CO:  { dx: 0,  dy: 50 },   // верх-лево → вниз
  BTN: { dx: 0,  dy: 50 },   // верх-право → вниз
  SB:  { dx: -40, dy: -10 },   // правый → влево
  BB:  { dx: 0,  dy: -60 },  // низ-право → вверх
  UTG: { dx: 0,  dy: -60 },  // низ-лево → вверх
  HJ:  { dx: 40, dy: -10 },    // левый → вправо
};

function rotate(hero: SeatPos) {
  const idx = ORDER.indexOf(hero);
  const anchorIdx = ORDER.indexOf(HERO_ANCHOR);
  const shift = (anchorIdx - idx + ORDER.length) % ORDER.length;
  const map = new Map<SeatPos, SeatPos>();
  ORDER.forEach((s, i) => map.set(s, ORDER[(i + shift) % ORDER.length]));
  return map; // logical -> visual
}

function numberStr(n: number) {
  return Math.abs(n % 1) < 1e-6 ? String(Math.round(n)) : n.toFixed(1);
}

function Seat({
  label, coord, active, stack, contributed = 0, heroCards,
}: {
  label: SeatPos; coord: SeatPos; active?: boolean;
  stack: number; contributed?: number; heroCards?: string | null;
}) {
  const behind = Math.max(0, Math.round((stack - contributed) * 10) / 10);
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
      style={{ left: COORDS[coord].left, top: COORDS[coord].top }}
    >
      <div
        className={
          "flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold " +
          (active ? "bg-white text-black border-white"
                  : "bg-transparent text-white/70 border-white/30")
        }
      >
        {label}
      </div>
      {/* стек (без bb) */}
      <div className="mt-1 text-center text-xs text-white/70">{numberStr(behind)}</div>
      {active && heroCards ? (
        <div className="mt-1 text-center text-xs font-semibold text-white">{heroCards}</div>
      ) : null}
    </div>
  );
}

function Dealer({ coordNear }: { coordNear: SeatPos }) {
  const c = COORDS[coordNear];
  return (
    <div
      className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white text-[10px] font-bold text-black"
      style={{ left: `calc(${c.left} - 25px)`, top: `calc(${c.top} + 10px)` }}
    >
      <div className="grid h-full w-full place-content-center">D</div>
    </div>
  );
}

export default function PokerTable({
  heroSeat,
  stacks,
  contribs = {},
  dealerSeat = "BTN",
  pot = null,
  heroCards = null,
  onRandom,
}: PokerTableProps) {
  const map = rotate(heroSeat);
  const coordOf = (s: SeatPos) => map.get(s)!;

  const potNow =
    pot ??
    Object.values(contribs).reduce((acc, v) => acc + (typeof v === "number" ? v : 0), 0);

  return (
    <div className="relative mx-auto h-[440px] w-full max-w-[720px] text-white">
      {/* стол */}
      <div className="absolute inset-0 rounded-[999px] border border-white/15 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)_inset]" />
      <div className="absolute inset-[6%] rounded-[999px] border border-white/10" />

      {/* сиденья */}
      {ORDER.map((seat) => (
        <Seat
          key={seat}
          label={seat}
          coord={coordOf(seat)}
          active={seat === heroSeat}
          stack={stacks[seat]}
          contributed={contribs[seat] || 0}
          heroCards={seat === heroSeat ? heroCards : null}
        />
      ))}

      {/* дилер рядом с реальным BTN */}
      <Dealer coordNear={coordOf(dealerSeat)} />

      {/* ОДИН бейдж на место: показываем только contribs */}
      {Object.entries(contribs).map(([s, v]) => {
        const seat = s as SeatPos;
        const val = Number(v || 0);
        if (val <= 0) return null;
        const coord = coordOf(seat);
        const offset = BADGE_OFFSET_VEC[coord];
        return (
          <div
            key={`contrib-${seat}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-xs"
            style={{
              left: `calc(${COORDS[coord].left} + ${offset.dx}px)`,
              top:  `calc(${COORDS[coord].top}  + ${offset.dy}px)`,
            }}
          >
            {numberStr(val)}
          </div>
        );
      })}

      {/* центр: Pot (без bb) */}
      <div className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid h-14 w-9 place-content-center rounded-md border border-white/20 bg-white/5 text-white/60">W</div>
        ))}
        <div className="col-span-5 mt-2 text-center text-xs text-white/80">
          Pot: {numberStr(potNow)}
        </div>
      </div>
    </div>
  );
}
