"use client";

import { useMemo, useState } from "react";
import { Handshake, LayoutGrid, List, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { DealFormModal, DealFormValues } from "@/components/deals/DealFormModal";
import { DealDetailModal } from "@/components/deals/DealDetailModal";
import { AGENTS, Deal, DealStatus, DealType } from "@/types";
import {
  DEAL_STATUS_LABEL,
  DEAL_TYPE_LABEL,
  RELATIONSHIP_STRENGTH_LABEL,
  formatCurrency,
  relativeDayLabel,
} from "@/lib/format";
import { DEAL_STATUS_TONE, DEAL_TYPE_TONE, RELATIONSHIP_STRENGTH_TONE } from "@/lib/statusTone";
import { generateId } from "@/lib/storage";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { canCreateDeals, hasFinancialAccess, isModuleVisible, MODULE_KEYS } from "@/lib/permissions";
import { RestrictedValue, RestrictedNotice } from "@/components/shared/Restricted";

const BOARD_COLUMNS: { status: DealStatus; label: string }[] = [
  { status: "scouting", label: "Prospect" },
  { status: "interest", label: "Interest" },
  { status: "offer", label: "Offer" },
  { status: "negotiation", label: "Negotiation" },
  { status: "signed", label: "Signed" },
  { status: "finished", label: "Finished" },
];

function DealCard({ deal, onOpen }: { deal: Deal; onOpen: () => void }) {
  const { getPlayer } = useData();
  const { user } = useCurrentUser();
  const player = getPlayer(deal.playerId);
  const financialAccess = hasFinancialAccess(user, player);
  return (
    <button
      onClick={onOpen}
      className="w-full rounded-lg border border-slate-200 bg-white p-3.5 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="text-sm font-semibold text-slate-900">
        {player ? `${player.firstName} ${player.lastName}` : "Unknown player"}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">{deal.clubName} · {deal.league}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge tone={DEAL_TYPE_TONE[deal.dealType]}>{DEAL_TYPE_LABEL[deal.dealType]}</Badge>
        {deal.relationshipStrength && (
          <Badge tone={RELATIONSHIP_STRENGTH_TONE[deal.relationshipStrength]}>
            {RELATIONSHIP_STRENGTH_LABEL[deal.relationshipStrength]}
          </Badge>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        {financialAccess ? (
          <span>{formatCurrency(deal.expectedSalary ?? deal.finalSalary, deal.currency)}</span>
        ) : (
          <RestrictedValue />
        )}
        <span>{deal.deadline ? relativeDayLabel(deal.deadline) : ""}</span>
      </div>
      <p className="mt-1 truncate text-xs text-slate-400">{deal.responsibleAgent}</p>
    </button>
  );
}

export default function DealsPage() {
  const { deals, addDeal, updateDeal, getPlayer } = useData();
  const { user } = useCurrentUser();
  const [view, setView] = useState<"board" | "list">("board");
  const [query, setQuery] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [dealTypeFilter, setDealTypeFilter] = useState<DealType | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [viewingDeal, setViewingDeal] = useState<Deal | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter((d) => {
      if (agentFilter !== "all" && d.responsibleAgent !== agentFilter) return false;
      if (dealTypeFilter !== "all" && d.dealType !== dealTypeFilter) return false;
      if (!q) return true;
      return `${d.clubName} ${d.league} ${d.country}`.toLowerCase().includes(q);
    });
  }, [deals, query, agentFilter, dealTypeFilter]);

  const otherDeals = filtered.filter((d) => d.status === "rejected" || d.status === "cancelled");

  function handleCreate(values: DealFormValues) {
    addDeal({
      ...values,
      timeline: [
        {
          id: generateId("dt"),
          date: new Date().toISOString().slice(0, 10),
          status: values.status,
          note: "Deal created.",
          agent: values.responsibleAgent,
        },
      ],
    });
    setFormOpen(false);
  }

  function handleUpdate(values: DealFormValues) {
    if (!editingDeal) return;
    updateDeal(editingDeal.id, values);
    setEditingDeal(null);
  }

  if (!isModuleVisible(user, MODULE_KEYS.deals)) {
    return (
      <div className="mx-auto max-w-3xl">
        <RestrictedNotice message="The Deals module is restricted for your role." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Deals</h2>
          <p className="mt-1 text-sm text-slate-400">{deals.length} deals tracked</p>
        </div>
        {canCreateDeals(user) && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Deal
          </Button>
        )}
      </div>

      <Card className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search by club, league, or country…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className="lg:w-48">
          <option value="all">All agents</option>
          {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
        </Select>
        <Select value={dealTypeFilter} onChange={(e) => setDealTypeFilter(e.target.value as DealType | "all")} className="lg:w-56">
          <option value="all">All deal types</option>
          {Object.entries(DEAL_TYPE_LABEL).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </Select>
        <div className="flex gap-1 rounded-lg border border-slate-200 p-1">
          <button
            onClick={() => setView("board")}
            className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium", view === "board" ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50")}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Board
          </button>
          <button
            onClick={() => setView("list")}
            className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium", view === "list" ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50")}
          >
            <List className="h-3.5 w-3.5" /> List
          </button>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Handshake className="h-5 w-5" />} title="No deals found" description="Try a different search or add a new deal." />
        </Card>
      ) : view === "board" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {BOARD_COLUMNS.map((col) => {
            const colDeals = filtered.filter((d) => d.status === col.status);
            return (
              <div key={col.status} className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{col.label}</p>
                  <Badge tone="slate">{colDeals.length}</Badge>
                </div>
                <div className="flex flex-1 flex-col gap-2 rounded-xl bg-slate-100/60 p-2 min-h-[120px]">
                  {colDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} onOpen={() => setViewingDeal(deal)} />
                  ))}
                  {colDeals.length === 0 && (
                    <p className="px-2 py-4 text-center text-xs text-slate-400">No deals</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-slate-100">
            {filtered.map((deal) => {
              const financialAccess = hasFinancialAccess(user, getPlayer(deal.playerId));
              return (
                <button
                  key={deal.id}
                  onClick={() => setViewingDeal(deal)}
                  className="flex w-full flex-col gap-2 px-5 py-3.5 text-left transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <DealPlayerLabel deal={deal} />
                    <p className="text-xs text-slate-400">{deal.clubName} · {deal.league} · {deal.country}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={DEAL_TYPE_TONE[deal.dealType]}>{DEAL_TYPE_LABEL[deal.dealType]}</Badge>
                    <Badge tone={DEAL_STATUS_TONE[deal.status]}>{DEAL_STATUS_LABEL[deal.status]}</Badge>
                    {financialAccess ? (
                      <span className="text-xs text-slate-400">{formatCurrency(deal.expectedSalary ?? deal.finalSalary, deal.currency)}</span>
                    ) : (
                      <RestrictedValue />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {otherDeals.length > 0 && view === "board" && (
        <Card>
          <div className="border-b border-slate-100 px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rejected / Cancelled</p>
          </div>
          <div className="divide-y divide-slate-100">
            {otherDeals.map((deal) => (
              <button
                key={deal.id}
                onClick={() => setViewingDeal(deal)}
                className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <DealPlayerLabel deal={deal} />
                  <p className="text-xs text-slate-400">{deal.clubName}</p>
                </div>
                <Badge tone={DEAL_STATUS_TONE[deal.status]}>{DEAL_STATUS_LABEL[deal.status]}</Badge>
              </button>
            ))}
          </div>
        </Card>
      )}

      <DealFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} title="Add New Deal" />

      <DealFormModal
        open={!!editingDeal}
        onClose={() => setEditingDeal(null)}
        onSubmit={handleUpdate}
        initialValues={editingDeal ?? undefined}
        title="Edit Deal"
      />

      <DealDetailModal
        deal={viewingDeal}
        onClose={() => setViewingDeal(null)}
        onEdit={(deal) => {
          setViewingDeal(null);
          setEditingDeal(deal);
        }}
      />
    </div>
  );
}

function DealPlayerLabel({ deal }: { deal: Deal }) {
  const { getPlayer } = useData();
  const player = getPlayer(deal.playerId);
  return (
    <p className="truncate text-sm font-medium text-slate-800">
      {player ? `${player.firstName} ${player.lastName}` : "Unknown player"}
    </p>
  );
}
