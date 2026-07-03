import { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="text-sm text-slate-800">
        {value === "" || value === undefined || value === null ? (
          <span className="text-slate-300">—</span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export function DetailGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
    </dl>
  );
}
