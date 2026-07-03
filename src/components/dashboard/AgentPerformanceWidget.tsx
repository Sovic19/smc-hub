"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useData } from "@/context/DataContext";
import { AGENT_PROFILES } from "@/lib/mockData";
import { computeAgentStats } from "@/lib/agentStats";
import { formatCurrency } from "@/lib/format";

export function AgentPerformanceWidget() {
  const { players, deals, tasks } = useData();

  const rows = AGENT_PROFILES.map((profile) => ({
    profile,
    stats: computeAgentStats(profile.name, players, deals, tasks),
  }));

  return (
    <Card>
      <CardHeader
        title="Agent Performance Summary"
        description="Quick view across all agents"
        action={
          <Link href="/agents" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            Full report
          </Link>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-medium">Agent</th>
              <th className="px-3 py-3 text-right font-medium">Players</th>
              <th className="px-3 py-3 text-right font-medium">Signed</th>
              <th className="px-3 py-3 text-right font-medium">Open Deals</th>
              <th className="px-3 py-3 text-right font-medium">Overdue</th>
              <th className="px-5 py-3 text-right font-medium">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(({ profile, stats }) => (
              <tr key={profile.id}>
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Avatar name={profile.name} size="xs" />
                    <span className="font-medium text-slate-800">{profile.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right text-slate-600">{stats.representedPlayers}</td>
                <td className="px-3 py-2.5 text-right text-slate-600">{stats.signedContracts}</td>
                <td className="px-3 py-2.5 text-right text-slate-600">{stats.openDeals}</td>
                <td className="px-3 py-2.5 text-right">
                  {stats.overdueTasks > 0 ? (
                    <Badge tone="red">{stats.overdueTasks}</Badge>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>
                <td className="px-5 py-2.5 text-right font-medium text-slate-900">
                  {formatCurrency(stats.estimatedCommission)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="p-6 text-center text-sm text-slate-400">
          <BarChart3 className="mx-auto mb-2 h-5 w-5" />
          No agent data available
        </div>
      )}
    </Card>
  );
}
