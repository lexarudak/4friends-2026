"use client";

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type FC,
	type HTMLAttributes,
} from "react";
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
	const isRefreshingRef = useRef(false);

	const isFinished = payload.isTournamentFinished || !payload.nextMatch;

	const refreshNextMatch = useCallback(async () => {
		if (isRefreshingRef.current) return;

		isRefreshingRef.current = true;
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
			isRefreshingRef.current = false;
		}
	}, [router]);

	useEffect(() => {
		if (isFinished || !payload.nextMatch) return;

		const serverNowMs = Date.parse(payload.serverNow);
		const targetMs = Date.parse(payload.nextMatch.targetDateIso);
		if (Number.isNaN(serverNowMs) || Number.isNaN(targetMs)) return;

		const perfBaseMs = performance.now();
		const getRemainingMs = () =>
			targetMs - (serverNowMs + (performance.now() - perfBaseMs));

		const remainingMs = getRemainingMs();
		if (remainingMs <= 0) {
			void refreshNextMatch();
			return;
		}

		// Keep a tiny buffer so we refresh right after the match start moment.
		const timeoutId = window.setTimeout(() => {
			void refreshNextMatch();
		}, remainingMs + 50);

		return () => window.clearTimeout(timeoutId);
	}, [isFinished, payload.nextMatch, payload.serverNow, refreshNextMatch]);

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
			key={nextMatch.id}
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
