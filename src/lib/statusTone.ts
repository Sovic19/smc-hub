import { BadgeTone } from "@/components/ui/Badge";
import {
  AlertStatus,
  AlertType,
  CalendarEventType,
  CommissionPaymentStatus,
  ContactCategory,
  ContractSituation,
  ContractStatus,
  DealStatus,
  DealType,
  DocumentStatus,
  FollowUpStatus,
  OpportunityStatus,
  OpportunityType,
  PipelineStage,
  PlayerCategory,
  PlayerStatus,
  RelationshipStrength,
  SyncStatus,
  TaskPriority,
  TaskStatus,
} from "@/types";

export const PLAYER_STATUS_TONE: Record<PlayerStatus, BadgeTone> = {
  active: "green",
  prospect: "brand",
  free_agent: "amber",
  retired: "slate",
  inactive: "slate",
};

export const PIPELINE_STAGE_TONE: Record<PipelineStage, BadgeTone> = {
  prospect: "slate",
  junior_prospect: "purple",
  monitored: "brand",
  active_client: "green",
  negotiation: "purple",
  offer: "amber",
  signed: "green",
  free_player: "amber",
  former_client: "slate",
};

export const PLAYER_CATEGORY_TONE: Record<PlayerCategory, BadgeTone> = {
  professional: "green",
  junior: "purple",
  prospect: "brand",
  former_client: "slate",
  monitored: "amber",
};

export const CONTRACT_SITUATION_TONE: Record<ContractSituation, BadgeTone> = {
  under_pro_contract: "green",
  junior_no_pro_contract: "purple",
  amateur_agreement: "brand",
  academy_junior_team: "purple",
  tryout: "amber",
  free_player: "amber",
  unknown: "slate",
};

export const CONTRACT_STATUS_TONE: Record<ContractStatus, BadgeTone> = {
  signed: "green",
  negotiating: "purple",
  offer_received: "amber",
  rejected: "red",
  expired: "red",
  terminated: "red",
  no_contract: "slate",
};

export const FOLLOW_UP_STATUS_TONE: Record<FollowUpStatus, BadgeTone> = {
  on_track: "green",
  due_soon: "amber",
  overdue: "red",
  completed: "slate",
};

export const SYNC_STATUS_TONE: Record<SyncStatus, BadgeTone> = {
  not_synced: "slate",
  synced: "green",
  failed: "red",
  needs_review: "amber",
};

export const RELATIONSHIP_STRENGTH_TONE: Record<RelationshipStrength, BadgeTone> = {
  strong: "green",
  medium: "brand",
  weak: "amber",
  new: "purple",
  inactive: "slate",
};

export const TASK_PRIORITY_TONE: Record<TaskPriority, BadgeTone> = {
  low: "slate",
  medium: "brand",
  high: "amber",
  urgent: "red",
};

export const TASK_STATUS_TONE: Record<TaskStatus, BadgeTone> = {
  pending: "brand",
  in_progress: "purple",
  urgent: "red",
  completed: "green",
  postponed: "slate",
};

export const DEAL_STATUS_TONE: Record<DealStatus, BadgeTone> = {
  scouting: "slate",
  interest: "brand",
  offer: "amber",
  negotiation: "purple",
  signed: "green",
  rejected: "red",
  cancelled: "red",
  finished: "slate",
};

export const DEAL_TYPE_TONE: Record<DealType, BadgeTone> = {
  professional_contract: "green",
  junior_placement: "purple",
  tryout: "amber",
  school_university_placement: "brand",
  development_pathway: "slate",
};

export const DOCUMENT_STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  valid: "green",
  expiring_soon: "amber",
  expired: "red",
  missing: "red",
  pending_review: "purple",
};

export const COMMISSION_PAYMENT_STATUS_TONE: Record<CommissionPaymentStatus, BadgeTone> = {
  unpaid: "amber",
  partially_paid: "purple",
  paid: "green",
};

export const CONTACT_CATEGORY_TONE: Record<ContactCategory, BadgeTone> = {
  coach: "brand",
  gm: "purple",
  sporting_manager: "purple",
  agent: "green",
  scout: "amber",
  university: "slate",
  club_owner: "red",
  other: "slate",
};

export const CALENDAR_EVENT_TYPE_TONE: Record<CalendarEventType, BadgeTone> = {
  agency_agreement_expiry: "purple",
  club_contract_expiry: "amber",
  birthday: "green",
  follow_up: "brand",
  draft: "slate",
  transfer_window: "slate",
  task_deadline: "red",
  document_expiry: "amber",
  deal_deadline: "purple",
};

export const ALERT_TYPE_TONE: Record<AlertType, BadgeTone> = {
  player_played_game: "slate",
  player_scored: "green",
  player_multi_point_game: "green",
  player_poor_performance: "amber",
  player_no_current_club: "amber",
  club_contract_expiring: "red",
  agency_agreement_expiring: "amber",
  follow_up_due_today: "brand",
  overdue_task: "red",
  document_expiry: "amber",
  junior_draft_eligible_soon: "purple",
  deal_inactive: "slate",
  club_opportunity: "brand",
  contact_not_followed_up: "slate",
  missing_key_data: "amber",
};

export const ALERT_STATUS_TONE: Record<AlertStatus, BadgeTone> = {
  new: "brand",
  acknowledged: "purple",
  in_progress: "amber",
  resolved: "green",
  dismissed: "slate",
};

export const OPPORTUNITY_TYPE_TONE: Record<OpportunityType, BadgeTone> = {
  free_player_placement: "amber",
  contract_expiring_soon: "red",
  junior_development: "purple",
  university_placement: "brand",
  club_needing_player: "green",
  first_year_europe: "brand",
  deal_follow_up: "amber",
  underused_relationship: "slate",
  market_opening: "slate",
};

export const OPPORTUNITY_STATUS_TONE: Record<OpportunityStatus, BadgeTone> = {
  new: "brand",
  reviewing: "purple",
  contacted: "amber",
  converted: "green",
  dismissed: "slate",
};
