// Core domain types for SMC Hub — internal operating system for SMC Hockey Agency

export const AGENTS = [
  "Marko Simić",
  "Ana Kovač",
  "David Novak",
  "Elena Petrova",
  "James Whitfield",
] as const;

export type AgentName = (typeof AGENTS)[number];

export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
}

// ---------------------------------------------------------------------------
// Shared / cross-cutting types
// ---------------------------------------------------------------------------

/** Where a record's data originated. Used across Players, Clubs, Contacts. */
export type DataSource = "manual" | "eliteprospects" | "internal" | "referral" | "other";

/** Pilot-mode sync status for the mock EliteProspects integration. */
export type SyncStatus = "not_synced" | "synced" | "failed" | "needs_review";

/** Reusable "sync metadata" fields shared by Player, Club, Contact. */
export interface SyncMeta {
  dataSource: DataSource;
  syncStatus: SyncStatus;
  lastSyncedAt?: string; // ISO date-time
  manualOverride: boolean;
  syncNotes?: string;
}

export type RelationshipStrength = "strong" | "medium" | "weak" | "new" | "inactive";

/** Mock player-level visibility setting, enforced by the pilot RBAC system. */
export type PlayerVisibility =
  | "entire_agency"
  | "assigned_agent_only"
  | "management_only"
  | "custom";

export type CommissionPaymentStatus = "unpaid" | "partially_paid" | "paid";

export interface CommissionInfo {
  percentage?: number;
  amount?: number;
  currency?: string;
  owner?: string; // responsible agent for the commission
  splitWithAgent?: string;
  splitPercentage?: number; // % of the commission going to splitWithAgent
  paymentStatus: CommissionPaymentStatus;
  dueDate?: string; // ISO date
  notes?: string;
}

export type CommunicationType = "phone" | "whatsapp" | "email" | "meeting" | "video_call" | "note";
export type LinkedEntityType = "player" | "club" | "contact" | "deal";

export interface CommunicationEntry {
  id: string;
  type: CommunicationType;
  date: string; // ISO date
  person: string;
  linkedEntityType: LinkedEntityType;
  linkedEntityId: string;
  linkedEntityLabel: string;
  responsibleAgent: string;
  summary: string;
  nextFollowUp?: string; // ISO date
  notes?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Players
// ---------------------------------------------------------------------------

export type PlayerStatus = "active" | "prospect" | "free_agent" | "retired" | "inactive";

/** High-level classification of the player's relationship to the agency. */
export type PlayerCategory =
  | "professional"
  | "junior"
  | "prospect"
  | "former_client"
  | "monitored";

/**
 * Where the player currently stands contractually. Junior players will
 * commonly have "junior_no_pro_contract" or "academy_junior_team" here —
 * that is an expected, valid state, not missing data.
 */
export type ContractSituation =
  | "under_pro_contract"
  | "junior_no_pro_contract"
  | "amateur_agreement"
  | "academy_junior_team"
  | "tryout"
  | "free_player"
  | "unknown";

export interface GuardianContact {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
}

export type PipelineStage =
  | "prospect"
  | "junior_prospect"
  | "monitored"
  | "active_client"
  | "negotiation"
  | "offer"
  | "signed"
  | "free_player"
  | "former_client";

export type ContractStatus =
  | "signed"
  | "negotiating"
  | "offer_received"
  | "rejected"
  | "expired"
  | "terminated"
  | "no_contract";

export type FollowUpStatus = "on_track" | "due_soon" | "overdue" | "completed";

export type Position = "G" | "D" | "LW" | "RW" | "C" | "F";

export type MaritalStatus = "single" | "married" | "girlfriend" | "no_girlfriend" | "unknown";

export interface SeasonStat {
  season: string;
  team: string;
  league: string;
  gp: number;
  g: number;
  a: number;
  pts: number;
  pim: number;
}

/** Data as imported from the (mock) EliteProspects pilot integration. */
export interface ExternalData {
  eliteProspectsUrl?: string;
  dateOfBirth?: string; // ISO date
  age?: number;
  nationality?: string;
  position?: string;
  shoots?: string;
  heightCm?: number;
  weightKg?: number;
  currentClub?: string;
  currentLeague?: string;
  seasonStats: SeasonStat[];
  notes?: string;
}

export interface SyncLogEntry {
  id: string;
  entityType: "player" | "club" | "contact";
  entityId: string;
  entityLabel: string;
  status: SyncStatus;
  message: string;
  timestamp: string; // ISO date-time
}

export interface PlayerNoteEntry {
  id: string;
  date: string; // ISO date
  author: string;
  note: string;
}

export interface ContractTimelineEntry {
  id: string;
  club: string;
  league: string;
  country: string;
  season: string;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  salary?: number;
  currency?: string;
  bonuses?: string;
  housing?: string;
  car?: string;
  arrangedByAgent?: string;
  clubContact?: string;
  dealStatus?: DealStatus;
  notes?: string;
}

export interface Player extends SyncMeta {
  id: string;

  // PROFILE
  firstName: string;
  lastName: string;
  position: Position;
  dateOfBirth?: string; // ISO date
  country: string; // nationality
  shoots?: string; // "L" | "R" — agency's own record (may differ from imported data)
  heightCm?: number;
  weightKg?: number;
  currentClub: string;
  currentLeague: string;
  season: string;
  countriesOfInterest: string[];
  status: PlayerStatus;
  category: PlayerCategory;
  pipelineStage: PipelineStage;
  eliteProspectsUrl?: string;
  videoUrls: string[];
  phone?: string;
  email?: string;
  whatsapp?: string;
  maritalStatus: MaritalStatus;
  familyNotes?: string;
  photoUrl?: string;
  visibility: PlayerVisibility;

  // JUNIOR / DEVELOPMENT
  // Left empty (undefined) for players who don't need them — this is a
  // normal, valid state for juniors and never treated as an error in the UI.
  contractSituation: ContractSituation;
  juniorTeam?: string;
  youthLeague?: string;
  draftEligibilityYear?: number;
  guardianContact?: GuardianContact;
  schoolInterest?: string;
  developmentNotes?: string;

  // REPRESENTATION
  representingAgent: string;
  contractNegotiatedBy: string; // agent who arranged the current club contract
  negotiationsLeadBy?: string; // person who led the negotiations
  agencyAgreementStartDate?: string; // ISO date
  agencyAgreementEndDate?: string; // ISO date
  cooperationNotes: string;

  // CONTRACT
  currentContractAmount?: number;
  salary?: number;
  currency?: string;
  bonuses?: string;
  housing?: string;
  car?: string;
  contractLength?: string;
  clubContractStartDate?: string; // ISO date
  clubContractEndDate?: string; // ISO date
  contractStatus: ContractStatus;
  clubContactPerson?: string;
  commission: CommissionInfo;
  contractTimeline: ContractTimelineEntry[];

  // FOLLOW UP (surfaced in the Communication tab)
  lastContact?: string; // ISO date
  nextFollowUp?: string; // ISO date
  responsibleAgent: string;
  followUpDeadline?: string; // ISO date
  followUpStatus: FollowUpStatus;

  // HISTORY
  history: PlayerNoteEntry[];

  // EXTERNAL DATA (EliteProspects pilot import)
  externalData?: ExternalData;

  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Clubs
// ---------------------------------------------------------------------------

export interface Club extends SyncMeta {
  id: string;
  name: string;
  country: string;
  league: string;
  manager?: string;
  headCoach?: string;
  sportingManager?: string;
  gm?: string;
  scoutContact?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  relationshipStrength: RelationshipStrength;
  notes?: string;
  eliteProspectsUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------

export type ContactCategory =
  | "coach"
  | "gm"
  | "sporting_manager"
  | "agent"
  | "scout"
  | "university"
  | "club_owner"
  | "other";

export interface Contact extends SyncMeta {
  id: string;
  firstName: string;
  lastName: string;
  category: ContactCategory;
  role?: string;
  organization?: string;
  linkedClubId?: string;
  country?: string;
  league?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  relationshipStrength: RelationshipStrength;
  lastContact?: string; // ISO date
  nextFollowUp?: string; // ISO date
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in_progress" | "urgent" | "completed" | "postponed";

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  playerId?: string;
  clubId?: string;
  contactId?: string;
  responsibleAgent: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string; // ISO date
  isRecurring: boolean;
  recurrenceNote?: string;
  reminderEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Deals
// ---------------------------------------------------------------------------

export type DealStatus =
  | "scouting"
  | "interest"
  | "offer"
  | "negotiation"
  | "signed"
  | "rejected"
  | "cancelled"
  | "finished";

export type DealType =
  | "professional_contract"
  | "junior_placement"
  | "tryout"
  | "school_university_placement"
  | "development_pathway";

export interface DealTimelineEntry {
  id: string;
  date: string; // ISO date
  status: DealStatus;
  note: string;
  agent: string;
}

export interface Deal {
  id: string;
  playerId: string;
  clubId?: string;
  clubName: string;
  league: string;
  country: string;
  responsibleAgent: string;
  negotiatingAgent?: string;
  clubContact?: string;
  status: DealStatus;
  dealType: DealType;
  expectedSalary?: number;
  finalSalary?: number;
  currency?: string;
  bonuses?: string;
  housing?: string;
  car?: string;
  commission: CommissionInfo;
  contractStartDate?: string; // ISO date
  contractEndDate?: string; // ISO date
  relationshipStrength?: RelationshipStrength;
  timeline: DealTimelineEntry[];
  notes?: string;
  nextAction?: string;
  deadline?: string; // ISO date
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Documents (central store)
// ---------------------------------------------------------------------------

export type DocumentCategory =
  | "agency_agreement"
  | "club_contract"
  | "passport"
  | "id_card"
  | "visa"
  | "insurance"
  | "medical"
  | "video"
  | "eliteprospects_link"
  | "invoice"
  | "commission_document"
  | "parental_consent"
  | "school_documents"
  | "guardian_contact"
  | "development_agreement"
  | "junior_registration"
  | "other";

export type DocumentStatus = "valid" | "expiring_soon" | "expired" | "missing" | "pending_review";

export interface AgencyDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  linkedPlayerId?: string;
  linkedClubId?: string;
  linkedDealId?: string;
  expiryDate?: string; // ISO date
  status: DocumentStatus;
  notes?: string;
  fileUrl?: string; // placeholder only — no real file storage
  sizeLabel?: string;
  uploadedAt: string; // ISO date
}

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------

export type ActivityType =
  | "player_added"
  | "player_updated"
  | "contract_updated"
  | "task_completed"
  | "note_added"
  | "club_added"
  | "contact_added"
  | "deal_updated"
  | "document_added"
  | "communication_logged";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  message: string;
  entityId?: string;
  entityLabel?: string;
  agent: string;
  timestamp: string; // ISO date
}

// ---------------------------------------------------------------------------
// Calendar (events are derived, not stored)
// ---------------------------------------------------------------------------

export type CalendarEventType =
  | "agency_agreement_expiry"
  | "club_contract_expiry"
  | "birthday"
  | "follow_up"
  | "draft"
  | "transfer_window"
  | "task_deadline"
  | "document_expiry"
  | "deal_deadline";

// ---------------------------------------------------------------------------
// Game Tracker
// ---------------------------------------------------------------------------

export type HomeAway = "home" | "away";

export interface GoalieGameStats {
  saves: number;
  goalsAgainst: number;
  savePercentage: number; // e.g. 92.4
  shutout: boolean;
}

export interface GameRecord {
  id: string;
  playerId: string;
  team: string;
  opponent: string;
  date: string; // ISO date
  competition: string;
  country: string;
  result: string; // e.g. "W 4-2"
  homeAway: HomeAway;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  penaltyMinutes: number;
  shots: number;
  timeOnIce: string; // "18:24"
  powerplayPoints: number;
  shorthandedPoints: number;
  faceoffPercentage?: number;
  goalieStats?: GoalieGameStats;
  gameReportUrl?: string;
  videoUrl?: string;
  dataSource: DataSource;
  syncStatus: SyncStatus;
  lastSyncedAt?: string; // ISO date-time
  syncNotes?: string;
  aiSummary?: string; // AI performance summary placeholder
  scoutNote?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Alerts & Intelligence
// ---------------------------------------------------------------------------

export type AlertType =
  | "player_played_game"
  | "player_scored"
  | "player_multi_point_game"
  | "player_poor_performance"
  | "player_no_current_club"
  | "club_contract_expiring"
  | "agency_agreement_expiring"
  | "follow_up_due_today"
  | "overdue_task"
  | "document_expiry"
  | "junior_draft_eligible_soon"
  | "deal_inactive"
  | "club_opportunity"
  | "contact_not_followed_up"
  | "missing_key_data";

export type AlertPriority = "low" | "medium" | "high" | "urgent";
export type AlertStatus = "new" | "acknowledged" | "in_progress" | "resolved" | "dismissed";

export interface AlertItem {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  description: string;
  linkedPlayerId?: string;
  linkedClubId?: string;
  linkedContactId?: string;
  linkedDealId?: string;
  linkedGameId?: string;
  responsibleAgent: string;
  createdDate: string; // ISO date
  dueDate?: string; // ISO date
  status: AlertStatus;
  recommendedAction?: string;
  aiSuggestedNextStep?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// SMC AI Assistant (mock)
// ---------------------------------------------------------------------------

export type AiMessageRole = "user" | "assistant";

export interface AiMessage {
  id: string;
  role: AiMessageRole;
  content: string;
  timestamp: string; // ISO date-time
}

export interface AiConversation {
  id: string;
  title: string;
  linkedEntityType?: LinkedEntityType;
  linkedEntityId?: string;
  linkedEntityLabel?: string;
  messages: AiMessage[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Opportunity Finder
// ---------------------------------------------------------------------------

export type OpportunityType =
  | "free_player_placement"
  | "contract_expiring_soon"
  | "junior_development"
  | "university_placement"
  | "club_needing_player"
  | "first_year_europe"
  | "deal_follow_up"
  | "underused_relationship"
  | "market_opening";

export type OpportunityUrgency = "low" | "medium" | "high" | "urgent";
export type OpportunityStatus = "new" | "reviewing" | "contacted" | "converted" | "dismissed";

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  linkedPlayerId?: string;
  linkedClubId?: string;
  linkedContactId?: string;
  linkedDealId?: string;
  league?: string;
  country?: string;
  estimatedValue?: number;
  currency?: string;
  urgency: OpportunityUrgency;
  responsibleAgent: string;
  recommendedAction: string;
  status: OpportunityStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Role-based access (mock — no real authentication yet)
// ---------------------------------------------------------------------------

export type UserRole =
  | "owner"
  | "director"
  | "senior_agent"
  | "agent"
  | "scout"
  | "assistant"
  | "guest";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** For agent-tier roles, links to the AGENTS roster for "assigned players" checks. */
  agentName?: string;
  active: boolean;
}

export type PlayerEditScope = "all" | "assigned" | "none";

export interface RolePermissions {
  role: UserRole;
  label: string;
  description: string;
  canViewAllFinancials: boolean;
  canViewAssignedFinancialsOnly: boolean;
  canEditPlayers: PlayerEditScope;
  canCreateDeals: boolean;
  canApproveDeals: boolean;
  canEditGlobalSettings: boolean;
  canManageUsers: boolean;
  canDeleteRecords: boolean;
  canAccessScoutingNotes: boolean;
  readOnly: boolean;
  moduleAccess: string[];
}

export type AuditAction =
  | "financial_edit"
  | "contract_edit"
  | "role_change"
  | "record_deleted"
  | "document_exported"
  | "permission_change";

export interface AuditLogEntry {
  id: string;
  user: string;
  role: UserRole;
  timestamp: string; // ISO date-time
  action: AuditAction;
  entityType: string;
  entityName: string;
  previousValue?: string;
  newValue?: string;
}
