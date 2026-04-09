"use client";

import {
	Fragment,
	useState,
	useEffect,
	type FC,
	type HTMLAttributes,
} from "react";
import { cn } from "@/utils/lib";
import styles from "./timer.module.scss";
import { ShadowCard } from "@/components/shared/shadow-card";

type Props = HTMLAttributes<HTMLDivElement> & {
	targetDate: Date;
	message?: string;
	homeTeam?: string;
	awayTeam?: string;
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
	awayTeam,
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

	return (
		<ShadowCard
			{...props}
			className={cn(styles.container, className)}
			color="neutral"
		>
			{message && <p className={styles.message}>{message}</p>}
			{homeTeam && awayTeam && (
				<div className={styles.teams}>
					<span className={styles.team}>{homeTeam}</span>
					<span className={styles.vs}>vs</span>
					<span className={styles.team}>{awayTeam}</span>
				</div>
			)}
			<div className={styles.countdown}>
				{UNITS.map(({ key, label }, i) => (
					<Fragment key={key}>
						{i > 0 && (
							<span className={styles.sep} aria-hidden>
								:
							</span>
						)}
						<div className={styles.unit}>
							<span className={styles.label}>{label}</span>
							<span className={styles.value}>{pad(countdown?.[key] ?? 0)}</span>
						</div>
					</Fragment>
				))}
			</div>
		</ShadowCard>
	);
};
