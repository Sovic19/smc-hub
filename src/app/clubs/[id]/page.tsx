"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  ChevronLeft,
  ExternalLink,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DetailField, DetailGrid } from "@/components/ui/DetailField";
import { MockDataNotice } from "@/components/ui/MockDataNotice";
import { PlayerRow } from "@/components/players/PlayerRow";
import { ClubFormModal, ClubFormValues } from "@/components/clubs/ClubFormModal";
import { CommunicationTimeline } from "@/components/communication/CommunicationTimeline";
import { SyncEntityButton } from "@/components/shared/SyncEntityButton";
import { AskAiButton } from "@/components/ai/AskAiButton";
import { draftOfferEmail } from "@/lib/mockAi";
import { RELATIONSHIP_STRENGTH_LABEL, SYNC_STATUS_LABEL, formatDateTime } from "@/lib/format";
import { RELATIONSHIP_STRENGTH_TONE, SYNC_STATUS_TONE } from "@/lib/statusTone";

export default function ClubDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getClub, updateClub, deleteClub, players } = useData();
  const club = getClub(params.id);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const currentPlayers = useMemo(
    () => players.filter((p) => p.currentClub === club?.name),
    [players, club]
  );

  const historicalPlayers = useMemo(() => {
    if (!club) return [];
    const currentIds = new Set(currentPlayers.map((p) => p.id));
    return players.filter(
      (p) =>
        !currentIds.has(p.id) &&
        p.contractTimeline.some((entry) => entry.club === club.name)
    );
  }, [players, club, currentPlayers]);

  if (!club) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<Building2 className="h-5 w-5" />}
          title="Club not found"
          description="This club may have been removed."
          action={
            <Link href="/clubs">
              <Button size="sm" variant="outline">Back to Clubs</Button>
            </Link>
          }
        />
      </div>
    );
  }

  function handleSave(values: ClubFormValues) {
    updateClub(club!.id, values);
    setEditOpen(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/clubs" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ChevronLeft className="h-4 w-4" />
        Back to Clubs
      </Link>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{club.name}</h2>
            <p className="text-sm text-slate-500">{club.league} · {club.country}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone={RELATIONSHIP_STRENGTH_TONE[club.relationshipStrength]}>
                {RELATIONSHIP_STRENGTH_LABEL[club.relationshipStrength]} relationship
              </Badge>
              <Badge tone={SYNC_STATUS_TONE[club.syncStatus]} dot>
                {SYNC_STATUS_LABEL[club.syncStatus]}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <AskAiButton
            label="Draft outreach email"
            response={draftOfferEmail(club)}
            contextLabel={club.name}
          />
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Club Information"
          action={<SyncEntityButton entityType="club" entityId={club.id} entityLabel={club.name} />}
        />
        <CardBody className="space-y-4">
          <MockDataNotice />
          <DetailGrid>
            <DetailField label="Manager" value={club.manager} />
            <DetailField label="Head Coach" value={club.headCoach} />
            <DetailField label="Sporting Manager" value={club.sportingManager} />
            <DetailField label="GM" value={club.gm} />
            <DetailField label="Scout Contact" value={club.scoutContact} />
            <DetailField
              label="Phone"
              value={club.phone ? (
                <a href={`tel:${club.phone}`} className="inline-flex items-center gap-1.5 text-brand-600 hover:underline">
                  <Phone className="h-3.5 w-3.5" /> {club.phone}
                </a>
              ) : undefined}
            />
            <DetailField
              label="Email"
              value={club.email ? (
                <a href={`mailto:${club.email}`} className="inline-flex items-center gap-1.5 text-brand-600 hover:underline">
                  <Mail className="h-3.5 w-3.5" /> {club.email}
                </a>
              ) : undefined}
            />
            <DetailField
              label="WhatsApp"
              value={club.whatsapp ? (
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-500" /> {club.whatsapp}
                </span>
              ) : undefined}
            />
            <DetailField
              label="EliteProspects"
              value={club.eliteProspectsUrl ? (
                <a href={club.eliteProspectsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  View club <ExternalLink className="h-3 w-3" />
                </a>
              ) : undefined}
            />
            <DetailField label="Last Synced" value={formatDateTime(club.lastSyncedAt)} />
            <DetailField label="Notes" value={club.notes} className="sm:col-span-2 lg:col-span-3" />
          </DetailGrid>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Current Represented Players"
          description={`${currentPlayers.length} player(s) currently at this club`}
          action={<Badge tone="brand">{currentPlayers.length}</Badge>}
        />
        {currentPlayers.length === 0 ? (
          <div className="p-6"><EmptyState title="No players currently at this club" /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {currentPlayers.map((p) => <PlayerRow key={p.id} player={p} />)}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Players Historically Placed by SMC"
          description="Clients previously placed at this club"
          action={<Badge tone="slate">{historicalPlayers.length}</Badge>}
        />
        {historicalPlayers.length === 0 ? (
          <div className="p-6"><EmptyState title="No historical placements on record" /></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {historicalPlayers.map((p) => <PlayerRow key={p.id} player={p} />)}
          </div>
        )}
      </Card>

      <CommunicationTimeline linkedEntityType="club" linkedEntityId={club.id} linkedEntityLabel={club.name} />

      <ClubFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSave}
        initialValues={club}
        title={`Edit ${club.name}`}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteClub(club.id);
          router.push("/clubs");
        }}
        title={`Delete ${club.name}?`}
        description="This will permanently remove the club record."
      />
    </div>
  );
}
