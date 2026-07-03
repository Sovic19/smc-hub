-- SMC Hub — úvodní schéma (hráči, kluby, kontakty, úkoly, uživatelé/role)
-- Zrcadlí TypeScript typy v src/types/index.ts. RLS (row-level security) a
-- propojení na auth.users přidáme v kroku 4 spolu s přihlašováním.

-- ---------------------------------------------------------------------------
-- Enum typy (1:1 podle union typů v src/types/index.ts)
-- ---------------------------------------------------------------------------

create type data_source as enum ('manual', 'eliteprospects', 'internal', 'referral', 'other');
create type sync_status as enum ('not_synced', 'synced', 'failed', 'needs_review');
create type relationship_strength as enum ('strong', 'medium', 'weak', 'new', 'inactive');
create type contact_category as enum ('coach', 'gm', 'sporting_manager', 'agent', 'scout', 'university', 'club_owner', 'other');

create type player_status as enum ('active', 'prospect', 'free_agent', 'retired', 'inactive');
create type player_category as enum ('professional', 'junior', 'prospect', 'former_client', 'monitored');
create type pipeline_stage as enum ('prospect', 'junior_prospect', 'monitored', 'active_client', 'negotiation', 'offer', 'signed', 'free_player', 'former_client');
create type contract_status as enum ('signed', 'negotiating', 'offer_received', 'rejected', 'expired', 'terminated', 'no_contract');
create type follow_up_status as enum ('on_track', 'due_soon', 'overdue', 'completed');
create type player_position as enum ('G', 'D', 'LW', 'RW', 'C', 'F');
create type marital_status as enum ('single', 'married', 'girlfriend', 'no_girlfriend', 'unknown');
create type player_visibility as enum ('entire_agency', 'assigned_agent_only', 'management_only', 'custom');
create type contract_situation as enum ('under_pro_contract', 'junior_no_pro_contract', 'amateur_agreement', 'academy_junior_team', 'tryout', 'free_player', 'unknown');
create type commission_payment_status as enum ('unpaid', 'partially_paid', 'paid');
create type deal_status as enum ('scouting', 'interest', 'offer', 'negotiation', 'signed', 'rejected', 'cancelled', 'finished');

create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type task_status as enum ('pending', 'in_progress', 'urgent', 'completed', 'postponed');

create type user_role as enum ('owner', 'director', 'senior_agent', 'agent', 'scout', 'assistant', 'guest');

-- ---------------------------------------------------------------------------
-- profiles — rozšíření Supabase Auth uživatele o roli (nahrazuje MockUser)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null,
  role user_role not null default 'guest',
  agent_name text, -- jméno použité v players.responsible_agent / tasks.responsible_agent
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Uživatelé aplikace a jejich role — nahrazuje mockovaný MockUser.';

-- ---------------------------------------------------------------------------
-- clubs
-- ---------------------------------------------------------------------------

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  league text not null,
  manager text,
  head_coach text,
  sporting_manager text,
  gm text,
  scout_contact text,
  phone text,
  email text,
  whatsapp text,
  relationship_strength relationship_strength not null default 'new',
  notes text,
  eliteprospects_url text,
  data_source data_source not null default 'manual',
  sync_status sync_status not null default 'not_synced',
  last_synced_at timestamptz,
  manual_override boolean not null default false,
  sync_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.clubs is 'Kluby, se kterými agentura jedná.';

-- ---------------------------------------------------------------------------
-- contacts
-- ---------------------------------------------------------------------------

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  category contact_category not null default 'other',
  role text,
  organization text,
  linked_club_id uuid references public.clubs (id) on delete set null,
  country text,
  league text,
  phone text,
  email text,
  whatsapp text,
  relationship_strength relationship_strength not null default 'new',
  last_contact date,
  next_follow_up date,
  notes text,
  data_source data_source not null default 'manual',
  sync_status sync_status not null default 'not_synced',
  last_synced_at timestamptz,
  manual_override boolean not null default false,
  sync_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.contacts is 'Lidé mimo hráče — trenéři, GM, skauti, univerzity...';

-- ---------------------------------------------------------------------------
-- players — hlavní tabulka
-- ---------------------------------------------------------------------------

create table public.players (
  id uuid primary key default gen_random_uuid(),

  -- PROFIL
  first_name text not null,
  last_name text not null,
  position player_position not null,
  date_of_birth date,
  country text not null,
  shoots text,
  height_cm int,
  weight_kg int,
  current_club text not null default '',
  current_league text not null default '',
  season text not null default '',
  countries_of_interest text[] not null default '{}',
  status player_status not null default 'prospect',
  category player_category not null default 'professional',
  pipeline_stage pipeline_stage not null default 'prospect',
  eliteprospects_url text,
  video_urls text[] not null default '{}',
  phone text,
  email text,
  whatsapp text,
  marital_status marital_status not null default 'unknown',
  family_notes text,
  photo_url text,
  visibility player_visibility not null default 'entire_agency',

  -- JUNIOR / VÝVOJ (u profesionálů zůstává NULL — to je normální stav, ne chyba)
  contract_situation contract_situation not null default 'unknown',
  junior_team text,
  youth_league text,
  draft_eligibility_year int,
  guardian_name text,
  guardian_relationship text,
  guardian_phone text,
  guardian_email text,
  school_interest text,
  development_notes text,

  -- ZASTUPOVÁNÍ
  representing_agent text not null,
  contract_negotiated_by text not null,
  negotiations_lead_by text,
  agency_agreement_start_date date,
  agency_agreement_end_date date,
  cooperation_notes text not null default '',

  -- SMLOUVA A PROVIZE (CommissionInfo rozepsané do sloupců)
  current_contract_amount numeric,
  salary numeric,
  currency text,
  bonuses text,
  housing text,
  car text,
  contract_length text,
  club_contract_start_date date,
  club_contract_end_date date,
  contract_status contract_status not null default 'no_contract',
  club_contact_person text,
  commission_percentage numeric,
  commission_amount numeric,
  commission_currency text,
  commission_owner text,
  commission_split_with_agent text,
  commission_split_percentage numeric,
  commission_payment_status commission_payment_status not null default 'unpaid',
  commission_due_date date,
  commission_notes text,

  -- FOLLOW-UP
  last_contact date,
  next_follow_up date,
  responsible_agent text not null,
  follow_up_deadline date,
  follow_up_status follow_up_status not null default 'on_track',

  -- EXTERNÍ DATA (mock EliteProspects import) — celý blok jako jsonb,
  -- protože je to jen snapshot cizích dat, ne relační struktura agentury
  external_data jsonb,

  -- SYNC METADATA
  data_source data_source not null default 'manual',
  sync_status sync_status not null default 'not_synced',
  last_synced_at timestamptz,
  manual_override boolean not null default false,
  sync_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.players is 'Hráči zastupovaní agenturou — hlavní tabulka.';

-- Historie poznámek u hráče (záložka "History")
create table public.player_notes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  date date not null default current_date,
  author text not null,
  note text not null,
  created_at timestamptz not null default now()
);

comment on table public.player_notes is 'Poznámky k hráči v čase (dřív Player.history[]).';

-- Historie klubů a smluv u hráče (záložka "Contract" → časová osa)
create table public.contract_timeline_entries (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  club text not null,
  league text,
  country text,
  season text,
  start_date date,
  end_date date,
  salary numeric,
  currency text,
  bonuses text,
  housing text,
  car text,
  arranged_by_agent text,
  club_contact text,
  deal_status deal_status,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.contract_timeline_entries is 'Historie klubů/smluv hráče v čase (dřív Player.contractTimeline[]).';

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  player_id uuid references public.players (id) on delete cascade,
  club_id uuid references public.clubs (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete cascade,
  responsible_agent text not null,
  priority task_priority not null default 'medium',
  status task_status not null default 'pending',
  due_date date,
  is_recurring boolean not null default false,
  recurrence_note text,
  reminder_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.tasks is 'Úkoly agentů, volitelně navázané na hráče/klub/kontakt.';

-- ---------------------------------------------------------------------------
-- Indexy na cizí klíče a časté filtry
-- ---------------------------------------------------------------------------

create index players_representing_agent_idx on public.players (representing_agent);
create index players_status_idx on public.players (status);
create index contacts_linked_club_id_idx on public.contacts (linked_club_id);
create index tasks_player_id_idx on public.tasks (player_id);
create index tasks_club_id_idx on public.tasks (club_id);
create index tasks_contact_id_idx on public.tasks (contact_id);
create index tasks_status_idx on public.tasks (status);
create index player_notes_player_id_idx on public.player_notes (player_id);
create index contract_timeline_entries_player_id_idx on public.contract_timeline_entries (player_id);
