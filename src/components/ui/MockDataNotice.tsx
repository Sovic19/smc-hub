import { Info } from "lucide-react";

export function MockDataNotice({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-lg border border-brand-100 bg-brand-50/60 px-3.5 py-2.5 text-xs text-brand-800 ${className ?? ""}`}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
      <p>
        <strong className="font-semibold">Pilot mock integration — no live external data connection yet.</strong>{" "}
        This version uses simulated mock data for EliteProspects imports. A future release can connect to
        an official EliteProspects API or another approved external data source.
      </p>
    </div>
  );
}
