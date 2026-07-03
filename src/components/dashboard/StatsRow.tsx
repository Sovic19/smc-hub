"use client";

import { Users, FileWarning, ListChecks, Handshake, Wallet } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { useData } from "@/context/DataContext";
import { daysUntil, formatCurrency } from "@/lib/format";
import { useCurrentUser } from "@/context/CurrentUserContext";

export function StatsRow() {
  const { players, tasks, deals } = useData();
  const { permissions } = useCurrentUser();

  const activePlayers = players.filter((p) => p.status === "active").length;
  const expiringSoon = players.filter((p) => {
    const d = daysUntil(p.clubContractEndDate);
    return d !== null && d >= 0 && d <= 60;
  }).length;
  const openTasks = tasks.filter(
    (t) => t.status !== "completed"
  ).length;
  const openDeals = deals.filter(
    (d) => !["signed", "rejected", "cancelled", "finished"].includes(d.status)
  ).length;
  const outstandingCommission = players.reduce(
    (sum, p) => sum + (p.commission.paymentStatus !== "paid" ? p.commission.amount ?? 0 : 0),
    0
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Total Players"
        value={players.length}
        trend={`${activePlayers} active`}
        icon={<Users className="h-4 w-4" />}
        tone="brand"
      />
      <StatCard
        label="Contracts Expiring"
        value={expiringSoon}
        trend="Within 60 days"
        icon={<FileWarning className="h-4 w-4" />}
        tone="amber"
      />
      <StatCard
        label="Open Tasks"
        value={openTasks}
        trend={`${tasks.length} total`}
        icon={<ListChecks className="h-4 w-4" />}
        tone="brand"
      />
      <StatCard
        label="Open Deals"
        value={openDeals}
        trend={`${deals.length} total`}
        icon={<Handshake className="h-4 w-4" />}
        tone="green"
      />
      <StatCard
        label="Outstanding Commission"
        value={permissions.canViewAllFinancials ? formatCurrency(outstandingCommission) : "Restricted"}
        trend="Unpaid + partially paid"
        icon={<Wallet className="h-4 w-4" />}
        tone="red"
      />
    </div>
  );
}
