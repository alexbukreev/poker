// src/quiz/PotOddsQuiz.txt
import { useEffect, useMemo, useState } from "react";
import type { TableState } from "@/engine/table";
import { buildPotOddsFromState } from "@/quiz/potOdds";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePrefs } from "@/state/prefs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 1 знак, целые без .0
function fmt(n: number) {
  const r = Math.round(n * 10) / 10;
  return Math.abs(r - Math.round(r)) < 1e-9 ? String(Math.round(r)) : r.toFixed(1);
}

type Props = {
  state: TableState;
  onNewSpot: () => void;
  stats: number[];                 // ← приходит сверху (App)
  onAddStat: (err: number) => void;
  onResetStats: () => void;
};

export default function PotOddsQuiz({
  state,
  onNewSpot,
  stats,
  onAddStat,
  onResetStats,
}: Props) {
  const po = useMemo(() => buildPotOddsFromState(state), [state]);
  const [value, setValue] = useState(0); // 0–100 (%)
  const [checked, setChecked] = useState<null | { correct: number; error: number }>(null);

  const { errorTol } = usePrefs();

  // новый спот — сброс ползунка/результата, статистика хранится в App
  useEffect(() => {
    setValue(0);
    setChecked(null);
  }, [po.potBefore, po.toCall, po.heroSeat]);

  function onCheck() {
    const correct = Math.round(po.threshold * 10) / 10;
    const error = Math.abs(value - correct);
    setChecked({ correct, error });
    onAddStat(Number(error.toFixed(1)));  // ← пишем в App
  }

  const ok = checked ? checked.error <= errorTol : false;

  // цветные точки по порогу из преференсов
  const Dot = (props: any) => {
    const { cx, cy, value, payload } = props;
    const err = typeof value === "number" ? value : payload?.err;
    const good = err <= errorTol;
    return <circle cx={cx} cy={cy} r={2.5} className={good ? "fill-green-500" : "fill-red-500"} />;
  };
  const ActiveDot = (props: any) => {
    const { cx, cy, value, payload } = props;
    const err = typeof value === "number" ? value : payload?.err;
    const good = err <= errorTol;
    return <circle cx={cx} cy={cy} r={3.5} className={good ? "fill-green-500" : "fill-red-500"} />;
  };

  // агрегаты
  const avg = stats.length > 0 ? stats.reduce((a, b) => a + b, 0) / stats.length : 0;
  const best = stats.length > 0 ? Math.min(...stats) : null;
  const chartData = stats.map((err, i) => ({ i: i + 1, err }));

  // точная подстройка
  const STEP = 0.1;
  const clamp01 = (x: number) => Math.max(0, Math.min(100, x));
  const nudge = (d: number) => setValue((p) => Number(clamp01(p + d).toFixed(1)));

  return (
    <div className="space-y-3 select-none">
      <div className="text-sm text-foreground/80">
        Pot (before decision): <b>{fmt(po.potBefore)}</b> • To call: <b>{fmt(po.toCall)}</b>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-sm text-foreground/80">
          <span>Your answer</span>
          <span className="text-foreground font-semibold">{value.toFixed(1)}%</span>
        </div>
        <Slider
          value={[value]}
          min={0}
          max={100}
          step={0.1}
          onValueChange={(v) => setValue(v[0] ?? value)}
          className="w-full"
          aria-label="Your pot-odds answer in percent"
        />
      </div>

      <div className="pt-1 flex items-center gap-2">
        <Button variant="outline" onClick={onCheck}>Check</Button>
        <Button variant="outline" onClick={onNewSpot}>Generate spot</Button>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => nudge(-STEP)} aria-label="Decrease by 0.1%">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => nudge(+STEP)} aria-label="Increase by 0.1%">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {checked && (
        <div className="mt-3 text-sm">
          Correct: <b>{checked.correct.toFixed(1)}%</b> • Error:{" "}
          <b className={ok ? "text-green-500" : "text-red-500"}>{checked.error.toFixed(1)}%</b>
          {ok ? " ✓" : " ✗"}
        </div>
      )}

      {stats.length > 0 && (
        <div className="mt-2 space-y-2">
          <div className="text-xs text-foreground/70">
            Attempts: <b className="text-foreground">{stats.length}</b>
            {" • "}Avg error:{" "}
            <b className={avg <= errorTol ? "text-green-500" : "text-foreground"}>
              {avg.toFixed(1)}%
            </b>
            {best !== null && (
              <>
                {" • "}Best: <b className="text-foreground">{best.toFixed(1)}%</b>
              </>
            )}
          </div>

          <div className="h-36 text-foreground">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: 40, right: 5, top: 0, bottom: -10 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="i" tickLine={false} axisLine={false} tickMargin={0} tick={{ fontSize: 10, fill: "currentColor" }} />
                <YAxis
                  domain={[0, "dataMax + 1"]}
                  tickLine={false}
                  axisLine={false}
                  mirror
                  width={1}
                  tickMargin={-40}
                  tick={{ fontSize: 10, fill: "currentColor" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(v) => [`${v}%`, "Error"]}
                  labelFormatter={(l) => `Attempt ${l}`}
                />
                <Line type="monotone" dataKey="err" stroke="hsl(var(--foreground))" strokeWidth={2} dot={<Dot />} activeDot={<ActiveDot />} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={onResetStats}>
              Reset session
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
