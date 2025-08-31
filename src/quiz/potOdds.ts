import { computePot, type TableState } from "@/engine/table";

/** Порог эквити (в %, одна десятая) по формуле b/(1+b), где b = call/potBefore */
export function potOddsThreshold(callAmount: number, potBefore: number): number {
  const b = potBefore > 0 ? callAmount / potBefore : 0;
  return Math.round((b / (1 + b)) * 1000) / 10; // одна десятая процента
}

/** Достаём pot ДО решения и "сколько доплатить" для героя из TableState */
export function buildPotOddsFromState(state: TableState) {
  const potBefore = computePot(state);
  const hero = state.heroSeat;
  const myPut = state.contribs[hero] ?? 0;

  const maxPut = Math.max(0, ...Object.values(state.contribs).map((v) => v ?? 0));
  const toCall = Math.max(0, maxPut - myPut);

  const threshold = potOddsThreshold(toCall, potBefore);
  return { potBefore, toCall, threshold, heroSeat: hero };
}
