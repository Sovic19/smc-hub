import {
  AlertStatus,
  AlertType,
  AuditAction,
  CalendarEventType,
  CommissionPaymentStatus,
  CommunicationType,
  ContactCategory,
  ContractSituation,
  ContractStatus,
  DataSource,
  DealStatus,
  DealType,
  DocumentCategory,
  DocumentStatus,
  FollowUpStatus,
  MaritalStatus,
  OpportunityStatus,
  OpportunityType,
  PipelineStage,
  PlayerCategory,
  PlayerStatus,
  PlayerVisibility,
  RelationshipStrength,
  SyncStatus,
  TaskPriority,
  TaskStatus,
} from "@/types";

// Hand-rolled date formatting — deliberately avoids toLocaleDateString /
// toLocaleString / Intl.DateTimeFormat. Those delegate to the runtime's ICU
// data, which is not guaranteed to match between the Node server and the
// browser (e.g. Node may render "Sep" while a browser renders "Sept" for the
// en-GB short month), causing React hydration mismatches. Parsing the ISO
// string's numeric components directly and mapping them through a fixed
// lookup table guarantees byte-identical output on server and client,
// regardless of runtime, ICU version, or timezone.
const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const MONTH_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

interface IsoDateParts {
  year: number;
  month: number; // 0-indexed
  day: number;
  hours: number;
  minutes: number;
}

/** Parses the numeric components straight out of an ISO date/date-time
 * string, sidestepping both locale formatting and Date's timezone-dependent
 * getters (which can shift a date-only string by a day depending on the
 * runtime's local timezone). */
function parseIsoDateParts(iso: string): IsoDateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(iso);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
    hours: match[4] !== undefined ? Number(match[4]) : 0,
    minutes: match[5] !== undefined ? Number(match[5]) : 0,
  };
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const parts = parseIsoDateParts(iso);
  if (!parts) return "—";
  return `${pad2(parts.day)} ${MONTH_SHORT[parts.month]} ${parts.year}`;
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  const parts = parseIsoDateParts(iso);
  if (!parts) return "—";
  return `${pad2(parts.day)} ${MONTH_SHORT[parts.month]} ${parts.year}, ${pad2(parts.hours)}:${pad2(parts.minutes)}`;
}

/** Deterministic "Month YYYY" label for a Date, e.g. calendar headers. */
export function formatMonthYearLabel(date: Date): string {
  return `${MONTH_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatCurrency(amount?: number, currency = "EUR"): string {
  if (amount === undefined || amount === null) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function relativeDayLabel(iso?: string): string {
  const diff = daysUntil(iso);
  if (diff === null) return "—";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 0) return `In ${diff} days`;
  return `${Math.abs(diff)} days ago`;
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.round(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${Math.round(diffMonth / 12)}y ago`;
}

export function formatHeight(cm?: number): string {
  if (!cm) return "—";
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${cm} cm (${feet}'${inches}")`;
}

export function formatWeight(kg?: number): string {
  if (!kg) return "—";
  const lbs = Math.round(kg * 2.20462);
  return `${kg} kg (${lbs} lbs)`;
}

export function calculateAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

// ---------------------------------------------------------------------------
// Label maps
// ---------------------------------------------------------------------------

export const PLAYER_STATUS_LABEL: Record<PlayerStatus, string> = {
  active: "Active",
  prospect: "Prospect",
  free_agent: "Free Agent",
  retired: "Retired",
  inactive: "Inactive",
};

export const PIPELINE_STAGE_LABEL: Record<PipelineStage, string> = {
  prospect: "Prospect",
  junior_prospect: "Junior Prospect",
  monitored: "Monitored",
  active_client: "Active Client",
  negotiation: "Negotiation",
  offer: "Offer",
  signed: "Signed",
  free_player: "Free Player",
  former_client: "Former Client",
};

export const PLAYER_CATEGORY_LABEL: Record<PlayerCategory, string> = {
  professional: "Professional Player",
  junior: "Junior Player",
  prospect: "Prospect",
  former_client: "Former Client",
  monitored: "Monitored Player",
};

export const CONTRACT_SITUATION_LABEL: Record<ContractSituation, string> = {
  under_pro_contract: "Under Professional Contract",
  junior_no_pro_contract: "Junior, No Professional Contract Yet",
  amateur_agreement: "Amateur Agreement",
  academy_junior_team: "Academy / Junior Team",
  tryout: "Tryout",
  free_player: "Free Player",
  unknown: "Unknown",
};

export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  signed: "Signed",
  negotiating: "Negotiating",
  offer_received: "Offer Received",
  rejected: "Rejected",
  expired: "Expired",
  terminated: "Terminated",
  no_contract: "No Contract",
};

export const FOLLOW_UP_STATUS_LABEL: Record<FollowUpStatus, string> = {
  on_track: "On Track",
  due_soon: "Due Soon",
  overdue: "Overdue",
  completed: "Completed",
};

export const SYNC_STATUS_LABEL: Record<SyncStatus, string> = {
  not_synced: "Not Synced",
  synced: "Synced",
  failed: "Failed",
  needs_review: "Needs Review",
};

export const DATA_SOURCE_LABEL: Record<DataSource, string> = {
  manual: "Manual",
  eliteprospects: "EliteProspects (mock)",
  internal: "Internal",
  referral: "Referral",
  other: "Other",
};

export const RELATIONSHIP_STRENGTH_LABEL: Record<RelationshipStrength, string> = {
  strong: "Strong",
  medium: "Medium",
  weak: "Weak",
  new: "New",
  inactive: "Inactive",
};

export const MARITAL_STATUS_LABEL: Record<MaritalStatus, string> = {
  single: "Single",
  married: "Married",
  girlfriend: "In a relationship",
  no_girlfriend: "Not in a relationship",
  unknown: "Unknown",
};

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  urgent: "Urgent",
  completed: "Completed",
  postponed: "Postponed",
};

export const DEAL_STATUS_LABEL: Record<DealStatus, string> = {
  scouting: "Scouting",
  interest: "Interest",
  offer: "Offer",
  negotiation: "Negotiation",
  signed: "Signed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  finished: "Finished",
};

export const DEAL_TYPE_LABEL: Record<DealType, string> = {
  professional_contract: "Professional Contract",
  junior_placement: "Junior Placement",
  tryout: "Tryout",
  school_university_placement: "School / University Placement",
  development_pathway: "Development Pathway",
};

export const CONTACT_CATEGORY_LABEL: Record<ContactCategory, string> = {
  coach: "Coach",
  gm: "General Manager",
  sporting_manager: "Sporting Manager",
  agent: "Agent",
  scout: "Scout",
  university: "University",
  club_owner: "Club Owner",
  other: "Other",
};

export const DOCUMENT_CATEGORY_LABEL: Record<DocumentCategory, string> = {
  agency_agreement: "Agency Agreement",
  club_contract: "Club Contract",
  passport: "Passport",
  id_card: "ID Card",
  visa: "Visa Documents",
  insurance: "Insurance",
  medical: "Medical Documents",
  video: "Video",
  eliteprospects_link: "EliteProspects Link",
  invoice: "Invoice",
  commission_document: "Commission Document",
  parental_consent: "Parental Consent",
  school_documents: "School Documents",
  guardian_contact: "Guardian Contact",
  development_agreement: "Development Agreement",
  junior_registration: "Junior Registration",
  other: "Other",
};

export const DOCUMENT_STATUS_LABEL: Record<DocumentStatus, string> = {
  valid: "Valid",
  expiring_soon: "Expiring Soon",
  expired: "Expired",
  missing: "Missing",
  pending_review: "Pending Review",
};

export const COMMUNICATION_TYPE_LABEL: Record<CommunicationType, string> = {
  phone: "Phone Call",
  whatsapp: "WhatsApp",
  email: "Email",
  meeting: "Meeting",
  video_call: "Video Call",
  note: "Note",
};

export const COMMISSION_PAYMENT_STATUS_LABEL: Record<CommissionPaymentStatus, string> = {
  unpaid: "Unpaid",
  partially_paid: "Partially Paid",
  paid: "Paid",
};

export const CALENDAR_EVENT_TYPE_LABEL: Record<CalendarEventType, string> = {
  agency_agreement_expiry: "Agency Agreement Expiry",
  club_contract_expiry: "Club Contract Expiry",
  birthday: "Birthday",
  follow_up: "Follow-up",
  draft: "Draft",
  transfer_window: "Transfer Window",
  task_deadline: "Task Deadline",
  document_expiry: "Document Expiry",
  deal_deadline: "Deal Deadline",
};

export const ALERT_TYPE_LABEL: Record<AlertType, string> = {
  player_played_game: "Player Played a Game",
  player_scored: "Player Scored",
  player_multi_point_game: "Multi-Point Game",
  player_poor_performance: "Poor Performance",
  player_no_current_club: "No Current Club",
  club_contract_expiring: "Club Contract Expiring",
  agency_agreement_expiring: "Agency Agreement Expiring",
  follow_up_due_today: "Follow-up Due Today",
  overdue_task: "Overdue Task",
  document_expiry: "Document Expiry",
  junior_draft_eligible_soon: "Junior Draft Eligible Soon",
  deal_inactive: "Deal Inactive",
  club_opportunity: "Club Opportunity",
  contact_not_followed_up: "Contact Not Followed Up",
  missing_key_data: "Missing Key Data",
};

export const ALERT_STATUS_LABEL: Record<AlertStatus, string> = {
  new: "New",
  acknowledged: "Acknowledged",
  in_progress: "In Progress",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export const OPPORTUNITY_TYPE_LABEL: Record<OpportunityType, string> = {
  free_player_placement: "Free Player Placement",
  contract_expiring_soon: "Contract Expiring Soon",
  junior_development: "Junior Development",
  university_placement: "University Placement",
  club_needing_player: "Club Needing a Player",
  first_year_europe: "First Year in Europe",
  deal_follow_up: "Deal Follow-up",
  underused_relationship: "Underused Relationship",
  market_opening: "Market Opening",
};

export const OPPORTUNITY_STATUS_LABEL: Record<OpportunityStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  contacted: "Contacted",
  converted: "Converted",
  dismissed: "Dismissed",
};

export const PLAYER_VISIBILITY_LABEL: Record<PlayerVisibility, string> = {
  entire_agency: "Entire Agency",
  assigned_agent_only: "Assigned Agent Only",
  management_only: "Management Only",
  custom: "Custom Access",
};

export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  financial_edit: "Financial Edit",
  contract_edit: "Contract Edit",
  role_change: "Role Change",
  record_deleted: "Record Deleted",
  document_exported: "Document Exported",
  permission_change: "Permission Change",
};
