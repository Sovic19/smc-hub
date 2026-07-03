"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { AGENTS, AlertItem, AlertPriority, AlertType } from "@/types";
import { ALERT_TYPE_LABEL, TASK_PRIORITY_LABEL } from "@/lib/format";

export type AlertFormValues = Omit<AlertItem, "id" | "createdAt" | "updatedAt">;

function emptyValues(): AlertFormValues {
  return {
    type: "missing_key_data",
    priority: "medium",
    title: "",
    description: "",
    linkedPlayerId: "",
    linkedClubId: "",
    linkedContactId: "",
    linkedDealId: "",
    linkedGameId: "",
    responsibleAgent: AGENTS[0],
    createdDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    status: "new",
    recommendedAction: "",
    aiSuggestedNextStep: "",
  };
}

export function AlertFormModal({
  open,
  onClose,
  onSubmit,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AlertFormValues) => void;
  title: string;
}) {
  const { players, clubs, contacts } = useData();
  const [values, setValues] = useState<AlertFormValues>(emptyValues());

  useEffect(() => {
    if (open) setValues(emptyValues());
  }, [open]);

  function set<K extends keyof AlertFormValues>(key: K, value: AlertFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Title" required>
          <Input required value={values.title} onChange={(e) => set("title", e.target.value)} />
        </FormField>
        <FormField label="Description">
          <Textarea value={values.description} onChange={(e) => set("description", e.target.value)} />
        </FormField>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Alert Type">
            <Select value={values.type} onChange={(e) => set("type", e.target.value as AlertType)}>
              {Object.entries(ALERT_TYPE_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Priority">
            <Select value={values.priority} onChange={(e) => set("priority", e.target.value as AlertPriority)}>
              {Object.entries(TASK_PRIORITY_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Linked Player">
            <Select value={values.linkedPlayerId ?? ""} onChange={(e) => set("linkedPlayerId", e.target.value)}>
              <option value="">None</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </Select>
          </FormField>
          <FormField label="Linked Club">
            <Select value={values.linkedClubId ?? ""} onChange={(e) => set("linkedClubId", e.target.value)}>
              <option value="">None</option>
              {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Linked Contact">
            <Select value={values.linkedContactId ?? ""} onChange={(e) => set("linkedContactId", e.target.value)}>
              <option value="">None</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
            </Select>
          </FormField>
          <FormField label="Responsible Agent">
            <Select value={values.responsibleAgent} onChange={(e) => set("responsibleAgent", e.target.value)}>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormField>
          <FormField label="Due Date">
            <Input type="date" value={values.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Recommended Action">
          <Textarea value={values.recommendedAction ?? ""} onChange={(e) => set("recommendedAction", e.target.value)} />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Alert</Button>
        </div>
      </form>
    </Modal>
  );
}
