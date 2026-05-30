"use client";

import { useEffect, useState, type FC } from "react";
import { computeLiveMinute } from "@/utils/live-minute";

type Props = {
	statusShort: string;
	elapsed: number | null;
	lastSyncAt: string | null;
	className?: string;
};

export const LiveMinute: FC<Props> = ({
	statusShort,
	elapsed,
	lastSyncAt,
	className,
}) => {
	const lastSyncMs = lastSyncAt ? Date.parse(lastSyncAt) : null;
	const [label, setLabel] = useState(() =>
		computeLiveMinute(statusShort, elapsed, lastSyncMs)
	);

	useEffect(() => {
		const tick = () =>
			setLabel(computeLiveMinute(statusShort, elapsed, lastSyncMs));
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	}, [statusShort, elapsed, lastSyncMs]);

	return <span className={className}>{label}</span>;
};
