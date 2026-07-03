import { Player } from "@/types";

/**
 * True when a player is classified as a junior and does not yet have a
 * professional contract. This is a normal, expected state — never treated
 * as missing/error data in the UI, just surfaced with an informational badge.
 */
export function isJuniorWithoutProContract(player: Pick<Player, "category" | "contractSituation">): boolean {
  return player.category === "junior" && player.contractSituation !== "under_pro_contract";
}
