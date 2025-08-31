// src/components/UiSection.tsx
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { type ReactNode } from "react";

export default function UiSection({
  title,
  defaultOpen = true,
  children,
  compactTop = false,          // ← NEW
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  compactTop?: boolean;        // ← NEW
}) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger
        className={
          "group flex w-full items-center justify-between text-l font-semibold text-foreground " +
          (compactTop ? "pt-0 pb-2" : "py-2")  // ← без верхнего отступа у первого раздела
        }
      >
        <span>{title}</span>
        <ChevronDown className="h-4 w-4 text-foreground/60 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="pb-3">{children}</div>
      </CollapsibleContent>

      <div className="border-b border-foreground/40 dark:border-white/40" />
    </Collapsible>
  );
}
