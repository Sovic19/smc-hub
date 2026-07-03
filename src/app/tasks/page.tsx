"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlarmClock,
  Bell,
  Check,
  ListChecks,
  Pencil,
  Plus,
  Repeat,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useData } from "@/context/DataContext";
import {
  TaskFormModal,
  TaskFormValues,
} from "@/components/tasks/TaskFormModal";
import {
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  daysUntil,
  formatDate,
  relativeDayLabel,
} from "@/lib/format";
import { TASK_PRIORITY_TONE, TASK_STATUS_TONE } from "@/lib/statusTone";
import { AGENTS, TaskItem, TaskPriority, TaskStatus } from "@/types";
import { cn } from "@/lib/cn";

const STATUS_TABS: { key: TaskStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "urgent", label: "Urgent" },
  { key: "completed", label: "Completed" },
  { key: "postponed", label: "Postponed" },
];

type ViewMode = "all" | "today" | "overdue";

export default function TasksPage() {
  const { tasks, players, clubs, contacts, addTask, updateTask, deleteTask } = useData();
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);

  const getPlayer = (id?: string) => players.find((p) => p.id === id);
  const getClub = (id?: string) => clubs.find((c) => c.id === id);
  const getContact = (id?: string) => contacts.find((c) => c.id === id);

  const todayCount = useMemo(
    () => tasks.filter((t) => t.status !== "completed" && daysUntil(t.dueDate) === 0).length,
    [tasks]
  );
  const overdueCount = useMemo(
    () => tasks.filter((t) => t.status !== "completed" && (daysUntil(t.dueDate) ?? 1) < 0).length,
    [tasks]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((t) => (statusTab === "all" ? true : t.status === statusTab))
      .filter((t) => (priorityFilter === "all" ? true : t.priority === priorityFilter))
      .filter((t) => (agentFilter === "all" ? true : t.responsibleAgent === agentFilter))
      .filter((t) => (q ? t.title.toLowerCase().includes(q) : true))
      .filter((t) => {
        if (viewMode === "all") return true;
        if (t.status === "completed") return false;
        const d = daysUntil(t.dueDate);
        if (viewMode === "today") return d === 0;
        if (viewMode === "overdue") return d !== null && d < 0;
        return true;
      })
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [tasks, query, statusTab, priorityFilter, agentFilter, viewMode]);

  function handleCreate(values: TaskFormValues) {
    addTask(values);
    setFormOpen(false);
  }

  function handleUpdate(values: TaskFormValues) {
    if (!editingTask) return;
    updateTask(editingTask.id, values);
    setEditingTask(null);
  }

  function toggleComplete(task: TaskItem) {
    updateTask(task.id, {
      status: task.status === "completed" ? "pending" : "completed",
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Tasks</h2>
          <p className="mt-1 text-sm text-slate-400">
            {tasks.filter((t) => t.status !== "completed").length} open items
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { key: "all" as ViewMode, label: "All Tasks", value: tasks.filter((t) => t.status !== "completed").length, icon: ListChecks, tone: "text-brand-600 bg-brand-50" },
          { key: "today" as ViewMode, label: "Due Today", value: todayCount, icon: AlarmClock, tone: "text-amber-600 bg-amber-50" },
          { key: "overdue" as ViewMode, label: "Overdue", value: overdueCount, icon: Bell, tone: "text-red-600 bg-red-50" },
        ].map((v) => {
          const Icon = v.icon;
          return (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key)}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                viewMode === v.key ? "border-brand-400 bg-brand-50/50 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50"
              )}
            >
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", v.tone)}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{v.value}</p>
                <p className="text-xs text-slate-500">{v.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search tasks…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:shrink-0">
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "all")} className="lg:w-40">
              <option value="all">All priorities</option>
              {Object.entries(TASK_PRIORITY_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
            <Select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className="lg:w-44">
              <option value="all">All agents</option>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                statusTab === tab.key
                  ? "bg-brand-600 text-white ring-brand-600"
                  : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<ListChecks className="h-5 w-5" />}
              title="No tasks found"
              description="Try adjusting your filters or add a new task."
              action={
                <Button size="sm" onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((task) => {
              const player = getPlayer(task.playerId);
              const club = getClub(task.clubId);
              const contact = getContact(task.contactId);
              const completed = task.status === "completed";
              return (
                <li key={task.id} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center">
                  <button
                    onClick={() => toggleComplete(task)}
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 text-transparent hover:border-brand-500 hover:text-brand-500"
                    )}
                    aria-label="Toggle complete"
                  >
                    <Check className="h-3 w-3" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-sm font-medium", completed ? "text-slate-400 line-through" : "text-slate-800")}>
                      {task.title}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {player && (
                        <Link href={`/players/${player.id}`} className="text-brand-600 hover:underline">
                          {player.firstName} {player.lastName}
                        </Link>
                      )}
                      {club && (
                        <Link href={`/clubs/${club.id}`} className="text-brand-600 hover:underline">
                          {player ? " · " : ""}{club.name}
                        </Link>
                      )}
                      {contact && (
                        <Link href={`/contacts/${contact.id}`} className="text-brand-600 hover:underline">
                          {player || club ? " · " : ""}{contact.firstName} {contact.lastName}
                        </Link>
                      )}
                      {!player && !club && !contact && "No entity linked"}
                      {" · "}
                      {task.responsibleAgent}
                      {task.isRecurring && (
                        <span className="ml-1 inline-flex items-center gap-0.5"><Repeat className="h-3 w-3" /></span>
                      )}
                      {task.reminderEnabled && (
                        <span className="ml-1 inline-flex items-center gap-0.5"><Bell className="h-3 w-3" /></span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <Badge tone={TASK_PRIORITY_TONE[task.priority]}>{TASK_PRIORITY_LABEL[task.priority]}</Badge>
                    <Badge tone={TASK_STATUS_TONE[task.status]}>{TASK_STATUS_LABEL[task.status]}</Badge>
                    <span className="text-xs text-slate-400" title={formatDate(task.dueDate)}>
                      {relativeDayLabel(task.dueDate)}
                    </span>
                    <button onClick={() => setEditingTask(task)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Edit task">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeletingTask(task)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete task">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <TaskFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} title="Add New Task" />

      <TaskFormModal
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdate}
        initialValues={editingTask ?? undefined}
        title="Edit Task"
      />

      <ConfirmDialog
        open={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={() => {
          if (deletingTask) deleteTask(deletingTask.id);
        }}
        title={`Delete task "${deletingTask?.title}"?`}
        description="This action cannot be undone."
      />
    </div>
  );
}
