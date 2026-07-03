"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageCircle,
  MessagesSquare,
  Phone,
  Plus,
  Search,
  StickyNote,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { CommunicationFormModal } from "@/components/communication/CommunicationFormModal";
import { Button } from "@/components/ui/Button";
import { AGENTS, CommunicationType, LinkedEntityType } from "@/types";
import { COMMUNICATION_TYPE_LABEL, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

const TYPE_ICON: Record<CommunicationType, typeof Phone> = {
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  meeting: Users,
  video_call: MessagesSquare,
  note: StickyNote,
};

const TYPE_TONE: Record<CommunicationType, string> = {
  phone: "bg-brand-50 text-brand-600",
  whatsapp: "bg-emerald-50 text-emerald-600",
  email: "bg-violet-50 text-violet-600",
  meeting: "bg-amber-50 text-amber-600",
  video_call: "bg-cyan-50 text-cyan-600",
  note: "bg-slate-100 text-slate-600",
};

const ENTITY_HREF: Record<LinkedEntityType, string> = {
  player: "/players",
  club: "/clubs",
  contact: "/contacts",
  deal: "/deals",
};

export default function CommunicationPage() {
  const { communications } = useData();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<CommunicationType | "all">("all");
  const [entityFilter, setEntityFilter] = useState<LinkedEntityType | "all">("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return communications
      .filter((c) => (typeFilter === "all" ? true : c.type === typeFilter))
      .filter((c) => (entityFilter === "all" ? true : c.linkedEntityType === entityFilter))
      .filter((c) => (agentFilter === "all" ? true : c.responsibleAgent === agentFilter))
      .filter((c) => (q ? `${c.summary} ${c.linkedEntityLabel} ${c.person}`.toLowerCase().includes(q) : true))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [communications, query, typeFilter, entityFilter, agentFilter]);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Communication</h2>
          <p className="mt-1 text-sm text-slate-400">{communications.length} logged interactions across the agency</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Log Communication
        </Button>
      </div>

      <Card className="space-y-3 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search communication…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as CommunicationType | "all")}>
            <option value="all">All types</option>
            {Object.entries(COMMUNICATION_TYPE_LABEL).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </Select>
          <Select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value as LinkedEntityType | "all")}>
            <option value="all">All entities</option>
            <option value="player">Players</option>
            <option value="club">Clubs</option>
            <option value="contact">Contacts</option>
            <option value="deal">Deals</option>
          </Select>
          <Select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)}>
            <option value="all">All agents</option>
            {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={<MessagesSquare className="h-5 w-5" />} title="No communication found" description="Try adjusting your filters or log a new entry." />
          </div>
        ) : (
          <ol className="divide-y divide-slate-100">
            {filtered.map((entry) => {
              const Icon = TYPE_ICON[entry.type];
              return (
                <li key={entry.id} className="flex gap-3 px-5 py-4">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", TYPE_TONE[entry.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-slate-800">{COMMUNICATION_TYPE_LABEL[entry.type]}</p>
                      <Link href={`${ENTITY_HREF[entry.linkedEntityType]}/${entry.linkedEntityId}`} className="text-xs text-brand-600 hover:underline">
                        {entry.linkedEntityLabel}
                      </Link>
                      <Badge tone="slate">{entry.linkedEntityType}</Badge>
                      <span className="ml-auto text-xs text-slate-400">{formatDate(entry.date)}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{entry.summary}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {entry.person} · {entry.responsibleAgent}
                      {entry.nextFollowUp && ` · Next follow-up: ${formatDate(entry.nextFollowUp)}`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <CommunicationFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
