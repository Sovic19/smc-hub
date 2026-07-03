/**
 * Jednorázový seed skript — nahraje ukázkové úkoly z src/lib/mockData.ts do Supabase.
 * Přemapuje stará mock ID hráčů/klubů/kontaktů na jejich nová Supabase UUID
 * (hráči a kontakty podle jména, kluby podle názvu).
 *
 * Spouštění: node --env-file=.env.local node_modules/.bin/tsx scripts/seed-tasks.ts
 */

import { createClient } from "@supabase/supabase-js";
import { MOCK_CLUBS, MOCK_CONTACTS, MOCK_PLAYERS, MOCK_TASKS } from "../src/lib/mockData";
import type { TaskItem } from "../src/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error("Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SECRET_KEY v prostředí.");
  process.exit(1);
}

const supabase = createClient(url, secretKey);

function taskToRow(
  task: TaskItem,
  newPlayerId: string | null,
  newClubId: string | null,
  newContactId: string | null
): Record<string, unknown> {
  return {
    title: task.title,
    description: task.description || null,
    player_id: newPlayerId,
    club_id: newClubId,
    contact_id: newContactId,
    responsible_agent: task.responsibleAgent,
    priority: task.priority,
    status: task.status,
    due_date: task.dueDate || null,
    is_recurring: task.isRecurring,
    recurrence_note: task.recurrenceNote || null,
    reminder_enabled: task.reminderEnabled,
  };
}

async function main() {
  console.log("Načítám hráče, kluby a kontakty ze Supabase, ať vím jejich nová UUID...");
  const [{ data: playerRows, error: playerError }, { data: clubRows, error: clubError }, { data: contactRows, error: contactError }] =
    await Promise.all([
      supabase.from("players").select("id, first_name, last_name"),
      supabase.from("clubs").select("id, name"),
      supabase.from("contacts").select("id, first_name, last_name"),
    ]);
  if (playerError) throw playerError;
  if (clubError) throw clubError;
  if (contactError) throw contactError;

  const playerIdByName = new Map<string, string>();
  for (const row of playerRows) playerIdByName.set(`${row.first_name} ${row.last_name}`, row.id);
  const oldPlayerIdToNewId = new Map<string, string>();
  for (const player of MOCK_PLAYERS) {
    const newId = playerIdByName.get(`${player.firstName} ${player.lastName}`);
    if (newId) oldPlayerIdToNewId.set(player.id, newId);
  }

  const clubIdByName = new Map<string, string>();
  for (const row of clubRows) clubIdByName.set(row.name, row.id);
  const oldClubIdToNewId = new Map<string, string>();
  for (const club of MOCK_CLUBS) {
    const newId = clubIdByName.get(club.name);
    if (newId) oldClubIdToNewId.set(club.id, newId);
  }

  const contactIdByName = new Map<string, string>();
  for (const row of contactRows) contactIdByName.set(`${row.first_name} ${row.last_name}`, row.id);
  const oldContactIdToNewId = new Map<string, string>();
  for (const contact of MOCK_CONTACTS) {
    const newId = contactIdByName.get(`${contact.firstName} ${contact.lastName}`);
    if (newId) oldContactIdToNewId.set(contact.id, newId);
  }

  console.log("Mažu stávající obsah tabulky tasks...");
  const { error: deleteError } = await supabase.from("tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) throw deleteError;

  console.log(`Nahrávám ${MOCK_TASKS.length} úkolů...`);
  for (const task of MOCK_TASKS) {
    const newPlayerId = task.playerId ? oldPlayerIdToNewId.get(task.playerId) ?? null : null;
    const newClubId = task.clubId ? oldClubIdToNewId.get(task.clubId) ?? null : null;
    const newContactId = task.contactId ? oldContactIdToNewId.get(task.contactId) ?? null : null;
    const { data, error } = await supabase
      .from("tasks")
      .insert(taskToRow(task, newPlayerId, newClubId, newContactId))
      .select("id")
      .single();
    if (error) throw error;
    console.log(`  ✓ ${task.title} → ${data.id}`);
  }
  console.log(`Hotovo — nahráno ${MOCK_TASKS.length} úkolů.`);
}

main().catch((err) => {
  console.error("Seed selhal:", err);
  process.exit(1);
});
