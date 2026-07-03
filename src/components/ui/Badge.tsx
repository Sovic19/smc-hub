import { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "brand"
  | "green"
  | "amber"
  | "red"
  | "slate"
  | "purple";

const toneClasses: Record<BadgeTone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  purple: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function Badge({
  children,
  tone = "slate",
  className,
  dot,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        toneClasses[tone],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "brand" && "bg-brand-500",
            tone === "green" && "bg-emerald-500",
            tone === "amber" && "bg-amber-500",
            tone === "red" && "bg-red-500",
            tone === "slate" && "bg-slate-400",
            tone === "purple" && "bg-violet-500"
          )}
        />
      )}
      {children}
    </span>
  );
}
