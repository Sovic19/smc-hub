import { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  icon,
  tone = "brand",
  trend,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "brand" | "green" | "amber" | "red" | "slate";
  trend?: string;
}) {
  const toneClasses = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-600",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {icon && (
          <div className={cn("rounded-lg p-2", toneClasses)}>{icon}</div>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      {trend && <p className="mt-1 text-xs text-slate-400">{trend}</p>}
    </div>
  );
}
