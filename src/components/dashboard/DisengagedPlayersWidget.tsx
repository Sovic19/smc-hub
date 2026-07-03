"use client";

import Link from "next/link";
import { UserX } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { daysUntil, relativeDayLabel } from "@/lib/format";

export function DisengagedPlayersWidget() {
  const { players } = useData();

  const disengaged = players
    .filter((p) => p.status !== "retired")
    .filter((p) => {
      const noClub = !p.currentClub || p.currentClub === "Free Agent" || p.status === "free_agent";
      const staleContact = (() => {
        const d = daysUntil(p.lastContact);
        return d !== null && d < -30;
      })();
      return noClub || staleContact;
    })
    .slice(0, 6);

  return (
    <Card>
      <CardHeader
        title="Players Without Engagement"
        description="No current club or no contact in 30+ days"
        action={<Badge tone="amber">{disengaged.length}</Badge>}
      />
      <div className="divide-y divide-slate-100">
        {disengaged.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<UserX className="h-5 w-5" />} title="Everyone is engaged" description="No players currently need re-engagement." />
          </div>
        ) : (
          disengaged.map((p) => {
            const noClub = !p.currentClub || p.currentClub === "Free Agent" || p.status === "free_agent";
            return (
              <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
                <Avatar name={`${p.firstName} ${p.lastName}`} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{p.firstName} {p.lastName}</p>
                  <p className="truncate text-xs text-slate-400">
                    {noClub ? "No current club" : `Last contact ${relativeDayLabel(p.lastContact).toLowerCase()}`}
                  </p>
                </div>
                <Badge tone="amber">{p.responsibleAgent}</Badge>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
