"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/cn";

export function CommissionSummaryWidget() {
  const { players, deals } = useData();

  const allCommissions = [
    ...players.map((p) => p.commission),
    ...deals.map((d) => d.commission),
  ];

  const paid = allCommissions.reduce((sum, c) => sum + (c.paymentStatus === "paid" ? c.amount ?? 0 : 0), 0);
  const partial = allCommissions.reduce((sum, c) => sum + (c.paymentStatus === "partially_paid" ? c.amount ?? 0 : 0), 0);
  const unpaid = allCommissions.reduce((sum, c) => sum + (c.paymentStatus === "unpaid" ? c.amount ?? 0 : 0), 0);
  const total = paid + partial + unpaid;

  const rows = [
    { label: "Paid", value: paid, classes: "bg-emerald-500" },
    { label: "Partially Paid", value: partial, classes: "bg-violet-500" },
    { label: "Unpaid", value: unpaid, classes: "bg-amber-500" },
  ];

  return (
    <Card>
      <CardHeader title="Commission Summary" description="Player contracts and deals combined" />
      <div className="space-y-4 px-5 py-4">
        <div>
          <p className="text-2xl font-semibold text-slate-900">{formatCurrency(total)}</p>
          <p className="text-xs text-slate-400">Total commission tracked</p>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          {rows.map((r) => (
            <div
              key={r.label}
              className={cn("h-full", r.classes)}
              style={{ width: total > 0 ? `${(r.value / total) * 100}%` : "0%" }}
            />
          ))}
        </div>
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className={cn("h-2 w-2 rounded-full", r.classes)} />
                {r.label}
              </span>
              <span className="font-medium text-slate-800">{formatCurrency(r.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
