"use client";

import { useState } from "react";
import { Plus, StickyNote } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContractTimelineList } from "@/components/players/ContractTimelineList";
import { useData } from "@/context/DataContext";
import { Player, PlayerNoteEntry } from "@/types";
import { formatDate } from "@/lib/format";
import { generateId, nowIso } from "@/lib/storage";

export function HistoryTab({ player }: { player: Player }) {
  const { updatePlayer } = useData();
  const [historyDraft, setHistoryDraft] = useState("");

  function addHistoryEntry() {
    const text = historyDraft.trim();
    if (!text) return;
    const entry: PlayerNoteEntry = {
      id: generateId("h"),
      date: nowIso().slice(0, 10),
      author: player.responsibleAgent || "Marko Simić",
      note: text,
    };
    updatePlayer(player.id, { history: [entry, ...player.history] });
    setHistoryDraft("");
  }

  const sortedHistory = [...player.history].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Contract & Club History" description="Previous clubs, leagues, and contract terms" />
        <CardBody>
          <ContractTimelineList entries={player.contractTimeline} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Notes History" description="Important events and cooperation notes over time" />
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Textarea
              value={historyDraft}
              onChange={(e) => setHistoryDraft(e.target.value)}
              placeholder="Log a new history entry or important event…"
              rows={2}
              className="flex-1"
            />
            <Button size="sm" onClick={addHistoryEntry} disabled={!historyDraft.trim()} className="self-end">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </div>

          {sortedHistory.length === 0 ? (
            <EmptyState icon={<StickyNote className="h-5 w-5" />} title="No history entries yet" />
          ) : (
            <ol className="space-y-4 border-l-2 border-slate-100 pl-4">
              {sortedHistory.map((entry) => (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-400" />
                  <p className="text-sm text-slate-700">{entry.note}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{formatDate(entry.date)} · {entry.author}</p>
                </li>
              ))}
            </ol>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
