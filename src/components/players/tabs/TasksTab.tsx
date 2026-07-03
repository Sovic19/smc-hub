"use client";

import { useMemo, useState } from "react";
import { Check, ListChecks, Plus } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TaskFormModal, TaskFormValues } from "@/components/tasks/TaskFormModal";
import { useData } from "@/context/DataContext";
import { Player } from "@/types";
import { TASK_PRIORITY_LABEL, TASK_STATUS_LABEL, relativeDayLabel } from "@/lib/format";
import { TASK_PRIORITY_TONE, TASK_STATUS_TONE } from "@/lib/statusTone";
import { cn } from "@/lib/cn";

export function TasksTab({ player }: { player: Player }) {
  const { tasks, addTask, updateTask } = useData();
  const [formOpen, setFormOpen] = useState(false);

  const playerTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.playerId === player.id)
        .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "")),
    [tasks, player.id]
  );

  function handleCreate(values: TaskFormValues) {
    addTask({ ...values, playerId: player.id });
    setFormOpen(false);
  }

  function toggleComplete(id: string, currentStatus: string) {
    updateTask(id, { status: currentStatus === "completed" ? "pending" : "completed" });
  }

  return (
    <Card>
      <CardHeader
        title="Tasks"
        description="Follow-ups, deadlines, and reminders for this player"
        action={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        }
      />
      <CardBody>
        {playerTasks.length === 0 ? (
          <EmptyState icon={<ListChecks className="h-5 w-5" />} title="No tasks linked to this player" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {playerTasks.map((task) => {
              const completed = task.status === "completed";
              return (
                <li key={task.id} className="flex items-start gap-3 py-3">
                  <button
                    onClick={() => toggleComplete(task.id, task.status)}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 text-transparent hover:border-brand-500 hover:text-brand-500"
                    )}
                    aria-label="Toggle complete"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-medium", completed ? "text-slate-400 line-through" : "text-slate-800")}>
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {task.responsibleAgent}
                      {task.isRecurring && " · Recurring"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <div className="flex gap-1.5">
                      <Badge tone={TASK_PRIORITY_TONE[task.priority]}>{TASK_PRIORITY_LABEL[task.priority]}</Badge>
                      <Badge tone={TASK_STATUS_TONE[task.status]}>{TASK_STATUS_LABEL[task.status]}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">{relativeDayLabel(task.dueDate)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>

      <TaskFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        title="Add Task"
        initialValues={{ playerId: player.id, responsibleAgent: player.responsibleAgent }}
      />
    </Card>
  );
}
