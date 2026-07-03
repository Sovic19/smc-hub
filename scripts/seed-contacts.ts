/**
 * Jednorázový seed skript — nahraje ukázkové kontakty z src/lib/mockData.ts do Supabase.
 * Protože kluby už mají v Supabase nová UUID (ne stará "club-1" apod.), skript si
 * nejdřív podle jména klubu dohledá jeho nové UUID a teprve pak vytvoří kontakty.
 *
 * Spouštění: node --env-file=.env.local node_modules/.bin/tsx scripts/seed-contacts.ts
 */

import { createClient } from "@supabase/supabase-js";
import { MOCK_CLUBS, MOCK_CONTACTS } from "../src/lib/mockData";
import type { Contact } from "../src/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error("Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SECRET_KEY v prostředí.");
  process.exit(1);
}

const supabase = createClient(url, secretKey);

function contactToRow(contact: Contact, newClubId: string | null): Record<string, unknown> {
  return {
    first_name: contact.firstName,
    last_name: contact.lastName,
    category: contact.category,
    role: contact.role || null,
    organization: contact.organization || null,
    linked_club_id: newClubId,
    country: contact.country || null,
    league: contact.league || null,
    phone: contact.phone || null,
    email: contact.email || null,
    whatsapp: contact.whatsapp || null,
    relationship_strength: contact.relationshipStrength,
    last_contact: contact.lastContact || null,
    next_follow_up: contact.nextFollowUp || null,
    notes: contact.notes || null,
    data_source: contact.dataSource,
    sync_status: contact.syncStatus,
    last_synced_at: contact.lastSyncedAt || null,
    manual_override: contact.manualOverride,
    sync_notes: contact.syncNotes || null,
  };
}

async function main() {
  console.log("Načítám kluby ze Supabase, ať vím jejich nová UUID...");
  const { data: clubRows, error: clubError } = await supabase.from("clubs").select("id, name");
  if (clubError) throw clubError;

  // Stejné pořadí jako v MOCK_CLUBS + shoda podle jména = spolehlivé přemapování.
  const clubIdByName = new Map<string, string>();
  for (const row of clubRows) clubIdByName.set(row.name, row.id);
  const oldIdToNewId = new Map<string, string>();
  for (const club of MOCK_CLUBS) {
    const newId = clubIdByName.get(club.name);
    if (newId) oldIdToNewId.set(club.id, newId);
  }

  console.log("Mažu stávající obsah tabulky contacts...");
  const { error: deleteError } = await supabase.from("contacts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) throw deleteError;

  console.log(`Nahrávám ${MOCK_CONTACTS.length} kontaktů...`);
  for (const contact of MOCK_CONTACTS) {
    const newClubId = contact.linkedClubId ? oldIdToNewId.get(contact.linkedClubId) ?? null : null;
    const { data, error } = await supabase
      .from("contacts")
      .insert(contactToRow(contact, newClubId))
      .select("id")
      .single();
    if (error) throw error;
    console.log(`  ✓ ${contact.firstName} ${contact.lastName} → ${data.id}`);
  }
  console.log(`Hotovo — nahráno ${MOCK_CONTACTS.length} kontaktů.`);
}

main().catch((err) => {
  console.error("Seed selhal:", err);
  process.exit(1);
});
