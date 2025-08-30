// Типы
export type SeatPos = "UTG" | "HJ" | "CO" | "BTN" | "SB" | "BB";
export const ALL_SEATS: SeatPos[] = ["HJ","CO","BTN","SB","BB","UTG"];

export type Stacks = Record<SeatPos, number>;
export type Contribs = Partial<Record<SeatPos, number>>;

export type TableState = {
  heroSeat: SeatPos;                 // логическая позиция героя (PokerTable сам «крутит» стол)
  dealerSeat: SeatPos;               // где «D»
  stacks: Stacks;                    // базовые стеки
  contribs: Contribs;                // внесённые деньги (блайнды/опены/коллы…)
  blinds: { sb: number; bb: number };
};

// Создание базового стола
export function createDefaultState(hero: SeatPos = "BB"): TableState {
  return {
    heroSeat: hero,
    dealerSeat: "BTN",
    stacks: { BTN:100, SB:100, BB:100, CO:100, HJ:100, UTG:100 },
    contribs: {},
    blinds: { sb: 0.5, bb: 1 },
  };
}

// Утилиты
export function resetContribs(s: TableState) { s.contribs = {}; }

export function postBlinds(s: TableState) {
  s.contribs.SB = s.blinds.sb;
  s.contribs.BB = s.blinds.bb;
}

export function openRaise(s: TableState, opener: SeatPos, sizeX: number) {
  s.contribs[opener] = (s.contribs[opener] ?? 0) + sizeX;
}

/** Колл до общей суммы взноса targetTotal (например, до 3.0 после опена 3x) */
export function callToTotal(s: TableState, seat: SeatPos, targetTotal: number) {
  const cur = s.contribs[seat] ?? 0;
  const add = Math.max(0, targetTotal - cur);
  s.contribs[seat] = cur + add;
}

export function computePot(s: TableState): number {
  return ALL_SEATS.reduce((sum, pos) => sum + (s.contribs[pos] ?? 0), 0);
}

/** Оставшийся стек за спиной (округление до 0.1) */
export function stackBehind(s: TableState, seat: SeatPos): number {
  const left = s.stacks[seat] - (s.contribs[seat] ?? 0);
  return Math.max(0, Math.round(left * 10) / 10);
}

// Вспомогательное
export function randomSeat(): SeatPos {
  return ALL_SEATS[Math.floor(Math.random() * ALL_SEATS.length)];
}
export const round1 = (x: number) => Math.round(x * 10) / 10;

export function randomSeatExcept(except: SeatPos): SeatPos {
    const pool = ALL_SEATS.filter((s) => s !== except);
    return pool[Math.floor(Math.random() * pool.length)];
}
