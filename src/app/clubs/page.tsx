"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Mail, Phone, Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useData } from "@/context/DataContext";
import { ClubFormModal, ClubFormValues } from "@/components/clubs/ClubFormModal";
import { RELATIONSHIP_STRENGTH_LABEL } from "@/lib/format";
import { RELATIONSHIP_STRENGTH_TONE } from "@/lib/statusTone";

export default function ClubsPage() {
  const { clubs, players, addClub } = useData();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clubs
      .filter((c) =>
        q
          ? `${c.name} ${c.league} ${c.country}`.toLowerCase().includes(q)
          : true
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clubs, query]);

  function playerCount(clubName: string) {
    return players.filter((p) => p.currentClub === clubName).length;
  }

  function handleCreate(values: ClubFormValues) {
    addClub(values);
    setFormOpen(false);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Clubs</h2>
          <p className="mt-1 text-sm text-slate-400">
            {clubs.length} partner clubs
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Club
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search clubs by name, league, or country…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<Building2 className="h-5 w-5" />}
            title="No clubs found"
            description="Try a different search or add a new club."
            action={
              <Button size="sm" onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Club
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((club) => (
            <Link key={club.id} href={`/clubs/${club.id}`}>
              <Card className="h-full p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {club.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {club.league} · {club.country}
                    </p>
                  </div>
                  <Badge tone="brand">
                    <Users className="mr-1 h-3 w-3" />
                    {playerCount(club.name)}
                  </Badge>
                </div>
                <div className="mt-3">
                  <Badge tone={RELATIONSHIP_STRENGTH_TONE[club.relationshipStrength]}>
                    {RELATIONSHIP_STRENGTH_LABEL[club.relationshipStrength]} relationship
                  </Badge>
                </div>
                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  {club.gm && <p>GM: {club.gm}</p>}
                  {club.headCoach && <p>Head Coach: {club.headCoach}</p>}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
                  {club.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {club.phone}
                    </span>
                  )}
                  {club.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {club.email}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <ClubFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        title="Add New Club"
      />
    </div>
  );
}
