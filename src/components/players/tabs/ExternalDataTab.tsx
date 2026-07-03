"use client";

import { ExternalLink, Globe2, ShieldAlert } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { DetailField, DetailGrid } from "@/components/ui/DetailField";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { MockDataNotice } from "@/components/ui/MockDataNotice";
import { Select } from "@/components/ui/Field";
import { ImportFromEPButton } from "@/components/players/ImportFromEPButton";
import { useData } from "@/context/DataContext";
import { Player, SyncStatus } from "@/types";
import { SYNC_STATUS_LABEL, formatDate, formatDateTime, formatHeight, formatWeight } from "@/lib/format";
import { SYNC_STATUS_TONE } from "@/lib/statusTone";

export function ExternalDataTab({ player }: { player: Player }) {
  const { updatePlayer } = useData();
  const ext = player.externalData;

  function setManualOverride(value: boolean) {
    updatePlayer(player.id, { manualOverride: value });
  }

  function setSyncStatus(value: SyncStatus) {
    updatePlayer(player.id, { syncStatus: value });
  }

  return (
    <div className="space-y-6">
      <MockDataNotice />

      <Card>
        <CardHeader
          title="Sync Status"
          description="EliteProspects pilot integration for this player"
          action={
            <ImportFromEPButton
              playerId={player.id}
              playerName={`${player.firstName} ${player.lastName}`}
              label={player.syncStatus === "synced" ? "Re-import Data" : "Import from EliteProspects"}
            />
          }
        />
        <CardBody>
          <DetailGrid>
            <DetailField
              label="Sync Status"
              value={
                <Badge tone={SYNC_STATUS_TONE[player.syncStatus]}>
                  {SYNC_STATUS_LABEL[player.syncStatus]}
                </Badge>
              }
            />
            <DetailField label="Last Synced" value={formatDateTime(player.lastSyncedAt)} />
            <DetailField
              label="EliteProspects URL"
              value={
                player.eliteProspectsUrl ? (
                  <a
                    href={player.eliteProspectsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-600 hover:underline"
                  >
                    View profile <ExternalLink className="h-3 w-3" />
                  </a>
                ) : undefined
              }
            />
            <DetailField
              label="Manual Override"
              value={
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={player.manualOverride}
                    onChange={(e) => setManualOverride(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                  />
                  <span className="text-sm text-slate-600">
                    {player.manualOverride
                      ? "Imported data manually adjusted"
                      : "Using imported data as-is"}
                  </span>
                </label>
              }
            />
            <DetailField
              label="Set Status Manually"
              value={
                <Select
                  value={player.syncStatus}
                  onChange={(e) => setSyncStatus(e.target.value as SyncStatus)}
                  className="max-w-[220px]"
                >
                  {Object.entries(SYNC_STATUS_LABEL).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </Select>
              }
            />
          </DetailGrid>

          {player.manualOverride && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p>
                An agent has manually overridden the imported EliteProspects data below.
                Re-importing will replace these manual adjustments with fresh mock data.
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {!ext ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<Globe2 className="h-5 w-5" />}
              title="No external data yet"
              description="Import this player's profile from EliteProspects to populate biographical details and season statistics."
              action={
                <ImportFromEPButton
                  playerId={player.id}
                  playerName={`${player.firstName} ${player.lastName}`}
                  variant="primary"
                />
              }
            />
          </CardBody>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader title="Imported Profile Data" description="Fields sourced from EliteProspects (mock)" />
            <CardBody>
              <DetailGrid>
                <DetailField label="Date of Birth" value={formatDate(ext.dateOfBirth)} />
                <DetailField label="Age" value={ext.age} />
                <DetailField label="Nationality" value={ext.nationality} />
                <DetailField label="Position" value={ext.position} />
                <DetailField label="Shoots / Catches" value={ext.shoots} />
                <DetailField label="Height" value={formatHeight(ext.heightCm)} />
                <DetailField label="Weight" value={formatWeight(ext.weightKg)} />
                <DetailField label="Current Club" value={ext.currentClub} />
                <DetailField label="Current League" value={ext.currentLeague} />
                <DetailField
                  label="Notes"
                  value={ext.notes}
                  className="sm:col-span-2 lg:col-span-3"
                />
              </DetailGrid>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Season Statistics" description="Imported from EliteProspects (mock)" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-medium">Season</th>
                    <th className="px-3 py-3 font-medium">Team</th>
                    <th className="px-3 py-3 font-medium">League</th>
                    <th className="px-3 py-3 text-right font-medium">GP</th>
                    <th className="px-3 py-3 text-right font-medium">G</th>
                    <th className="px-3 py-3 text-right font-medium">A</th>
                    <th className="px-3 py-3 text-right font-medium">PTS</th>
                    <th className="px-5 py-3 text-right font-medium">PIM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ext.seasonStats.map((s, idx) => (
                    <tr key={idx} className="text-slate-700">
                      <td className="px-5 py-2.5 font-medium text-slate-900">{s.season}</td>
                      <td className="px-3 py-2.5">{s.team}</td>
                      <td className="px-3 py-2.5 text-slate-500">{s.league}</td>
                      <td className="px-3 py-2.5 text-right">{s.gp}</td>
                      <td className="px-3 py-2.5 text-right">{s.g}</td>
                      <td className="px-3 py-2.5 text-right">{s.a}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-900">{s.pts}</td>
                      <td className="px-5 py-2.5 text-right">{s.pim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
