"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ImportFromEPButton } from "@/components/players/ImportFromEPButton";
import { useData } from "@/context/DataContext";
import {
  AGENTS,
  CommissionPaymentStatus,
  ContractSituation,
  ContractStatus,
  FollowUpStatus,
  MaritalStatus,
  Player,
  PipelineStage,
  PlayerCategory,
  PlayerStatus,
  Position,
} from "@/types";
import {
  COMMISSION_PAYMENT_STATUS_LABEL,
  CONTRACT_SITUATION_LABEL,
  CONTRACT_STATUS_LABEL,
  FOLLOW_UP_STATUS_LABEL,
  MARITAL_STATUS_LABEL,
  PIPELINE_STAGE_LABEL,
  PLAYER_CATEGORY_LABEL,
  PLAYER_STATUS_LABEL,
  SYNC_STATUS_LABEL,
  formatDateTime,
} from "@/lib/format";
import { SYNC_STATUS_TONE } from "@/lib/statusTone";
import { isJuniorWithoutProContract } from "@/lib/junior";

export type PlayerFormValues = Omit<Player, "id" | "createdAt" | "updatedAt" | "history">;

const POSITION_LABEL: Record<Position, string> = {
  G: "Goaltender",
  D: "Defenseman",
  LW: "Left Wing",
  RW: "Right Wing",
  C: "Center",
  F: "Forward",
};

const CURRENCIES = ["EUR", "USD", "CZK", "SEK", "CHF", "GBP", "NOK"];

function emptyValues(): PlayerFormValues {
  return {
    firstName: "",
    lastName: "",
    position: "C",
    dateOfBirth: "",
    country: "",
    shoots: "",
    heightCm: undefined,
    weightKg: undefined,
    currentClub: "",
    currentLeague: "",
    season: "",
    countriesOfInterest: [],
    status: "active",
    category: "professional",
    pipelineStage: "prospect",
    eliteProspectsUrl: "",
    videoUrls: [],
    phone: "",
    email: "",
    whatsapp: "",
    maritalStatus: "unknown",
    familyNotes: "",
    visibility: "entire_agency",

    contractSituation: "unknown",
    juniorTeam: "",
    youthLeague: "",
    draftEligibilityYear: undefined,
    guardianContact: undefined,
    schoolInterest: "",
    developmentNotes: "",

    representingAgent: AGENTS[0],
    contractNegotiatedBy: "",
    negotiationsLeadBy: "",
    agencyAgreementStartDate: "",
    agencyAgreementEndDate: "",
    cooperationNotes: "",

    currentContractAmount: undefined,
    salary: undefined,
    currency: "EUR",
    bonuses: "",
    housing: "",
    car: "",
    contractLength: "",
    clubContractStartDate: "",
    clubContractEndDate: "",
    contractStatus: "no_contract",
    clubContactPerson: "",
    commission: { paymentStatus: "unpaid" },
    contractTimeline: [],

    lastContact: "",
    nextFollowUp: "",
    responsibleAgent: AGENTS[0],
    followUpDeadline: "",
    followUpStatus: "on_track",

    dataSource: "manual",
    syncStatus: "not_synced",
    lastSyncedAt: undefined,
    manualOverride: false,
    externalData: undefined,
  };
}

export function PlayerForm({
  initialValues,
  onSubmit,
  submitLabel = "Save Player",
  onCancel,
  playerId,
}: {
  initialValues?: Partial<PlayerFormValues>;
  onSubmit: (values: PlayerFormValues) => void;
  submitLabel?: string;
  onCancel?: () => void;
  /** When editing an existing player, enables live EliteProspects sync controls. */
  playerId?: string;
}) {
  const router = useRouter();
  const { getPlayer } = useData();
  const livePlayer = playerId ? getPlayer(playerId) : undefined;
  const [values, setValues] = useState<PlayerFormValues>({
    ...emptyValues(),
    ...initialValues,
  });
  const [videoUrlsText, setVideoUrlsText] = useState(
    (initialValues?.videoUrls ?? []).join("\n")
  );
  const [countriesText, setCountriesText] = useState(
    (initialValues?.countriesOfInterest ?? []).join(", ")
  );

  function set<K extends keyof PlayerFormValues>(key: K, value: PlayerFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setCommission<K extends keyof PlayerFormValues["commission"]>(
    key: K,
    value: PlayerFormValues["commission"][K]
  ) {
    setValues((prev) => ({ ...prev, commission: { ...prev.commission, [key]: value } }));
  }

  function setGuardianContact<K extends keyof NonNullable<PlayerFormValues["guardianContact"]>>(
    key: K,
    value: NonNullable<PlayerFormValues["guardianContact"]>[K]
  ) {
    setValues((prev) => ({
      ...prev,
      guardianContact: { ...prev.guardianContact, [key]: value },
    }));
  }

  const isJunior = values.category === "junior";
  const showJuniorBadge = isJuniorWithoutProContract(values);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const videoUrls = videoUrlsText.split("\n").map((v) => v.trim()).filter(Boolean);
    const countriesOfInterest = countriesText.split(",").map((v) => v.trim()).filter(Boolean);
    onSubmit({ ...values, videoUrls, countriesOfInterest });
  }

  function handleCancel() {
    if (onCancel) onCancel();
    else router.back();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader title="Profile" description="Identity, bio, and contact details" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="First Name" required>
            <Input required value={values.firstName} onChange={(e) => set("firstName", e.target.value)} />
          </FormField>
          <FormField label="Last Name" required>
            <Input required value={values.lastName} onChange={(e) => set("lastName", e.target.value)} />
          </FormField>
          <FormField label="Position" required>
            <Select value={values.position} onChange={(e) => set("position", e.target.value as Position)}>
              {Object.entries(POSITION_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label} ({val})</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Date of Birth">
            <Input type="date" value={values.dateOfBirth ?? ""} onChange={(e) => set("dateOfBirth", e.target.value)} />
          </FormField>
          <FormField label="Nationality / Country">
            <Input value={values.country} onChange={(e) => set("country", e.target.value)} />
          </FormField>
          <FormField label="Shoots / Catches">
            <Select value={values.shoots ?? ""} onChange={(e) => set("shoots", e.target.value)}>
              <option value="">—</option>
              <option value="L">Left</option>
              <option value="R">Right</option>
            </Select>
          </FormField>
          <FormField label="Height (cm)">
            <Input type="number" min={0} value={values.heightCm ?? ""} onChange={(e) => set("heightCm", e.target.value === "" ? undefined : Number(e.target.value))} />
          </FormField>
          <FormField label="Weight (kg)">
            <Input type="number" min={0} value={values.weightKg ?? ""} onChange={(e) => set("weightKg", e.target.value === "" ? undefined : Number(e.target.value))} />
          </FormField>
          <FormField label="Marital Status">
            <Select value={values.maritalStatus} onChange={(e) => set("maritalStatus", e.target.value as MaritalStatus)}>
              {Object.entries(MARITAL_STATUS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Current Club">
            <Input value={values.currentClub} onChange={(e) => set("currentClub", e.target.value)} />
          </FormField>
          <FormField label="Current League">
            <Input value={values.currentLeague} onChange={(e) => set("currentLeague", e.target.value)} />
          </FormField>
          <FormField label="Season">
            <Input placeholder="2025/26" value={values.season} onChange={(e) => set("season", e.target.value)} />
          </FormField>
          <FormField label="Player Status">
            <Select value={values.status} onChange={(e) => set("status", e.target.value as PlayerStatus)}>
              {Object.entries(PLAYER_STATUS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Pipeline Stage">
            <Select value={values.pipelineStage} onChange={(e) => set("pipelineStage", e.target.value as PipelineStage)}>
              {Object.entries(PIPELINE_STAGE_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Player Category">
            <Select value={values.category} onChange={(e) => set("category", e.target.value as PlayerCategory)}>
              {Object.entries(PLAYER_CATEGORY_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField
            label="Contract Situation"
            hint={showJuniorBadge ? "Missing salary/contract fields below are expected for this situation." : undefined}
          >
            <Select value={values.contractSituation} onChange={(e) => set("contractSituation", e.target.value as ContractSituation)}>
              {Object.entries(CONTRACT_SITUATION_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          {showJuniorBadge && (
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Badge tone="purple">Junior / No pro contract yet</Badge>
            </div>
          )}
          <FormField label="EliteProspects URL">
            <Input type="url" placeholder="https://www.eliteprospects.com/player/..." value={values.eliteProspectsUrl} onChange={(e) => set("eliteProspectsUrl", e.target.value)} />
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
          <FormField label="Countries of Interest" className="sm:col-span-2 lg:col-span-3" hint="Comma-separated">
            <Input value={countriesText} onChange={(e) => setCountriesText(e.target.value)} placeholder="Sweden, Finland, Switzerland" />
          </FormField>
          <FormField label="Video / Highlight URLs" className="sm:col-span-2 lg:col-span-3" hint="One URL per line">
            <Textarea value={videoUrlsText} onChange={(e) => setVideoUrlsText(e.target.value)} placeholder="https://youtube.com/..." />
          </FormField>
          <FormField label="Family Notes" className="sm:col-span-2 lg:col-span-3">
            <Textarea value={values.familyNotes} onChange={(e) => set("familyNotes", e.target.value)} />
          </FormField>
        </CardBody>
      </Card>

      {isJunior && (
        <Card>
          <CardHeader
            title="Junior Development"
            description="Shown for junior players — empty fields here are normal, not an error"
          />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Junior Team">
              <Input value={values.juniorTeam ?? ""} onChange={(e) => set("juniorTeam", e.target.value)} />
            </FormField>
            <FormField label="Youth League">
              <Input value={values.youthLeague ?? ""} onChange={(e) => set("youthLeague", e.target.value)} />
            </FormField>
            <FormField label="Draft Eligibility Year">
              <Input
                type="number"
                min={2000}
                max={2100}
                value={values.draftEligibilityYear ?? ""}
                onChange={(e) => set("draftEligibilityYear", e.target.value === "" ? undefined : Number(e.target.value))}
              />
            </FormField>
            <FormField label="Guardian Name" hint="Parent / guardian contact placeholder">
              <Input value={values.guardianContact?.name ?? ""} onChange={(e) => setGuardianContact("name", e.target.value)} />
            </FormField>
            <FormField label="Guardian Relationship">
              <Input placeholder="Father, Mother, Legal guardian…" value={values.guardianContact?.relationship ?? ""} onChange={(e) => setGuardianContact("relationship", e.target.value)} />
            </FormField>
            <FormField label="Guardian Phone">
              <Input type="tel" value={values.guardianContact?.phone ?? ""} onChange={(e) => setGuardianContact("phone", e.target.value)} />
            </FormField>
            <FormField label="Guardian Email" className="sm:col-span-2 lg:col-span-1">
              <Input type="email" value={values.guardianContact?.email ?? ""} onChange={(e) => setGuardianContact("email", e.target.value)} />
            </FormField>
            <FormField label="School / University Interest" className="sm:col-span-2 lg:col-span-3">
              <Textarea value={values.schoolInterest ?? ""} onChange={(e) => set("schoolInterest", e.target.value)} />
            </FormField>
            <FormField label="Development Notes" className="sm:col-span-2 lg:col-span-3">
              <Textarea value={values.developmentNotes ?? ""} onChange={(e) => set("developmentNotes", e.target.value)} />
            </FormField>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="EliteProspects Integration" description="Pilot import — mock data only" />
        <CardBody>
          {livePlayer ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={SYNC_STATUS_TONE[livePlayer.syncStatus]} dot>
                  {SYNC_STATUS_LABEL[livePlayer.syncStatus]}
                </Badge>
                {livePlayer.manualOverride && <Badge tone="purple">Manual Override</Badge>}
                <span className="text-xs text-slate-400">Last synced: {formatDateTime(livePlayer.lastSyncedAt)}</span>
              </div>
              <ImportFromEPButton
                playerId={livePlayer.id}
                playerName={`${livePlayer.firstName} ${livePlayer.lastName}`}
                label={livePlayer.syncStatus === "synced" ? "Re-import Data" : "Import from EliteProspects"}
              />
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-500">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <p>
                Save this player first to enable importing profile data from EliteProspects.
                You&apos;ll find full sync details on the player&apos;s External Data tab.
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Representation" description="Agency relationship details" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Representing SMC Agent">
            <Select value={values.representingAgent} onChange={(e) => set("representingAgent", e.target.value)}>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormField>
          <FormField label="Agent Who Arranged Current Club Contract">
            <Select value={values.contractNegotiatedBy} onChange={(e) => set("contractNegotiatedBy", e.target.value)}>
              <option value="">—</option>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormField>
          <FormField label="Person Who Led Negotiations">
            <Input value={values.negotiationsLeadBy} onChange={(e) => set("negotiationsLeadBy", e.target.value)} />
          </FormField>
          <FormField label="Agency Agreement Start Date">
            <Input type="date" value={values.agencyAgreementStartDate ?? ""} onChange={(e) => set("agencyAgreementStartDate", e.target.value)} />
          </FormField>
          <FormField label="Agency Agreement End Date">
            <Input type="date" value={values.agencyAgreementEndDate ?? ""} onChange={(e) => set("agencyAgreementEndDate", e.target.value)} />
          </FormField>
          <FormField label="Cooperation Notes" className="sm:col-span-2">
            <Textarea value={values.cooperationNotes} onChange={(e) => set("cooperationNotes", e.target.value)} />
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Contract" description="Compensation, terms, and commission" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Contract Status">
            <Select value={values.contractStatus} onChange={(e) => set("contractStatus", e.target.value as ContractStatus)}>
              {Object.entries(CONTRACT_STATUS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Current Contract Amount (total)">
            <Input type="number" min={0} value={values.currentContractAmount ?? ""} onChange={(e) => set("currentContractAmount", e.target.value === "" ? undefined : Number(e.target.value))} />
          </FormField>
          <FormField label="Salary (annual)">
            <Input type="number" min={0} value={values.salary ?? ""} onChange={(e) => set("salary", e.target.value === "" ? undefined : Number(e.target.value))} />
          </FormField>
          <FormField label="Currency">
            <Select value={values.currency} onChange={(e) => set("currency", e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormField>
          <FormField label="Contract Length">
            <Input placeholder="e.g. 3 years" value={values.contractLength} onChange={(e) => set("contractLength", e.target.value)} />
          </FormField>
          <FormField label="Club Contact Person">
            <Input value={values.clubContactPerson} onChange={(e) => set("clubContactPerson", e.target.value)} />
          </FormField>
          <FormField label="Club Contract Start Date">
            <Input type="date" value={values.clubContractStartDate ?? ""} onChange={(e) => set("clubContractStartDate", e.target.value)} />
          </FormField>
          <FormField label="Club Contract End Date">
            <Input type="date" value={values.clubContractEndDate ?? ""} onChange={(e) => set("clubContractEndDate", e.target.value)} />
          </FormField>
          <FormField label="Housing">
            <Input value={values.housing} onChange={(e) => set("housing", e.target.value)} />
          </FormField>
          <FormField label="Car">
            <Input value={values.car} onChange={(e) => set("car", e.target.value)} />
          </FormField>
          <FormField label="Bonuses" className="sm:col-span-2 lg:col-span-3">
            <Textarea value={values.bonuses} onChange={(e) => set("bonuses", e.target.value)} />
          </FormField>

          <div className="sm:col-span-2 lg:col-span-3">
            <p className="mb-3 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Agent Commission
            </p>
          </div>
          <FormField label="Commission %">
            <Input type="number" min={0} max={100} value={values.commission.percentage ?? ""} onChange={(e) => setCommission("percentage", e.target.value === "" ? undefined : Number(e.target.value))} />
          </FormField>
          <FormField label="Commission Amount">
            <Input type="number" min={0} value={values.commission.amount ?? ""} onChange={(e) => setCommission("amount", e.target.value === "" ? undefined : Number(e.target.value))} />
          </FormField>
          <FormField label="Commission Currency">
            <Select value={values.commission.currency ?? values.currency} onChange={(e) => setCommission("currency", e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormField>
          <FormField label="Commission Owner">
            <Select value={values.commission.owner ?? ""} onChange={(e) => setCommission("owner", e.target.value)}>
              <option value="">—</option>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormField>
          <FormField label="Split With Agent">
            <Select value={values.commission.splitWithAgent ?? ""} onChange={(e) => setCommission("splitWithAgent", e.target.value)}>
              <option value="">None</option>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormField>
          <FormField label="Split %">
            <Input type="number" min={0} max={100} value={values.commission.splitPercentage ?? ""} onChange={(e) => setCommission("splitPercentage", e.target.value === "" ? undefined : Number(e.target.value))} />
          </FormField>
          <FormField label="Payment Status">
            <Select value={values.commission.paymentStatus} onChange={(e) => setCommission("paymentStatus", e.target.value as CommissionPaymentStatus)}>
              {Object.entries(COMMISSION_PAYMENT_STATUS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Commission Due Date">
            <Input type="date" value={values.commission.dueDate ?? ""} onChange={(e) => setCommission("dueDate", e.target.value)} />
          </FormField>
          <FormField label="Commission Notes" className="sm:col-span-2 lg:col-span-3">
            <Textarea value={values.commission.notes ?? ""} onChange={(e) => setCommission("notes", e.target.value)} />
          </FormField>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Follow-up & Ownership" description="Scheduling shown on the Communication tab" />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Last Contact">
            <Input type="date" value={values.lastContact ?? ""} onChange={(e) => set("lastContact", e.target.value)} />
          </FormField>
          <FormField label="Next Follow-up">
            <Input type="date" value={values.nextFollowUp ?? ""} onChange={(e) => set("nextFollowUp", e.target.value)} />
          </FormField>
          <FormField label="Follow-up Deadline">
            <Input type="date" value={values.followUpDeadline ?? ""} onChange={(e) => set("followUpDeadline", e.target.value)} />
          </FormField>
          <FormField label="Responsible Agent">
            <Select value={values.responsibleAgent} onChange={(e) => set("responsibleAgent", e.target.value)}>
              {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          </FormField>
          <FormField label="Follow-up Status">
            <Select value={values.followUpStatus} onChange={(e) => set("followUpStatus", e.target.value as FollowUpStatus)}>
              {Object.entries(FOLLOW_UP_STATUS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-2 pb-2">
        <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
