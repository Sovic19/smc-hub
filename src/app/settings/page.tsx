"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Download,
  Globe,
  KeyRound,
  Lock,
  PlugZap,
  RefreshCw,
  ScrollText,
  Sparkles,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { MockDataNotice } from "@/components/ui/MockDataNotice";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { AGENT_PROFILES } from "@/lib/mockData";
import { AUDIT_ACTION_LABEL, SYNC_STATUS_LABEL, formatDateTime } from "@/lib/format";
import { SYNC_STATUS_TONE } from "@/lib/statusTone";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { ROLE_PERMISSIONS, canManageUsers } from "@/lib/permissions";
import { UserRole } from "@/types";

const ENTITY_HREF: Record<string, string> = {
  player: "/players",
  club: "/clubs",
  contact: "/contacts",
};

const PERMISSION_COLUMNS: { key: keyof typeof ROLE_PERMISSIONS.owner; label: string }[] = [
  { key: "canViewAllFinancials", label: "All Financials" },
  { key: "canViewAssignedFinancialsOnly", label: "Assigned Financials" },
  { key: "canCreateDeals", label: "Create Deals" },
  { key: "canApproveDeals", label: "Approve Deals" },
  { key: "canEditGlobalSettings", label: "Edit Settings" },
  { key: "canManageUsers", label: "Manage Users" },
  { key: "canDeleteRecords", label: "Delete Records" },
  { key: "canAccessScoutingNotes", label: "Scouting Notes" },
];

function PermissionCheck({ value }: { value: boolean }) {
  return value ? (
    <Check className="mx-auto h-4 w-4 text-emerald-600" />
  ) : (
    <X className="mx-auto h-4 w-4 text-slate-300" />
  );
}

export default function SettingsPage() {
  const { syncLog, auditLog, addAuditLogEntry } = useData();
  const { showToast } = useToast();
  const { user: currentUser, users, permissions, setCurrentUserId } = useCurrentUser();
  const [language, setLanguage] = useState("en");
  const [refreshing, setRefreshing] = useState(false);
  const sortedLog = [...syncLog].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const sortedAuditLog = [...auditLog].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  function handleRefreshAll() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast("Manual refresh is a placeholder", {
        description: "A future release can trigger a full re-sync from an approved data source.",
        variant: "info",
      });
    }, 700);
  }

  function handleExport(label: string) {
    showToast(`${label} export is a placeholder`, {
      description: "Real data export will be available in a future release.",
      variant: "info",
    });
  }

  function handleRoleChange(userId: string, nextRole: UserRole) {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    addAuditLogEntry({
      user: currentUser.name,
      role: currentUser.role,
      action: "role_change",
      entityType: "User",
      entityName: target.name,
      previousValue: ROLE_PERMISSIONS[target.role].label,
      newValue: ROLE_PERMISSIONS[nextRole].label,
    });
    showToast(`${target.name}'s role updated (mock)`, {
      description: "Role changes are local to this pilot and are not persisted to a real identity system.",
      variant: "success",
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Settings</h2>
        <p className="mt-1 text-sm text-slate-400">
          Agency-wide configuration and integrations
        </p>
      </div>

      <Card>
        <CardHeader title="Agency Agents" description="Agents currently configured in this pilot" />
        <CardBody>
          <ul className="divide-y divide-slate-100">
            {AGENT_PROFILES.map((agent) => (
              <li key={agent.id} className="flex items-center gap-3 py-3">
                <Avatar name={agent.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{agent.name}</p>
                  <p className="text-xs text-slate-500">{agent.role}</p>
                </div>
                <div className="hidden text-right text-xs text-slate-400 sm:block">
                  <p>{agent.email}</p>
                  {agent.phone && <p>{agent.phone}</p>}
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Mock Current User"
          description="Switch roles to preview permission-aware access — no real authentication yet"
          action={<Badge tone="purple" dot>Pilot / Mock Mode</Badge>}
        />
        <CardBody>
          <label className="flex max-w-sm flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-600">Acting as</span>
            <Select value={currentUser.id} onChange={(e) => setCurrentUserId(e.target.value)}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} — {ROLE_PERMISSIONS[u.role].label}</option>
              ))}
            </Select>
          </label>
          <p className="mt-2 text-xs text-slate-400">{permissions.description}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Users &amp; Roles"
          description="Mock user directory for this pilot"
          action={<UserCog className="h-4 w-4 text-slate-400" />}
        />
        <CardBody>
          <ul className="divide-y divide-slate-100">
            {users.map((u) => (
              <li key={u.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{u.name}</p>
                    <p className="truncate text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-11 sm:pl-0">
                  {canManageUsers(currentUser) ? (
                    <Select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="h-8 py-0 text-xs"
                    >
                      {Object.values(ROLE_PERMISSIONS).map((rp) => (
                        <option key={rp.role} value={rp.role}>{rp.label}</option>
                      ))}
                    </Select>
                  ) : (
                    <Badge tone="slate">{ROLE_PERMISSIONS[u.role].label}</Badge>
                  )}
                  {u.id === currentUser.id && <Badge tone="brand">You</Badge>}
                </div>
              </li>
            ))}
          </ul>
          {canManageUsers(currentUser) && (
            <p className="mt-3 text-xs text-slate-400">
              Role changes are recorded in the audit log below but are not persisted to a real identity system in this pilot.
            </p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Permission Matrix" description="What each role can access across the agency" />
        <CardBody className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="py-2 pr-3 font-medium">Role</th>
                {PERMISSION_COLUMNS.map((col) => (
                  <th key={col.key} className="px-2 py-2 text-center font-medium">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.values(ROLE_PERMISSIONS).map((rp) => (
                <tr key={rp.role}>
                  <td className="py-2.5 pr-3 font-medium text-slate-700">{rp.label}</td>
                  {PERMISSION_COLUMNS.map((col) => (
                    <td key={col.key} className="px-2 py-2.5 text-center">
                      <PermissionCheck value={rp[col.key] as boolean} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Financial Access Rules" description="How salary, contract, and commission data is protected" />
        <CardBody className="space-y-3">
          <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-500">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p>
              Salary, bonuses, contract value, and commission (percentage, amount, and split) are hidden or
              replaced with &quot;Restricted&quot; wherever a role does not have financial access. Owner and Director
              see all financial data. Senior Agent and Agent see financial data only for players assigned to
              them. Scout, Assistant, and Guest never see financial data.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2">
            <li>• Player Contract tab (salary, commission)</li>
            <li>• Deals (expected/final salary, commission)</li>
            <li>• Agent Statistics (contract value, commission)</li>
            <li>• Dashboard financial widgets</li>
            <li>• Contract, invoice &amp; commission documents</li>
          </ul>
        </CardBody>
      </Card>

      {(currentUser.role === "owner" || currentUser.role === "director") && (
        <Card>
          <CardHeader
            title="Audit Log"
            description="Financial edits, contract changes, role changes, deletions, exports, and permission changes"
            action={<ScrollText className="h-4 w-4 text-slate-400" />}
          />
          <CardBody>
            {sortedAuditLog.length === 0 ? (
              <EmptyState title="No audit activity yet" description="Sensitive actions will be logged here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="py-2 pr-3 font-medium">User</th>
                      <th className="px-2 py-2 font-medium">Action</th>
                      <th className="px-2 py-2 font-medium">Entity</th>
                      <th className="px-2 py-2 font-medium">Previous</th>
                      <th className="px-2 py-2 font-medium">New</th>
                      <th className="px-2 py-2 text-right font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedAuditLog.slice(0, 25).map((entry) => (
                      <tr key={entry.id}>
                        <td className="py-2.5 pr-3">
                          <p className="font-medium text-slate-700">{entry.user}</p>
                          <p className="text-slate-400">{ROLE_PERMISSIONS[entry.role].label}</p>
                        </td>
                        <td className="px-2 py-2.5"><Badge tone="slate">{AUDIT_ACTION_LABEL[entry.action]}</Badge></td>
                        <td className="px-2 py-2.5 text-slate-600">
                          {entry.entityType}: {entry.entityName}
                        </td>
                        <td className="px-2 py-2.5 text-slate-400">{entry.previousValue ?? "—"}</td>
                        <td className="px-2 py-2.5 text-slate-600">{entry.newValue ?? "—"}</td>
                        <td className="px-2 py-2.5 text-right text-slate-400">{formatDateTime(entry.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Data Sources"
          description="External profile data integrations for player, club, and contact records"
          action={
            <Badge tone="purple" dot>
              Pilot / Mock Mode
            </Badge>
          }
        />
        <CardBody className="space-y-6">
          <MockDataNotice />

          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">EliteProspects Integration</p>
                <p className="text-xs text-slate-500">Player, club &amp; contact data — pilot mock integration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="purple">Pilot / Mock Mode</Badge>
              <Button size="sm" variant="outline" onClick={handleRefreshAll} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh All
              </Button>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-800">Last Sync Log</h4>
            {sortedLog.length === 0 ? (
              <EmptyState title="No sync activity yet" description="Imports will be logged here." />
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <ul className="divide-y divide-slate-100">
                  {sortedLog.slice(0, 15).map((entry) => (
                    <li key={entry.id} className="flex items-center gap-3 px-4 py-3">
                      <Badge tone={SYNC_STATUS_TONE[entry.status]}>
                        {SYNC_STATUS_LABEL[entry.status]}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`${ENTITY_HREF[entry.entityType]}/${entry.entityId}`}
                          className="text-sm font-medium text-slate-800 hover:text-brand-600 hover:underline"
                        >
                          {entry.entityLabel}
                        </Link>
                        <p className="truncate text-xs text-slate-400">{entry.message}</p>
                      </div>
                      <Badge tone="slate">{entry.entityType}</Badge>
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatDateTime(entry.timestamp)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Future API &amp; Backend Connection"
          description="Official EliteProspects API, other approved data sources, and a real backend"
        />
        <CardBody className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-500">
            <PlugZap className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p>
              A future release of SMC Hub can connect to an official EliteProspects API, another
              approved external data source, and a real backend to replace localStorage.
              Configuration below is a placeholder — no live connection is made yet.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-slate-600">API Key</span>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                <Input disabled placeholder="Not configured — available in a future release" className="pl-9" />
              </div>
            </label>
            <Button disabled variant="outline">Connect</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Language" description="Interface language preference" />
        <CardBody>
          <label className="flex max-w-xs flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-600">
              <Globe className="mr-1 inline h-3.5 w-3.5" />
              Display language
            </span>
            <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="cs">Čeština (Czech)</option>
            </Select>
          </label>
          <p className="mt-2 text-xs text-slate-400">
            Interface text remains in English for this pilot. Full Czech localization is a placeholder for a future release.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Export Data" description="Placeholder export actions — no real file generation yet" />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {["Players", "Clubs", "Contacts", "Deals", "Tasks"].map((label) => (
              <Button key={label} variant="outline" size="sm" onClick={() => handleExport(label)}>
                <Download className="h-4 w-4" />
                Export {label}
              </Button>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Storage" description="Where this pilot's data lives" />
        <CardBody>
          <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-500">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p>
              All data in SMC Hub is stored locally in this browser (localStorage). No backend is
              connected yet — clearing your browser storage will reset the app to its seeded mock data.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
