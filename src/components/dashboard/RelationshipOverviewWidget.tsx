"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { useData } from "@/context/DataContext";
import { RELATIONSHIP_STRENGTH_LABEL } from "@/lib/format";
import { RelationshipStrength } from "@/types";
import { cn } from "@/lib/cn";

const ORDER: RelationshipStrength[] = ["strong", "medium", "new", "weak", "inactive"];

const BAR_CLASSES: Record<RelationshipStrength, string> = {
  strong: "bg-emerald-500",
  medium: "bg-brand-500",
  new: "bg-violet-500",
  weak: "bg-amber-500",
  inactive: "bg-slate-300",
};

export function RelationshipOverviewWidget() {
  const { clubs, contacts } = useData();
  const total = clubs.length + contacts.length;

  const counts = ORDER.map((strength) => ({
    strength,
    count:
      clubs.filter((c) => c.relationshipStrength === strength).length +
      contacts.filter((c) => c.relationshipStrength === strength).length,
  }));

  return (
    <Card>
      <CardHeader title="Relationship Overview" description="Clubs and contacts by relationship strength" />
      <div className="space-y-3 px-5 py-4">
        {counts.map(({ strength, count }) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={strength}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">{RELATIONSHIP_STRENGTH_LABEL[strength]}</span>
                <span className="text-slate-400">{count}</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={cn("h-full rounded-full", BAR_CLASSES[strength])} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
