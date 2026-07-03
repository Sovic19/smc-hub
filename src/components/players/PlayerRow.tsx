import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Player } from "@/types";
import { CONTRACT_STATUS_LABEL, PLAYER_STATUS_LABEL, formatDate } from "@/lib/format";
import { CONTRACT_STATUS_TONE, PLAYER_STATUS_TONE } from "@/lib/statusTone";
import { isJuniorWithoutProContract } from "@/lib/junior";

export function PlayerRow({ player }: { player: Player }) {
  const showJuniorBadge = isJuniorWithoutProContract(player);
  return (
    <Link
      href={`/players/${player.id}`}
      className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={`${player.firstName} ${player.lastName}`} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {player.firstName} {player.lastName}
          </p>
          <p className="truncate text-xs text-slate-500">
            {player.position} · {player.currentClub || "Unassigned"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pl-[52px] sm:w-40 sm:shrink-0 sm:grid-cols-1 sm:gap-0.5 sm:pl-0">
        <p className="text-xs text-slate-400 sm:hidden">League</p>
        <p className="truncate text-sm text-slate-600">{player.currentLeague || "—"}</p>
        <p className="truncate text-xs text-slate-400">{player.country}</p>
      </div>

      <div className="flex flex-wrap gap-1.5 pl-[52px] sm:w-44 sm:shrink-0 sm:pl-0">
        <Badge tone={PLAYER_STATUS_TONE[player.status]}>
          {PLAYER_STATUS_LABEL[player.status]}
        </Badge>
        {showJuniorBadge ? (
          <Badge tone="purple">Junior / No pro contract yet</Badge>
        ) : (
          <Badge tone={CONTRACT_STATUS_TONE[player.contractStatus]}>
            {CONTRACT_STATUS_LABEL[player.contractStatus]}
          </Badge>
        )}
      </div>

      <div className="pl-[52px] text-sm text-slate-500 sm:w-36 sm:shrink-0 sm:pl-0">
        <p className="text-xs text-slate-400 sm:hidden">Contract expiry</p>
        {formatDate(player.clubContractEndDate)}
      </div>

      <div className="pl-[52px] text-sm text-slate-500 sm:w-32 sm:shrink-0 sm:pl-0">
        <p className="text-xs text-slate-400 sm:hidden">Agent</p>
        {player.representingAgent}
      </div>

      <ChevronRight className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />
    </Link>
  );
}
