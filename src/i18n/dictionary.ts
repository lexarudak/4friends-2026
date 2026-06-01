import en from "./dictionaries/en";
import ru from "./dictionaries/ru";
import type { Locale } from "./config";

export type Dictionary = typeof en;

/** The four leaderboard metric titles, shared by stat services. */
export type StatLabels = {
	totalScore: string;
	exactHits: string;
	predictedWins: string;
	avgPerMatch: string;
};

export function getDictionary(locale: Locale): Dictionary {
	return locale === "ru" ? ru : en;
}
