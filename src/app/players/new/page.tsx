"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PlayerForm, PlayerFormValues } from "@/components/players/PlayerForm";
import { useData } from "@/context/DataContext";

export default function NewPlayerPage() {
  const router = useRouter();
  const { addPlayer } = useData();

  function handleSubmit(values: PlayerFormValues) {
    const created = addPlayer({ ...values, history: [] });
    router.push(`/players/${created.id}`);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link
        href="/players"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Players
      </Link>
      <div>
        <h2 className="text-xl font-semibold text-white">Add New Player</h2>
        <p className="mt-1 text-sm text-slate-400">
          Fill in the player&apos;s profile. You can add documents and history after creation.
        </p>
      </div>
      <PlayerForm onSubmit={handleSubmit} submitLabel="Create Player" />
    </div>
  );
}
