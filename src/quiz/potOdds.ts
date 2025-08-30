// src/quiz/ptOdds.ts
import { computePot, type TableState, type SeatPos } from "@/engine/table";

/** Порог эквити (в %, одна десятая) по формуле b/(1+b), где b = call/potBefore */
export function potOddsThreshold(callAmount: number, potBefore: number): number {
  const b = callAmount / potBefore;
  return Math.round((b / (1 + b)) * 1000) / 10;
}

/** Достаём из стола пот ДО решения и «сколько доплатить» для конкретного игрока */
export function buildPotOddsFromState(state: TableState, forSeat: SeatPos) {
  const potBefore = computePot(state);
  const myPut = state.contribs[forSeat] ?? 0;
  const maxPut = Math.max(...Object.values(state.contribs).map(v => v ?? 0), 0);
  const toCall = Math.max(0, maxPut - myPut);
  const threshold = potOddsThreshold(toCall, potBefore);
  return { potBefore, toCall, threshold };
}
