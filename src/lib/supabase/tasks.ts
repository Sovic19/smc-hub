import { supabase } from "@/lib/supabase/client";
import { TaskItem } from "@/types";

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  player_id: string | null;
  club_id: string | null;
  contact_id: string | null;
  responsible_agent: string;
  priority: string;
  status: string;
  due_date: string | null;
  is_recurring: boolean;
  recurrence_note: string | null;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}

function rowToTask(row: TaskRow): TaskItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    playerId: row.player_id ?? undefined,
    clubId: row.club_id ?? undefined,
    contactId: row.contact_id ?? undefined,
    responsibleAgent: row.responsible_agent,
    priority: row.priority as TaskItem["priority"],
    status: row.status as TaskItem["status"],
    dueDate: row.due_date ?? undefined,
    isRecurring: row.is_recurring,
    recurrenceNote: row.recurrence_note ?? undefined,
    reminderEnabled: row.reminder_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function taskToRow(task: Partial<TaskItem>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (task.title !== undefined) row.title = task.title;
  if (task.description !== undefined) row.description = task.description || null;
  if (task.playerId !== undefined) row.player_id = task.playerId || null;
  if (task.clubId !== undefined) row.club_id = task.clubId || null;
  if (task.contactId !== undefined) row.contact_id = task.contactId || null;
  if (task.responsibleAgent !== undefined) row.responsible_agent = task.responsibleAgent;
  if (task.priority !== undefined) row.priority = task.priority;
  if (task.status !== undefined) row.status = task.status;
  if (task.dueDate !== undefined) row.due_date = task.dueDate || null;
  if (task.isRecurring !== undefined) row.is_recurring = task.isRecurring;
  if (task.recurrenceNote !== undefined) row.recurrence_note = task.recurrenceNote || null;
  if (task.reminderEnabled !== undefined) row.reminder_enabled = task.reminderEnabled;
  return row;
}

export async function fetchTasks(): Promise<TaskItem[]> {
  const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as TaskRow[]).map(rowToTask);
}

export async function insertTask(task: Omit<TaskItem, "id" | "createdAt" | "updatedAt">): Promise<TaskItem> {
  const { data, error } = await supabase.from("tasks").insert(taskToRow(task)).select("*").single();
  if (error) throw error;
  return rowToTask(data as TaskRow);
}

export async function updateTaskRow(id: string, updates: Partial<TaskItem>): Promise<void> {
  const row = taskToRow(updates);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("tasks").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteTaskRow(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
