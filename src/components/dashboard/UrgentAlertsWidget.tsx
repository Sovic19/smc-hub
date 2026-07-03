"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { ALERT_TYPE_LABEL, TASK_PRIORITY_LABEL } from "@/lib/format";
import { TASK_PRIORITY_TONE } from "@/lib/statusTone";

export function UrgentAlertsWidget() {
  const { alerts } = useData();

  const urgent = alerts
    .filter((a) => (a.priority === "urgent" || a.priority === "high") && a.status !== "resolved" && a.status !== "dismissed")
    .sort((a, b) => b.createdDate.localeCompare(a.createdDate))
    .slice(0, 6);

  return (
    <Card>
      <CardHeader
        title="Urgent Alerts"
        description="High-priority alerts needing attention"
        action={
          <Link href="/alerts" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        }
      />
      <div className="divide-y divide-slate-100">
        {urgent.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<AlertTriangle className="h-5 w-5" />}
              title="No urgent alerts"
              description="Nothing needs immediate attention right now."
            />
          </div>
        ) : (
          urgent.map((a) => (
            <Link key={a.id} href="/alerts" className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{a.title}</p>
                <p className="mt-0.5 truncate text-xs text-slate-400">{a.description}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge tone={TASK_PRIORITY_TONE[a.priority]}>{TASK_PRIORITY_LABEL[a.priority]}</Badge>
                <span className="text-[11px] text-slate-400">{ALERT_TYPE_LABEL[a.type]}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
