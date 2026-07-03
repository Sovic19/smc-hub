"use client";

import Link from "next/link";
import { Handshake } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { formatCurrency, relativeDayLabel } from "@/lib/format";

export function NewOffersWidget() {
  const { deals, getPlayer } = useData();

  const offers = [...deals]
    .filter((d) => d.status === "offer" || d.status === "negotiation")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader
        title="New Offers"
        description="Active offers and negotiations"
        action={
          <Link href="/deals" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            View all
          </Link>
        }
      />
      <div className="divide-y divide-slate-100">
        {offers.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<Handshake className="h-5 w-5" />} title="No active offers" />
          </div>
        ) : (
          offers.map((deal) => {
            const player = getPlayer(deal.playerId);
            return (
              <Link key={deal.id} href="/deals" className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {player ? `${player.firstName} ${player.lastName}` : "Unknown"} → {deal.clubName}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {formatCurrency(deal.expectedSalary, deal.currency)} · {deal.responsibleAgent}
                  </p>
                </div>
                <Badge tone={deal.status === "offer" ? "amber" : "purple"}>
                  {deal.deadline ? relativeDayLabel(deal.deadline) : deal.status}
                </Badge>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
