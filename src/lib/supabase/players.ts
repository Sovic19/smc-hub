import { supabase } from "@/lib/supabase/client";
import { ContractTimelineEntry, Player, PlayerNoteEntry } from "@/types";

// Sloupce v `players` tabulce jsou snake_case, TypeScript typ Player je camelCase.
// Tyto dvě funkce převádějí mezi nimi jedním centrálním místem.

const PLAYER_SELECT = "*, player_notes(*), contract_timeline_entries(*)";

interface PlayerRow {
  [key: string]: unknown;
  id: string;
  player_notes: NoteRow[];
  contract_timeline_entries: TimelineRow[];
  created_at: string;
  updated_at: string;
}

interface NoteRow {
  id: string;
  date: string;
  author: string;
  note: string;
}

interface TimelineRow {
  id: string;
  club: string;
  league: string | null;
  country: string | null;
  season: string | null;
  start_date: string | null;
  end_date: string | null;
  salary: number | null;
  currency: string | null;
  bonuses: string | null;
  housing: string | null;
  car: string | null;
  arranged_by_agent: string | null;
  club_contact: string | null;
  deal_status: string | null;
  notes: string | null;
}

function noteRowToEntry(row: NoteRow): PlayerNoteEntry {
  return { id: row.id, date: row.date, author: row.author, note: row.note };
}

function timelineRowToEntry(row: TimelineRow): ContractTimelineEntry {
  return {
    id: row.id,
    club: row.club,
    league: row.league ?? "",
    country: row.country ?? "",
    season: row.season ?? "",
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    salary: row.salary ?? undefined,
    currency: row.currency ?? undefined,
    bonuses: row.bonuses ?? undefined,
    housing: row.housing ?? undefined,
    car: row.car ?? undefined,
    arrangedByAgent: row.arranged_by_agent ?? undefined,
    clubContact: row.club_contact ?? undefined,
    dealStatus: (row.deal_status as ContractTimelineEntry["dealStatus"]) ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function rowToPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    position: row.position as Player["position"],
    dateOfBirth: (row.date_of_birth as string) ?? undefined,
    country: row.country as string,
    shoots: (row.shoots as string) ?? undefined,
    heightCm: (row.height_cm as number) ?? undefined,
    weightKg: (row.weight_kg as number) ?? undefined,
    currentClub: row.current_club as string,
    currentLeague: row.current_league as string,
    season: row.season as string,
    countriesOfInterest: (row.countries_of_interest as string[]) ?? [],
    status: row.status as Player["status"],
    category: row.category as Player["category"],
    pipelineStage: row.pipeline_stage as Player["pipelineStage"],
    eliteProspectsUrl: (row.eliteprospects_url as string) ?? undefined,
    videoUrls: (row.video_urls as string[]) ?? [],
    phone: (row.phone as string) ?? undefined,
    email: (row.email as string) ?? undefined,
    whatsapp: (row.whatsapp as string) ?? undefined,
    maritalStatus: row.marital_status as Player["maritalStatus"],
    familyNotes: (row.family_notes as string) ?? undefined,
    photoUrl: (row.photo_url as string) ?? undefined,
    visibility: row.visibility as Player["visibility"],

    contractSituation: row.contract_situation as Player["contractSituation"],
    juniorTeam: (row.junior_team as string) ?? undefined,
    youthLeague: (row.youth_league as string) ?? undefined,
    draftEligibilityYear: (row.draft_eligibility_year as number) ?? undefined,
    guardianContact:
      row.guardian_name || row.guardian_relationship || row.guardian_phone || row.guardian_email
        ? {
            name: (row.guardian_name as string) ?? undefined,
            relationship: (row.guardian_relationship as string) ?? undefined,
            phone: (row.guardian_phone as string) ?? undefined,
            email: (row.guardian_email as string) ?? undefined,
          }
        : undefined,
    schoolInterest: (row.school_interest as string) ?? undefined,
    developmentNotes: (row.development_notes as string) ?? undefined,

    representingAgent: row.representing_agent as string,
    contractNegotiatedBy: row.contract_negotiated_by as string,
    negotiationsLeadBy: (row.negotiations_lead_by as string) ?? undefined,
    agencyAgreementStartDate: (row.agency_agreement_start_date as string) ?? undefined,
    agencyAgreementEndDate: (row.agency_agreement_end_date as string) ?? undefined,
    cooperationNotes: row.cooperation_notes as string,

    currentContractAmount: (row.current_contract_amount as number) ?? undefined,
    salary: (row.salary as number) ?? undefined,
    currency: (row.currency as string) ?? undefined,
    bonuses: (row.bonuses as string) ?? undefined,
    housing: (row.housing as string) ?? undefined,
    car: (row.car as string) ?? undefined,
    contractLength: (row.contract_length as string) ?? undefined,
    clubContractStartDate: (row.club_contract_start_date as string) ?? undefined,
    clubContractEndDate: (row.club_contract_end_date as string) ?? undefined,
    contractStatus: row.contract_status as Player["contractStatus"],
    clubContactPerson: (row.club_contact_person as string) ?? undefined,
    commission: {
      percentage: (row.commission_percentage as number) ?? undefined,
      amount: (row.commission_amount as number) ?? undefined,
      currency: (row.commission_currency as string) ?? undefined,
      owner: (row.commission_owner as string) ?? undefined,
      splitWithAgent: (row.commission_split_with_agent as string) ?? undefined,
      splitPercentage: (row.commission_split_percentage as number) ?? undefined,
      paymentStatus: row.commission_payment_status as Player["commission"]["paymentStatus"],
      dueDate: (row.commission_due_date as string) ?? undefined,
      notes: (row.commission_notes as string) ?? undefined,
    },
    contractTimeline: (row.contract_timeline_entries ?? []).map(timelineRowToEntry),

    lastContact: (row.last_contact as string) ?? undefined,
    nextFollowUp: (row.next_follow_up as string) ?? undefined,
    responsibleAgent: row.responsible_agent as string,
    followUpDeadline: (row.follow_up_deadline as string) ?? undefined,
    followUpStatus: row.follow_up_status as Player["followUpStatus"],

    history: (row.player_notes ?? []).map(noteRowToEntry),
    externalData: (row.external_data as Player["externalData"]) ?? undefined,

    dataSource: row.data_source as Player["dataSource"],
    syncStatus: row.sync_status as Player["syncStatus"],
    lastSyncedAt: (row.last_synced_at as string) ?? undefined,
    manualOverride: row.manual_override as boolean,
    syncNotes: (row.sync_notes as string) ?? undefined,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Připraví hlavní řádek `players` tabulky (bez player_notes/contract_timeline_entries — ty se zapisují zvlášť). */
function playerToRow(player: Partial<Player>): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (player.firstName !== undefined) row.first_name = player.firstName;
  if (player.lastName !== undefined) row.last_name = player.lastName;
  if (player.position !== undefined) row.position = player.position;
  if (player.dateOfBirth !== undefined) row.date_of_birth = player.dateOfBirth || null;
  if (player.country !== undefined) row.country = player.country;
  if (player.shoots !== undefined) row.shoots = player.shoots || null;
  if (player.heightCm !== undefined) row.height_cm = player.heightCm ?? null;
  if (player.weightKg !== undefined) row.weight_kg = player.weightKg ?? null;
  if (player.currentClub !== undefined) row.current_club = player.currentClub;
  if (player.currentLeague !== undefined) row.current_league = player.currentLeague;
  if (player.season !== undefined) row.season = player.season;
  if (player.countriesOfInterest !== undefined) row.countries_of_interest = player.countriesOfInterest;
  if (player.status !== undefined) row.status = player.status;
  if (player.category !== undefined) row.category = player.category;
  if (player.pipelineStage !== undefined) row.pipeline_stage = player.pipelineStage;
  if (player.eliteProspectsUrl !== undefined) row.eliteprospects_url = player.eliteProspectsUrl || null;
  if (player.videoUrls !== undefined) row.video_urls = player.videoUrls;
  if (player.phone !== undefined) row.phone = player.phone || null;
  if (player.email !== undefined) row.email = player.email || null;
  if (player.whatsapp !== undefined) row.whatsapp = player.whatsapp || null;
  if (player.maritalStatus !== undefined) row.marital_status = player.maritalStatus;
  if (player.familyNotes !== undefined) row.family_notes = player.familyNotes || null;
  if (player.photoUrl !== undefined) row.photo_url = player.photoUrl || null;
  if (player.visibility !== undefined) row.visibility = player.visibility;

  if (player.contractSituation !== undefined) row.contract_situation = player.contractSituation;
  if (player.juniorTeam !== undefined) row.junior_team = player.juniorTeam || null;
  if (player.youthLeague !== undefined) row.youth_league = player.youthLeague || null;
  if (player.draftEligibilityYear !== undefined) row.draft_eligibility_year = player.draftEligibilityYear ?? null;
  if (player.guardianContact !== undefined) {
    row.guardian_name = player.guardianContact?.name || null;
    row.guardian_relationship = player.guardianContact?.relationship || null;
    row.guardian_phone = player.guardianContact?.phone || null;
    row.guardian_email = player.guardianContact?.email || null;
  }
  if (player.schoolInterest !== undefined) row.school_interest = player.schoolInterest || null;
  if (player.developmentNotes !== undefined) row.development_notes = player.developmentNotes || null;

  if (player.representingAgent !== undefined) row.representing_agent = player.representingAgent;
  if (player.contractNegotiatedBy !== undefined) row.contract_negotiated_by = player.contractNegotiatedBy;
  if (player.negotiationsLeadBy !== undefined) row.negotiations_lead_by = player.negotiationsLeadBy || null;
  if (player.agencyAgreementStartDate !== undefined) row.agency_agreement_start_date = player.agencyAgreementStartDate || null;
  if (player.agencyAgreementEndDate !== undefined) row.agency_agreement_end_date = player.agencyAgreementEndDate || null;
  if (player.cooperationNotes !== undefined) row.cooperation_notes = player.cooperationNotes;

  if (player.currentContractAmount !== undefined) row.current_contract_amount = player.currentContractAmount ?? null;
  if (player.salary !== undefined) row.salary = player.salary ?? null;
  if (player.currency !== undefined) row.currency = player.currency || null;
  if (player.bonuses !== undefined) row.bonuses = player.bonuses || null;
  if (player.housing !== undefined) row.housing = player.housing || null;
  if (player.car !== undefined) row.car = player.car || null;
  if (player.contractLength !== undefined) row.contract_length = player.contractLength || null;
  if (player.clubContractStartDate !== undefined) row.club_contract_start_date = player.clubContractStartDate || null;
  if (player.clubContractEndDate !== undefined) row.club_contract_end_date = player.clubContractEndDate || null;
  if (player.contractStatus !== undefined) row.contract_status = player.contractStatus;
  if (player.clubContactPerson !== undefined) row.club_contact_person = player.clubContactPerson || null;

  if (player.commission !== undefined) {
    row.commission_percentage = player.commission.percentage ?? null;
    row.commission_amount = player.commission.amount ?? null;
    row.commission_currency = player.commission.currency || null;
    row.commission_owner = player.commission.owner || null;
    row.commission_split_with_agent = player.commission.splitWithAgent || null;
    row.commission_split_percentage = player.commission.splitPercentage ?? null;
    row.commission_payment_status = player.commission.paymentStatus;
    row.commission_due_date = player.commission.dueDate || null;
    row.commission_notes = player.commission.notes || null;
  }

  if (player.lastContact !== undefined) row.last_contact = player.lastContact || null;
  if (player.nextFollowUp !== undefined) row.next_follow_up = player.nextFollowUp || null;
  if (player.responsibleAgent !== undefined) row.responsible_agent = player.responsibleAgent;
  if (player.followUpDeadline !== undefined) row.follow_up_deadline = player.followUpDeadline || null;
  if (player.followUpStatus !== undefined) row.follow_up_status = player.followUpStatus;

  if (player.externalData !== undefined) row.external_data = player.externalData ?? null;

  if (player.dataSource !== undefined) row.data_source = player.dataSource;
  if (player.syncStatus !== undefined) row.sync_status = player.syncStatus;
  if (player.lastSyncedAt !== undefined) row.last_synced_at = player.lastSyncedAt || null;
  if (player.manualOverride !== undefined) row.manual_override = player.manualOverride;
  if (player.syncNotes !== undefined) row.sync_notes = player.syncNotes || null;

  return row;
}

export async function fetchPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from("players").select(PLAYER_SELECT).order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as PlayerRow[]).map(rowToPlayer);
}

export async function insertPlayer(player: Omit<Player, "id" | "createdAt" | "updatedAt">): Promise<Player> {
  const row = playerToRow(player);
  const { data, error } = await supabase.from("players").insert(row).select(PLAYER_SELECT).single();
  if (error) throw error;
  const created = rowToPlayer(data as unknown as PlayerRow);

  if (player.history.length > 0) {
    await replacePlayerNotes(created.id, player.history);
  }
  if (player.contractTimeline.length > 0) {
    await replaceContractTimeline(created.id, player.contractTimeline);
  }
  return fetchPlayerById(created.id);
}

export async function updatePlayerRow(id: string, updates: Partial<Player>): Promise<void> {
  const row = playerToRow(updates);
  if (Object.keys(row).length > 0) {
    const { error } = await supabase.from("players").update(row).eq("id", id);
    if (error) throw error;
  }
  if (updates.history !== undefined) {
    await replacePlayerNotes(id, updates.history);
  }
  if (updates.contractTimeline !== undefined) {
    await replaceContractTimeline(id, updates.contractTimeline);
  }
}

export async function deletePlayerRow(id: string): Promise<void> {
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) throw error;
}

async function fetchPlayerById(id: string): Promise<Player> {
  const { data, error } = await supabase.from("players").select(PLAYER_SELECT).eq("id", id).single();
  if (error) throw error;
  return rowToPlayer(data as unknown as PlayerRow);
}

/** Nahradí celou historii poznámek hráče — stejná sémantika jako dřívější `updatePlayer(id, { history: [...] })`. */
async function replacePlayerNotes(playerId: string, entries: PlayerNoteEntry[]): Promise<void> {
  await supabase.from("player_notes").delete().eq("player_id", playerId);
  if (entries.length === 0) return;
  const rows = entries.map((e) => ({ player_id: playerId, date: e.date, author: e.author, note: e.note }));
  const { error } = await supabase.from("player_notes").insert(rows);
  if (error) throw error;
}

/** Nahradí celou časovou osu smluv hráče — stejná sémantika jako u historie poznámek. */
async function replaceContractTimeline(playerId: string, entries: ContractTimelineEntry[]): Promise<void> {
  await supabase.from("contract_timeline_entries").delete().eq("player_id", playerId);
  if (entries.length === 0) return;
  const rows = entries.map((e) => ({
    player_id: playerId,
    club: e.club,
    league: e.league || null,
    country: e.country || null,
    season: e.season || null,
    start_date: e.startDate || null,
    end_date: e.endDate || null,
    salary: e.salary ?? null,
    currency: e.currency || null,
    bonuses: e.bonuses || null,
    housing: e.housing || null,
    car: e.car || null,
    arranged_by_agent: e.arrangedByAgent || null,
    club_contact: e.clubContact || null,
    deal_status: e.dealStatus || null,
    notes: e.notes || null,
  }));
  const { error } = await supabase.from("contract_timeline_entries").insert(rows);
  if (error) throw error;
}
