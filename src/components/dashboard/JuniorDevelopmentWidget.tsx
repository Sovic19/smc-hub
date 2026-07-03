"use client";

import Link from "next/link";
import { Award, CalendarClock, GraduationCap, Users } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { daysUntil, relativeDayLabel } from "@/lib/format";
import { isJuniorWithoutProContract } from "@/lib/junior";

function StatChip({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  tone: "brand" | "purple" | "amber";
}) {
  const toneClasses = {
    brand: "bg-brand-50 text-brand-600",
    purple: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  }[tone];
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-900">{value}</p>
        <p className="text-[11px] text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function JuniorDevelopmentWidget() {
  const { players } = useData();

  const juniors = players.filter((p) => p.category === "junior");
  const withoutProContract = juniors.filter((p) => isJuniorWithoutProContract(p));
  const currentYear = new Date().getFullYear();
  const draftEligibleUpcoming = juniors
    .filter((p) => p.draftEligibilityYear !== undefined && p.draftEligibilityYear >= currentYear)
    .sort((a, b) => (a.draftEligibilityYear ?? 0) - (b.draftEligibilityYear ?? 0));
  const juniorFollowUps = juniors
    .filter((p) => {
      const d = daysUntil(p.nextFollowUp);
      return d !== null && d >= 0 && d <= 21;
    })
    .sort((a, b) => (daysUntil(a.nextFollowUp) ?? 0) - (daysUntil(b.nextFollowUp) ?? 0));

  return (
    <Card>
      <CardHeader
        title="Junior Development"
        description="Prospects, academy players, and draft-track juniors"
        action={
          <Link href="/players?category=junior" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        }
      />
      <div className="grid grid-cols-3 gap-3 px-5 py-4">
        <StatChip icon={Users} label="Junior Players" value={juniors.length} tone="brand" />
        <StatChip icon={GraduationCap} label="Without Pro Contract" value={withoutProContract.length} tone="purple" />
        <StatChip icon={Award} label="Draft Eligible" value={draftEligibleUpcoming.length} tone="amber" />
      </div>

      <div className="grid grid-cols-1 divide-y divide-slate-100 border-t border-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <div>
          <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Upcoming Draft Eligible
          </p>
          {draftEligibleUpcoming.length === 0 ? (
            <div className="px-5 py-4">
              <EmptyState icon={<Award className="h-5 w-5" />} title="No upcoming draft-eligible juniors" />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {draftEligibleUpcoming.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/players/${p.id}`}
                  className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-slate-50"
                >
                  <Avatar name={`${p.firstName} ${p.lastName}`} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{p.firstName} {p.lastName}</p>
                    <p className="truncate text-xs text-slate-400">{p.juniorTeam || p.currentClub}</p>
                  </div>
                  <Badge tone="amber">{p.draftEligibilityYear}</Badge>
                </Link>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Junior Follow-ups Due Soon
          </p>
          {juniorFollowUps.length === 0 ? (
            <div className="px-5 py-4">
              <EmptyState icon={<CalendarClock className="h-5 w-5" />} title="No junior follow-ups due soon" />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {juniorFollowUps.slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  href={`/players/${p.id}`}
                  className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-slate-50"
                >
                  <Avatar name={`${p.firstName} ${p.lastName}`} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{p.firstName} {p.lastName}</p>
                    <p className="truncate text-xs text-slate-400">{p.responsibleAgent}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{relativeDayLabel(p.nextFollowUp)}</span>
                </Link>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
