"use client";

import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { daysUntil, formatDate, relativeDayLabel } from "@/lib/format";
import { FileClock } from "lucide-react";

export function ExpirationsWidget() {
  const { players } = useData();

  const expiring = players
    .filter((p) => {
      if (p.status === "retired" || p.status === "inactive") return false;
      const d = daysUntil(p.clubContractEndDate);
      return d !== null && d <= 90;
    })
    .sort((a, b) => (daysUntil(a.clubContractEndDate) ?? 0) - (daysUntil(b.clubContractEndDate) ?? 0))
    .slice(0, 6);

  return (
    <Card>
      <CardHeader
        title="Upcoming Contract Expirations"
        description="Club contracts expiring within 90 days"
        action={
          <Link href="/players" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        }
      />
      <div className="divide-y divide-slate-100">
        {expiring.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<FileClock className="h-5 w-5" />}
              title="No contracts expiring soon"
              description="All club contracts are outside the 90-day window."
            />
          </div>
        ) : (
          expiring.map((p) => {
            const d = daysUntil(p.clubContractEndDate);
            const overdue = d !== null && d < 0;
            const urgent = d !== null && d >= 0 && d <= 30;
            return (
              <Link
                key={p.id}
                href={`/players/${p.id}`}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
              >
                <Avatar name={`${p.firstName} ${p.lastName}`} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {p.currentClub} · {p.currentLeague}
                  </p>
                </div>
                <div className="text-right">
                  <Badge tone={overdue ? "red" : urgent ? "amber" : "slate"}>
                    {relativeDayLabel(p.clubContractEndDate)}
                  </Badge>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formatDate(p.clubContractEndDate)}
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
