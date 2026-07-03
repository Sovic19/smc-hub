"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { Contact } from "@/types";
import { CONTACT_CATEGORY_LABEL, RELATIONSHIP_STRENGTH_LABEL } from "@/lib/format";

export type ContactFormValues = Omit<Contact, "id" | "createdAt" | "updatedAt">;

function emptyValues(): ContactFormValues {
  return {
    firstName: "",
    lastName: "",
    category: "other",
    role: "",
    organization: "",
    linkedClubId: "",
    country: "",
    league: "",
    phone: "",
    email: "",
    whatsapp: "",
    relationshipStrength: "new",
    lastContact: "",
    nextFollowUp: "",
    notes: "",
    dataSource: "manual",
    syncStatus: "not_synced",
    manualOverride: false,
  };
}

export function ContactFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ContactFormValues) => void;
  initialValues?: Partial<ContactFormValues>;
  title: string;
}) {
  const { clubs } = useData();
  const [values, setValues] = useState<ContactFormValues>({
    ...emptyValues(),
    ...initialValues,
  });

  useEffect(() => {
    if (open) {
      setValues({ ...emptyValues(), ...initialValues });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) {
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
          <FormField label="First Name" required>
            <Input required value={values.firstName} onChange={(e) => set("firstName", e.target.value)} />
          </FormField>
          <FormField label="Last Name" required>
            <Input required value={values.lastName} onChange={(e) => set("lastName", e.target.value)} />
          </FormField>
          <FormField label="Category">
            <Select value={values.category} onChange={(e) => set("category", e.target.value as Contact["category"])}>
              {Object.entries(CONTACT_CATEGORY_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Role">
            <Input value={values.role} onChange={(e) => set("role", e.target.value)} />
          </FormField>
          <FormField label="Organization">
            <Input value={values.organization} onChange={(e) => set("organization", e.target.value)} />
          </FormField>
          <FormField label="Linked Club">
            <Select value={values.linkedClubId ?? ""} onChange={(e) => set("linkedClubId", e.target.value)}>
              <option value="">None</option>
              {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Country">
            <Input value={values.country} onChange={(e) => set("country", e.target.value)} />
          </FormField>
          <FormField label="League">
            <Input value={values.league} onChange={(e) => set("league", e.target.value)} />
          </FormField>
          <FormField label="Relationship Strength">
            <Select value={values.relationshipStrength} onChange={(e) => set("relationshipStrength", e.target.value as Contact["relationshipStrength"])}>
              {Object.entries(RELATIONSHIP_STRENGTH_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
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
          <FormField label="Last Contact">
            <Input type="date" value={values.lastContact ?? ""} onChange={(e) => set("lastContact", e.target.value)} />
          </FormField>
          <FormField label="Next Follow-up">
            <Input type="date" value={values.nextFollowUp ?? ""} onChange={(e) => set("nextFollowUp", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Notes">
          <Textarea value={values.notes} onChange={(e) => set("notes", e.target.value)} />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Contact</Button>
        </div>
      </form>
    </Modal>
  );
}
