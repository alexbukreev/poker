// src/panels/ControlsPanel.tsx
import { useEffect, useState } from "react";
import UiSection from "@/components/UiSection";
import type { TableState } from "@/engine/table";
import { Button } from "@/components/ui/button";

export default function ControlsPanel({
  state,
  pot,
  onRandom,
}: {
  state: TableState;
  pot: number;
  onRandom: () => void;
}) {
  return (
    <div className="text-foreground">
      <UiSection title="Table" defaultOpen compactTop>
        <div className="space-y-1 text-sm text-foreground/80">
          <div>
            Hero: <b className="text-foreground">{state.heroSeat}</b>
          </div>
          <div>
            Pot: <b className="text-foreground">{Math.round(pot * 10) / 10}</b>
          </div>
        </div>
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
              onClick={onRandom}
              className="w-full" // убери, если не нужна растяжка
          >
            Random spot
          </Button>
        </div>
      </UiSection>
      
      <UiSection title="Preferences" defaultOpen>
        {/* UI-муляж (без логики) */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-foreground/80">Rake</span>
          <div className="h-6 w-11 rounded-full border border-border bg-foreground/10">
            <div className="h-5 w-5 translate-x-[2px] translate-y-[2px] rounded-full bg-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-foreground/80">
            <div className="mb-1">Rake %</div>
            <input
              type="number"
              step="0.1"
              defaultValue={5.0}
              readOnly
              className="w-full rounded-md border border-border bg-background px-2 py-1 outline-none"
            />
          </label>
          <label className="text-sm text-foreground/80">
            <div className="mb-1">Cap (bb)</div>
            <input
              type="number"
              step="0.1"
              defaultValue={5.0}
              readOnly
              className="w-full rounded-md border border-border bg-background px-2 py-1 outline-none"
            />
          </label>
        </div>
      </UiSection>

      <UiSection title="Appearance" defaultOpen>
        <ThemeToggle />
      </UiSection>
    </div>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // инициализация от текущего DOM (скрипт в index.html уже мог выставить класс)
  useEffect(() => {
    if (typeof document === "undefined") return;
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function apply(mode: "dark" | "light") {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    }
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground/80">Dark theme</span>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={() => apply(isDark ? "light" : "dark")}
        className="relative h-6 w-11 rounded-full border border-border bg-foreground/10 transition-colors"
      >
        <span
          className={[
            "absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-foreground transition-transform",
            isDark ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
