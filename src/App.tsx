import { useState } from "react";
import PokerTable from "@/components/PokerTable";
import {
  createDefaultState,
  postBlinds,
  openRaise,
  computePot,
  randomSeatExcept,
  type TableState,   // <— обратите внимание на `type`
} from "@/engine/table";

export default function App() {
  const [state, setState] = useState<TableState>(() => {
    const s = createDefaultState("UTG");
    postBlinds(s);                // SB 0.5, BB 1
    openRaise(s, "BTN", 3);       // BTN 3x
    return s;
  });

  const pot = computePot(state);

  return (
    <div className="p-6 space-y-4">
      <PokerTable
        heroSeat={state.heroSeat}
        dealerSeat={state.dealerSeat}
        stacks={state.stacks}
        contribs={state.contribs}
        pot={pot}
        heroCards="4♣ K♥"
      />

      {/* временно: кнопка для смены логической позиции героя */}
      <button
        className="rounded-md border px-3 py-1"
        onClick={() =>
          setState(prev => ({
            ...prev,
            heroSeat: randomSeatExcept(prev.heroSeat),
          }))
        }
      >
        Random hero seat
      </button>
    </div>
  );
}
