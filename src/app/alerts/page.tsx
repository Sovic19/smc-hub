"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { AskAiButton } from "@/components/ai/AskAiButton";
import { AlertFormModal, AlertFormValues } from "@/components/alerts/AlertFormModal";
import { useData } from "@/context/DataContext";
import { AlertItem, AlertStatus, AlertType } from "@/types";
import {
  ALERT_STATUS_LABEL,
  ALERT_TYPE_LABEL,
  TASK_PRIORITY_LABEL,
  daysUntil,
  formatDate,
  relativeDayLabel,
} from "@/lib/format";
import { ALERT_STATUS_TONE, ALERT_TYPE_TONE, TASK_PRIORITY_TONE } from "@/lib/statusTone";
import { explainAlert } from "@/lib/mockAi";
import { cn } from "@/lib/cn";

type ViewMode = "all" | "urgent" | "today" | "week" | "contract" | "performance" | "communication" | "dataquality";

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: "all", label: "All" },
  { key: "urgent", label: "Urgent" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "contract", label: "Contract Alerts" },
  { key: "performance", label: "Player Performance" },
  { key: "communication", label: "Communication" },
  { key: "dataquality", label: "Data Quality" },
];

const CONTRACT_TYPES: AlertType[] = ["club_contract_expiring", "agency_agreement_expiring", "document_expiry"];
const PERFORMANCE_TYPES: AlertType[] = [
  "player_played_game",
  "player_scored",
  "player_multi_point_game",
  "player_poor_performance",
  "junior_draft_eligible_soon",
];
const COMMUNICATION_TYPES: AlertType[] = ["follow_up_due_today", "overdue_task", "contact_not_followed_up", "deal_inactive"];
const DATA_QUALITY_TYPES: AlertType[] = ["missing_key_data", "player_no_current_club"];

export default function AlertsPage() {
  const { alerts, players, clubs, contacts, addAlert, updateAlert } = useData();
  const [view, setView] = useState<ViewMode>("all");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);

  function linkedEntity(alert: AlertItem) {
    if (alert.linkedPlayerId) {
      const p = players.find((pl) => pl.id === alert.linkedPlayerId);
      return p ? { label: `${p.firstName} ${p.lastName}`, href: `/players/${p.id}` } : null;
    }
    if (alert.linkedClubId) {
      const c = clubs.find((cl) => cl.id === alert.linkedClubId);
      return c ? { label: c.name, href: `/clubs/${c.id}` } : null;
    }
    if (alert.linkedContactId) {
      const c = contacts.find((ct) => ct.id === alert.linkedContactId);
      return c ? { label: `${c.firstName} ${c.lastName}`, href: `/contacts/${c.id}` } : null;
    }
    return null;
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return alerts
      .filter((a) => (statusFilter === "all" ? true : a.status === statusFilter))
      .filter((a) => (q ? `${a.title} ${a.description}`.toLowerCase().includes(q) : true))
      .filter((a) => {
        switch (view) {
          case "urgent":
            return a.priority === "urgent";
          case "today":
            return daysUntil(a.dueDate) === 0;
          case "week": {
            const d = daysUntil(a.dueDate);
            return d !== null && d >= 0 && d <= 7;
          }
          case "contract":
            return CONTRACT_TYPES.includes(a.type);
          case "performance":
            return PERFORMANCE_TYPES.includes(a.type);
          case "communication":
            return COMMUNICATION_TYPES.includes(a.type);
          case "dataquality":
            return DATA_QUALITY_TYPES.includes(a.type);
          default:
            return true;
        }
      })
      .sort((a, b) => b.createdDate.localeCompare(a.createdDate));
  }, [alerts, query, statusFilter, view]);

  function handleCreate(values: AlertFormValues) {
    addAlert(values);
    setFormOpen(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Alerts &amp; Intelligence</h2>
          <p className="mt-1 text-sm text-slate-400">
            {alerts.filter((a) => a.status === "new" || a.status === "in_progress").length} active alerts
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Alert
        </Button>
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search alerts…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AlertStatus | "all")} className="lg:w-44">
            <option value="all">All statuses</option>
            {Object.entries(ALERT_STATUS_LABEL).map(([val, label]) => (
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

      <Card>
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={<AlertTriangle className="h-5 w-5" />} title="No alerts found" description="Try adjusting your filters." />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((alert) => {
              const entity = linkedEntity(alert);
              return (
                <li key={alert.id} className="flex flex-col gap-3 px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-800">{alert.title}</p>
                        <Badge tone={ALERT_TYPE_TONE[alert.type]}>{ALERT_TYPE_LABEL[alert.type]}</Badge>
                        <Badge tone={TASK_PRIORITY_TONE[alert.priority]}>{TASK_PRIORITY_LABEL[alert.priority]}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{alert.description}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {entity && <Link href={entity.href} className="text-brand-600 hover:underline">{entity.label}</Link>}
                        {entity && " · "}
                        {alert.responsibleAgent}
                        {alert.dueDate && ` · Due ${relativeDayLabel(alert.dueDate)}`}
                        {" · "}Created {formatDate(alert.createdDate)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Select
                        value={alert.status}
                        onChange={(e) => updateAlert(alert.id, { status: e.target.value as AlertStatus })}
                        className="h-8 py-0 text-xs"
                      >
                        {Object.entries(ALERT_STATUS_LABEL).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </Select>
                      <Badge tone={ALERT_STATUS_TONE[alert.status]}>{ALERT_STATUS_LABEL[alert.status]}</Badge>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <AskAiButton label="Explain alert / suggest action" response={explainAlert(alert)} contextLabel={alert.title} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <AlertFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} title="Add New Alert" />
    </div>
  );
}
