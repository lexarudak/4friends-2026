"use client";

import { useState, useEffect, type FC, type HTMLAttributes } from "react";
import { cn } from "@/utils/lib";
import { TeamBadge } from "@/components/shared/team-badge";
import { useI18n } from "@/i18n/provider";
import styles from "./timer.module.scss";

type Props = HTMLAttributes<HTMLDivElement> & {
	targetDate: Date;
	message?: string;
	subMessage?: string;
	homeTeam?: string;
	homeFlag?: string;
	awayTeam?: string;
	awayFlag?: string;
	serverNowIso?: string;
	onReachedZero?: () => void;
	disableUrgency?: boolean;
};

type Countdown = {
	days: number;
	hours: number;
	mins: number;
	secs: number;
};

const pad = (n: number) => String(n).padStart(2, "0");

const computeCountdown = (targetDate: Date, nowMs: number): Countdown => {
	const diff = Math.max(0, (targetDate?.getTime() ?? 0) - nowMs);
	const totalSecs = Math.floor(diff / 1000);

	return {
		days: Math.floor(totalSecs / 86400),
		hours: Math.floor((totalSecs % 86400) / 3600),
		mins: Math.floor((totalSecs % 3600) / 60),
		secs: totalSecs % 60,
	};
};

const UNIT_KEYS: (keyof Countdown)[] = ["days", "hours", "mins", "secs"];

export const Timer: FC<Props> = ({
	targetDate,
	message,
	subMessage,
	homeTeam,
	homeFlag = "",
	awayTeam,
	awayFlag = "",
	serverNowIso,
	onReachedZero,
	disableUrgency = false,
	className,
	...props
}) => {
	const { t } = useI18n();
	const [countdown, setCountdown] = useState<Countdown | null>(null);
	const [serverClockBase, setServerClockBase] = useState<{
		serverNowMs: number;
		perfNowMs: number;
	} | null>(null);
	const [isServerClockReady, setIsServerClockReady] = useState(!serverNowIso);
	const [hasReachedZero, setHasReachedZero] = useState(false);

	useEffect(() => {
		if (!serverNowIso) {
			setServerClockBase(null);
			setIsServerClockReady(true);
			return;
		}

		const serverNowMs = Date.parse(serverNowIso);
		if (Number.isNaN(serverNowMs)) {
			setServerClockBase(null);
			setIsServerClockReady(true);
			return;
		}

		setServerClockBase({
			serverNowMs,
			perfNowMs: performance.now(),
		});
		setIsServerClockReady(true);
	}, [serverNowIso]);

	useEffect(() => {
		if (!isServerClockReady) return;

		const getNowMs = () => {
			if (!serverClockBase) return Date.now();
			return (
				serverClockBase.serverNowMs +
				(performance.now() - serverClockBase.perfNowMs)
			);
		};

		setCountdown(computeCountdown(targetDate, getNowMs()));
		const tick = () => setCountdown(computeCountdown(targetDate, getNowMs()));
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [targetDate, serverClockBase, isServerClockReady]);

	const totalSecs = countdown
		? countdown.days * 86400 +
			countdown.hours * 3600 +
			countdown.mins * 60 +
			countdown.secs
		: Infinity;

	useEffect(() => {
		if (!onReachedZero || !Number.isFinite(totalSecs)) return;

		if (totalSecs > 0) {
			if (hasReachedZero) setHasReachedZero(false);
			return;
		}

		if (hasReachedZero) return;

		setHasReachedZero(true);
		onReachedZero();
	}, [onReachedZero, totalSecs, hasReachedZero]);

	const urgency = disableUrgency
		? undefined
		: totalSecs < 600
			? "red"
			: totalSecs < 3600
				? "gold"
				: undefined;

	return (
		<div
			{...props}
			className={cn(styles.container, className)}
			data-urgency={urgency}
		>
			{(message || subMessage) && (
				<div className={styles.messageBlock}>
					{message && <p className={styles.message}>{message}</p>}
					{subMessage && <p className={styles.subMessage}>{subMessage}</p>}
				</div>
			)}
			{homeTeam && awayTeam && (
				<div className={styles.teams}>
					<TeamBadge name={homeTeam} flag={homeFlag} className={styles.team} />
					<span className={styles.vs}>VS</span>
					<TeamBadge name={awayTeam} flag={awayFlag} className={styles.team} />
				</div>
			)}
			<div className={styles.countdown}>
				{UNIT_KEYS.map((key) => (
					<div key={key} className={styles.unit}>
						<span className={styles.value}>{pad(countdown?.[key] ?? 0)}</span>
						<span className={styles.label}>{t.timer[key]}</span>
					</div>
				))}
			</div>
		</div>
	);
};
