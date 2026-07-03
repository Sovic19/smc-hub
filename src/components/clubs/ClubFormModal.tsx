"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Club } from "@/types";
import { RELATIONSHIP_STRENGTH_LABEL } from "@/lib/format";

export type ClubFormValues = Omit<Club, "id" | "createdAt" | "updatedAt">;

function emptyValues(): ClubFormValues {
  return {
    name: "",
    league: "",
    country: "",
    manager: "",
    headCoach: "",
    sportingManager: "",
    gm: "",
    scoutContact: "",
    phone: "",
    email: "",
    whatsapp: "",
    relationshipStrength: "new",
    notes: "",
    eliteProspectsUrl: "",
    dataSource: "manual",
    syncStatus: "not_synced",
    manualOverride: false,
  };
}

export function ClubFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ClubFormValues) => void;
  initialValues?: Partial<ClubFormValues>;
  title: string;
}) {
  const [values, setValues] = useState<ClubFormValues>({
    ...emptyValues(),
    ...initialValues,
  });

  useEffect(() => {
    if (open) {
      setValues({ ...emptyValues(), ...initialValues });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof ClubFormValues>(key: K, value: ClubFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Club Name" required>
            <Input required value={values.name} onChange={(e) => set("name", e.target.value)} />
          </FormField>
          <FormField label="League">
            <Input value={values.league} onChange={(e) => set("league", e.target.value)} />
          </FormField>
          <FormField label="Country">
            <Input value={values.country} onChange={(e) => set("country", e.target.value)} />
          </FormField>
          <FormField label="Relationship Strength">
            <Select value={values.relationshipStrength} onChange={(e) => set("relationshipStrength", e.target.value as Club["relationshipStrength"])}>
              {Object.entries(RELATIONSHIP_STRENGTH_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Manager">
            <Input value={values.manager} onChange={(e) => set("manager", e.target.value)} />
          </FormField>
          <FormField label="Head Coach">
            <Input value={values.headCoach} onChange={(e) => set("headCoach", e.target.value)} />
          </FormField>
          <FormField label="Sporting Manager">
            <Input value={values.sportingManager} onChange={(e) => set("sportingManager", e.target.value)} />
          </FormField>
          <FormField label="GM">
            <Input value={values.gm} onChange={(e) => set("gm", e.target.value)} />
          </FormField>
          <FormField label="Scout Contact">
            <Input value={values.scoutContact} onChange={(e) => set("scoutContact", e.target.value)} />
          </FormField>
          <FormField label="Phone">
            <Input type="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} />
          </FormField>
          <FormField label="Email">
            <Input type="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
          </FormField>
          <FormField label="WhatsApp">
            <Input value={values.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </FormField>
          <FormField label="EliteProspects Club URL">
            <Input type="url" value={values.eliteProspectsUrl} onChange={(e) => set("eliteProspectsUrl", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Notes">
          <Textarea value={values.notes} onChange={(e) => set("notes", e.target.value)} />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Club</Button>
        </div>
      </form>
    </Modal>
  );
}
