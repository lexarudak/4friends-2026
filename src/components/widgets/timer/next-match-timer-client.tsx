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
import { LIVE_MATCH_FINALIZED_EVENT } from "@/utils/constants";
import { Timer } from "./timer";

type Props = HTMLAttributes<HTMLDivElement> & {
	initialPayload: NextMatchTimerPayload;
};

/** Signature of the parts that, when changed, warrant re-fetching server sections. */
function payloadSignature(p: NextMatchTimerPayload): string {
	const live = p.liveMatches
		.map((m) => `${m.id}:${m.statusShort}:${m.home.goals}-${m.away.goals}`)
		.join("|");
	return `${p.hasLive}#${p.nextMatch?.id ?? "none"}#${live}`;
}

export const NextMatchTimerClient: FC<Props> = ({
	initialPayload,
	className,
	...props
}) => {
	const router = useRouter();
	const [payload, setPayload] = useState(initialPayload);
	const isRefreshingRef = useRef(false);
	const signatureRef = useRef(payloadSignature(initialPayload));
	const liveIdsRef = useRef(
		new Set(initialPayload.liveMatches.map((m) => m.id))
	);

	const isFinished =
		payload.isTournamentFinished && !payload.hasLive && !payload.nextMatch;

	const refreshNextMatch = useCallback(
		async (options: { waitForSync?: boolean } = {}) => {
			if (isRefreshingRef.current) return;

			isRefreshingRef.current = true;
			try {
				const t = encodeURIComponent(payload.tournament);
				const url = options.waitForSync
					? `/api/next-match?sync=wait&t=${t}`
					: `/api/next-match?t=${t}`;
				// Let the CDN edge-cache serve polls (s-maxage); don't force no-store.
				const response = await fetch(url, { method: "GET" });

				if (!response.ok) return;

				const nextPayload = (await response.json()) as NextMatchTimerPayload;
				setPayload(nextPayload);

				// A live match that left the set has finished → points were just
				// awarded. Signal the leaderboard to refetch exactly then.
				const newLiveIds = new Set(nextPayload.liveMatches.map((m) => m.id));
				const someFinished = [...liveIdsRef.current].some(
					(id) => !newLiveIds.has(id)
				);
				liveIdsRef.current = newLiveIds;
				if (someFinished) {
					window.dispatchEvent(new CustomEvent(LIVE_MATCH_FINALIZED_EVENT));
				}

				// Only re-fetch server sections (DB-heavy) when something material
				// changed: live scores/status, the next match, or live on/off.
				const nextSig = payloadSignature(nextPayload);
				if (nextSig !== signatureRef.current) {
					signatureRef.current = nextSig;
					router.refresh();
				}
			} catch (err) {
				console.error("[NextMatchTimerClient.refreshNextMatch]", err);
			} finally {
				isRefreshingRef.current = false;
			}
		},
		[router, payload.tournament]
	);

	const refreshOnKickoff = useCallback(
		() => refreshNextMatch({ waitForSync: true }),
		[refreshNextMatch]
	);

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
			void refreshOnKickoff();
			return;
		}

		// Keep a tiny buffer so we refresh right after the match start moment.
		const timeoutId = window.setTimeout(() => {
			void refreshOnKickoff();
		}, remainingMs + 50);

		return () => window.clearTimeout(timeoutId);
	}, [isFinished, payload.nextMatch, payload.serverNow, refreshOnKickoff]);

	useEffect(() => {
		if (!payload.hasLive) return;
		const intervalId = window.setInterval(() => {
			void refreshNextMatch();
		}, 30_000);
		return () => window.clearInterval(intervalId);
	}, [payload.hasLive, refreshNextMatch]);

	if (!payload.nextMatch) {
		if (payload.hasLive) {
			return (
				<Timer
					{...props}
					className={className}
					targetDate={new Date(payload.serverNow)}
					message="Match in play"
					subMessage="Check the live section below"
					disableUrgency
				/>
			);
		}
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
			onReachedZero={refreshOnKickoff}
		/>
	);
};
