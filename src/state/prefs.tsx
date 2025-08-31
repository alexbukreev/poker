// src/state/prefs.tsx
import React, { createContext, useContext, useMemo, useState } from "react";

type Prefs = {
  errorTol: number;                 // percent threshold
  setErrorTol: (v: number) => void;
};

const Ctx = createContext<Prefs | null>(null);

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [errorTol, setErrorTolState] = useState<number>(() => {
    try {
      const s = localStorage.getItem("pref:errorTol");
      const v = s ? parseFloat(s) : 0.5;
      return Number.isFinite(v) ? v : 0.5;
    } catch {
      return 0.5;
    }
  });

  const setErrorTol = (v: number) => {
    const vv = Math.min(10, Math.max(0, Math.round(v * 10) / 10)); // clamp & 0.1 step
    setErrorTolState(vv);
    try { localStorage.setItem("pref:errorTol", String(vv)); } catch {}
  };

  const value = useMemo(() => ({ errorTol, setErrorTol }), [errorTol]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePrefs must be used within <PrefsProvider>");
  return ctx;
}
