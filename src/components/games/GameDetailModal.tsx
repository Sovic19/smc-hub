"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DetailField, DetailGrid } from "@/components/ui/DetailField";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AskAiButton } from "@/components/ai/AskAiButton";
import { useData } from "@/context/DataContext";
import { GameRecord } from "@/types";
import { DATA_SOURCE_LABEL, SYNC_STATUS_LABEL, formatDate } from "@/lib/format";
import { SYNC_STATUS_TONE } from "@/lib/statusTone";
import { summarizeGame } from "@/lib/mockAi";

export function GameDetailModal({
  game,
  onClose,
  onEdit,
}: {
  game: GameRecord | null;
  onClose: () => void;
  onEdit: (game: GameRecord) => void;
}) {
  const { getPlayer, deleteGame } = useData();
  const [confirmOpen, setConfirmOpen] = useState(false);
  if (!game) return null;

  const player = getPlayer(game.playerId);

  return (
    <>
      <Modal
        open={!!game}
        onClose={onClose}
        title={player ? `${player.firstName} ${player.lastName} vs ${game.opponent}` : game.opponent}
        description={`${game.competition} · ${formatDate(game.date)}`}
        size="lg"
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={game.result.startsWith("W") ? "green" : game.result.startsWith("L") ? "red" : "slate"}>
              {game.result}
            </Badge>
            <Badge tone="slate">{game.homeAway === "home" ? "Home" : "Away"}</Badge>
            <Badge tone={SYNC_STATUS_TONE[game.syncStatus]}>{SYNC_STATUS_LABEL[game.syncStatus]}</Badge>
            <div className="ml-auto">
              <AskAiButton
                label="Summarize performance"
                response={summarizeGame(game, player)}
                contextLabel={player ? `${player.firstName} ${player.lastName}` : undefined}
              />
            </div>
          </div>

          <DetailGrid>
            <DetailField
              label="Player"
              value={player ? <Link href={`/players/${player.id}`} className="text-brand-600 hover:underline">{player.firstName} {player.lastName}</Link> : undefined}
            />
            <DetailField label="Team" value={game.team} />
            <DetailField label="Country" value={game.country} />
            {game.goalieStats ? (
              <>
                <DetailField label="Saves" value={game.goalieStats.saves} />
                <DetailField label="Goals Against" value={game.goalieStats.goalsAgainst} />
                <DetailField label="Save %" value={`${game.goalieStats.savePercentage}%`} />
                <DetailField label="Shutout" value={game.goalieStats.shutout ? "Yes" : "No"} />
              </>
            ) : (
              <>
                <DetailField label="Goals" value={game.goals} />
                <DetailField label="Assists" value={game.assists} />
                <DetailField label="Points" value={game.points} />
                <DetailField label="+/-" value={game.plusMinus} />
                <DetailField label="Penalty Minutes" value={game.penaltyMinutes} />
                <DetailField label="Shots" value={game.shots} />
                <DetailField label="Time on Ice" value={game.timeOnIce} />
                <DetailField label="Powerplay Points" value={game.powerplayPoints} />
                <DetailField label="Shorthanded Points" value={game.shorthandedPoints} />
                <DetailField label="Faceoff %" value={game.faceoffPercentage !== undefined ? `${game.faceoffPercentage}%` : undefined} />
              </>
            )}
            <DetailField label="Data Source" value={DATA_SOURCE_LABEL[game.dataSource]} />
            <DetailField
              label="Game Report"
              value={game.gameReportUrl ? (
                <a href={game.gameReportUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  View report <ExternalLink className="h-3 w-3" />
                </a>
              ) : undefined}
            />
            <DetailField
              label="Video / Highlights"
              value={game.videoUrl ? (
                <a href={game.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                  Watch <ExternalLink className="h-3 w-3" />
                </a>
              ) : undefined}
            />
            <DetailField label="AI Performance Summary" value={game.aiSummary} className="sm:col-span-2 lg:col-span-3" />
            <DetailField label="Internal Scout Note" value={game.scoutNote} className="sm:col-span-2 lg:col-span-3" />
          </DetailGrid>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" size="sm" onClick={() => onEdit(game)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          deleteGame(game.id);
          onClose();
        }}
        title="Delete this game record?"
        description="This will permanently remove the game record."
      />
    </>
  );
}
