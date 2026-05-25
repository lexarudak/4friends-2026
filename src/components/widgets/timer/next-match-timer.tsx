import type { FC, HTMLAttributes } from "react";
import { MatchService } from "@/services/match.service";
import { NextMatchTimerClient } from "./next-match-timer-client";

type Props = HTMLAttributes<HTMLDivElement>;

export const NextMatchTimer: FC<Props> = async ({ className, ...props }) => {
	const payload = await MatchService.getNextMatchTimerPayload();

	return (
		<NextMatchTimerClient
			{...props}
			className={className}
			initialPayload={payload}
		/>
	);
};
