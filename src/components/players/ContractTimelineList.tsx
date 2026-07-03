import { ContractTimelineEntry } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { History } from "lucide-react";
import { DEAL_STATUS_LABEL } from "@/lib/format";
import { DEAL_STATUS_TONE } from "@/lib/statusTone";
import { RestrictedValue } from "@/components/shared/Restricted";

export function ContractTimelineList({
  entries,
  showFinancials = true,
}: {
  entries: ContractTimelineEntry[];
  showFinancials?: boolean;
}) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<History className="h-5 w-5" />}
        title="No contract history recorded"
        description="Previous clubs and contracts will appear here."
      />
    );
  }

  const sorted = [...entries].sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));

  return (
    <ol className="space-y-5 border-l-2 border-slate-100 pl-5">
      {sorted.map((entry) => (
        <li key={entry.id} className="relative">
          <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-brand-400" />
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {entry.club}
              {entry.league && <span className="font-normal text-slate-500"> · {entry.league}</span>}
            </p>
            {entry.dealStatus && (
              <Badge tone={DEAL_STATUS_TONE[entry.dealStatus]}>{DEAL_STATUS_LABEL[entry.dealStatus]}</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            {entry.country} · {entry.season} · {formatDate(entry.startDate)} – {entry.endDate ? formatDate(entry.endDate) : "present"}
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 sm:grid-cols-4">
            <div><dt className="text-slate-400">Salary</dt><dd>{showFinancials ? formatCurrency(entry.salary, entry.currency) : <RestrictedValue />}</dd></div>
            <div><dt className="text-slate-400">Housing</dt><dd>{entry.housing || "—"}</dd></div>
            <div><dt className="text-slate-400">Car</dt><dd>{entry.car || "—"}</dd></div>
            <div><dt className="text-slate-400">Bonuses</dt><dd>{entry.bonuses || "—"}</dd></div>
            <div><dt className="text-slate-400">Arranged By</dt><dd>{entry.arrangedByAgent || "—"}</dd></div>
            <div><dt className="text-slate-400">Club Contact</dt><dd>{entry.clubContact || "—"}</dd></div>
          </dl>
          {entry.notes && <p className="mt-2 text-sm text-slate-600">{entry.notes}</p>}
        </li>
      ))}
    </ol>
  );
}
