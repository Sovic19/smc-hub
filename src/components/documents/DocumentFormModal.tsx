"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { AgencyDocument, DocumentCategory, DocumentStatus } from "@/types";
import { DOCUMENT_CATEGORY_LABEL, DOCUMENT_STATUS_LABEL } from "@/lib/format";

export type DocumentFormValues = Omit<AgencyDocument, "id" | "uploadedAt">;

function emptyValues(): DocumentFormValues {
  return {
    title: "",
    category: "other",
    linkedPlayerId: "",
    linkedClubId: "",
    linkedDealId: "",
    expiryDate: "",
    status: "valid",
    notes: "",
    fileUrl: "",
    sizeLabel: "",
  };
}

export function DocumentFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: DocumentFormValues) => void;
  initialValues?: Partial<DocumentFormValues>;
  title: string;
}) {
  const { players, clubs, deals } = useData();
  const [values, setValues] = useState<DocumentFormValues>({ ...emptyValues(), ...initialValues });

  useEffect(() => {
    if (open) setValues({ ...emptyValues(), ...initialValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof DocumentFormValues>(key: K, value: DocumentFormValues[K]) {
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Category">
            <Select value={values.category} onChange={(e) => set("category", e.target.value as DocumentCategory)}>
              {Object.entries(DOCUMENT_CATEGORY_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={values.status} onChange={(e) => set("status", e.target.value as DocumentStatus)}>
              {Object.entries(DOCUMENT_STATUS_LABEL).map(([val, label]) => (
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
          <FormField label="Linked Deal">
            <Select value={values.linkedDealId ?? ""} onChange={(e) => set("linkedDealId", e.target.value)}>
              <option value="">None</option>
              {deals.map((d) => <option key={d.id} value={d.id}>{d.clubName}</option>)}
            </Select>
          </FormField>
          <FormField label="Expiry Date">
            <Input type="date" value={values.expiryDate ?? ""} onChange={(e) => set("expiryDate", e.target.value)} />
          </FormField>
          <FormField label="File URL" className="sm:col-span-2" hint="Placeholder only — no real file storage in this pilot">
            <Input value={values.fileUrl ?? ""} onChange={(e) => set("fileUrl", e.target.value)} placeholder="https://…" />
          </FormField>
        </div>
        <FormField label="Notes">
          <Textarea value={values.notes} onChange={(e) => set("notes", e.target.value)} />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Document</Button>
        </div>
      </form>
    </Modal>
  );
}
