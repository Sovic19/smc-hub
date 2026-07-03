"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Plus,
  Search,
  Shield,
  Trophy,
  UserX,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { GameFormModal, GameFormValues } from "@/components/games/GameFormModal";
import { GameDetailModal } from "@/components/games/GameDetailModal";
import { DataSource, GameRecord, SyncStatus } from "@/types";
import { DATA_SOURCE_LABEL, SYNC_STATUS_LABEL, daysUntil, formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";

type ViewMode = "all" | "top" | "yesterday" | "stale" | "goalies" | "juniors";

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: "all", label: "All Recent" },
  { key: "top", label: "Top Performances" },
  { key: "yesterday", label: "Played Yesterday" },
  { key: "stale", label: "No Recent Games" },
  { key: "goalies", label: "Goalie Performances" },
  { key: "juniors", label: "Junior Performances" },
];

function GameRow({ game, onOpen }: { game: GameRecord; onOpen: () => void }) {
  const { getPlayer } = useData();
  const player = getPlayer(game.playerId);
  return (
    <button
      onClick={onOpen}
      className="flex w-full flex-col gap-2 px-5 py-3.5 text-left transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={player ? `${player.firstName} ${player.lastName}` : "?"} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">
            {player ? `${player.firstName} ${player.lastName}` : "Unknown player"}
          </p>
          <p className="truncate text-xs text-slate-400">
            {game.team} vs {game.opponent} · {game.competition}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 pl-[44px] sm:pl-0">
        <Badge tone={game.result.startsWith("W") ? "green" : game.result.startsWith("L") ? "red" : "slate"}>
          {game.result}
        </Badge>
        {game.goalieStats ? (
          <span className="text-xs text-slate-500">{game.goalieStats.saves} saves · {game.goalieStats.savePercentage}%</span>
        ) : (
          <span className="text-xs text-slate-500">{game.points} pts ({game.goals}G {game.assists}A)</span>
        )}
        <span className="text-xs text-slate-400">{formatDate(game.date)}</span>
      </div>
    </button>
  );
}

export default function GameTrackerPage() {
  const { games, players, addGame, updateGame } = useData();
  const [view, setView] = useState<ViewMode>("all");
  const [query, setQuery] = useState("");
  const [playerFilter, setPlayerFilter] = useState("all");
  const [leagueFilter, setLeagueFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState<DataSource | "all">("all");
  const [syncFilter, setSyncFilter] = useState<SyncStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<GameRecord | null>(null);
  const [viewingGame, setViewingGame] = useState<GameRecord | null>(null);

  const leagues = useMemo(() => Array.from(new Set(games.map((g) => g.competition))).sort(), [games]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter((g) => {
      const player = players.find((p) => p.id === g.playerId);
      if (playerFilter !== "all" && g.playerId !== playerFilter) return false;
      if (leagueFilter !== "all" && g.competition !== leagueFilter) return false;
      if (sourceFilter !== "all" && g.dataSource !== sourceFilter) return false;
      if (syncFilter !== "all" && g.syncStatus !== syncFilter) return false;
      if (q && !`${player ? `${player.firstName} ${player.lastName}` : ""} ${g.team} ${g.opponent}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [games, players, playerFilter, leagueFilter, sourceFilter, syncFilter, query]);

  const viewGames = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
    switch (view) {
      case "top":
        return [...filtered].sort((a, b) => (b.goalieStats ? 0 : b.points) - (a.goalieStats ? 0 : a.points)).slice(0, 15);
      case "yesterday":
        return sorted.filter((g) => daysUntil(g.date) === -1);
      case "goalies":
        return sorted.filter((g) => !!g.goalieStats);
      case "juniors":
        return sorted.filter((g) => players.find((p) => p.id === g.playerId)?.category === "junior");
      case "all":
      case "stale":
      default:
        return sorted;
    }
  }, [filtered, view, players]);

  const stalePlayers = useMemo(() => {
    if (view !== "stale") return [];
    return players.filter((p) => {
      if (p.status === "retired") return false;
      const playerGames = games.filter((g) => g.playerId === p.id);
      if (playerGames.length === 0) return true;
      const mostRecent = playerGames.reduce((max, g) => (g.date > max ? g.date : max), playerGames[0].date);
      const d = daysUntil(mostRecent);
      return d !== null && d < -14;
    });
  }, [view, players, games]);

  function handleCreate(values: GameFormValues) {
    addGame(values);
    setFormOpen(false);
  }

  function handleUpdate(values: GameFormValues) {
    if (!editingGame) return;
    updateGame(editingGame.id, values);
    setEditingGame(null);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Game Tracker</h2>
          <p className="mt-1 text-sm text-slate-400">{games.length} game records on file</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Game
        </Button>
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search by player, team, or opponent…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2 lg:flex lg:w-auto lg:shrink-0 lg:flex-wrap">
            <Select value={playerFilter} onChange={(e) => setPlayerFilter(e.target.value)} className="lg:w-40">
              <option value="all">All players</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </Select>
            <Select value={leagueFilter} onChange={(e) => setLeagueFilter(e.target.value)} className="lg:w-44">
              <option value="all">All leagues</option>
              {leagues.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
            <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as DataSource | "all")} className="lg:w-36">
              <option value="all">All sources</option>
              {Object.entries(DATA_SOURCE_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
            <Select value={syncFilter} onChange={(e) => setSyncFilter(e.target.value as SyncStatus | "all")} className="lg:w-36">
              <option value="all">All sync statuses</option>
              {Object.entries(SYNC_STATUS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                view === v.key ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </Card>

      {view === "stale" ? (
        <Card>
          {stalePlayers.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<UserX className="h-5 w-5" />} title="Every active player has a recent game" description="No players are missing recent game data." />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stalePlayers.map((p) => (
                <Link key={p.id} href={`/players/${p.id}`} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50">
                  <Avatar name={`${p.firstName} ${p.lastName}`} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{p.firstName} {p.lastName}</p>
                    <p className="truncate text-xs text-slate-400">{p.currentClub || "No club"} · {p.responsibleAgent}</p>
                  </div>
                  <Badge tone="amber">No recent games</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <Card>
          {viewGames.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={view === "goalies" ? <Shield className="h-5 w-5" /> : view === "top" ? <Trophy className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                title="No games found"
                description="Try adjusting your filters or add a new game record."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {viewGames.map((g) => (
                <GameRow key={g.id} game={g} onOpen={() => setViewingGame(g)} />
              ))}
            </div>
          )}
        </Card>
      )}

      <GameFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleCreate} title="Add Game Record" />

      <GameFormModal
        open={!!editingGame}
        onClose={() => setEditingGame(null)}
        onSubmit={handleUpdate}
        initialValues={editingGame ?? undefined}
        title="Edit Game Record"
      />

      <GameDetailModal
        game={viewingGame}
        onClose={() => setViewingGame(null)}
        onEdit={(game) => {
          setViewingGame(null);
          setEditingGame(game);
        }}
      />
    </div>
  );
}
