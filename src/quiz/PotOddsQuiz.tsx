// src/quiz/PotOddsQuiz.tsx
import { useEffect, useMemo, useState } from "react";
import type { TableState } from "@/engine/table";
import { buildPotOddsFromState } from "@/quiz/potOdds";

const ANCHORS = [
  { label: "¼", value: 20.0 },
  { label: "⅓", value: 25.0 },
  { label: "½", value: 33.3 },
  { label: "⅔", value: 40.0 },
  { label: "¾", value: 42.9 },
  { label: "1×", value: 50.0 },
  { label: "1.5×", value: 60.0 },
];
const SNAP_EPS = 0.6;

export default function PotOddsQuiz({ state }: { state: TableState }) {
  const hero = state.heroSeat;
  const { potBefore, toCall, threshold } = useMemo(
    () => buildPotOddsFromState(state, hero), [state, hero]
  );

  const [guess, setGuess] = useState(0);
  const [checked, setChecked] = useState(false);
  useEffect(() => { setGuess(0); setChecked(false); }, [state]);

  const snapNow = () =>
    setGuess(g => {
      let best = ANCHORS[0].value, d = Math.abs(g - best);
      for (const a of ANCHORS) { const dd = Math.abs(g - a.value); if (dd < d) { d = dd; best = a.value; } }
      return d <= SNAP_EPS ? best : g;
    });

  const err = Math.abs(guess - threshold);
  const ok = err <= 0.5;

  return (
    <div className="w-72 text-white">
      {/* без собственного заголовка; только факты */}
      <div className="text-sm text-white/80">
        Pot (before decision): <b className="text-white">{potBefore % 1 ? potBefore.toFixed(1) : potBefore}</b>
        {" • "}
        To call: <b className="text-white">{toCall % 1 ? toCall.toFixed(1) : toCall}</b>
      </div>

      <div className="mt-3">
        <input
          type="range" min={0} max={100} step={0.1} value={guess}
          onChange={(e) => { setGuess(parseFloat(e.target.value)); setChecked(false); }}
          onMouseUp={snapNow} onTouchEnd={snapNow}
          className="w-full"
        />
        <div className="mt-1 text-sm">
          Your answer: <b>{guess.toFixed(1)}%</b>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {ANCHORS.map(a => (
            <button
              key={a.label}
              className="rounded-md border border-white/25 bg-white/10 px-3 py-1 text-base font-semibold"
              title={`${a.label} → ${a.value.toFixed(1)}%`}
              onClick={() => { setGuess(a.value); setChecked(false); }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <button
          className="rounded-md border border-white/30 px-3 py-1"
          onClick={() => setChecked(true)}
        >
          Check
        </button>
      </div>

      {checked && (
        <div className="mt-3 text-sm">
          Correct: <b>{threshold.toFixed(1)}%</b> • Error:{" "}
          <b className={ok ? "text-green-400" : "text-red-400"}>{err.toFixed(1)}%</b>
          {ok ? " ✓" : " ✗"}
        </div>
      )}
    </div>
  );
}
