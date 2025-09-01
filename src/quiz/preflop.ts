// src/quiz/preflop.ts
// Types + helpers for the Preflop Trainer MVP.

import {
  type TableState,
  type SeatPos,
  createDefaultState,
  postBlinds,
  callToTotal,
} from "@/engine/table";

/** Range preset (PokerStove-like) */
export type RangePreset = {
  id: string;
  label: string;
  range: string; // e.g. "22+,A5s+,KTs+,QTs+,JTs,ATo+,KQo"
};

/** Preflop action prior to hero's decision */
export type PreAction =
  | { seat: SeatPos; type: "raise_to"; bb: number }
  | { seat: SeatPos; type: "call" }
  | { seat: SeatPos; type: "fold" };

/** What the correct solution expects (MVP) */
export type Solution =
  | { action: "fold" }
  | { action: "call";    mix?: { raise_to?: number; raise_freq_pct?: number } } // allow 3-bet mix
  | { action: "raise_to"; bb: number; mix?: { call_freq_pct?: number } };        // allow call mix

export type Scenario = {
  id: string;
  hero: { seat: SeatPos; cards?: string }; // cards are optional placeholder
  pre_actions: PreAction[];
  ranges?: Array<{ seat: SeatPos; preset?: string; range?: string }>;
  metrics?: {
    pot_before?: number;
    to_call?: number;
    pot_odds_threshold_pct?: number;
    mdf_pct?: number;
  };
  solution: Solution;
  allowed_bets?: number[]; // UI raise buttons
  comment?: string;
  tags?: string[];
  difficulty?: "easy" | "medium" | "hard";
};

export type PreflopPack = {
  version: string;
  meta?: { name?: string; author?: string; game?: string };
  blind_config?: { sb?: number; bb?: number; ante?: number };
  effective_bb?: number;
  range_presets?: RangePreset[];
  scenarios: Scenario[];
};

export type UserAnswer =
  | { action: "fold" }
  | { action: "call" }
  | { action: "raise_to"; bb?: number };

export type Verdict = { kind: "correct" | "partial" | "wrong"; note?: string };

function maxContrib(s: TableState): number {
  const vals = Object.values(s.contribs);
  return vals.length ? Math.max(...vals.map((v) => v || 0)) : 0;
}

/** Build a table state for visualizing a scenario (preflop before hero acts). */
export function buildStateFromScenario(pack: PreflopPack, sc: Scenario): TableState {
  const sb = pack.blind_config?.sb ?? 0.5;
  const bb = pack.blind_config?.bb ?? 1.0;

  const s = createDefaultState(sc.hero.seat);
  s.dealerSeat = "BTN";
  s.blinds = { sb, bb };
  postBlinds(s); // SB, BB

  // Apply pre-actions in order. We normalize raises to "callToTotal".
  for (const a of sc.pre_actions) {
    if (a.type === "fold") continue;
    if (a.type === "raise_to") {
      callToTotal(s, a.seat, a.bb);
      continue;
    }
    if (a.type === "call") {
      const target = maxContrib(s);
      if (target > 0) callToTotal(s, a.seat, target);
    }
  }
  return s;
}

/** Evaluate user's answer against the scenario's solution (MVP rules). */
export function evaluateAnswer(sc: Scenario, ua: UserAnswer): Verdict {
  const sol = sc.solution;

  switch (sol.action) {
    case "fold": {
      return { kind: ua.action === "fold" ? "correct" : "wrong" };
    }

    case "call": {
      if (ua.action === "call") return { kind: "correct" };
      // partially ok if solution allows a 3-bet mix
      if (ua.action === "raise_to" && sol.mix?.raise_to)
        return { kind: "partial", note: "Mix: sometimes 3-bet allowed" };
      return { kind: "wrong" };
    }

    case "raise_to": {
      if (ua.action === "raise_to") {
        // (optionally compare sizes with tolerance here)
        return { kind: "correct" };
      }
      // partially ok if solution allows call mix
      if (ua.action === "call" && sol.mix?.call_freq_pct)
        return { kind: "partial", note: "Mix: sometimes call allowed" };
      return { kind: "wrong" };
    }
  }
}

/** Normalize unknown input into PreflopPack; throws on invalid. */
export function normalizePack(input: unknown): PreflopPack {
  const x = input as PreflopPack;
  if (!x || typeof x !== "object") throw new Error("Invalid pack: not an object");
  if (!Array.isArray(x.scenarios)) throw new Error("Invalid pack: scenarios[] required");
  return {
    version: x.version || "1.0",
    meta: x.meta || {},
    blind_config: x.blind_config || { sb: 0.5, bb: 1.0, ante: 0 },
    effective_bb: x.effective_bb ?? 100,
    range_presets: x.range_presets || [],
    scenarios: x.scenarios,
  };
}
