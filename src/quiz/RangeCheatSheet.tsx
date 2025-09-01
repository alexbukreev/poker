// src/quiz/RangeCheatSheet.tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type RangeRow = { label: string; range: string };

const DATA: Record<string, { calls: RangeRow[]; threebets: RangeRow[] }> = {
  "BBvsBTN_2.5x": {
    calls: [
      { label: "Calls", range: "22+,A2s+,K5s+,Q8s+,J8s+,T8s+,97s+,86s+,A2o+,K9o+,Q9o+,J9o+,T9o" },
    ],
    threebets: [
      { label: "3-bets", range: "JJ+,AQs+,AJs,KQs,A5s–A2s,AQo" },
    ],
  },
  "SBvsBTN_2.5x": {
    calls: [
      { label: "Calls (mix)", range: "AJs–ATs,KQs,QJs,JTs" },
    ],
    threebets: [
      { label: "3-bets", range: "TT+,AQs+,AJs,KQs,A5s–A2s,AQo" },
    ],
  },
  "BBvsUTG_2.5x": {
    calls: [
      { label: "Calls", range: "22–77,A2s–A5s,ATs–AQs,KTs+,QTs+,JTs,T9s,98s" },
    ],
    threebets: [
      { label: "3-bets (tight)", range: "JJ+,AKs,AKo,A5s–A4s" },
    ],
  },
};

export default function RangeCheatSheet({
  spotKey = "BBvsBTN_2.5x",
}: {
  /** e.g. "BBvsBTN_2.5x" */
  spotKey?: keyof typeof DATA | string;
}) {
  const slot = (DATA as any)[spotKey] ?? DATA["BBvsBTN_2.5x"];
  return (
    <div className="text-sm">
      <div className="mb-2 opacity-70">{String(spotKey)}</div>
      <Tabs defaultValue="calls" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="threebets">3-bets</TabsTrigger>
        </TabsList>
        <TabsContent value="calls" className="mt-2">
          {slot.calls.map((r: RangeRow, i: number) => (
            <div key={i} className="rounded border border-foreground/20 p-2 mb-2">
              <div className="font-medium">{r.label}</div>
              <div className="text-xs opacity-85">{r.range}</div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="threebets" className="mt-2">
          {slot.threebets.map((r: RangeRow, i: number) => (
            <div key={i} className="rounded border border-foreground/20 p-2 mb-2">
              <div className="font-medium">{r.label}</div>
              <div className="text-xs opacity-85">{r.range}</div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
