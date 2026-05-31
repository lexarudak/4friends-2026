/**
 * Whether a round/group label represents a knockout (playoff) match — one that
 * cannot end in a draw and needs a winner pick.
 *
 * Matches both raw API rounds ("Round of 16", "Quarter-finals", "Final",
 * "3rd Place Final") and our display labels ("1/8 Final", "Quarter Final").
 * Returns false for league/group formats ("Group A", "Group Stage - 1",
 * "Regular Season - 9", "League Stage - 2").
 */
export function isKnockoutRound(label: string | null | undefined): boolean {
	if (!label) return false;
	return /round of|1\/(?:8|16|32)|quarter|semi|final|third\s*place/i.test(label);
}
