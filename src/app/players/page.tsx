"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayerRow } from "@/components/players/PlayerRow";
import {
  PlayerFilters,
  PlayersFilterBar,
} from "@/components/players/PlayersFilterBar";
import { useData } from "@/context/DataContext";

function PlayersPageInner() {
  const { players } = useData();
  const searchParams = useSearchParams();
  const initialContract = searchParams.get("contract");
  const initialCategory = searchParams.get("category");

  const [filters, setFilters] = useState<PlayerFilters>({
    query: "",
    status: "all",
    category: (initialCategory as PlayerFilters["category"]) || "all",
    contractStatus: (initialContract as PlayerFilters["contractStatus"]) || "all",
    contractSituation: "all",
    position: "all",
  });

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return players
      .filter((p) => {
        if (filters.status !== "all" && p.status !== filters.status) return false;
        if (filters.category !== "all" && p.category !== filters.category) return false;
        if (
          filters.contractStatus !== "all" &&
          p.contractStatus !== filters.contractStatus
        )
          return false;
        if (
          filters.contractSituation !== "all" &&
          p.contractSituation !== filters.contractSituation
        )
          return false;
        if (filters.position !== "all" && p.position !== filters.position)
          return false;
        if (
          q &&
          !`${p.firstName} ${p.lastName} ${p.currentClub}`
            .toLowerCase()
            .includes(q)
        )
          return false;
        return true;
      })
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [players, filters]);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Players</h2>
          <p className="mt-1 text-sm text-slate-400">
            {players.length} players in the roster
          </p>
        </div>
        <Link href="/players/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Player
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <PlayersFilterBar filters={filters} onChange={setFilters} />
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="No players found"
              description="Try adjusting your filters or add a new player."
              action={
                <Link href="/players/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    Add Player
                  </Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((player) => (
              <PlayerRow key={player.id} player={player} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function PlayersPage() {
  return (
    <Suspense>
      <PlayersPageInner />
    </Suspense>
  );
}
