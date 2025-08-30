// src/engine/deck.ts
import type { SeatPos } from "@/components/PokerTable";

// ----- базовые типы -----
export type Suit = "s" | "h" | "d" | "c";         // spades/hearts/diamonds/clubs
export type Rank = "2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"T"|"J"|"Q"|"K"|"A";

export type Card = { r: Rank; s: Suit };          // { r: "A", s: "s" } — туз пики
export type CardStr = `${Rank}${Uppercase<Suit>}`; // "As","Td","Qc", ...

export function toStr(c: Card): CardStr {
  return `${c.r}${c.s.toUpperCase() as Uppercase<Suit>}`;
}
export function fromStr(cs: string): Card {
  const r = cs[0] as Rank;
  const s = cs[1]?.toLowerCase() as Suit;
  if (!"23456789TJQKA".includes(r) || !"shdc".includes(s)) {
    throw new Error(`Bad card ${cs}`);
  }
  return { r, s };
}

export const SUITS: Suit[] = ["s", "h", "d", "c"];
export const RANKS: Rank[] = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];

// pretty-строки с символами мастей
const SUIT_SYM: Record<Suit, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };
export function fmtCards(cs: Card[]): string {
  return cs.map((c) => `${c.r}${SUIT_SYM[c.s]}`).join(" ");
}

// ----- колода и случайность -----
export function makeDeck(exclude: Card[] = []): Card[] {
  const excl = new Set(exclude.map(toStr));
  const deck: Card[] = [];
  for (const r of RANKS) for (const s of SUITS) {
    const c = { r, s }; if (!excl.has(toStr(c))) deck.push(c);
  }
  return deck;
}

export function shuffle(deck: Card[], rnd: () => number = Math.random): void {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

export function draw(deck: Card[], n = 1): Card[] {
  if (deck.length < n) throw new Error("Deck exhausted");
  return deck.splice(0, n);
}

// ----- состояние сдачи -----
export type Hands = Partial<Record<SeatPos, Card[]>>;
export type Board = { flop: Card[]; turn?: Card; river?: Card };
export type DeckState = {
  deck: Card[];        // оставшиеся карты
  burned: Card[];      // сожжённые
  hands: Hands;        // карманные карты по местам
  board: Board;        // борд
};

// создать/сбросить стейт колоды; можно исключить заранее известные карты (например, фикс-руку героя)
export function createDeckState(exclude: Card[] = []): DeckState {
  const deck = makeDeck(exclude);
  shuffle(deck);
  return { deck, burned: [], hands: {}, board: { flop: [] } };
}

// задать конкретную руку (удаляет карты из колоды, проверяет уникальность)
export function setHand(ds: DeckState, seat: SeatPos, cards: Card[]): void {
  if (cards.length !== 2) throw new Error("Hand must be 2 cards preflop");
  const need = new Set(cards.map(toStr));
  // удалить из колоды (если есть)
  ds.deck = ds.deck.filter((c) => !need.has(toStr(c)));
  // проверить, что эти карты не заняты
  for (const [s, h] of Object.entries(ds.hands)) {
    const used = new Set((h ?? []).map(toStr));
    for (const cs of need) if (used.has(cs)) throw new Error(`Card ${cs} already in ${s}`);
  }
  ds.hands[seat] = cards;
}

// отдать руку если не задана — сдаёт из колоды
export function ensureHand(ds: DeckState, seat: SeatPos): Card[] {
  const have = ds.hands[seat];
  if (have && have.length === 2) return have;
  const dealt = draw(ds.deck, 2);
  ds.hands[seat] = dealt;
  return dealt;
}

// сдать флоп/тёрн/ривер с burn
export function dealFlop(ds: DeckState): Card[] {
  if (ds.board.flop.length) return ds.board.flop;
  ds.burned.push(...draw(ds.deck, 1));
  const flop = draw(ds.deck, 3);
  ds.board.flop = flop;
  return flop;
}
export function dealTurn(ds: DeckState): Card {
  if (ds.board.turn) return ds.board.turn;
  ds.burned.push(...draw(ds.deck, 1));
  const [turn] = draw(ds.deck, 1);
  ds.board.turn = turn;
  return turn;
}
export function dealRiver(ds: DeckState): Card {
  if (ds.board.river) return ds.board.river;
  ds.burned.push(...draw(ds.deck, 1));
  const [river] = draw(ds.deck, 1);
  ds.board.river = river;
  return river;
}

// удобные геттеры
export function getHand(ds: DeckState, seat: SeatPos): Card[] | undefined {
  return ds.hands[seat];
}
export function boardAll(ds: DeckState): Card[] {
  const out = [...ds.board.flop];
  if (ds.board.turn) out.push(ds.board.turn);
  if (ds.board.river) out.push(ds.board.river);
  return out;
}

// сериализация (по желанию)
export function serialize(ds: DeckState) {
  return {
    deck: ds.deck.map(toStr),
    burned: ds.burned.map(toStr),
    hands: Object.fromEntries(
      Object.entries(ds.hands).map(([s, h]) => [s, (h ?? []).map(toStr)])
    ),
    board: {
      flop: ds.board.flop.map(toStr),
      turn: ds.board.turn ? toStr(ds.board.turn) : undefined,
      river: ds.board.river ? toStr(ds.board.river) : undefined,
    },
  };
}
export function deserialize(obj: any): DeckState {
  const deck = (obj.deck ?? []).map(fromStr);
  const burned = (obj.burned ?? []).map(fromStr);
  const hands: Hands = {};
  for (const [s, arr] of Object.entries(obj.hands ?? {})) {
    hands[s as SeatPos] = (arr as string[]).map(fromStr);
  }
  const board: Board = {
    flop: (obj.board?.flop ?? []).map(fromStr),
    turn: obj.board?.turn ? fromStr(obj.board.turn) : undefined,
    river: obj.board?.river ? fromStr(obj.board.river) : undefined,
  };
  return { deck, burned, hands, board };
}
