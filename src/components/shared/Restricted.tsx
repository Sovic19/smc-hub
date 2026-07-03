import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/cn";

/** Inline placeholder for a single restricted value, e.g. inside a table cell. */
export function RestrictedValue({
  label = "Restricted",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-slate-400",
        className
      )}
      title="You do not have permission to view this financial data"
    >
      <Lock className="h-3 w-3" />
      {label}
    </span>
  );
}

/** Full-width notice block explaining a restricted section. */
export function RestrictedNotice({
  message = "You do not have permission to view financial data.",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-500",
        className
      )}
    >
      <Lock className="h-4 w-4 shrink-0 text-slate-400" />
      <p>{message}</p>
    </div>
  );
}

/** Renders children only when `allowed`, otherwise a restricted notice. */
export function FinancialGate({
  allowed,
  children,
  message,
}: {
  allowed: boolean;
  children: ReactNode;
  message?: string;
}) {
  if (allowed) return <>{children}</>;
  return <RestrictedNotice message={message} />;
}
