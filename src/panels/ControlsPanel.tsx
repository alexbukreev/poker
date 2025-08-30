// src/panels/ControlsPanel.tsx
import UiSection from "@/components/UiSection";
import type { TableState } from "@/engine/table";

export default function ControlsPanel({
  state, pot, onRandom,
}: { state: TableState; pot: number; onRandom: () => void }) {
  return (
    <div className="text-white">
      <UiSection title="Table" defaultOpen compactTop>
        <div className="space-y-1 text-sm text-white/80">
          <div>Hero: <b className="text-white">{state.heroSeat}</b></div>
          <div>Pot: <b className="text-white">{Math.round(pot * 10) / 10}</b></div>
        </div>
        <div className="mt-3">
          <button className="rounded-md border border-white/30 px-3 py-1" onClick={onRandom}>
            Random spot
          </button>
        </div>
      </UiSection>

      <UiSection title="Preferences" defaultOpen>
        {/* UI-муляж */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-white/80">Rake</span>
          <div className="h-6 w-11 rounded-full border border-white/20 bg-white/15">
            <div className="h-5 w-5 translate-x-[2px] translate-y-[2px] rounded-full bg-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-white/80">
            <div className="mb-1">Rake %</div>
            <input type="number" step="0.1" defaultValue={5.0}
              className="w-full rounded-md border border-white/20 bg-black/30 px-2 py-1 outline-none" readOnly />
          </label>
          <label className="text-sm text-white/80">
            <div className="mb-1">Cap (bb)</div>
            <input type="number" step="0.1" defaultValue={5.0}
              className="w-full rounded-md border border-white/20 bg-black/30 px-2 py-1 outline-none" readOnly />
          </label>
        </div>
      </UiSection>
    </div>
  );
}
