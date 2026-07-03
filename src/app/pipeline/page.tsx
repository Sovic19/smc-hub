"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FolderKanban, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { AGENTS, Player, PipelineStage } from "@/types";
import {
  CONTRACT_STATUS_LABEL,
  PIPELINE_STAGE_LABEL,
  relativeDayLabel,
} from "@/lib/format";
import { CONTRACT_STATUS_TONE } from "@/lib/statusTone";
import { isJuniorWithoutProContract } from "@/lib/junior";

const PIPELINE_COLUMNS: PipelineStage[] = [
  "prospect",
  "junior_prospect",
  "monitored",
  "active_client",
  "negotiation",
  "offer",
  "signed",
  "free_player",
  "former_client",
];

function PipelineCard({ player }: { player: Player }) {
  const showJuniorBadge = isJuniorWithoutProContract(player);
  return (
    <Link
      href={`/players/${player.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-2.5">
        <Avatar name={`${player.firstName} ${player.lastName}`} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {player.firstName} {player.lastName}
          </p>
          <p className="truncate text-xs text-slate-500">
            {player.position} · {player.currentClub || "Unassigned"}
          </p>
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {showJuniorBadge ? (
          <Badge tone="purple">Junior / No pro contract yet</Badge>
        ) : (
          <Badge tone={CONTRACT_STATUS_TONE[player.contractStatus]}>{CONTRACT_STATUS_LABEL[player.contractStatus]}</Badge>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{player.responsibleAgent}</span>
        <span>{player.nextFollowUp ? relativeDayLabel(player.nextFollowUp) : ""}</span>
      </div>
    </Link>
  );
}

export default function PipelinePage() {
  const { players } = useData();
  const [query, setQuery] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players
      .filter((p) => (agentFilter === "all" ? true : p.representingAgent === agentFilter))
      .filter((p) => (q ? `${p.firstName} ${p.lastName} ${p.currentClub}`.toLowerCase().includes(q) : true));
  }, [players, query, agentFilter]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Player Pipeline</h2>
          <p className="mt-1 text-sm text-slate-400">{filtered.length} players tracked across the pipeline</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search players…" className="pl-9 sm:w-56" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className="sm:w-44">
            <option value="all">All agents</option>
            {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<FolderKanban className="h-5 w-5" />} title="No players match this filter" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE_COLUMNS.map((stage) => {
            const stagePlayers = filtered.filter((p) => p.pipelineStage === stage);
            return (
              <div key={stage} className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{PIPELINE_STAGE_LABEL[stage]}</p>
                  <Badge tone="slate">{stagePlayers.length}</Badge>
                </div>
                <div className="flex min-h-[120px] flex-1 flex-col gap-2 rounded-xl bg-slate-100/60 p-2">
                  {stagePlayers.map((p) => <PipelineCard key={p.id} player={p} />)}
                  {stagePlayers.length === 0 && (
                    <p className="px-2 py-4 text-center text-xs text-slate-400">No players</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
