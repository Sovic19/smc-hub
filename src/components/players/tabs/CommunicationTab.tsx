"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FormField, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CommunicationTimeline } from "@/components/communication/CommunicationTimeline";
import { useData } from "@/context/DataContext";
import { AGENTS, FollowUpStatus, Player } from "@/types";
import { FOLLOW_UP_STATUS_LABEL, relativeDayLabel } from "@/lib/format";
import { FOLLOW_UP_STATUS_TONE } from "@/lib/statusTone";

export function CommunicationTab({ player }: { player: Player }) {
  const { updatePlayer } = useData();
  const [values, setValues] = useState({
    lastContact: player.lastContact ?? "",
    nextFollowUp: player.nextFollowUp ?? "",
    followUpDeadline: player.followUpDeadline ?? "",
    responsibleAgent: player.responsibleAgent,
    followUpStatus: player.followUpStatus,
  });
  const [dirty, setDirty] = useState(false);

  function set<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function save() {
    updatePlayer(player.id, values);
    setDirty(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Follow-up Status"
          description="Next steps and ownership"
          action={
            <Badge tone={FOLLOW_UP_STATUS_TONE[player.followUpStatus]}>
              {FOLLOW_UP_STATUS_LABEL[player.followUpStatus]}
            </Badge>
          }
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Last Contact">
              <Input type="date" value={values.lastContact} onChange={(e) => set("lastContact", e.target.value)} />
            </FormField>
            <FormField label="Next Follow-up" hint={relativeDayLabel(values.nextFollowUp)}>
              <Input type="date" value={values.nextFollowUp} onChange={(e) => set("nextFollowUp", e.target.value)} />
            </FormField>
            <FormField label="Deadline" hint={relativeDayLabel(values.followUpDeadline)}>
              <Input type="date" value={values.followUpDeadline} onChange={(e) => set("followUpDeadline", e.target.value)} />
            </FormField>
            <FormField label="Responsible Agent">
              <Select value={values.responsibleAgent} onChange={(e) => set("responsibleAgent", e.target.value)}>
                {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </Select>
            </FormField>
            <FormField label="Status">
              <Select value={values.followUpStatus} onChange={(e) => set("followUpStatus", e.target.value as FollowUpStatus)}>
                {Object.entries(FOLLOW_UP_STATUS_LABEL).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </Select>
            </FormField>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={save} disabled={!dirty}>
              <Save className="h-4 w-4" />
              Save Follow-up
            </Button>
          </div>
        </CardBody>
      </Card>

      <CommunicationTimeline
        linkedEntityType="player"
        linkedEntityId={player.id}
        linkedEntityLabel={`${player.firstName} ${player.lastName}`}
        defaultAgent={player.responsibleAgent}
      />
    </div>
  );
}
