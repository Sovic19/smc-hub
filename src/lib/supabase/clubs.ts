import { supabase } from "@/lib/supabase/client";
import { Club } from "@/types";

// Kluby nemají žádné vnořené objekty ani dětské tabulky, takže je mapování
// mnohem jednodušší než u hráčů — jen snake_case <-> camelCase.

interface ClubRow {
  id: string;
  name: string;
  country: string;
  league: string;
  manager: string | null;
  head_coach: string | null;
  sporting_manager: string | null;
  gm: string | null;
  scout_contact: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  relationship_strength: string;
  notes: string | null;
  eliteprospects_url: string | null;
  data_source: string;
  sync_status: string;
  last_synced_at: string | null;
  manual_override: boolean;
  sync_notes: string | null;
  created_at: string;
  updated_at: string;
}

function rowToClub(row: ClubRow): Club {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    league: row.league,
    manager: row.manager ?? undefined,
    headCoach: row.head_coach ?? undefined,
    sportingManager: row.sporting_manager ?? undefined,
    gm: row.gm ?? undefined,
    scoutContact: row.scout_contact ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    relationshipStrength: row.relationship_strength as Club["relationshipStrength"],
    notes: row.notes ?? undefined,
    eliteProspectsUrl: row.eliteprospects_url ?? undefined,
    dataSource: row.data_source as Club["dataSource"],
    syncStatus: row.sync_status as Club["syncStatus"],
    lastSyncedAt: row.last_synced_at ?? undefined,
    manualOverride: row.manual_override,
    syncNotes: row.sync_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function clubToRow(club: Partial<Club>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (club.name !== undefined) row.name = club.name;
  if (club.country !== undefined) row.country = club.country;
  if (club.league !== undefined) row.league = club.league;
  if (club.manager !== undefined) row.manager = club.manager || null;
  if (club.headCoach !== undefined) row.head_coach = club.headCoach || null;
  if (club.sportingManager !== undefined) row.sporting_manager = club.sportingManager || null;
  if (club.gm !== undefined) row.gm = club.gm || null;
  if (club.scoutContact !== undefined) row.scout_contact = club.scoutContact || null;
  if (club.phone !== undefined) row.phone = club.phone || null;
  if (club.email !== undefined) row.email = club.email || null;
  if (club.whatsapp !== undefined) row.whatsapp = club.whatsapp || null;
  if (club.relationshipStrength !== undefined) row.relationship_strength = club.relationshipStrength;
  if (club.notes !== undefined) row.notes = club.notes || null;
  if (club.eliteProspectsUrl !== undefined) row.eliteprospects_url = club.eliteProspectsUrl || null;
  if (club.dataSource !== undefined) row.data_source = club.dataSource;
  if (club.syncStatus !== undefined) row.sync_status = club.syncStatus;
  if (club.lastSyncedAt !== undefined) row.last_synced_at = club.lastSyncedAt || null;
  if (club.manualOverride !== undefined) row.manual_override = club.manualOverride;
  if (club.syncNotes !== undefined) row.sync_notes = club.syncNotes || null;
  return row;
}

export async function fetchClubs(): Promise<Club[]> {
  const { data, error } = await supabase.from("clubs").select("*").order("name");
  if (error) throw error;
  return (data as ClubRow[]).map(rowToClub);
}

export async function insertClub(club: Omit<Club, "id" | "createdAt" | "updatedAt">): Promise<Club> {
  const { data, error } = await supabase.from("clubs").insert(clubToRow(club)).select("*").single();
  if (error) throw error;
  return rowToClub(data as ClubRow);
}

export async function updateClubRow(id: string, updates: Partial<Club>): Promise<void> {
  const row = clubToRow(updates);
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("clubs").update(row).eq("id", id);
  if (error) throw error;
}

export async function deleteClubRow(id: string): Promise<void> {
  const { error } = await supabase.from("clubs").delete().eq("id", id);
  if (error) throw error;
}
