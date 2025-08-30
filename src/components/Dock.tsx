// src/components/Dock.tsx
import { useId, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function Dock({ side="right", title, children, widthClass="w-80", defaultOpen=true }:{
  side?: "left" | "right"; title: string; children: ReactNode; widthClass?: string; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const edgeBtnPos = side === "left" ? "left-0 rounded-r-md" : "right-0 rounded-l-md";

  return (
    <>
      {!open && (
        <button
          aria-label={`Toggle ${title}`}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(true)}
          className={`fixed top-1/2 -translate-y-1/2 z-50 h-7 w-7 border border-white/20 bg-white/10 ${edgeBtnPos}`}
        />
      )}

      <Sheet open={open} onOpenChange={setOpen} modal={false}>
        <SheetContent
          side={side}
          id={id}
          className={`${widthClass} border-white/15 bg-black/90 text-white`}
          onPointerDownOutside={(e) => e.preventDefault()}
          onFocusOutside={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}   // ← убираем авто-фокус внутри панели
        >
          <SheetHeader className="border-b border-white/10 px-4 py-2">
            <SheetTitle className="text-white text-base md:text-lg">{title}</SheetTitle>
          </SheetHeader>

          {/* такие же горизонтальные отступы, сверху — 0 */}
          <div className="px-4 pt-0 -mt-2 pb-4">{children}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
