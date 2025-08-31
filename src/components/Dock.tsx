// src/components/Dock.tsx
import { useId, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function Dock({
  side = "right",
  title,
  children,
  widthClass = "w-80",
  defaultOpen = true,
}: {
  side?: "left" | "right";
  title: string;
  children: ReactNode;
  widthClass?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <>
      {!open && (
        <button
          aria-label={`Toggle ${title}`}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(true)}
          className={`fixed top-1/2 -translate-y-1/2 z-50 h-7 w-7 border border-border bg-foreground/10 ${
            side === "left" ? "left-0 rounded-r-md" : "right-0 rounded-l-md"
          }`}
        />
      )}

      <Sheet open={open} onOpenChange={setOpen} modal={false}>
        <SheetContent
          side={side}
          id={id}
          className={`${widthClass} border-border bg-background/100 text-foreground`}
          onPointerDownOutside={(e) => (e as any).preventDefault()}
          onFocusOutside={(e) => (e as any).preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className="border-b border-foreground/90 dark:border-white/90 px-4 py-2">
            <SheetTitle className="text-foreground text-base md:text-lg">{title}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pt-0 -mt-2 pb-4">{children}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
