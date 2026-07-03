import { MockUser, Player, RolePermissions, UserRole } from "@/types";

export const MODULE_KEYS = {
  dashboard: "dashboard",
  players: "players",
  clubs: "clubs",
  contacts: "contacts",
  pipeline: "pipeline",
  deals: "deals",
  tasks: "tasks",
  calendar: "calendar",
  documents: "documents",
  communication: "communication",
  agents: "agents",
  gametracker: "gametracker",
  alerts: "alerts",
  aiassistant: "aiassistant",
  opportunities: "opportunities",
  settings: "settings",
} as const;

export type ModuleKey = (typeof MODULE_KEYS)[keyof typeof MODULE_KEYS];

const ALL_MODULES: string[] = Object.values(MODULE_KEYS);
// Deals and Agent Statistics are the two modules that are inherently about
// money (deal terms, commission performance) — hidden from purely
// non-financial roles at the navigation level. Everything else uses
// field-level financial gating instead of hiding the whole module.
const NON_FINANCIAL_MODULES: string[] = ALL_MODULES.filter(
  (m) => m !== MODULE_KEYS.deals && m !== MODULE_KEYS.agents
);

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  owner: {
    role: "owner",
    label: "Owner",
    description: "Full access to every module, all financial data, and workspace administration.",
    canViewAllFinancials: true,
    canViewAssignedFinancialsOnly: false,
    canEditPlayers: "all",
    canCreateDeals: true,
    canApproveDeals: true,
    canEditGlobalSettings: true,
    canManageUsers: true,
    canDeleteRecords: true,
    canAccessScoutingNotes: true,
    readOnly: false,
    moduleAccess: ALL_MODULES,
  },
  director: {
    role: "director",
    label: "Director",
    description: "Full operational access; can view all financials and approve deals.",
    canViewAllFinancials: true,
    canViewAssignedFinancialsOnly: false,
    canEditPlayers: "all",
    canCreateDeals: true,
    canApproveDeals: true,
    canEditGlobalSettings: true,
    canManageUsers: false,
    canDeleteRecords: true,
    canAccessScoutingNotes: true,
    readOnly: false,
    moduleAccess: ALL_MODULES,
  },
  senior_agent: {
    role: "senior_agent",
    label: "Senior Agent",
    description: "Full access to assigned players; can create deals and contracts. Financials limited to their own roster.",
    canViewAllFinancials: false,
    canViewAssignedFinancialsOnly: true,
    canEditPlayers: "assigned",
    canCreateDeals: true,
    canApproveDeals: false,
    canEditGlobalSettings: false,
    canManageUsers: false,
    canDeleteRecords: false,
    canAccessScoutingNotes: true,
    readOnly: false,
    moduleAccess: ALL_MODULES,
  },
  agent: {
    role: "agent",
    label: "Agent",
    description: "Edits assigned players only. Cannot see commissions belonging to other agents.",
    canViewAllFinancials: false,
    canViewAssignedFinancialsOnly: true,
    canEditPlayers: "assigned",
    canCreateDeals: false,
    canApproveDeals: false,
    canEditGlobalSettings: false,
    canManageUsers: false,
    canDeleteRecords: false,
    canAccessScoutingNotes: true,
    readOnly: false,
    moduleAccess: ALL_MODULES,
  },
  scout: {
    role: "scout",
    label: "Scout",
    description: "Read-only player database access. Can add scouting notes. No financial access.",
    canViewAllFinancials: false,
    canViewAssignedFinancialsOnly: false,
    canEditPlayers: "none",
    canCreateDeals: false,
    canApproveDeals: false,
    canEditGlobalSettings: false,
    canManageUsers: false,
    canDeleteRecords: false,
    canAccessScoutingNotes: true,
    readOnly: true,
    moduleAccess: NON_FINANCIAL_MODULES,
  },
  assistant: {
    role: "assistant",
    label: "Assistant",
    description: "Updates contacts, tasks, documents, and communication. No financial access.",
    canViewAllFinancials: false,
    canViewAssignedFinancialsOnly: false,
    canEditPlayers: "none",
    canCreateDeals: false,
    canApproveDeals: false,
    canEditGlobalSettings: false,
    canManageUsers: false,
    canDeleteRecords: false,
    canAccessScoutingNotes: false,
    readOnly: false,
    moduleAccess: NON_FINANCIAL_MODULES,
  },
  guest: {
    role: "guest",
    label: "Guest / Read Only",
    description: "Read-only access across the board. No financial or edit access.",
    canViewAllFinancials: false,
    canViewAssignedFinancialsOnly: false,
    canEditPlayers: "none",
    canCreateDeals: false,
    canApproveDeals: false,
    canEditGlobalSettings: false,
    canManageUsers: false,
    canDeleteRecords: false,
    canAccessScoutingNotes: false,
    readOnly: true,
    moduleAccess: NON_FINANCIAL_MODULES,
  },
};

export function getPermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

export function isModuleVisible(user: MockUser, moduleKey: string): boolean {
  return ROLE_PERMISSIONS[user.role].moduleAccess.includes(moduleKey);
}

function isAssignedToUser(user: MockUser, player: Pick<Player, "representingAgent">): boolean {
  return !!user.agentName && player.representingAgent === user.agentName;
}

/** True if the user may see financial fields — optionally scoped to a specific player. */
export function hasFinancialAccess(
  user: MockUser,
  player?: Pick<Player, "representingAgent">
): boolean {
  const perms = ROLE_PERMISSIONS[user.role];
  if (perms.canViewAllFinancials) return true;
  if (perms.canViewAssignedFinancialsOnly && player) return isAssignedToUser(user, player);
  return false;
}

/** True if the whole Contract / financial tab should even be shown. */
export function canSeeFinancialTab(user: MockUser): boolean {
  const perms = ROLE_PERMISSIONS[user.role];
  return perms.canViewAllFinancials || perms.canViewAssignedFinancialsOnly;
}

export function canEditPlayer(user: MockUser, player: Pick<Player, "representingAgent">): boolean {
  const scope = ROLE_PERMISSIONS[user.role].canEditPlayers;
  if (scope === "all") return true;
  if (scope === "assigned") return isAssignedToUser(user, player);
  return false;
}

export function canCreateDeals(user: MockUser): boolean {
  return ROLE_PERMISSIONS[user.role].canCreateDeals;
}

export function canApproveDeals(user: MockUser): boolean {
  return ROLE_PERMISSIONS[user.role].canApproveDeals;
}

export function canManageSettings(user: MockUser): boolean {
  return ROLE_PERMISSIONS[user.role].canEditGlobalSettings;
}

export function canManageUsers(user: MockUser): boolean {
  return ROLE_PERMISSIONS[user.role].canManageUsers;
}

export function canDeleteRecords(user: MockUser): boolean {
  return ROLE_PERMISSIONS[user.role].canDeleteRecords;
}

export function canAccessScoutingNotes(user: MockUser): boolean {
  return ROLE_PERMISSIONS[user.role].canAccessScoutingNotes;
}

export function isReadOnly(user: MockUser): boolean {
  return ROLE_PERMISSIONS[user.role].readOnly;
}
