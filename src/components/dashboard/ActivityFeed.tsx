"use client";

import {
  Activity,
  UserPlus,
  FileText,
  CheckCircle2,
  Building2,
  Contact as ContactIcon,
  StickyNote,
  Handshake,
  File,
  MessagesSquare,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { timeAgo } from "@/lib/format";
import { ActivityType } from "@/types";
import { cn } from "@/lib/cn";

const ICONS: Record<ActivityType, typeof UserPlus> = {
  player_added: UserPlus,
  player_updated: FileText,
  contract_updated: FileText,
  task_completed: CheckCircle2,
  note_added: StickyNote,
  club_added: Building2,
  contact_added: ContactIcon,
  deal_updated: Handshake,
  document_added: File,
  communication_logged: MessagesSquare,
};

const TONE: Record<ActivityType, string> = {
  player_added: "bg-brand-50 text-brand-600",
  player_updated: "bg-slate-100 text-slate-600",
  contract_updated: "bg-amber-50 text-amber-600",
  task_completed: "bg-emerald-50 text-emerald-600",
  note_added: "bg-violet-50 text-violet-600",
  club_added: "bg-cyan-50 text-cyan-600",
  contact_added: "bg-rose-50 text-rose-600",
  deal_updated: "bg-indigo-50 text-indigo-600",
  document_added: "bg-slate-100 text-slate-600",
  communication_logged: "bg-brand-50 text-brand-600",
};

export function ActivityFeed() {
  const { activity } = useData();
  const sorted = [...activity].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp)
  );

  return (
    <Card>
      <CardHeader title="Recent Activity" description="Latest updates across the agency" />
      <div className="max-h-[520px] overflow-y-auto px-5 py-4">
        {sorted.length === 0 ? (
          <EmptyState
            icon={<Activity className="h-5 w-5" />}
            title="No activity yet"
            description="Actions across the agency will appear here."
          />
        ) : (
          <ol className="space-y-4">
            {sorted.slice(0, 10).map((entry) => {
              const Icon = ICONS[entry.type] ?? Activity;
              return (
                <li key={entry.id} className="flex gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      TONE[entry.type]
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 pb-1">
                    <p className="text-sm text-slate-700">{entry.message}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {entry.agent} · {timeAgo(entry.timestamp)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </Card>
  );
}
