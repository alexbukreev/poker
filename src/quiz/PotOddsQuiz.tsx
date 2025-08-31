import { useEffect, useMemo, useState } from "react";
import type { TableState } from "@/engine/table";
import { buildPotOddsFromState } from "@/quiz/potOdds";
import { Button } from "@/components/ui/button";

// локальный форматтер: 1 знак, целые без .0
function fmt(n: number) {
  const r = Math.round(n * 10) / 10;
  return Math.abs(r - Math.round(r)) < 1e-9 ? String(Math.round(r)) : r.toFixed(1);
}

export default function PotOddsQuiz({ state }: { state: TableState }) {
  const po = useMemo(() => buildPotOddsFromState(state), [state]);
  const [value, setValue] = useState(0); // 0–100 (%)
  const [checked, setChecked] = useState<null | { correct: number; error: number }>(null);

  // новый спот — сброс ползунка и результата
  useEffect(() => {
    setValue(0);
    setChecked(null);
  }, [po.potBefore, po.toCall, po.heroSeat]);

  function onCheck() {
    const correct = Math.round(po.threshold * 10) / 10;
    const error = Math.abs(value - correct);
    setChecked({ correct, error });
  }

  const ok = checked ? checked.error <= 0.5 : false; // допуск 0.5%

  return (
    <div className="space-y-3 select-none">
      <div className="text-sm text-foreground/80">
        Pot (before decision): <b>{fmt(po.potBefore)}</b> • To call: <b>{fmt(po.toCall)}</b>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-full accent-foreground"
        aria-label="Your pot-odds answer in percent"
      />

      <div className="text-sm">
        Your answer: <b>{value.toFixed(1)}%</b>
      </div>

      <div className="pt-1">
        <Button variant="outline" onClick={onCheck}>Check</Button>
      </div>

      {checked && (
        <div className="mt-3 text-sm">
          Correct: <b>{checked.correct.toFixed(1)}%</b> • Error:{" "}
          <b className={ok ? "text-green-500" : "text-red-500"}>
            {checked.error.toFixed(1)}%
          </b>
          {ok ? " ✓" : " ✗"}
        </div>
      )}
    </div>
  );
}
