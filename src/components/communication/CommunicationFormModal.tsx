"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { AGENTS, CommunicationType, LinkedEntityType } from "@/types";
import { COMMUNICATION_TYPE_LABEL } from "@/lib/format";

export function CommunicationFormModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { players, clubs, contacts, deals, addCommunication } = useData();
  const [entityType, setEntityType] = useState<LinkedEntityType>("player");
  const [entityId, setEntityId] = useState("");
  const [type, setType] = useState<CommunicationType>("phone");
  const [person, setPerson] = useState("");
  const [responsibleAgent, setResponsibleAgent] = useState<string>(AGENTS[0]);
  const [summary, setSummary] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");

  const entityOptions =
    entityType === "player"
      ? players.map((p) => ({ id: p.id, label: `${p.firstName} ${p.lastName}` }))
      : entityType === "club"
        ? clubs.map((c) => ({ id: c.id, label: c.name }))
        : entityType === "contact"
          ? contacts.map((c) => ({ id: c.id, label: `${c.firstName} ${c.lastName}` }))
          : deals.map((d) => ({ id: d.id, label: d.clubName }));

  function reset() {
    setEntityType("player");
    setEntityId("");
    setType("phone");
    setPerson("");
    setResponsibleAgent(AGENTS[0]);
    setSummary("");
    setNextFollowUp("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const entity = entityOptions.find((o) => o.id === entityId);
    if (!entity || !summary.trim()) return;
    addCommunication({
      type,
      date: new Date().toISOString().slice(0, 10),
      person: person || entity.label,
      linkedEntityType: entityType,
      linkedEntityId: entity.id,
      linkedEntityLabel: entity.label,
      responsibleAgent,
      summary: summary.trim(),
      nextFollowUp: nextFollowUp || undefined,
    });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Communication" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Entity Type">
            <Select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value as LinkedEntityType);
                setEntityId("");
              }}
            >
              <option value="player">Player</option>
              <option value="club">Club</option>
              <option value="contact">Contact</option>
              <option value="deal">Deal</option>
            </Select>
          </FormField>
          <FormField label="Linked Record" required>
            <Select required value={entityId} onChange={(e) => setEntityId(e.target.value)}>
              <option value="">Select…</option>
              {entityOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Type">
            <Select value={type} onChange={(e) => setType(e.target.value as CommunicationType)}>
              {Object.entries(COMMUNICATION_TYPE_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Person">
            <Input value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Defaults to linked record" />
          </FormField>
          <FormField label="Responsible Agent">
            <Select value={responsibleAgent} onChange={(e) => setResponsibleAgent(e.target.value)}>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormField>
          <FormField label="Next Follow-up">
            <Input type="date" value={nextFollowUp} onChange={(e) => setNextFollowUp(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Summary" required>
          <Textarea required value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!entityId || !summary.trim()}>Save Entry</Button>
        </div>
      </form>
    </Modal>
  );
}
