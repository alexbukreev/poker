// src/engine/generator.ts
import {
  ALL_SEATS, type SeatPos, type TableState,
  createDefaultState, postBlinds, openRaise, callToTotal,
} from "@/engine/table";

const ORDER: SeatPos[] = ["UTG", "HJ", "CO", "BTN", "SB", "BB"];
const nextSeat = (s: SeatPos) => ORDER[(ORDER.indexOf(s) + 1) % ORDER.length];

const OPEN_SIZES: Record<SeatPos, number[]> = {
  UTG: [2.0, 2.2, 2.5],
  HJ:  [2.0, 2.2, 2.5],
  CO:  [2.0, 2.2, 2.5],
  BTN: [2.0, 2.2, 2.5, 3.0],
  SB:  [2.5, 3.0, 3.5],
  BB:  [],
};

function choose<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function minNextRaiseTotal(prevTotal: number, prevPrevTotal: number) {
  return prevTotal + (prevTotal - prevPrevTotal);
}

/** Генерация префлоп-спота; можно зафиксировать героя или выбрать random */
export function generatePreflopSpot(opts?: { hero?: SeatPos | "random" }): TableState {
  const hero: SeatPos = !opts?.hero || opts.hero === "random" ? choose(ALL_SEATS) : opts.hero;

  const s = createDefaultState(hero);
  s.dealerSeat = "BTN";
  postBlinds(s); // SB=0.5, BB=1

  // сиденья ДО героя (UTG→…→BB)
  const beforeHero: SeatPos[] = [];
  let p: SeatPos = "UTG";
  while (p !== hero) { beforeHero.push(p); p = nextSeat(p); }
  const openerPool = beforeHero.filter((x) => x !== "BB");
  if (openerPool.length === 0) return s;

  // опенер и сайз
  const opener = choose(openerPool);
  const openX = choose(OPEN_SIZES[opener]);
  openRaise(s, opener, openX);

  // cold calls между опенером и героем
  p = nextSeat(opener);
  const between: SeatPos[] = [];
  while (p !== hero) { between.push(p); p = nextSeat(p); }

  for (const seat of between) {
    if (Math.random() < 0.30) callToTotal(s, seat, openX);
  }

  // возможный 3-бет
  if (between.length && Math.random() < 0.25) {
    const threeBettor = choose(between);
    const min3b = minNextRaiseTotal(openX, 1);
    const candidates = [min3b, min3b + 0.5, min3b + 1].filter((t) => t <= 12);
    callToTotal(s, threeBettor, choose(candidates));
  }

  return s;
}

/** Back-compat */
export function generateRandomPreflopSpot(): TableState {
  return generatePreflopSpot({ hero: "random" });
}
