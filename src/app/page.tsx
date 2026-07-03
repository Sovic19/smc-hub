"use client";

import { StatsRow } from "@/components/dashboard/StatsRow";
import { ExpirationsWidget } from "@/components/dashboard/ExpirationsWidget";
import { TasksDueTodayWidget } from "@/components/dashboard/TasksDueTodayWidget";
import { TasksWidget } from "@/components/dashboard/TasksWidget";
import { NewOffersWidget } from "@/components/dashboard/NewOffersWidget";
import { DisengagedPlayersWidget } from "@/components/dashboard/DisengagedPlayersWidget";
import { UpcomingFollowUpsWidget } from "@/components/dashboard/UpcomingFollowUpsWidget";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { LatestCommunicationWidget } from "@/components/dashboard/LatestCommunicationWidget";
import { AgentPerformanceWidget } from "@/components/dashboard/AgentPerformanceWidget";
import { RelationshipOverviewWidget } from "@/components/dashboard/RelationshipOverviewWidget";
import { CommissionSummaryWidget } from "@/components/dashboard/CommissionSummaryWidget";
import { JuniorDevelopmentWidget } from "@/components/dashboard/JuniorDevelopmentWidget";
import { UrgentAlertsWidget } from "@/components/dashboard/UrgentAlertsWidget";
import { PlayedYesterdayWidget } from "@/components/dashboard/PlayedYesterdayWidget";
import { TopPerformancesWidget } from "@/components/dashboard/TopPerformancesWidget";
import { RestrictedNotice } from "@/components/shared/Restricted";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { Card, CardHeader } from "@/components/ui/Card";

export default function DashboardPage() {
  const { user, permissions } = useCurrentUser();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Welcome back, {user.name.split(" ")[0]}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Here&apos;s what&apos;s happening across the agency today.
        </p>
      </div>

      <StatsRow />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <TasksDueTodayWidget />
          <UrgentAlertsWidget />
          <ExpirationsWidget />
          <NewOffersWidget />
          <TasksWidget />
        </div>
        <div className="space-y-6">
          <ActivityFeed />
          <LatestCommunicationWidget />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PlayedYesterdayWidget />
        <TopPerformancesWidget />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DisengagedPlayersWidget />
        <UpcomingFollowUpsWidget />
      </div>

      <JuniorDevelopmentWidget />

      {(permissions.canViewAllFinancials || permissions.canViewAssignedFinancialsOnly) && (
        <AgentPerformanceWidget />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RelationshipOverviewWidget />
        {permissions.canViewAllFinancials ? (
          <CommissionSummaryWidget />
        ) : (
          <Card>
            <CardHeader title="Commission Summary" description="Agency-wide commission overview" />
            <div className="p-5">
              <RestrictedNotice message="Commission and financial summaries are restricted for your role." />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
