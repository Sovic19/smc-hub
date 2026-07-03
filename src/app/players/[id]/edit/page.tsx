"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PlayerForm, PlayerFormValues } from "@/components/players/PlayerForm";
import { useData } from "@/context/DataContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserX, ShieldAlert } from "lucide-react";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { canEditPlayer, hasFinancialAccess } from "@/lib/permissions";
import { formatCurrency } from "@/lib/format";

export default function EditPlayerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { getPlayer, updatePlayer, addAuditLogEntry } = useData();
  const player = getPlayer(params.id);
  const { user: currentUser } = useCurrentUser();

  if (!player) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<UserX className="h-5 w-5" />}
          title="Player not found"
          description="This player may have been removed."
        />
      </div>
    );
  }

  if (!canEditPlayer(currentUser, player)) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<ShieldAlert className="h-5 w-5" />}
          title="You do not have permission to edit this player"
          description="Your role only allows editing players assigned to you, or is read-only."
        />
      </div>
    );
  }

  function handleSubmit(values: PlayerFormValues) {
    // Sync fields are managed live via the Import from EliteProspects action
    // (which writes straight to context), so they're intentionally excluded
    // here to avoid the form's stale draft overwriting a just-completed sync.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { syncStatus, lastSyncedAt, manualOverride, externalData, ...rest } = values;
    if (hasFinancialAccess(currentUser, player!) && values.salary !== player!.salary) {
      addAuditLogEntry({
        user: currentUser.name,
        role: currentUser.role,
        action: "financial_edit",
        entityType: "Player",
        entityName: `${player!.firstName} ${player!.lastName}`,
        previousValue: formatCurrency(player!.salary, player!.currency),
        newValue: formatCurrency(values.salary, values.currency),
      });
    }
    updatePlayer(player!.id, rest);
    router.push(`/players/${player!.id}`);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link
        href={`/players/${player.id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to {player.firstName} {player.lastName}
      </Link>
      <div>
        <h2 className="text-xl font-semibold text-white">
          Edit {player.firstName} {player.lastName}
        </h2>
      </div>
      <PlayerForm
        initialValues={player}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        playerId={player.id}
      />
    </div>
  );
}
