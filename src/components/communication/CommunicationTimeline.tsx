"use client";

import { useMemo, useState } from "react";
import {
  Mail,
  MessageCircle,
  MessagesSquare,
  Phone,
  StickyNote,
  Users,
  Plus,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { AGENTS, CommunicationType, LinkedEntityType } from "@/types";
import { COMMUNICATION_TYPE_LABEL, formatDate } from "@/lib/format";
import { AskAiButton } from "@/components/ai/AskAiButton";
import { summarizeCommunication } from "@/lib/mockAi";
import { cn } from "@/lib/cn";

const TYPE_ICON: Record<CommunicationType, typeof Phone> = {
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  meeting: Users,
  video_call: MessagesSquare,
  note: StickyNote,
};

const TYPE_TONE: Record<CommunicationType, string> = {
  phone: "bg-brand-50 text-brand-600",
  whatsapp: "bg-emerald-50 text-emerald-600",
  email: "bg-violet-50 text-violet-600",
  meeting: "bg-amber-50 text-amber-600",
  video_call: "bg-cyan-50 text-cyan-600",
  note: "bg-slate-100 text-slate-600",
};

export function CommunicationTimeline({
  linkedEntityType,
  linkedEntityId,
  linkedEntityLabel,
  defaultAgent,
}: {
  linkedEntityType: LinkedEntityType;
  linkedEntityId: string;
  linkedEntityLabel: string;
  defaultAgent?: string;
}) {
  const { communications, addCommunication } = useData();
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({
    type: "phone" as CommunicationType,
    person: "",
    responsibleAgent: defaultAgent ?? AGENTS[0],
    summary: "",
    nextFollowUp: "",
    notes: "",
  });

  const entries = useMemo(
    () =>
      communications
        .filter((c) => c.linkedEntityType === linkedEntityType && c.linkedEntityId === linkedEntityId)
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    [communications, linkedEntityType, linkedEntityId]
  );

  function submit() {
    if (!draft.summary.trim()) return;
    addCommunication({
      type: draft.type,
      date: new Date().toISOString().slice(0, 10),
      person: draft.person || linkedEntityLabel,
      linkedEntityType,
      linkedEntityId,
      linkedEntityLabel,
      responsibleAgent: draft.responsibleAgent,
      summary: draft.summary.trim(),
      nextFollowUp: draft.nextFollowUp || undefined,
      notes: draft.notes || undefined,
    });
    setDraft({ type: "phone", person: "", responsibleAgent: defaultAgent ?? AGENTS[0], summary: "", nextFollowUp: "", notes: "" });
    setShowForm(false);
  }

  return (
    <Card>
      <CardHeader
        title="Communication Timeline"
        description="Calls, WhatsApp, emails, meetings, and notes"
        action={
          <div className="flex flex-wrap gap-2">
            {entries.length > 0 && (
              <AskAiButton
                label="Summarize"
                response={summarizeCommunication(entries, linkedEntityLabel)}
                contextLabel={linkedEntityLabel}
                size="sm"
              />
            )}
            <Button size="sm" variant={showForm ? "outline" : "primary"} onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" />
              Log Communication
            </Button>
          </div>
        }
      />
      <CardBody className="space-y-5">
        {showForm && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="Type">
                <Select value={draft.type} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as CommunicationType }))}>
                  {Object.entries(COMMUNICATION_TYPE_LABEL).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Person">
                <Input value={draft.person} onChange={(e) => setDraft((d) => ({ ...d, person: e.target.value }))} placeholder={linkedEntityLabel} />
              </FormField>
              <FormField label="Responsible Agent">
                <Select value={draft.responsibleAgent} onChange={(e) => setDraft((d) => ({ ...d, responsibleAgent: e.target.value }))}>
                  {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
                </Select>
              </FormField>
              <FormField label="Next Follow-up">
                <Input type="date" value={draft.nextFollowUp} onChange={(e) => setDraft((d) => ({ ...d, nextFollowUp: e.target.value }))} />
              </FormField>
            </div>
            <FormField label="Summary" required>
              <Textarea value={draft.summary} onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))} rows={2} />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" onClick={submit} disabled={!draft.summary.trim()}>Save Entry</Button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <EmptyState icon={<MessagesSquare className="h-5 w-5" />} title="No communication logged yet" />
        ) : (
          <ol className="space-y-4">
            {entries.map((entry) => {
              const Icon = TYPE_ICON[entry.type];
              return (
                <li key={entry.id} className="flex gap-3">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", TYPE_TONE[entry.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 border-b border-slate-100 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-slate-800">{COMMUNICATION_TYPE_LABEL[entry.type]}</p>
                      <span className="text-xs text-slate-400">with {entry.person}</span>
                      <span className="ml-auto text-xs text-slate-400">{formatDate(entry.date)}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{entry.summary}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {entry.responsibleAgent}
                      {entry.nextFollowUp && ` · Next follow-up: ${formatDate(entry.nextFollowUp)}`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
