import React, { useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

/**
 * PreflopTrainer — interactive POC for a preflop quiz + quick calculators.
 *
 * v3 additions:
 *  - Hero stays bottom-right visually; logical hero seat is randomized per spot.
 *  - Quick calc spots update contributions => pot and remaining stacks change correctly.
 *  - Random hero hole cards per spot.
 *  - Two quick generators: Pot odds (BTN open) and SB steal MDF.
 */

type GWizardLink = {
  solution_type?: string;
  gmfs_solution_tab?: string;
  gametype?: string;
  depth?: number;
  gmfft_sort_key?: number;
  gmfft_sort_order?: "asc" | "desc";
  history_spot?: number;
  preflop_actions?: string;
  gmff_favorite?: boolean;
  soltab?: string;
  board?: string;
};

type SeatPos = "UTG" | "HJ" | "CO" | "BTN" | "SB" | "BB";

type Question = {
  id: string;
  spot: "RFI" | "vsOpen" | "vs3bet" | "vs4bet" | string;
  heroPos: SeatPos;
  openerPos?: SeatPos | null;
  hand?: string;
  openSize?: string;
  stacks?: string;
  rake?: string;
  options: string[];
  correct: string;
  explain?: string;
  gwizard?: GWizardLink;
};

type Scenario = {
  meta: { name: string; version: number; stakes?: string; table?: string };
  questions: Question[];
};

type Answered = { qid: string; choice: string; correct: boolean; timestamp: number };

type Stacks = Partial<Record<SeatPos, number>>;
// contributions posted to the pot per seat (bb)
type Contribs = Partial<Record<SeatPos, number>>;

const DEFAULT_SCENARIO: Scenario = {
  meta: { name: "Demo: Preflop Basics", version: 1, stakes: "NL50", table: "6max" },
  questions: [
    {
      id: "q1",
      spot: "RFI",
      heroPos: "BTN",
      options: ["Fold", "Open 2x", "Open 2.5x", "Open 3x"],
      correct: "Open 2.5x",
      explain: "BTN opens ~45–50% with 2.0–2.5x in many pools.",
      gwizard: {
        solution_type: "gwiz",
        gmfs_solution_tab: "ai_sols",
        gametype: "Cash",
        depth: 200,
        gmfft_sort_key: 0,
        gmfft_sort_order: "desc",
        history_spot: 3,
        preflop_actions: "R2.5",
        gmff_favorite: false,
        soltab: "strategy",
        board: "",
      },
    },
    {
      id: "q2",
      spot: "vsOpen",
      heroPos: "BB",
      openerPos: "BTN",
      hand: "KQo",
      openSize: "2.5x",
      options: ["Fold", "Call", "3-bet 9bb"],
      correct: "Call",
      explain: "BB defends KQo vs BTN open mostly by calling (rake dependent).",
      gwizard: {
        solution_type: "gwiz",
        gmfs_solution_tab: "ai_sols",
        gametype: "Cash",
        depth: 200,
        gmfft_sort_key: 0,
        gmfft_sort_order: "desc",
        history_spot: 3,
        preflop_actions: "R2.5-C",
        gmff_favorite: false,
        soltab: "strategy",
        board: "",
      },
    },
  ],
};

function buildGWizardURL(g: GWizardLink | undefined): string | null {
  if (!g) return null;
  const base = "https://app.gtowizard.com/solutions";
  const params = new URLSearchParams();
  if (g.solution_type) params.set("solution_type", g.solution_type);
  if (g.gmfs_solution_tab) params.set("gmfs_solution_tab", g.gmfs_solution_tab);
  if (g.gametype) params.set("gametype", g.gametype);
  if (g.depth !== undefined) params.set("depth", String(g.depth));
  if (g.gmfft_sort_key !== undefined) params.set("gmfft_sort_key", String(g.gmfft_sort_key));
  if (g.gmfft_sort_order) params.set("gmfft_sort_order", g.gmfft_sort_order);
  if (g.history_spot !== undefined) params.set("history_spot", String(g.history_spot));
  if (g.preflop_actions) params.set("preflop_actions", g.preflop_actions);
  if (g.gmff_favorite !== undefined) params.set("gmff_favorite", String(g.gmff_favorite));
  if (g.soltab) params.set("soltab", g.soltab);
  if (g.board) params.set("board", g.board);
  return `${base}?${params.toString()}`;
}

const SEATS: SeatPos[] = ["HJ", "CO", "BTN", "SB", "BB", "UTG"];

const SEAT_COORDS: Record<SeatPos, { left: string; top: string }> = {
  BTN: { left: "68%", top: "8%" },
  SB: { left: "91%", top: "40%" },
  BB: { left: "70%", top: "78%" },
  UTG: { left: "35%", top: "78%" },
  HJ: { left: "8%", top: "40%" },
  CO: { left: "28%", top: "8%" },
};

function Seat({
  pos,
  active,
  villain,
  stack,
  contrib = 0,
  heroCards,
}: {
  pos: SeatPos;
  active?: boolean;
  villain?: boolean;
  stack?: number; // base stack (bb)
  contrib?: number; // contributed to pot
  heroCards?: string | null; // e.g. "A♠ K♦"
}) {
  const behind = stack !== undefined ? Math.max(0, Math.round((stack - (contrib || 0)) * 10) / 10) : undefined;
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 select-none transition-transform"
      style={{ left: SEAT_COORDS[pos].left, top: SEAT_COORDS[pos].top }}
    >
      <div
        className={
          `flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold shadow-sm ` +
          (active
            ? "bg-white text-black border-white"
            : villain
            ? "bg-transparent text-white border-white/50"
            : "bg-transparent text-white/70 border-white/30")
        }
      >
        {pos}
      </div>
      <div className="mt-1 text-center text-xs text-white/70">{behind !== undefined ? `${behind}bb` : ""}</div>
      {active && heroCards ? (
        <div className="mt-1 text-center text-xs font-semibold text-white">{heroCards}</div>
      ) : null}
    </div>
  );
}

function DealerButton({ near }: { near: SeatPos }) {
  const btn = SEAT_COORDS[near] || SEAT_COORDS["BTN"];
  return (
    <div
      className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white text-[10px] font-bold text-black"
      style={{ left: `calc(${btn.left} - 20px)`, top: `calc(${btn.top} + 16px)` }}
    >
      <div className="grid h-full w-full place-content-center">D</div>
    </div>
  );
}

// ---------- helpers ----------
function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randHand(): string {
  const ranks = ["A","K","Q","J","T","9","8","7","6","5","4","3","2"];
  const suits = ["♠","♥","♦","♣"];
  const c1 = `${randItem(ranks)}${randItem(suits)}`;
  let c2 = `${randItem(ranks)}${randItem(suits)}`;
  if (c1 === c2) c2 = `${randItem(ranks)}${randItem(suits)}`;
  return `${c1} ${c2}`;
}
function round1(x: number): number { return Math.round(x * 10) / 10; }

// ---------- component ----------

export default function PreflopTrainer() {
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Answered[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [mode, setMode] = useState<"quiz" | "quick">("quick");

  // hero anchor logic: hero always renders at bottom-right (BB coord)
  const HERO_ANCHOR: SeatPos = "BB";
  const [heroPos, setHeroPos] = useState<SeatPos>("BB"); // logical seat

  // stacks and blinds
  const [stacks] = useState<Stacks>({ BTN: 100, SB: 100, BB: 100, CO: 100, HJ: 100, UTG: 100 });
  const [blinds] = useState({ sb: 0.5, bb: 1 });

  // rotate table so heroPos maps to HERO_ANCHOR coords
  function rotatedSeats(): Array<{ seat: SeatPos; coord: SeatPos }> {
    const order: SeatPos[] = ["HJ", "CO", "BTN", "SB", "BB", "UTG"]; // clockwise
    const heroIdx = order.indexOf(heroPos);
    const anchorIdx = order.indexOf(HERO_ANCHOR);
    const shift = (anchorIdx - heroIdx + order.length) % order.length;
    return order.map((_, i) => ({ seat: order[i], coord: order[(i + shift) % order.length] }));
  }

  // overlays for current spot
  type Overlay = { potBefore?: number; callSize?: number; opener?: SeatPos | null; openSize?: number; contribs?: Contribs };
  const [overlay, setOverlay] = useState<Overlay>({ potBefore: 0, callSize: 0, opener: null, openSize: 0, contribs: {} });

  const [heroCards, setHeroCards] = useState<string>(randHand());

  // file handling
  const inputRef = useRef<HTMLInputElement | null>(null);
  const current = scenario.questions[qIndex];
  const progress = Math.round(((qIndex) / scenario.questions.length) * 100);
  const accuracy = useMemo(() => {
    if (!answers.length) return 0; const ok = answers.filter((a) => a.correct).length; return Math.round((ok / answers.length) * 100);
  }, [answers]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed?.meta && Array.isArray(parsed?.questions)) { setScenario(parsed); setQIndex(0); setAnswers([]); setShowSolution(false); setMode("quiz"); }
        else { alert("Invalid scenario file structure."); }
      } catch { alert("Failed to parse JSON."); }
      if (inputRef.current) inputRef.current.value = "";
    };
    reader.readAsText(f);
  }

  function pick(choice: string) {
    if (!current) return; const correct = choice === current.correct;
    setAnswers((prev) => [...prev, { qid: current.id, choice, correct, timestamp: Date.now() }]); setShowSolution(true);
  }
  const next = () => { setShowSolution(false); setQIndex((i) => Math.min(i + 1, scenario.questions.length - 1)); };
  const prev = () => { setShowSolution(false); setQIndex((i) => Math.max(i - 1, 0)); };
  const resetQuiz = () => { setAnswers([]); setQIndex(0); setShowSolution(false); };

  function exportResults() {
    const payload = { scenario: scenario.meta, answers };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${scenario.meta.name.replace(/\s+/g, "_")}_results.json`; a.click(); URL.revokeObjectURL(url);
  }

  const gLink = buildGWizardURL(current?.gwizard);

  // ===== Quick calculators =====
  type QuickQ = {
    id: string; kind: "potodds" | "mdf"; text: string; options: string[]; correct: string;
    meta?: { hero: SeatPos; opener?: SeatPos | null; potBefore?: number; callSize?: number; openSize?: number };
  };

  function calcPotOddsThreshold(call: number, potBefore: number): number { const b = call / potBefore; return (b / (1 + b)) * 100; }
  function calcMDFvsSB(raiseSize: number): number { const potBefore = 1.5; const risk = raiseSize - 0.5; return (potBefore / (potBefore + risk)) * 100; }
  function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => (Math.random() > 0.5 ? 1 : -1)); }

  function genPotOddsQuestion(): QuickQ {
    // Randomize hero seat (visual stays bottom-right). Opener is BTN.
    const seats: SeatPos[] = ["UTG","HJ","CO","BTN","SB","BB"];
    const hero = randItem(seats);
    const opener: SeatPos = "BTN";
    const openSizes = [2.0, 2.2, 2.5, 3.0];
    const x = randItem(openSizes);

    const potBefore = 0.5 + 1 + x; // SB + BB + BTN open
    const call = x - 1; // BB call to close

    return {
      id: `po-${x}-${hero}`,
      kind: "potodds",
      text: `BB vs BTN open ${x}x. Pot before decision = ${round1(potBefore)}bb, call = ${round1(call)}bb. What is the minimum equity threshold?`,
      options: shuffle([-4,-2,0,2].map((d) => `${round1((calcPotOddsThreshold(call, potBefore)) + d)}%`)),
      correct: `${round1(calcPotOddsThreshold(call, potBefore))}%`,
      meta: { hero, opener, potBefore, callSize: call, openSize: x },
    };
  }

  function genMDFQuestion(): QuickQ {
    const seats: SeatPos[] = ["UTG","HJ","CO","BTN","SB","BB"];
    const hero = randItem(seats);
    const opener: SeatPos = "SB";
    const sizes = [2.0, 2.2, 2.5, 3.0];
    const x = randItem(sizes);
    const thr = round1(calcMDFvsSB(x));

    return {
      id: `mdf-${x}-${hero}`,
      kind: "mdf",
      text: `SB steals to ${x}x (SB=0.5, BB=1). What is BB's MDF?`,
      options: shuffle([-6,-3,0,3].map((d) => `${round1(thr + d)}%`)),
      correct: `${thr}%`,
      meta: { hero, opener, potBefore: 1.5, callSize: 1.0, openSize: x },
    };
  }

  const [quickQ, setQuickQ] = useState<QuickQ | null>(null);
  const [quickAnswer, setQuickAnswer] = useState<string | null>(null);

  function newQuick(kind: "potodds" | "mdf") {
    const q = kind === "potodds" ? genPotOddsQuestion() : genMDFQuestion();
    setQuickAnswer(null); setQuickQ(q);
    setHeroPos(q.meta?.hero ?? "BB");
    setHeroCards(randHand());

    // Build contributions used for visual stacks and pot Now
    let contribs: Contribs = {};
    if (q.kind === "potodds") {
      // SB 0.5, BB 1, BTN open to X
      contribs = { SB: 0.5, BB: 1, BTN: q.meta?.openSize };
      setOverlay({ potBefore: q.meta?.potBefore, callSize: q.meta?.callSize, opener: "BTN", openSize: q.meta?.openSize, contribs });
    } else {
      // SB steal to X, BB 1 posted
      contribs = { SB: q.meta?.openSize, BB: 1 };
      // For display we show current pot (1 + X) and note
      setOverlay({ potBefore: 1.5, callSize: 1, opener: "SB", openSize: q.meta?.openSize, contribs });
    }
  }

  function pickQuick(choice: string) { setQuickAnswer(choice); }

  // contribution badges aligned with rotated seats
  function ContributionBadges() {
    const map = rotatedSeats();
    const sbCoord = map.find((r) => r.seat === "SB")!.coord;
    const bbCoord = map.find((r) => r.seat === "BB")!.coord;
    const openerCoord = overlay.opener ? map.find((r) => r.seat === overlay.opener)!.coord : null;
    return (
      <>
        <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white" style={{ left: `calc(${SEAT_COORDS[sbCoord].left} - 26px)`, top: `calc(${SEAT_COORDS[sbCoord].top} + 26px)` }}>SB {blinds.sb}</div>
        <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white" style={{ left: `calc(${SEAT_COORDS[bbCoord].left} + 26px)`, top: `calc(${SEAT_COORDS[bbCoord].top} + 26px)` }}>BB {blinds.bb}</div>
        {openerCoord && overlay.openSize ? (
          <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white" style={{ left: SEAT_COORDS[openerCoord].left, top: `calc(${SEAT_COORDS[openerCoord].top} + 34px)` }}>{overlay.openSize}x</div>
        ) : null}
      </>
    );
  }

  // helpers for current pot and seat contribs
  const contribs = overlay.contribs || {};
  const potNow = Object.values(contribs).reduce((s, v) => s + (v || 0), 0);

  return (
    <div className="mx-auto max-w-[980px] p-4 text-white">
      {/* top bar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-white text-black">{scenario.meta.table || "6max"}</Badge>
          <Badge variant="outline" className="border-white/40 text-white/80">{scenario.meta.stakes || "NL"}</Badge>
          <Badge variant="outline" className="border-white/40 text-white/80">v{scenario.meta.version}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="file" accept="application/json" onChange={onFile} className="hidden" />
          <Button variant="secondary" onClick={() => inputRef.current?.click()}>Load scenario (.json)</Button>
          <Button variant="outline" onClick={resetQuiz} className="border-white/30 text-white">Reset</Button>
          <Button onClick={exportResults}>Export results</Button>
        </div>
      </div>

      {/* mode switch */}
      <div className="mb-3 flex gap-2">
        <Button variant={mode === "quiz" ? "default" : "secondary"} onClick={() => setMode("quiz")}>Quiz mode</Button>
        <Button variant={mode === "quick" ? "default" : "secondary"} onClick={() => setMode("quick")}>Quick calc</Button>
      </div>

      {/* rotated table */}
      <div className="relative mx-auto h-[440px] w-full max-w-[720px]">
        <div className="absolute inset-0 rounded-[999px] border border-white/15 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)_inset]" />
        <div className="absolute inset-[6%] rounded-[999px] border border-white/10" />
        {rotatedSeats().map(({ seat, coord }) => (
          <Seat key={seat} pos={coord} active={seat === heroPos} villain={seat === (quickQ?.meta?.opener ?? current?.openerPos ?? undefined)} stack={stacks[seat]} contrib={contribs[seat] || 0} heroCards={seat === heroPos ? heroCards : null} />
        ))}
        <DealerButton near={rotatedSeats().find((r) => r.seat === "BTN")!.coord} />
        <ContributionBadges />
        {/* board + pot/call */}
        <div className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid h-14 w-9 place-content-center rounded-md border border-white/20 bg-white/5 text-white/60">W</div>
          ))}
          <div className="col-span-5 mt-2 text-center text-xs text-white/80">
            Pot: {round1(potNow)} bb {overlay.callSize ? `• Call: ${round1(overlay.callSize)} bb` : ""}
          </div>
        </div>
      </div>

      {mode === "quiz" ? (
        <Card className="mt-5 border-white/10 bg-white/5 text-white">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm text-white/70">Question {qIndex + 1} / {scenario.questions.length}</div>
              <div className="flex items-center gap-4">
                <div className="w-40"><Progress value={progress} /></div>
                <Badge className="bg-white text-black">Accuracy: {accuracy}%</Badge>
              </div>
            </div>
            <Separator className="mb-4 bg-white/10" />

            {current ? (
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <div className="mb-2 text-xl font-semibold">{current.spot} — {current.heroPos}</div>
                  <div className="text-sm text-white/80">
                    {current.openerPos ? (<span>Opener: <b>{current.openerPos}</b>. </span>) : null}
                    {current.openSize ? (<span>Open size: <b>{current.openSize}</b>. </span>) : null}
                    {current.stacks ? (<span>Stacks: <b>{current.stacks}</b>. </span>) : <span>Stacks: <b>100bb</b>. </span>}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {current.options.map((opt) => (<Button key={opt} onClick={() => pick(opt)} disabled={showSolution}>{opt}</Button>))}
                  </div>

                  {showSolution && (
                    <div className="mt-4 rounded-md border border-white/15 bg-white/5 p-3">
                      <div className="font-semibold">Correct answer: {current.correct}</div>
                      {current.explain ? (<div className="mt-1 text-sm text-white/80">{current.explain}</div>) : null}
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  {gLink ? (<a href={gLink} target="_blank" rel="noreferrer"><Button variant="secondary" className="w-full">Open in GTO Wizard</Button></a>) : (<Button variant="secondary" className="w-full" disabled>GTO Wizard link unavailable</Button>)}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-white/30 text-white" onClick={prev} disabled={qIndex === 0}>Prev</Button>
                    <Button className="flex-1" onClick={next} disabled={qIndex >= scenario.questions.length - 1}>Next</Button>
                  </div>
                </div>
              </div>
            ) : (<div>No questions available.</div>)}
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-5 border-white/10 bg-white/5 text-white">
          <CardContent className="p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Button onClick={() => newQuick("potodds")}>New: Pot odds</Button>
              <Button onClick={() => newQuick("mdf")}>New: SB steal MDF</Button>
            </div>
            {quickQ ? (
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <div className="mb-2 text-xl font-semibold">{quickQ.kind === "potodds" ? "Pot odds threshold" : "BB MDF vs SB"}</div>
                  <div className="text-sm text-white/80">{quickQ.text}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {quickQ.options.map((opt) => (<Button key={opt} onClick={() => pickQuick(opt)} disabled={!!quickAnswer}>{opt}</Button>))}
                  </div>
                  {quickAnswer && (
                    <div className="mt-4 rounded-md border border-white/15 bg-white/5 p-3">
                      <div className="font-semibold">Correct: {quickQ.correct}</div>
                      <div className="text-sm text-white/80">Your answer: {quickAnswer} {quickAnswer === quickQ.correct ? "✓" : "✗"}</div>
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Button variant="secondary" onClick={() => newQuick(quickQ.kind)}>Next random</Button>
                </div>
              </div>
            ) : (
              <div className="text-white/80">Choose a calculator above to generate a random training question. The table reflects each spot: hero bottom-right, blinds/opener, and current pot + call.</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* JSON schema helper */}
      <Card className="mt-5 border-white/10 bg-white/5 text-white">
        <CardContent className="p-4">
          <div className="mb-2 text-lg font-semibold">Scenario file format (JSON)</div>
          <pre className="overflow-auto rounded-md border border-white/10 bg-black/40 p-3 text-xs leading-relaxed text-white/80">{`{\n  "meta": { "name": "Your Scenario Name", "version": 1, "stakes": "NL50", "table": "6max" },\n  "questions": [\n    {\n      "id": "q1",\n      "spot": "RFI",\n      "heroPos": "BTN",\n      "options": ["Fold", "Open 2x", "Open 2.5x", "Open 3x"],\n      "correct": "Open 2.5x"\n    }\n  ]\n}`}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
