"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { AGENTS, TaskItem, TaskPriority, TaskStatus } from "@/types";
import { TASK_PRIORITY_LABEL, TASK_STATUS_LABEL } from "@/lib/format";

export type TaskFormValues = Omit<TaskItem, "id" | "createdAt" | "updatedAt">;

function emptyValues(): TaskFormValues {
  return {
    title: "",
    description: "",
    playerId: "",
    clubId: "",
    contactId: "",
    responsibleAgent: AGENTS[0],
    priority: "medium",
    status: "pending",
    dueDate: "",
    isRecurring: false,
    recurrenceNote: "",
    reminderEnabled: false,
  };
}

export function TaskFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
  initialValues?: Partial<TaskFormValues>;
  title: string;
}) {
  const { players, clubs, contacts } = useData();
  const [values, setValues] = useState<TaskFormValues>({
    ...emptyValues(),
    ...initialValues,
  });

  useEffect(() => {
    if (open) {
      setValues({ ...emptyValues(), ...initialValues });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Title" required>
          <Input required value={values.title} onChange={(e) => set("title", e.target.value)} />
        </FormField>
        <FormField label="Description">
          <Textarea value={values.description} onChange={(e) => set("description", e.target.value)} />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Linked Player">
            <Select value={values.playerId ?? ""} onChange={(e) => set("playerId", e.target.value)}>
              <option value="">None</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Linked Club">
            <Select value={values.clubId ?? ""} onChange={(e) => set("clubId", e.target.value)}>
              <option value="">None</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Linked Contact">
            <Select value={values.contactId ?? ""} onChange={(e) => set("contactId", e.target.value)}>
              <option value="">None</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Responsible Agent">
            <Select value={values.responsibleAgent} onChange={(e) => set("responsibleAgent", e.target.value)}>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormField>
          <FormField label="Priority">
            <Select value={values.priority} onChange={(e) => set("priority", e.target.value as TaskPriority)}>
              {Object.entries(TASK_PRIORITY_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={values.status} onChange={(e) => set("status", e.target.value as TaskStatus)}>
              {Object.entries(TASK_STATUS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Due Date">
            <Input type="date" value={values.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value)} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={values.isRecurring}
              onChange={(e) => set("isRecurring", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
            />
            Recurring task <span className="text-xs text-slate-400">(placeholder)</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={values.reminderEnabled}
              onChange={(e) => set("reminderEnabled", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
            />
            Enable reminder <span className="text-xs text-slate-400">(placeholder)</span>
          </label>
          {values.isRecurring && (
            <FormField label="Recurrence Note" className="sm:col-span-2">
              <Input
                placeholder="e.g. Repeats quarterly"
                value={values.recurrenceNote ?? ""}
                onChange={(e) => set("recurrenceNote", e.target.value)}
              />
            </FormField>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Task</Button>
        </div>
      </form>
    </Modal>
  );
}
