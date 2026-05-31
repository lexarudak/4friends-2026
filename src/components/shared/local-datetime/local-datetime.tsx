"use client";

import { useEffect, useState, type FC } from "react";

type Props = {
	iso: string;
	/** Fallback text rendered on the server / before mount (avoids hydration mismatch). */
	fallback?: string;
	className?: string;
	withDate?: boolean;
};

/**
 * Renders a timestamp in the user's local timezone. Formats only after mount,
 * so SSR emits the fallback and there is no hydration mismatch.
 */
export const LocalDateTime: FC<Props> = ({
	iso,
	fallback = "",
	className,
	withDate = true,
}) => {
	const [text, setText] = useState(fallback);

	useEffect(() => {
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return;
		const time = new Intl.DateTimeFormat(undefined, {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		}).format(d);
		if (!withDate) {
			setText(time);
			return;
		}
		const date = new Intl.DateTimeFormat(undefined, {
			day: "2-digit",
			month: "2-digit",
			year: "2-digit",
		}).format(d);
		setText(`${date} ${time}`);
	}, [iso, withDate]);

	return <span className={className}>{text}</span>;
};
