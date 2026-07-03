"use client";

import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui/Field";
import {
  CONTRACT_SITUATION_LABEL,
  CONTRACT_STATUS_LABEL,
  PLAYER_CATEGORY_LABEL,
  PLAYER_STATUS_LABEL,
} from "@/lib/format";
import { ContractSituation, ContractStatus, PlayerCategory, PlayerStatus, Position } from "@/types";

export interface PlayerFilters {
  query: string;
  status: PlayerStatus | "all";
  category: PlayerCategory | "all";
  contractStatus: ContractStatus | "all";
  contractSituation: ContractSituation | "all";
  position: Position | "all";
}

const POSITIONS: Position[] = ["C", "LW", "RW", "D", "G", "F"];

export function PlayersFilterBar({
  filters,
  onChange,
}: {
  filters: PlayerFilters;
  onChange: (filters: PlayerFilters) => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search players by name or club…"
          className="pl-9"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:shrink-0 lg:flex-wrap">
        <Select
          value={filters.status}
          onChange={(e) =>
            onChange({ ...filters, status: e.target.value as PlayerFilters["status"] })
          }
          className="lg:w-36"
        >
          <option value="all">All statuses</option>
          {Object.entries(PLAYER_STATUS_LABEL).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          value={filters.category}
          onChange={(e) =>
            onChange({ ...filters, category: e.target.value as PlayerFilters["category"] })
          }
          className="lg:w-40"
        >
          <option value="all">All categories</option>
          {Object.entries(PLAYER_CATEGORY_LABEL).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          value={filters.contractStatus}
          onChange={(e) =>
            onChange({
              ...filters,
              contractStatus: e.target.value as PlayerFilters["contractStatus"],
            })
          }
          className="lg:w-40"
        >
          <option value="all">All contracts</option>
          {Object.entries(CONTRACT_STATUS_LABEL).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          value={filters.contractSituation}
          onChange={(e) =>
            onChange({
              ...filters,
              contractSituation: e.target.value as PlayerFilters["contractSituation"],
            })
          }
          className="lg:w-56"
        >
          <option value="all">All contract situations</option>
          {Object.entries(CONTRACT_SITUATION_LABEL).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          value={filters.position}
          onChange={(e) =>
            onChange({ ...filters, position: e.target.value as PlayerFilters["position"] })
          }
          className="lg:w-28"
        >
          <option value="all">All positions</option>
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
