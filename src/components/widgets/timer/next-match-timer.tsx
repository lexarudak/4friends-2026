import type { FC, HTMLAttributes } from "react";
import { MatchService } from "@/services/match.service";
import { getActiveRoomTournament } from "@/lib/active-room";
import { NextMatchTimerClient } from "./next-match-timer-client";

type Props = HTMLAttributes<HTMLDivElement>;

export const NextMatchTimer: FC<Props> = async ({ className, ...props }) => {
	const tournament = await getActiveRoomTournament();
	const payload = await MatchService.getNextMatchTimerPayload(tournament);

	return (
		<NextMatchTimerClient
			{...props}
			className={className}
			initialPayload={payload}
		/>
	);
};
