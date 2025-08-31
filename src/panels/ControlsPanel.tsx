// src/panels/ControlsPanel.tsx
import { useEffect, useState } from "react";
import UiSection from "@/components/UiSection";
import type { SeatPos } from "@/engine/table";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePrefs } from "@/state/prefs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type HeroChoice = SeatPos | "random";

export default function ControlsPanel({
  pot,
  onGenerate,
  heroPref,
  onChangeHeroPref,
}: {
  pot: number;
  onGenerate: (opts: { hero: HeroChoice }) => void;
  heroPref: HeroChoice;
  onChangeHeroPref: (v: HeroChoice) => void;
}) {
  const { errorTol, setErrorTol } = usePrefs();

  return (
    <div className="text-foreground">
      <UiSection title="Table" defaultOpen compactTop>
        <div className="space-y-3 text-sm text-foreground/80">
          <label className="block">
            <div className="mb-1">Hero</div>
            <Select
              value={heroPref}
              onValueChange={(v) => onChangeHeroPref((v as HeroChoice) ?? "random")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose hero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="UTG">UTG</SelectItem>
                <SelectItem value="HJ">HJ</SelectItem>
                <SelectItem value="CO">CO</SelectItem>
                <SelectItem value="BTN">BTN</SelectItem>
                <SelectItem value="SB">SB</SelectItem>
                <SelectItem value="BB">BB</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <div>
            Pot: <b className="text-foreground">{Math.round(pot * 10) / 10}</b>
          </div>
        </div>

        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onGenerate({ hero: heroPref })}
            className="w-full"
          >
            Generate spot
          </Button>
        </div>
      </UiSection>

      <UiSection title="Preferences" defaultOpen>
        {/* ... твой блок Rake ... */}

        {/* Error tolerance */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-sm text-foreground/80">
            <span>Error tolerance</span>
            <span className="text-foreground font-semibold">{errorTol.toFixed(1)}%</span>
          </div>
          <Slider
            value={[errorTol]}
            min={0}
            max={10}
            step={0.1}
            onValueChange={(v) => setErrorTol(v[0] ?? errorTol)}
            className="w-full"
          />
          <div className="mt-1 text-[11px] text-foreground/60">Green ≤ tolerance</div>
        </div>
      </UiSection>

      <UiSection title="Appearance" defaultOpen>
        <ThemeToggle />
      </UiSection>
    </div>
  );
}

/* ⬇️ вернуть ThemeToggle */
function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

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
