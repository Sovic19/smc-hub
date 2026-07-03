"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { daysUntil, formatDate } from "@/lib/format";

export function TopPerformancesWidget() {
  const { games, players } = useData();

  const top = games
    .filter((g) => {
      const d = daysUntil(g.date);
      return d !== null && d >= -7 && d <= 0 && !g.goalieStats;
    })
    .sort((a, b) => b.points - a.points)
    .slice(0, 6);

  return (
    <Card>
      <CardHeader
        title="Top Performances This Week"
        description="Best point totals in the last 7 days"
        action={
          <Link href="/game-tracker" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        }
      />
      <div className="divide-y divide-slate-100">
        {top.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<Trophy className="h-5 w-5" />} title="No recent games" description="No games recorded in the last 7 days." />
          </div>
        ) : (
          top.map((g) => {
            const player = players.find((p) => p.id === g.playerId);
            return (
              <Link key={g.id} href="/game-tracker" className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
                <Avatar name={player ? `${player.firstName} ${player.lastName}` : "?"} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {player ? `${player.firstName} ${player.lastName}` : "Unknown player"}
                  </p>
                  <p className="truncate text-xs text-slate-400">vs {g.opponent} · {formatDate(g.date)}</p>
                </div>
                <Badge tone="green">{g.points} pts</Badge>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
