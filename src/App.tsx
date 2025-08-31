// src/App.tsx
import { useState } from "react";
import PokerTable from "@/components/PokerTable";
import { computePot, type TableState, type SeatPos } from "@/engine/table";
import { generatePreflopSpot, generateRandomPreflopSpot } from "@/engine/generator";
import Dock from "@/components/Dock";
import ControlsPanel from "@/panels/ControlsPanel";
import QuizzesPanel from "@/panels/QuizzesPanel";
import { PrefsProvider } from "@/state/prefs";

type HeroChoice = SeatPos | "random";

export default function App() {
  const [state, setState] = useState<TableState>(() => generateRandomPreflopSpot());
  const pot = computePot(state);

  // ← всегда "random" после перезагрузки
  const [heroPref, setHeroPref] = useState<HeroChoice>("random");

  const onGenerate = ({ hero }: { hero: HeroChoice }) => {
    setState(generatePreflopSpot({ hero }));
  };

  return (
    <PrefsProvider>
      <div className="p-6 space-y-4">
        <PokerTable
          heroSeat={state.heroSeat}
          dealerSeat={state.dealerSeat}
          stacks={state.stacks}
          contribs={state.contribs}
          pot={pot}
          heroCards="A♣ T♦"
        />

        <Dock side="left" title="Controls" defaultOpen widthClass="w-80">
          <ControlsPanel
            pot={pot}
            onGenerate={onGenerate}
            heroPref={heroPref}
            onChangeHeroPref={setHeroPref}
          />
        </Dock>

        <Dock side="right" title="Quizzes" defaultOpen widthClass="w-80">
          <QuizzesPanel
            state={state}
            onNewSpot={() => onGenerate({ hero: heroPref })}
          />
        </Dock>
      </div>
    </PrefsProvider>
  );
}
