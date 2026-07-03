"use client";

import Link from "next/link";
import { AlarmClock, Check } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { daysUntil } from "@/lib/format";
import { TASK_PRIORITY_LABEL } from "@/lib/format";
import { TASK_PRIORITY_TONE } from "@/lib/statusTone";
import { cn } from "@/lib/cn";

export function TasksDueTodayWidget() {
  const { tasks, updateTask, getPlayer } = useData();

  const dueToday = tasks
    .filter((t) => t.status !== "completed" && daysUntil(t.dueDate) === 0)
    .sort((a, b) => (a.priority > b.priority ? -1 : 1));

  return (
    <Card>
      <CardHeader
        title="Tasks Due Today"
        description="Everything that needs to happen today"
        action={
          <Link href="/tasks" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        }
      />
      <div className="divide-y divide-slate-100">
        {dueToday.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<AlarmClock className="h-5 w-5" />} title="Nothing due today" description="You're all caught up." />
          </div>
        ) : (
          dueToday.map((task) => {
            const player = task.playerId ? getPlayer(task.playerId) : undefined;
            return (
              <div key={task.id} className="flex items-center gap-3 px-5 py-3">
                <button
                  onClick={() => updateTask(task.id, { status: "completed" })}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 text-transparent transition-colors hover:border-brand-500 hover:text-brand-500"
                  )}
                  aria-label="Mark task complete"
                >
                  <Check className="h-3 w-3" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{task.title}</p>
                  <p className="truncate text-xs text-slate-400">
                    {player ? `${player.firstName} ${player.lastName} · ` : ""}
                    {task.responsibleAgent}
                  </p>
                </div>
                <Badge tone={TASK_PRIORITY_TONE[task.priority]}>{TASK_PRIORITY_LABEL[task.priority]}</Badge>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
