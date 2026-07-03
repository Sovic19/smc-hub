"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { AGENTS, CommissionPaymentStatus, Deal, DealStatus, DealType, RelationshipStrength } from "@/types";
import {
  COMMISSION_PAYMENT_STATUS_LABEL,
  DEAL_STATUS_LABEL,
  DEAL_TYPE_LABEL,
  RELATIONSHIP_STRENGTH_LABEL,
} from "@/lib/format";

export type DealFormValues = Omit<Deal, "id" | "createdAt" | "updatedAt" | "timeline">;

const CURRENCIES = ["EUR", "USD", "CZK", "SEK", "CHF", "GBP", "NOK"];

function emptyValues(): DealFormValues {
  return {
    playerId: "",
    clubId: "",
    clubName: "",
    league: "",
    country: "",
    responsibleAgent: AGENTS[0],
    negotiatingAgent: "",
    clubContact: "",
    status: "scouting",
    dealType: "professional_contract",
    expectedSalary: undefined,
    finalSalary: undefined,
    currency: "EUR",
    bonuses: "",
    housing: "",
    car: "",
    commission: { paymentStatus: "unpaid" },
    contractStartDate: "",
    contractEndDate: "",
    relationshipStrength: "new",
    notes: "",
    nextAction: "",
    deadline: "",
  };
}

export function DealFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: DealFormValues) => void;
  initialValues?: Partial<DealFormValues>;
  title: string;
}) {
  const { players, clubs } = useData();
  const [values, setValues] = useState<DealFormValues>({ ...emptyValues(), ...initialValues });

  useEffect(() => {
    if (open) setValues({ ...emptyValues(), ...initialValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof DealFormValues>(key: K, value: DealFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setCommission<K extends keyof DealFormValues["commission"]>(key: K, value: DealFormValues["commission"][K]) {
    setValues((prev) => ({ ...prev, commission: { ...prev.commission, [key]: value } }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  function handleClubChange(clubId: string) {
    const club = clubs.find((c) => c.id === clubId);
    setValues((prev) => ({
      ...prev,
      clubId,
      clubName: club?.name ?? prev.clubName,
      league: club?.league ?? prev.league,
      country: club?.country ?? prev.country,
      relationshipStrength: club?.relationshipStrength ?? prev.relationshipStrength,
    }));
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Player" required>
            <Select required value={values.playerId} onChange={(e) => set("playerId", e.target.value)}>
              <option value="">Select player…</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </Select>
          </FormField>
          <FormField label="Club">
            <Select value={values.clubId ?? ""} onChange={(e) => handleClubChange(e.target.value)}>
              <option value="">Select club…</option>
              {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Club Name (if not listed)">
            <Input value={values.clubName} onChange={(e) => set("clubName", e.target.value)} />
          </FormField>
          <FormField label="League">
            <Input value={values.league} onChange={(e) => set("league", e.target.value)} />
          </FormField>
          <FormField label="Country">
            <Input value={values.country} onChange={(e) => set("country", e.target.value)} />
          </FormField>
          <FormField label="Deal Status">
            <Select value={values.status} onChange={(e) => set("status", e.target.value as DealStatus)}>
              {Object.entries(DEAL_STATUS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Deal Type">
            <Select value={values.dealType} onChange={(e) => set("dealType", e.target.value as DealType)}>
              {Object.entries(DEAL_TYPE_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Responsible SMC Agent">
            <Select value={values.responsibleAgent} onChange={(e) => set("responsibleAgent", e.target.value)}>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormField>
          <FormField label="Negotiating Agent">
            <Select value={values.negotiatingAgent ?? ""} onChange={(e) => set("negotiatingAgent", e.target.value)}>
              <option value="">—</option>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormField>
          <FormField label="Club Contact">
            <Input value={values.clubContact} onChange={(e) => set("clubContact", e.target.value)} />
          </FormField>
          <FormField label="Relationship Strength">
            <Select value={values.relationshipStrength ?? "new"} onChange={(e) => set("relationshipStrength", e.target.value as RelationshipStrength)}>
              {Object.entries(RELATIONSHIP_STRENGTH_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Expected Salary">
            <Input type="number" min={0} value={values.expectedSalary ?? ""} onChange={(e) => set("expectedSalary", e.target.value === "" ? undefined : Number(e.target.value))} />
          </FormField>
          <FormField label="Final Salary">
            <Input type="number" min={0} value={values.finalSalary ?? ""} onChange={(e) => set("finalSalary", e.target.value === "" ? undefined : Number(e.target.value))} />
          </FormField>
          <FormField label="Currency">
            <Select value={values.currency} onChange={(e) => set("currency", e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormField>
          <FormField label="Housing">
            <Input value={values.housing} onChange={(e) => set("housing", e.target.value)} />
          </FormField>
          <FormField label="Car">
            <Input value={values.car} onChange={(e) => set("car", e.target.value)} />
          </FormField>
          <FormField label="Contract Start">
            <Input type="date" value={values.contractStartDate ?? ""} onChange={(e) => set("contractStartDate", e.target.value)} />
          </FormField>
          <FormField label="Contract End">
            <Input type="date" value={values.contractEndDate ?? ""} onChange={(e) => set("contractEndDate", e.target.value)} />
          </FormField>
          <FormField label="Deadline">
            <Input type="date" value={values.deadline ?? ""} onChange={(e) => set("deadline", e.target.value)} />
          </FormField>
          <FormField label="Bonuses" className="sm:col-span-2">
            <Input value={values.bonuses} onChange={(e) => set("bonuses", e.target.value)} />
          </FormField>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Commission</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Commission %">
            <Input type="number" min={0} max={100} value={values.commission.percentage ?? ""} onChange={(e) => setCommission("percentage", e.target.value === "" ? undefined : Number(e.target.value))} />
          </FormField>
          <FormField label="Commission Amount">
            <Input type="number" min={0} value={values.commission.amount ?? ""} onChange={(e) => setCommission("amount", e.target.value === "" ? undefined : Number(e.target.value))} />
          </FormField>
          <FormField label="Owner">
            <Select value={values.commission.owner ?? ""} onChange={(e) => setCommission("owner", e.target.value)}>
              <option value="">—</option>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormField>
          <FormField label="Payment Status">
            <Select value={values.commission.paymentStatus} onChange={(e) => setCommission("paymentStatus", e.target.value as CommissionPaymentStatus)}>
              {Object.entries(COMMISSION_PAYMENT_STATUS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Next Action">
          <Input value={values.nextAction ?? ""} onChange={(e) => set("nextAction", e.target.value)} />
        </FormField>
        <FormField label="Notes">
          <Textarea value={values.notes} onChange={(e) => set("notes", e.target.value)} />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Deal</Button>
        </div>
      </form>
    </Modal>
  );
}
