"use client";

import { FormEvent, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useData } from "@/context/DataContext";
import { DataSource, GameRecord, HomeAway, SyncStatus } from "@/types";
import { DATA_SOURCE_LABEL, SYNC_STATUS_LABEL } from "@/lib/format";

export type GameFormValues = Omit<GameRecord, "id" | "createdAt" | "updatedAt">;

function emptyValues(): GameFormValues {
  return {
    playerId: "",
    team: "",
    opponent: "",
    date: new Date().toISOString().slice(0, 10),
    competition: "",
    country: "",
    result: "",
    homeAway: "home",
    goals: 0,
    assists: 0,
    points: 0,
    plusMinus: 0,
    penaltyMinutes: 0,
    shots: 0,
    timeOnIce: "",
    powerplayPoints: 0,
    shorthandedPoints: 0,
    faceoffPercentage: undefined,
    goalieStats: undefined,
    gameReportUrl: "",
    videoUrl: "",
    dataSource: "manual",
    syncStatus: "not_synced",
    scoutNote: "",
  };
}

export function GameFormModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: GameFormValues) => void;
  initialValues?: Partial<GameFormValues>;
  title: string;
}) {
  const { players } = useData();
  const [values, setValues] = useState<GameFormValues>({ ...emptyValues(), ...initialValues });
  const [isGoalie, setIsGoalie] = useState(!!initialValues?.goalieStats);

  useEffect(() => {
    if (open) {
      setValues({ ...emptyValues(), ...initialValues });
      setIsGoalie(!!initialValues?.goalieStats);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof GameFormValues>(key: K, value: GameFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setGoalieStat<K extends keyof NonNullable<GameFormValues["goalieStats"]>>(
    key: K,
    value: NonNullable<GameFormValues["goalieStats"]>[K]
  ) {
    setValues((prev) => ({
      ...prev,
      goalieStats: {
        saves: prev.goalieStats?.saves ?? 0,
        goalsAgainst: prev.goalieStats?.goalsAgainst ?? 0,
        savePercentage: prev.goalieStats?.savePercentage ?? 0,
        shutout: prev.goalieStats?.shutout ?? false,
        [key]: value,
      },
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const points = values.goals + values.assists;
    onSubmit({ ...values, points, goalieStats: isGoalie ? values.goalieStats : undefined });
  }

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Player" required>
            <Select required value={values.playerId} onChange={(e) => set("playerId", e.target.value)}>
              <option value="">Select player…</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </Select>
          </FormField>
          <FormField label="Team">
            <Input value={values.team} onChange={(e) => set("team", e.target.value)} />
          </FormField>
          <FormField label="Opponent">
            <Input value={values.opponent} onChange={(e) => set("opponent", e.target.value)} />
          </FormField>
          <FormField label="Date">
            <Input type="date" value={values.date} onChange={(e) => set("date", e.target.value)} />
          </FormField>
          <FormField label="Competition / League">
            <Input value={values.competition} onChange={(e) => set("competition", e.target.value)} />
          </FormField>
          <FormField label="Country">
            <Input value={values.country} onChange={(e) => set("country", e.target.value)} />
          </FormField>
          <FormField label="Result">
            <Input placeholder="W 4-2" value={values.result} onChange={(e) => set("result", e.target.value)} />
          </FormField>
          <FormField label="Home / Away">
            <Select value={values.homeAway} onChange={(e) => set("homeAway", e.target.value as HomeAway)}>
              <option value="home">Home</option>
              <option value="away">Away</option>
            </Select>
          </FormField>
          <FormField label="Time on Ice">
            <Input placeholder="18:24" value={values.timeOnIce} onChange={(e) => set("timeOnIce", e.target.value)} />
          </FormField>

          <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2 lg:col-span-3">
            <input
              type="checkbox"
              checked={isGoalie}
              onChange={(e) => setIsGoalie(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
            />
            This is a goaltender appearance
          </label>

          {isGoalie ? (
            <>
              <FormField label="Saves">
                <Input type="number" min={0} value={values.goalieStats?.saves ?? ""} onChange={(e) => setGoalieStat("saves", Number(e.target.value))} />
              </FormField>
              <FormField label="Goals Against">
                <Input type="number" min={0} value={values.goalieStats?.goalsAgainst ?? ""} onChange={(e) => setGoalieStat("goalsAgainst", Number(e.target.value))} />
              </FormField>
              <FormField label="Save %">
                <Input type="number" min={0} max={100} step={0.1} value={values.goalieStats?.savePercentage ?? ""} onChange={(e) => setGoalieStat("savePercentage", Number(e.target.value))} />
              </FormField>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={values.goalieStats?.shutout ?? false}
                  onChange={(e) => setGoalieStat("shutout", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
                />
                Shutout
              </label>
            </>
          ) : (
            <>
              <FormField label="Goals">
                <Input type="number" min={0} value={values.goals} onChange={(e) => set("goals", Number(e.target.value))} />
              </FormField>
              <FormField label="Assists">
                <Input type="number" min={0} value={values.assists} onChange={(e) => set("assists", Number(e.target.value))} />
              </FormField>
              <FormField label="+/-">
                <Input type="number" value={values.plusMinus} onChange={(e) => set("plusMinus", Number(e.target.value))} />
              </FormField>
              <FormField label="Penalty Minutes">
                <Input type="number" min={0} value={values.penaltyMinutes} onChange={(e) => set("penaltyMinutes", Number(e.target.value))} />
              </FormField>
              <FormField label="Shots">
                <Input type="number" min={0} value={values.shots} onChange={(e) => set("shots", Number(e.target.value))} />
              </FormField>
              <FormField label="Powerplay Points">
                <Input type="number" min={0} value={values.powerplayPoints} onChange={(e) => set("powerplayPoints", Number(e.target.value))} />
              </FormField>
              <FormField label="Shorthanded Points">
                <Input type="number" min={0} value={values.shorthandedPoints} onChange={(e) => set("shorthandedPoints", Number(e.target.value))} />
              </FormField>
              <FormField label="Faceoff %">
                <Input type="number" min={0} max={100} step={0.1} value={values.faceoffPercentage ?? ""} onChange={(e) => set("faceoffPercentage", e.target.value === "" ? undefined : Number(e.target.value))} />
              </FormField>
            </>
          )}

          <FormField label="Game Report URL">
            <Input type="url" value={values.gameReportUrl ?? ""} onChange={(e) => set("gameReportUrl", e.target.value)} />
          </FormField>
          <FormField label="Video / Highlights URL">
            <Input type="url" value={values.videoUrl ?? ""} onChange={(e) => set("videoUrl", e.target.value)} />
          </FormField>
          <FormField label="Data Source">
            <Select value={values.dataSource} onChange={(e) => set("dataSource", e.target.value as DataSource)}>
              {Object.entries(DATA_SOURCE_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Sync Status">
            <Select value={values.syncStatus} onChange={(e) => set("syncStatus", e.target.value as SyncStatus)}>
              {Object.entries(SYNC_STATUS_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Internal Scout Note">
          <Textarea value={values.scoutNote ?? ""} onChange={(e) => set("scoutNote", e.target.value)} />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Game</Button>
        </div>
      </form>
    </Modal>
  );
}
