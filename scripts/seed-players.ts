/**
 * Jednorázový seed skript — nahraje ukázkové hráče z src/lib/mockData.ts
 * do Supabase tabulky `players` (+ player_notes, contract_timeline_entries).
 *
 * Spouští se přes tsx a používá SECRET klíč (server-only, nikdy ne v appce):
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/seed-players.ts
 *
 * Bezpečné spouštět opakovaně — na začátku smaže obsah tabulky players
 * (kaskádově i player_notes/contract_timeline_entries) a nahraje ho znovu.
 */

import { createClient } from "@supabase/supabase-js";
import { MOCK_PLAYERS } from "../src/lib/mockData";
import type { Player } from "../src/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error("Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SECRET_KEY v prostředí.");
  console.error("Spusť skript s: node --env-file=.env.local node_modules/.bin/tsx scripts/seed-players.ts");
  process.exit(1);
}

const supabase = createClient(url, secretKey);

function playerToFullRow(player: Player): Record<string, unknown> {
  return {
    first_name: player.firstName,
    last_name: player.lastName,
    position: player.position,
    date_of_birth: player.dateOfBirth || null,
    country: player.country,
    shoots: player.shoots || null,
    height_cm: player.heightCm ?? null,
    weight_kg: player.weightKg ?? null,
    current_club: player.currentClub,
    current_league: player.currentLeague,
    season: player.season,
    countries_of_interest: player.countriesOfInterest,
    status: player.status,
    category: player.category,
    pipeline_stage: player.pipelineStage,
    eliteprospects_url: player.eliteProspectsUrl || null,
    video_urls: player.videoUrls,
    phone: player.phone || null,
    email: player.email || null,
    whatsapp: player.whatsapp || null,
    marital_status: player.maritalStatus,
    family_notes: player.familyNotes || null,
    photo_url: player.photoUrl || null,
    visibility: player.visibility,

    contract_situation: player.contractSituation,
    junior_team: player.juniorTeam || null,
    youth_league: player.youthLeague || null,
    draft_eligibility_year: player.draftEligibilityYear ?? null,
    guardian_name: player.guardianContact?.name || null,
    guardian_relationship: player.guardianContact?.relationship || null,
    guardian_phone: player.guardianContact?.phone || null,
    guardian_email: player.guardianContact?.email || null,
    school_interest: player.schoolInterest || null,
    development_notes: player.developmentNotes || null,

    representing_agent: player.representingAgent,
    contract_negotiated_by: player.contractNegotiatedBy,
    negotiations_lead_by: player.negotiationsLeadBy || null,
    agency_agreement_start_date: player.agencyAgreementStartDate || null,
    agency_agreement_end_date: player.agencyAgreementEndDate || null,
    cooperation_notes: player.cooperationNotes,

    current_contract_amount: player.currentContractAmount ?? null,
    salary: player.salary ?? null,
    currency: player.currency || null,
    bonuses: player.bonuses || null,
    housing: player.housing || null,
    car: player.car || null,
    contract_length: player.contractLength || null,
    club_contract_start_date: player.clubContractStartDate || null,
    club_contract_end_date: player.clubContractEndDate || null,
    contract_status: player.contractStatus,
    club_contact_person: player.clubContactPerson || null,
    commission_percentage: player.commission.percentage ?? null,
    commission_amount: player.commission.amount ?? null,
    commission_currency: player.commission.currency || null,
    commission_owner: player.commission.owner || null,
    commission_split_with_agent: player.commission.splitWithAgent || null,
    commission_split_percentage: player.commission.splitPercentage ?? null,
    commission_payment_status: player.commission.paymentStatus,
    commission_due_date: player.commission.dueDate || null,
    commission_notes: player.commission.notes || null,

    last_contact: player.lastContact || null,
    next_follow_up: player.nextFollowUp || null,
    responsible_agent: player.responsibleAgent,
    follow_up_deadline: player.followUpDeadline || null,
    follow_up_status: player.followUpStatus,

    external_data: player.externalData ?? null,

    data_source: player.dataSource,
    sync_status: player.syncStatus,
    last_synced_at: player.lastSyncedAt || null,
    manual_override: player.manualOverride,
    sync_notes: player.syncNotes || null,
  };
}

async function main() {
  console.log(`Mažu stávající obsah tabulky players (a navázané player_notes / contract_timeline_entries)...`);
  const { error: deleteError } = await supabase.from("players").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) throw deleteError;

  console.log(`Nahrávám ${MOCK_PLAYERS.length} hráčů...`);
  let count = 0;
  for (const player of MOCK_PLAYERS) {
    const { data, error } = await supabase
      .from("players")
      .insert(playerToFullRow(player))
      .select("id")
      .single();
    if (error) throw error;
    const newId = data.id as string;

    if (player.history.length > 0) {
      const notes = player.history.map((n) => ({ player_id: newId, date: n.date, author: n.author, note: n.note }));
      const { error: notesError } = await supabase.from("player_notes").insert(notes);
      if (notesError) throw notesError;
    }

    if (player.contractTimeline.length > 0) {
      const timeline = player.contractTimeline.map((t) => ({
        player_id: newId,
        club: t.club,
        league: t.league || null,
        country: t.country || null,
        season: t.season || null,
        start_date: t.startDate || null,
        end_date: t.endDate || null,
        salary: t.salary ?? null,
        currency: t.currency || null,
        bonuses: t.bonuses || null,
        housing: t.housing || null,
        car: t.car || null,
        arranged_by_agent: t.arrangedByAgent || null,
        club_contact: t.clubContact || null,
        deal_status: t.dealStatus || null,
        notes: t.notes || null,
      }));
      const { error: timelineError } = await supabase.from("contract_timeline_entries").insert(timeline);
      if (timelineError) throw timelineError;
    }

    count++;
    console.log(`  ✓ ${player.firstName} ${player.lastName} → ${newId}`);
  }

  console.log(`Hotovo — nahráno ${count} hráčů.`);
}

main().catch((err) => {
  console.error("Seed selhal:", err);
  process.exit(1);
});
