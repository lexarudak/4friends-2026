"use client";

import { useEffect, useState, type FC } from "react";

type Mode = "time" | "date" | "datetime";

type Props = {
	iso: string;
	mode?: Mode;
	/** Fallback text rendered on the server / before mount (avoids hydration mismatch). */
	fallback?: string;
	className?: string;
};

function format(iso: string, mode: Mode): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	const time = new Intl.DateTimeFormat(undefined, {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(d);
	const date = new Intl.DateTimeFormat(undefined, {
		day: "2-digit",
		month: "2-digit",
		year: "2-digit",
	}).format(d);
	if (mode === "time") return time;
	if (mode === "date") return date;
	return `${date} ${time}`;
}

/**
 * Renders a timestamp in the user's local timezone. Formats only after mount,
 * so SSR emits the fallback and there is no hydration mismatch.
 */
export const LocalDateTime: FC<Props> = ({
	iso,
	mode = "datetime",
	fallback = "",
	className,
}) => {
	const [text, setText] = useState(fallback);

	useEffect(() => {
		setText(format(iso, mode));
	}, [iso, mode]);

	return <span className={className}>{text}</span>;
};
