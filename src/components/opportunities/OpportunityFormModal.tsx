"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { AGENTS, Opportunity, OpportunityStatus, OpportunityType, OpportunityUrgency } from "@/types";
import { OPPORTUNITY_STATUS_LABEL, OPPORTUNITY_TYPE_LABEL, TASK_PRIORITY_LABEL } from "@/lib/format";

export type OpportunityFormValues = Omit<Opportunity, "id" | "createdAt" | "updatedAt">;

function emptyValues(): OpportunityFormValues {
  return {
    title: "",
    type: "free_player_placement",
    linkedPlayerId: "",
    linkedClubId: "",
    linkedContactId: "",
    linkedDealId: "",
    league: "",
    country: "",
    estimatedValue: undefined,
    currency: "EUR",
    urgency: "medium",
    responsibleAgent: AGENTS[0],
    recommendedAction: "",
    status: "new",
    notes: "",
  };
}

export function OpportunityFormModal({
  open,
  onClose,
  onSubmit,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: OpportunityFormValues) => void;
  title: string;
}) {
  const { players, clubs, contacts } = useData();
  const [values, setValues] = useState<OpportunityFormValues>(emptyValues());

  useEffect(() => {
    if (open) setValues(emptyValues());
  }, [open]);

  function set<K extends keyof OpportunityFormValues>(key: K, value: OpportunityFormValues[K]) {
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Opportunity Type">
            <Select value={values.type} onChange={(e) => set("type", e.target.value as OpportunityType)}>
              {Object.entries(OPPORTUNITY_TYPE_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Urgency">
            <Select value={values.urgency} onChange={(e) => set("urgency", e.target.value as OpportunityUrgency)}>
              {Object.entries(TASK_PRIORITY_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={values.status} onChange={(e) => set("status", e.target.value as OpportunityStatus)}>
              {Object.entries(OPPORTUNITY_STATUS_LABEL).map(([val, label]) => (
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
          <FormField label="League">
            <Input value={values.league ?? ""} onChange={(e) => set("league", e.target.value)} />
          </FormField>
          <FormField label="Country">
            <Input value={values.country ?? ""} onChange={(e) => set("country", e.target.value)} />
          </FormField>
          <FormField label="Responsible Agent">
            <Select value={values.responsibleAgent} onChange={(e) => set("responsibleAgent", e.target.value)}>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormField>
          <FormField label="Estimated Value">
            <Input type="number" min={0} value={values.estimatedValue ?? ""} onChange={(e) => set("estimatedValue", e.target.value === "" ? undefined : Number(e.target.value))} />
          </FormField>
          <FormField label="Currency">
            <Input value={values.currency ?? ""} onChange={(e) => set("currency", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Recommended Action">
          <Textarea value={values.recommendedAction} onChange={(e) => set("recommendedAction", e.target.value)} />
        </FormField>
        <FormField label="Notes">
          <Textarea value={values.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Opportunity</Button>
        </div>
      </form>
    </Modal>
  );
}
