"use client";

import { useMemo, useState } from "react";
import { Compass, Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { OpportunityFormModal, OpportunityFormValues } from "@/components/opportunities/OpportunityFormModal";
import { useData } from "@/context/DataContext";
import { Opportunity, OpportunityStatus } from "@/types";
import {
  OPPORTUNITY_STATUS_LABEL,
  OPPORTUNITY_TYPE_LABEL,
  TASK_PRIORITY_LABEL,
  formatCurrency,
} from "@/lib/format";
import { OPPORTUNITY_STATUS_TONE, OPPORTUNITY_TYPE_TONE, TASK_PRIORITY_TONE } from "@/lib/statusTone";
import { cn } from "@/lib/cn";

type ViewMode = "best" | "country" | "league" | "agent" | "playertype" | "junior" | "expiry";

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: "best", label: "Best Opportunities" },
  { key: "expiry", label: "Contract Expiry" },
  { key: "junior", label: "Junior" },
  { key: "country", label: "By Country" },
  { key: "league", label: "By League" },
  { key: "agent", label: "By Agent" },
  { key: "playertype", label: "By Player Type" },
];

const URGENCY_RANK: Record<string, number> = { urgent: 3, high: 2, medium: 1, low: 0 };

function OpportunityRow({ opp, playerLabel }: { opp: Opportunity; playerLabel?: string }) {
  return (
    <li className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-slate-800">{opp.title}</p>
          <Badge tone={OPPORTUNITY_TYPE_TONE[opp.type]}>{OPPORTUNITY_TYPE_LABEL[opp.type]}</Badge>
          <Badge tone={TASK_PRIORITY_TONE[opp.urgency]}>{TASK_PRIORITY_LABEL[opp.urgency]}</Badge>
        </div>
        {opp.notes && <p className="mt-1 text-sm text-slate-500">{opp.notes}</p>}
        <p className="mt-1 text-xs text-slate-400">
          {playerLabel && <>{playerLabel} · </>}
          {[opp.league, opp.country].filter(Boolean).join(", ")}
          {opp.league || opp.country ? " · " : ""}
          {opp.responsibleAgent}
          {opp.estimatedValue ? ` · ${formatCurrency(opp.estimatedValue, opp.currency)}` : ""}
        </p>
        <p className="mt-1 text-xs text-slate-500">{opp.recommendedAction}</p>
      </div>
      <Badge tone={OPPORTUNITY_STATUS_TONE[opp.status]}>{OPPORTUNITY_STATUS_LABEL[opp.status]}</Badge>
    </li>
  );
}

export default function OpportunitiesPage() {
  const { opportunities, players, addOpportunity } = useData();
  const [view, setView] = useState<ViewMode>("best");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);

  function playerLabel(opp: Opportunity) {
    if (!opp.linkedPlayerId) return undefined;
    const p = players.find((pl) => pl.id === opp.linkedPlayerId);
    return p ? `${p.firstName} ${p.lastName}` : undefined;
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return opportunities
      .filter((o) => (statusFilter === "all" ? true : o.status === statusFilter))
      .filter((o) => (q ? `${o.title} ${o.notes ?? ""}`.toLowerCase().includes(q) : true));
  }, [opportunities, query, statusFilter]);

  const groupedView = view === "country" || view === "league" || view === "agent" || view === "playertype";

  const groups = useMemo(() => {
    if (!groupedView) return [];
    const keyFor = (o: Opportunity): string => {
      if (view === "country") return o.country || "Unspecified";
      if (view === "league") return o.league || "Unspecified";
      if (view === "agent") return o.responsibleAgent;
      if (view === "playertype") {
        const p = players.find((pl) => pl.id === o.linkedPlayerId);
        if (!p) return "Not player-specific";
        return p.category.charAt(0).toUpperCase() + p.category.slice(1);
      }
      return "Other";
    };
    const map = new Map<string, Opportunity[]>();
    for (const o of filtered) {
      const key = keyFor(o);
      map.set(key, [...(map.get(key) ?? []), o]);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [groupedView, view, filtered, players]);

  const flatList = useMemo(() => {
    switch (view) {
      case "expiry":
        return filtered.filter((o) => o.type === "contract_expiring_soon" || o.type === "deal_follow_up")
          .sort((a, b) => URGENCY_RANK[b.urgency] - URGENCY_RANK[a.urgency]);
      case "junior":
        return filtered.filter((o) => {
          if (o.type === "junior_development") return true;
          const p = players.find((pl) => pl.id === o.linkedPlayerId);
          return p?.category === "junior";
        });
      case "best":
      default:
        return [...filtered].sort(
          (a, b) => URGENCY_RANK[b.urgency] - URGENCY_RANK[a.urgency] || (b.estimatedValue ?? 0) - (a.estimatedValue ?? 0)
        );
    }
  }, [filtered, view, players]);

  function handleCreate(values: OpportunityFormValues) {
    addOpportunity(values);
    setFormOpen(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Opportunity Finder</h2>
          <p className="mt-1 text-sm text-slate-400">{opportunities.length} opportunities on file</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Opportunity
        </Button>
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search opportunities…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OpportunityStatus | "all")} className="lg:w-44">
            <option value="all">All statuses</option>
            {Object.entries(OPPORTUNITY_STATUS_LABEL).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </Select>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                view === v.key ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </Card>

      {groupedView ? (
        groups.length === 0 ? (
          <Card>
            <div className="p-6">
              <EmptyState icon={<Compass className="h-5 w-5" />} title="No opportunities found" description="Try adjusting your filters." />
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {groups.map(([key, items]) => (
              <Card key={key}>
                <div className="border-b border-slate-100 px-5 py-3">
                  <h3 className="text-sm font-semibold text-slate-700">{key}</h3>
                </div>
                <ul className="divide-y divide-slate-100">
                  {items.map((o) => <OpportunityRow key={o.id} opp={o} playerLabel={playerLabel(o)} />)}
                </ul>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card>
          {flatList.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<Compass className="h-5 w-5" />} title="No opportunities found" description="Try adjusting your filters or add a new opportunity." />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {flatList.map((o) => <OpportunityRow key={o.id} opp={o} playerLabel={playerLabel(o)} />)}
            </ul>
          )}
        </Card>
      )}

      <OpportunityFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} title="Add New Opportunity" />
    </div>
  );
}
