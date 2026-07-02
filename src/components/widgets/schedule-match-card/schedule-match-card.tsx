"use client";

import type { FC } from "react";
import { TeamBadge } from "@/components/shared/team-badge";
import { LiveMinute } from "@/components/shared/live-minute";
import { LocalDateTime } from "@/components/shared/local-datetime";
import { isKnockoutRound } from "@/utils/knockout";
import { PaginatedTable } from "@/components/features/paginated-table";
import { useI18n } from "@/i18n/provider";
import styles from "./schedule-match-card.module.scss";

export type ScheduleBet = {
	userId: string;
	name: string;
	betHome: number;
	betAway: number;
	winPick?: "home" | "away" | null;
	points?: number | null;
};

export type ScheduleMatch = {
	id: string;
	group: string;
	time: string;
	date: string;
	/** ISO timestamp — formatted in the user's tz on the client. */
	dateIso?: string;
	home: { name: string; flag: string };
	away: { name: string; flag: string };
	/** null = not started, number = final or live score */
	resultHome?: number | null;
	resultAway?: number | null;
	/** "upcoming" | "live" | "finished" */
	status?: "upcoming" | "live" | "finished";
	minute?: number | null;
	/** Live phase code from API (1H/HT/2H/ET/BT/P/INT). Required for client minute rendering. */
	statusShort?: string | null;
	/** ISO of the most recent successful API sync — used for client-side minute projection. */
	lastSyncAt?: string | null;
	/** API winner field — true/false/null mapped to home/away/null. Accounts for ET and penalties. */
	winner?: "home" | "away" | null;
	/** Total goals including ET (differs from resultHome for AET matches). */
	goalsHome?: number | null;
	goalsAway?: number | null;
	/** Penalty shootout scores — set only for PEN matches. */
	penaltyHome?: number | null;
	penaltyAway?: number | null;
	bets?: ScheduleBet[];
};

type Props = {
	match: ScheduleMatch;
};

export const ScheduleMatchCard: FC<Props> = ({ match }) => {
	const { t } = useI18n();
	const status = match.status ?? "upcoming";
	const hasBets = !!match.bets && match.bets.length > 0;
	const hasResult = match.resultHome != null && match.resultAway != null;
	const isPlayoffMatch = isKnockoutRound(match.group);

	const getBasePoints = (bet: ScheduleBet) => {
		if (!hasResult) return null;

		if (bet.betHome === match.resultHome && bet.betAway === match.resultAway) {
			return 3;
		}

		const betDiff = bet.betHome - bet.betAway;
		const realDiff = match.resultHome! - match.resultAway!;

		if (betDiff === realDiff) return 2;

		const betOutcome = Math.sign(betDiff);
		const realOutcome = Math.sign(realDiff);

		if (betOutcome === realOutcome) return 1;

		return 0;
	};

	const getBonusPoints = (bet: ScheduleBet) => {
		if (!hasResult || !isPlayoffMatch || !bet.winPick) return 0;

		const winnerSide =
			match.resultHome! > match.resultAway!
				? "home"
				: match.resultHome! < match.resultAway!
					? "away"
					: null;

		if (!winnerSide) return 0;

		return bet.winPick === winnerSide ? 2 : 0;
	};

	const getTotalPoints = (bet: ScheduleBet) => {
		const basePoints = getBasePoints(bet);
		if (basePoints == null) return null;
		return basePoints + getBonusPoints(bet);
	};

	const getDisplayPoints = (bet: ScheduleBet) => {
		if (status === "live") {
			return getTotalPoints(bet) ?? 0;
		}

		return bet.points ?? getTotalPoints(bet) ?? 0;
	};

	const getBetStatus = (points: number) => {
		if (!hasResult) return "pending";
		if (points >= 5) return "bonus-5";
		if (points === 4) return "bonus-4";
		if (points === 3) return "exact";
		if (points === 2) return "win-2";
		if (points === 1) return "win-1";
		return "miss";
	};

	const getBetTag = (bet: ScheduleBet) => {
		const scoreTag = `${bet.betHome}:${bet.betAway}`;

		if (!isPlayoffMatch) {
			return scoreTag;
		}

		const markerPlaceholder = "\u00A0";
		const leftMarker =
			bet.betHome === bet.betAway && bet.winPick === "home"
				? "•"
				: markerPlaceholder;
		const rightMarker =
			bet.betHome === bet.betAway && bet.winPick === "away"
				? "•"
				: markerPlaceholder;

		return `${leftMarker} ${scoreTag} ${rightMarker}`;
	};

	const isDraw = hasResult && match.resultHome === match.resultAway;
	const advancingSide = isPlayoffMatch && isDraw ? (match.winner ?? null) : null;

	const hasPen = match.penaltyHome != null && match.penaltyAway != null;
	const hasAetGoals =
		!hasPen &&
		match.goalsHome != null &&
		match.goalsAway != null &&
		(match.goalsHome !== match.resultHome || match.goalsAway !== match.resultAway);
	const showExtra = advancingSide != null && (hasPen || hasAetGoals);

	const homeExtra = showExtra
		? hasPen
			? match.penaltyHome
			: match.goalsHome
		: null;
	const awayExtra = showExtra
		? hasPen
			? match.penaltyAway
			: match.goalsAway
		: null;
	const extraTypeLabel = hasPen ? t.schedule.pen : hasAetGoals ? t.schedule.aet : null;

	const sortedBets = hasBets
		? [...match.bets!].sort((a, b) => getDisplayPoints(b) - getDisplayPoints(a))
		: [];

	const betRows = sortedBets.map((bet, i) => {
		const points = getDisplayPoints(bet);

		return {
			position: i + 1,
			tag: getBetTag(bet),
			name: bet.name,
			score: points,
			status: getBetStatus(points),
		};
	});

	return (
		<div className={styles.card} data-status={status}>
			{/* Header row */}
			<div className={styles.header}>
				<span className={styles.group}>{match.group}</span>
				<span className={styles.statusLabel}>
					{status === "live" ? (
						t.schedule.inPlay
					) : status === "finished" ? (
						t.schedule.finished
					) : match.dateIso ? (
						<LocalDateTime iso={match.dateIso} mode="time" fallback={match.time} />
					) : (
						match.time
					)}
				</span>
				{status === "live" && (
					<LiveMinute
						className={styles.minute}
						statusShort={match.statusShort ?? "LIVE"}
						elapsed={match.minute ?? null}
						lastSyncAt={match.lastSyncAt ?? null}
					/>
				)}
				{status !== "live" &&
					(match.dateIso ? (
						<LocalDateTime
							className={styles.date}
							iso={match.dateIso}
							mode="date"
							fallback={match.date}
						/>
					) : (
						<span className={styles.date}>{match.date}</span>
					))}
			</div>

			{/* Score row */}
			<div
				className={styles.score}
				data-playoff={
					showExtra ? "extra" : advancingSide != null ? "dot" : undefined
				}
			>
				<div className={styles.teamRow}>
					<span className={styles.teamScore}>{match.resultHome ?? "–"}</span>
					{showExtra && (
						<span className={styles.extraScore}>({homeExtra})</span>
					)}
					{showExtra && (
						<span
							className={styles.extraLabel}
							data-hidden={advancingSide !== "home" || undefined}
						>
							{extraTypeLabel}
						</span>
					)}
					{!showExtra && advancingSide != null && (
						<span className={styles.advancingDot} aria-hidden>
							{advancingSide === "home" ? "•" : " "}
						</span>
					)}
					<TeamBadge
						size="s"
						name={match.home.name}
						flag={match.home.flag}
						className={styles.team}
					/>
				</div>
				<div className={styles.teamRow}>
					<span className={styles.teamScore}>{match.resultAway ?? "–"}</span>
					{showExtra && (
						<span className={styles.extraScore}>({awayExtra})</span>
					)}
					{showExtra && (
						<span
							className={styles.extraLabel}
							data-hidden={advancingSide !== "away" || undefined}
						>
							{extraTypeLabel}
						</span>
					)}
					{!showExtra && advancingSide != null && (
						<span className={styles.advancingDot} aria-hidden>
							{advancingSide === "away" ? "•" : " "}
						</span>
					)}
					<TeamBadge
						size="s"
						name={match.away.name}
						flag={match.away.flag}
						className={styles.team}
					/>
				</div>
			</div>

			{/* Bets table */}
			{hasBets && (
				<PaginatedTable
					rows={betRows}
					pageSize={5}
					tableClassName={styles.table}
					hidePosition
				/>
			)}
		</div>
	);
};
