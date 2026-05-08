export function getCompetitionPosition(
	scoresDesc: number[],
	index: number
): number {
	if (index <= 0) return 1;
	return scoresDesc[index] === scoresDesc[index - 1]
		? getCompetitionPosition(scoresDesc, index - 1)
		: index + 1;
}
