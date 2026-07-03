import { ExternalData, Player, SeasonStat } from "@/types";

function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function seasonsBack(currentSeason: string, count: number): string[] {
  const match = currentSeason.match(/(\d{4})\/(\d{2})/);
  const startYear = match ? parseInt(match[1], 10) : new Date().getFullYear();
  const seasons: string[] = [];
  for (let i = 0; i < count; i++) {
    const y = startYear - i;
    seasons.push(`${y}/${String((y + 1) % 100).padStart(2, "0")}`);
  }
  return seasons;
}

/**
 * Generates realistic-looking mock EliteProspects profile data for the pilot
 * import flow. No real scraping or API call happens here.
 */
export function generateMockExternalData(
  player: Pick<
    Player,
    "id" | "firstName" | "lastName" | "position" | "country" | "currentClub" | "currentLeague" | "season" | "eliteProspectsUrl"
  >
): ExternalData {
  const rand = seededRandom(player.id + player.firstName + player.lastName);

  const age = 18 + Math.floor(rand() * 15); // 18-32
  const birthYear = new Date().getFullYear() - age;
  const birthMonth = 1 + Math.floor(rand() * 12);
  const birthDay = 1 + Math.floor(rand() * 27);
  const dateOfBirth = `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;

  const isGoalie = player.position === "G";
  const heightCm = isGoalie
    ? 183 + Math.floor(rand() * 15)
    : 175 + Math.floor(rand() * 18);
  const weightKg = isGoalie
    ? 82 + Math.floor(rand() * 14)
    : 75 + Math.floor(rand() * 20);
  const shoots = isGoalie ? pick(rand, ["L", "R"]) : pick(rand, ["L", "R"]);

  const seasons = seasonsBack(player.season, 3);
  const seasonStats: SeasonStat[] = seasons.map((season, idx) => {
    const gp = 30 + Math.floor(rand() * 30);
    if (isGoalie) {
      return {
        season,
        team: idx === 0 ? player.currentClub : pick(rand, [player.currentClub, "U20 Development Squad"]),
        league: idx === 0 ? player.currentLeague : player.currentLeague,
        gp,
        g: 0,
        a: 0,
        pts: 0,
        pim: 0,
      };
    }
    const g = Math.floor(rand() * 28);
    const a = Math.floor(rand() * 34);
    return {
      season,
      team: idx === 0 ? player.currentClub : pick(rand, [player.currentClub, "U20 Development Squad"]),
      league: player.currentLeague,
      gp,
      g,
      a,
      pts: g + a,
      pim: Math.floor(rand() * 40),
    };
  });

  return {
    eliteProspectsUrl:
      player.eliteProspectsUrl ||
      `https://www.eliteprospects.com/player/${player.id}/${player.firstName.toLowerCase()}-${player.lastName.toLowerCase()}`,
    dateOfBirth,
    age,
    nationality: player.country,
    position: player.position,
    shoots: isGoalie ? `Catches: ${shoots}` : `Shoots: ${shoots}`,
    heightCm,
    weightKg,
    currentClub: player.currentClub,
    currentLeague: player.currentLeague,
    seasonStats,
    notes:
      "Imported via mock EliteProspects pilot integration. Values are simulated for demonstration purposes only.",
  };
}
