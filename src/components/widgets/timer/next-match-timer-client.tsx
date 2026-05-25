"use client";

import { useCallback, useState, type FC, type HTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import type { NextMatchTimerPayload } from "@/types/api";
import { Timer } from "./timer";

type Props = HTMLAttributes<HTMLDivElement> & {
	initialPayload: NextMatchTimerPayload;
};

export const NextMatchTimerClient: FC<Props> = ({
	initialPayload,
	className,
	...props
}) => {
	const router = useRouter();
	const [payload, setPayload] = useState(initialPayload);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const isFinished = payload.isTournamentFinished || !payload.nextMatch;

	const refreshNextMatch = useCallback(async () => {
		if (isFinished || isRefreshing) return;

		setIsRefreshing(true);
		try {
			const response = await fetch("/api/next-match", {
				method: "GET",
				cache: "no-store",
			});

			if (!response.ok) return;

			const nextPayload = (await response.json()) as NextMatchTimerPayload;
			setPayload(nextPayload);

			// Refresh server sections so "Next matches" and related blocks stay in sync.
			router.refresh();
		} catch (err) {
			console.error("[NextMatchTimerClient.refreshNextMatch]", err);
		} finally {
			setIsRefreshing(false);
		}
	}, [isFinished, isRefreshing, router]);

	if (!payload.nextMatch || payload.isTournamentFinished) {
		return (
			<Timer
				{...props}
				className={className}
				targetDate={new Date(payload.serverNow)}
				message="Tournament finished"
				subMessage="No upcoming matches"
				disableUrgency
			/>
		);
	}

	const { nextMatch } = payload;

	return (
		<Timer
			{...props}
			className={className}
			targetDate={new Date(nextMatch.targetDateIso)}
			serverNowIso={payload.serverNow}
			message="Next match"
			subMessage={nextMatch.group}
			homeTeam={nextMatch.home.name}
			homeFlag={nextMatch.home.flag}
			awayTeam={nextMatch.away.name}
			awayFlag={nextMatch.away.flag}
			onReachedZero={refreshNextMatch}
		/>
	);
};
