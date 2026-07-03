"use client";

import Link from "next/link";
import { Check, ListChecks } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { relativeDayLabel } from "@/lib/format";
import { TASK_PRIORITY_TONE } from "@/lib/statusTone";
import { TASK_PRIORITY_LABEL } from "@/lib/format";
import { cn } from "@/lib/cn";

export function TasksWidget() {
  const { tasks, updateTask, getPlayer } = useData();

  const open = tasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 6);

  return (
    <Card>
      <CardHeader
        title="Upcoming Tasks"
        description="Open items sorted by due date"
        action={
          <Link
            href="/tasks"
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            View all
          </Link>
        }
      />
      <div className="divide-y divide-slate-100">
        {open.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<ListChecks className="h-5 w-5" />}
              title="No open tasks"
              description="You're all caught up."
            />
          </div>
        ) : (
          open.map((task) => {
            const player = task.playerId ? getPlayer(task.playerId) : undefined;
            return (
              <div key={task.id} className="flex items-start gap-3 px-5 py-3">
                <button
                  onClick={() => updateTask(task.id, { status: "completed" })}
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 text-transparent transition-colors hover:border-brand-500 hover:text-brand-500"
                  )}
                  aria-label="Mark task complete"
                >
                  <Check className="h-3 w-3" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {task.title}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {player ? `${player.firstName} ${player.lastName} · ` : ""}
                    {task.responsibleAgent}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge tone={TASK_PRIORITY_TONE[task.priority]}>
                    {TASK_PRIORITY_LABEL[task.priority]}
                  </Badge>
                  <p className="text-[11px] text-slate-400">
                    {relativeDayLabel(task.dueDate)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
