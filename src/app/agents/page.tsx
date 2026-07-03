"use client";

import { useMemo } from "react";
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Handshake,
  UserRound,
  UserX,
  Wallet,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useData } from "@/context/DataContext";
import { AGENT_PROFILES } from "@/lib/mockData";
import { computeAgentStats } from "@/lib/agentStats";
import { formatCurrency } from "@/lib/format";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { isModuleVisible, MODULE_KEYS } from "@/lib/permissions";
import { RestrictedNotice, RestrictedValue } from "@/components/shared/Restricted";

export default function AgentStatisticsPage() {
  const { players, deals, tasks } = useData();
  const { user, permissions } = useCurrentUser();

  const stats = useMemo(
    () => AGENT_PROFILES.map((profile) => ({
      profile,
      stats: computeAgentStats(profile.name, players, deals, tasks),
    })),
    [players, deals, tasks]
  );

  if (!isModuleVisible(user, MODULE_KEYS.agents)) {
    return (
      <div className="mx-auto max-w-3xl">
        <RestrictedNotice message="Agent Statistics are restricted for your role." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">Agent Statistics</h2>
        <p className="mt-1 text-sm text-slate-400">Performance overview across the agency</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {stats.map(({ profile, stats: s }) => (
          <Card key={profile.id}>
            <CardHeader
              title={
                <div className="flex items-center gap-3">
                  <Avatar name={profile.name} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{profile.name}</p>
                    <p className="text-xs font-normal text-slate-500">{profile.role}</p>
                  </div>
                </div>
              }
              action={
                s.overdueTasks > 0 ? (
                  <Badge tone="red">{s.overdueTasks} overdue</Badge>
                ) : (
                  <Badge tone="green">On track</Badge>
                )
              }
            />
            <CardBody>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatItem icon={UserRound} label="Players" value={s.representedPlayers} tone="brand" />
                <StatItem icon={CheckCircle2} label="Signed" value={s.signedContracts} tone="green" />
                <StatItem icon={Handshake} label="Open Deals" value={s.openDeals} tone="purple" />
                <StatItem icon={UserX} label="Without Club" value={s.playersWithoutClub} tone="amber" />
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                {permissions.canViewAllFinancials || profile.name === user.agentName ? (
                  <>
                    <div>
                      <p className="text-xs text-slate-400">Total Contract Value</p>
                      <p className="mt-0.5 text-lg font-semibold text-slate-900">{formatCurrency(s.totalContractValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Estimated Commission</p>
                      <p className="mt-0.5 text-lg font-semibold text-slate-900">{formatCurrency(s.estimatedCommission)}</p>
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-2">
                    <RestrictedValue label="Financial figures restricted" />
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5 text-slate-400" />{s.completedTasks} tasks completed</span>
                <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-slate-400" />{s.upcomingFollowUps} follow-ups in 14 days</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Agency Totals" description="Combined across all agents" action={<BarChart3 className="h-4 w-4 text-slate-400" />} />
        <CardBody>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatItem icon={UserRound} label="Total Players" value={players.length} tone="brand" />
            <StatItem icon={CheckCircle2} label="Signed Contracts" value={players.filter((p) => p.contractStatus === "signed").length} tone="green" />
            <StatItem icon={Handshake} label="Open Deals" value={deals.filter((d) => !["signed", "rejected", "cancelled", "finished"].includes(d.status)).length} tone="purple" />
            <StatItem icon={UserX} label="Players Without Club" value={players.filter((p) => !p.currentClub || p.currentClub === "Free Agent").length} tone="amber" />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof UserRound;
  label: string;
  value: number;
  tone: "brand" | "green" | "purple" | "amber";
}) {
  const toneClasses = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  }[tone];
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClasses}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
        <p className="text-[11px] text-slate-500">{label}</p>
      </div>
    </div>
  );
}
