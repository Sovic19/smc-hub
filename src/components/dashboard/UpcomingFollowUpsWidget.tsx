"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { FOLLOW_UP_STATUS_LABEL, daysUntil, relativeDayLabel } from "@/lib/format";
import { FOLLOW_UP_STATUS_TONE } from "@/lib/statusTone";

export function UpcomingFollowUpsWidget() {
  const { players } = useData();

  const upcoming = players
    .filter((p) => {
      const d = daysUntil(p.nextFollowUp);
      return d !== null && d >= 0 && d <= 14;
    })
    .sort((a, b) => (daysUntil(a.nextFollowUp) ?? 0) - (daysUntil(b.nextFollowUp) ?? 0))
    .slice(0, 6);

  return (
    <Card>
      <CardHeader title="Upcoming Follow-ups" description="Player check-ins due within 14 days" />
      <div className="divide-y divide-slate-100">
        {upcoming.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<CalendarClock className="h-5 w-5" />} title="No follow-ups due soon" />
          </div>
        ) : (
          upcoming.map((p) => (
            <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
              <Avatar name={`${p.firstName} ${p.lastName}`} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{p.firstName} {p.lastName}</p>
                <p className="truncate text-xs text-slate-400">{p.responsibleAgent}</p>
              </div>
              <div className="text-right">
                <Badge tone={FOLLOW_UP_STATUS_TONE[p.followUpStatus]}>{FOLLOW_UP_STATUS_LABEL[p.followUpStatus]}</Badge>
                <p className="mt-1 text-[11px] text-slate-400">{relativeDayLabel(p.nextFollowUp)}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
