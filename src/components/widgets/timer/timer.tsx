"use client";

import { useState, useEffect, type FC, type HTMLAttributes } from "react";
import { cn } from "@/utils/lib";
import { TeamBadge } from "@/components/shared/team-badge";
import styles from "./timer.module.scss";

type Props = HTMLAttributes<HTMLDivElement> & {
	targetDate: Date;
	message?: string;
	homeTeam?: string;
	homeFlag?: string;
	awayTeam?: string;
	awayFlag?: string;
};

type Countdown = {
	days: number;
	hours: number;
	mins: number;
	secs: number;
};

const pad = (n: number) => String(n).padStart(2, "0");

const computeCountdown = (targetDate: Date): Countdown => {
	const diff = Math.max(0, (targetDate?.getTime() ?? 0) - Date.now());
	const totalSecs = Math.floor(diff / 1000);

	return {
		days: Math.floor(totalSecs / 86400),
		hours: Math.floor((totalSecs % 86400) / 3600),
		mins: Math.floor((totalSecs % 3600) / 60),
		secs: totalSecs % 60,
	};
};

const UNITS: { key: keyof Countdown; label: string }[] = [
	{ key: "days", label: "Days" },
	{ key: "hours", label: "Hours" },
	{ key: "mins", label: "mins" },
	{ key: "secs", label: "secs" },
];

export const Timer: FC<Props> = ({
	targetDate,
	message,
	homeTeam,
	homeFlag = "",
	awayTeam,
	awayFlag = "",
	className,
	...props
}) => {
	const [countdown, setCountdown] = useState<Countdown | null>(null);

	useEffect(() => {
		setCountdown(computeCountdown(targetDate));
		const tick = () => setCountdown(computeCountdown(targetDate));
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [targetDate]);

	const totalSecs = countdown
		? countdown.days * 86400 +
			countdown.hours * 3600 +
			countdown.mins * 60 +
			countdown.secs
		: Infinity;
	const urgency =
		totalSecs < 600 ? "red" : totalSecs < 3600 ? "gold" : undefined;

	return (
		<div
			{...props}
			className={cn(styles.container, className)}
			data-urgency={urgency}
		>
			{message && <p className={styles.message}>{message}</p>}
			{homeTeam && awayTeam && (
				<div className={styles.teams}>
					<TeamBadge name={homeTeam} flag={homeFlag} className={styles.team} />
					<span className={styles.vs}>VS</span>
					<TeamBadge name={awayTeam} flag={awayFlag} className={styles.team} />
				</div>
			)}
			<div className={styles.countdown}>
				{UNITS.map(({ key, label }) => (
					<div key={key} className={styles.unit}>
						<span className={styles.value}>{pad(countdown?.[key] ?? 0)}</span>
						<span className={styles.label}>{label}</span>
					</div>
				))}
			</div>
		</div>
	);
};
