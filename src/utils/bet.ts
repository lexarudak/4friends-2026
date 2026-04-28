import type { BetHistoryItem } from "@/db/bet-history";
import type { BetItemStatus } from "@/components/widgets/bet-item";

export function getBetItemStatus(item: BetHistoryItem): BetItemStatus {
	const hasResult = item.resultHome !== null && item.resultAway !== null;
	if (!hasResult) return "pending";
	if (item.resultHome === item.betHome && item.resultAway === item.betAway)
		return "exact";
	if (
		Math.sign(item.betHome - item.betAway) ===
		Math.sign(item.resultHome! - item.resultAway!)
	)
		return "win";
	return "miss";
}
