"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  Globe2,
  Handshake,
  ListChecks,
  MessagesSquare,
  Pencil,
  History as HistoryIcon,
  Trash2,
  UserRound,
  UserX,
  Wallet,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImportFromEPButton } from "@/components/players/ImportFromEPButton";
import { AskAiButton } from "@/components/ai/AskAiButton";
import { generatePlayerSummary } from "@/lib/mockAi";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { canDeleteRecords, canEditPlayer, canSeeFinancialTab } from "@/lib/permissions";
import { ProfileTab } from "@/components/players/tabs/ProfileTab";
import { RepresentationTab } from "@/components/players/tabs/RepresentationTab";
import { ContractTab } from "@/components/players/tabs/ContractTab";
import { DocumentsTab } from "@/components/players/tabs/DocumentsTab";
import { CommunicationTab } from "@/components/players/tabs/CommunicationTab";
import { HistoryTab } from "@/components/players/tabs/HistoryTab";
import { TasksTab } from "@/components/players/tabs/TasksTab";
import { ExternalDataTab } from "@/components/players/tabs/ExternalDataTab";
import {
  CONTRACT_STATUS_LABEL,
  PLAYER_CATEGORY_LABEL,
  PLAYER_STATUS_LABEL,
  SYNC_STATUS_LABEL,
  relativeDayLabel,
} from "@/lib/format";
import {
  CONTRACT_STATUS_TONE,
  PLAYER_CATEGORY_TONE,
  PLAYER_STATUS_TONE,
  SYNC_STATUS_TONE,
} from "@/lib/statusTone";
import { isJuniorWithoutProContract } from "@/lib/junior";

export default function PlayerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getPlayer, deletePlayer } = useData();
  const player = getPlayer(params.id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { user: currentUser } = useCurrentUser();

  if (!player) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<UserX className="h-5 w-5" />}
          title="Player not found"
          description="This player may have been removed."
          action={
            <Link href="/players">
              <Button size="sm" variant="outline">
                Back to Players
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/players"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Players
      </Link>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 p-6 shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-brand-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <Avatar
              name={`${player.firstName} ${player.lastName}`}
              size="lg"
              className="ring-4 ring-white/15"
            />
            <div>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                {player.firstName} {player.lastName}
              </h2>
              <p className="mt-1 text-sm text-brand-200">
                {player.position} · {player.currentClub || "Unassigned"} ·{" "}
                {player.currentLeague}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone={PLAYER_STATUS_TONE[player.status]}>
                  {PLAYER_STATUS_LABEL[player.status]}
                </Badge>
                <Badge tone={PLAYER_CATEGORY_TONE[player.category]}>
                  {PLAYER_CATEGORY_LABEL[player.category]}
                </Badge>
                {isJuniorWithoutProContract(player) ? (
                  <Badge tone="purple">Junior / No pro contract yet</Badge>
                ) : (
                  <Badge tone={CONTRACT_STATUS_TONE[player.contractStatus]}>
                    {CONTRACT_STATUS_LABEL[player.contractStatus]}
                  </Badge>
                )}
                <Badge tone={SYNC_STATUS_TONE[player.syncStatus]} dot>
                  {SYNC_STATUS_LABEL[player.syncStatus]}
                </Badge>
                {player.manualOverride && (
                  <Badge tone="purple">Manual Override</Badge>
                )}
              </div>
              <p className="mt-2 text-xs text-brand-300">
                {player.lastSyncedAt
                  ? `EliteProspects synced ${relativeDayLabel(player.lastSyncedAt.slice(0, 10)).toLowerCase()}`
                  : "Not yet synced with EliteProspects"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <AskAiButton
              label="Summarize"
              response={generatePlayerSummary(player)}
              contextLabel={`${player.firstName} ${player.lastName}`}
              variant="inverse"
            />
            <ImportFromEPButton
              playerId={player.id}
              playerName={`${player.firstName} ${player.lastName}`}
              variant="inverse"
              label="Import from EP"
            />
            {canEditPlayer(currentUser, player) && (
              <Link href={`/players/${player.id}/edit`}>
                <Button variant="inverse" size="sm">
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
            {canDeleteRecords(currentUser) && (
              <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
        <Tabs
          tabs={[
            {
              key: "profile",
              label: "Profile",
              icon: <UserRound className="h-4 w-4" />,
              content: <ProfileTab player={player} />,
            },
            {
              key: "representation",
              label: "Representation",
              icon: <Handshake className="h-4 w-4" />,
              content: <RepresentationTab player={player} />,
            },
            ...(canSeeFinancialTab(currentUser)
              ? [
                  {
                    key: "contract",
                    label: "Contract",
                    icon: <Wallet className="h-4 w-4" />,
                    content: <ContractTab player={player} />,
                  },
                ]
              : []),
            {
              key: "documents",
              label: "Documents",
              icon: <FileText className="h-4 w-4" />,
              content: <DocumentsTab player={player} />,
            },
            {
              key: "communication",
              label: "Communication",
              icon: <MessagesSquare className="h-4 w-4" />,
              content: <CommunicationTab player={player} />,
            },
            {
              key: "history",
              label: "History",
              icon: <HistoryIcon className="h-4 w-4" />,
              content: <HistoryTab player={player} />,
            },
            {
              key: "tasks",
              label: "Tasks",
              icon: <ListChecks className="h-4 w-4" />,
              content: <TasksTab player={player} />,
            },
            {
              key: "external",
              label: "External Data",
              icon: <Globe2 className="h-4 w-4" />,
              content: <ExternalDataTab player={player} />,
            },
          ]}
        />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          deletePlayer(player.id);
          router.push("/players");
        }}
        title={`Delete ${player.firstName} ${player.lastName}?`}
        description="This will permanently remove the player and all associated data."
      />
    </div>
  );
}
