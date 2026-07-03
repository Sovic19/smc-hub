"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/cn";

export interface TabDef {
  key: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

export function Tabs({
  tabs,
  defaultKey,
}: {
  tabs: TabDef[];
  defaultKey?: string;
}) {
  const [active, setActive] = useState(defaultKey ?? tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              active === tab.key
                ? "bg-white text-brand-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-6">{activeTab?.content}</div>
    </div>
  );
}
