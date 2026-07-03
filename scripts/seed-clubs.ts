/**
 * Jednorázový seed skript — nahraje ukázkové kluby z src/lib/mockData.ts do Supabase.
 * Spouštění: node --env-file=.env.local node_modules/.bin/tsx scripts/seed-clubs.ts
 */

import { createClient } from "@supabase/supabase-js";
import { MOCK_CLUBS } from "../src/lib/mockData";
import type { Club } from "../src/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error("Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SECRET_KEY v prostředí.");
  process.exit(1);
}

const supabase = createClient(url, secretKey);

function clubToRow(club: Club): Record<string, unknown> {
  return {
    name: club.name,
    country: club.country,
    league: club.league,
    manager: club.manager || null,
    head_coach: club.headCoach || null,
    sporting_manager: club.sportingManager || null,
    gm: club.gm || null,
    scout_contact: club.scoutContact || null,
    phone: club.phone || null,
    email: club.email || null,
    whatsapp: club.whatsapp || null,
    relationship_strength: club.relationshipStrength,
    notes: club.notes || null,
    eliteprospects_url: club.eliteProspectsUrl || null,
    data_source: club.dataSource,
    sync_status: club.syncStatus,
    last_synced_at: club.lastSyncedAt || null,
    manual_override: club.manualOverride,
    sync_notes: club.syncNotes || null,
  };
}

async function main() {
  console.log("Mažu stávající obsah tabulky clubs...");
  const { error: deleteError } = await supabase.from("clubs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) throw deleteError;

  console.log(`Nahrávám ${MOCK_CLUBS.length} klubů...`);
  for (const club of MOCK_CLUBS) {
    const { data, error } = await supabase.from("clubs").insert(clubToRow(club)).select("id").single();
    if (error) throw error;
    console.log(`  ✓ ${club.name} → ${data.id}`);
  }
  console.log(`Hotovo — nahráno ${MOCK_CLUBS.length} klubů.`);
}

main().catch((err) => {
  console.error("Seed selhal:", err);
  process.exit(1);
});
