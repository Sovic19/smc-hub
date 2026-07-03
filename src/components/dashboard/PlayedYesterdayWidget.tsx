"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { daysUntil } from "@/lib/format";

export function PlayedYesterdayWidget() {
  const { games, players } = useData();

  const yesterday = games.filter((g) => daysUntil(g.date) === -1);

  return (
    <Card>
      <CardHeader
        title="Played Yesterday"
        description="Represented players in action"
        action={
          <Link href="/game-tracker" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        }
      />
      <div className="divide-y divide-slate-100">
        {yesterday.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<Activity className="h-5 w-5" />} title="No games yesterday" description="No represented players had a game yesterday." />
          </div>
        ) : (
          yesterday.map((g) => {
            const player = players.find((p) => p.id === g.playerId);
            return (
              <Link key={g.id} href="/game-tracker" className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
                <Avatar name={player ? `${player.firstName} ${player.lastName}` : "?"} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {player ? `${player.firstName} ${player.lastName}` : "Unknown player"}
                  </p>
                  <p className="truncate text-xs text-slate-400">{g.team} vs {g.opponent}</p>
                </div>
                <div className="text-right">
                  <Badge tone={g.result.startsWith("W") ? "green" : g.result.startsWith("L") ? "red" : "slate"}>{g.result}</Badge>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {g.goalieStats ? `${g.goalieStats.saves} saves` : `${g.points} pts`}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
