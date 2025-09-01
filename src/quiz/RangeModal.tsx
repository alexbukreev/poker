// src/quiz/RangeModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import RangeMatrix from "./RangeMatrix";

type RangeRow = { label: string; range: string };
type Pack = { calls: RangeRow[]; threebets: RangeRow[] };

const DATA: Record<string, Pack> = {
  "BBvsBTN_2.5x": {
    calls: [{ label: "Calls", range: "22+,A2s+,K5s+,Q8s+,J8s+,T8s+,97s+,86s+,A2o+,K9o+,Q9o+,J9o+,T9o" }],
    threebets: [{ label: "3-bets", range: "JJ+,AQs+,AJs,KQs,A5s-A2s,AQo" }],
  },
  "SBvsBTN_2.5x": {
    calls: [{ label: "Calls (mix)", range: "AJs-ATs,KQs,QJs,JTs" }],
    threebets: [{ label: "3-bets", range: "TT+,AQs+,AJs,KQs,A5s-A2s,AQo" }],
  },
  "BBvsUTG_2.5x": {
    calls: [{ label: "Calls", range: "22-77,A2s-A5s,ATs-AQs,KTs+,QTs+,JTs,T9s,98s" }],
    threebets: [{ label: "3-bets (tight)", range: "JJ+,AKs,AKo,A5s-A4s" }],
  },
};

export default function RangeModal({ spotKey = "BBvsBTN_2.5x" }: { spotKey?: keyof typeof DATA | string }) {
  const pack = (DATA as any)[spotKey] ?? DATA["BBvsBTN_2.5x"];
  const [tab, setTab] = useState<"calls"|"threebets">("calls");
  const [sel, setSel] = useState(0);

  const rows = pack[tab];
  const current = rows[Math.min(sel, rows.length-1)] ?? rows[0];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Open ranges</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Range matrix — {String(spotKey)}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v)=>setTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calls">Calls</TabsTrigger>
            <TabsTrigger value="threebets">3-bets</TabsTrigger>
          </TabsList>

          <TabsContent value="calls" className="mt-2">
            <RowPicker rows={pack.calls} sel={sel} onSel={setSel} />
            <ScrollArea className="mt-2 max-h-[420px] pr-4">
              <RangeMatrix range={current.range} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="threebets" className="mt-2">
            <RowPicker rows={pack.threebets} sel={sel} onSel={setSel} />
            <ScrollArea className="mt-2 max-h-[420px] pr-4">
              <RangeMatrix range={current.range} />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function RowPicker({ rows, sel, onSel }: { rows: RangeRow[]; sel: number; onSel: (i:number)=>void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {rows.map((r, i) => (
        <button
          key={i}
          onClick={() => onSel(i)}
          className={`rounded border px-2 py-1 text-xs ${
            sel===i ? "border-foreground bg-foreground text-background" : "border-foreground/30 hover:border-foreground/60"
          }`}
          title={r.range}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
