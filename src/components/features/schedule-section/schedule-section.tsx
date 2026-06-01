"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import type { ScheduleMatch } from "@/components/widgets/schedule-match-card";
import { ScheduleMatchCard } from "@/components/widgets/schedule-match-card";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Button } from "@/components/shared/button";
import { PageTitle } from "@/components/shared/page-title";
import styles from "./schedule-section.module.scss";

type ReadonlyURLSearchParams = ReturnType<typeof useSearchParams>;

type Props = {
	matches: ScheduleMatch[];
};

function parseDDMMYY(date: string): Date {
	const [d, m, y] = date.split("/").map(Number);
	return new Date(2000 + y, m - 1, d);
}

function parseISODateParam(value: string | null): Date | null {
	if (!value) return null;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

	const [y, m, d] = value.split("-").map(Number);
	const dt = new Date(y, m - 1, d);

	if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
		return null;
	}

	return dt;
}

function isWithinRange(value: Date, minDate: Date, maxDate: Date): boolean {
	return value >= minDate && value <= maxDate;
}

function formatISODateParam(value: Date | undefined): string | null {
	if (!value) return null;
	const y = value.getFullYear();
	const m = String(value.getMonth() + 1).padStart(2, "0");
	const d = String(value.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function clampDate(value: Date, minDate: Date, maxDate: Date): Date {
	if (value < minDate) return minDate;
	if (value > maxDate) return maxDate;
	return value;
}

function normalizeRange(
	range: DateRange,
	defaultRange: DateRange,
	minDate: Date,
	maxDate: Date
): DateRange {
	const from = range.from
		? clampDate(range.from, minDate, maxDate)
		: defaultRange.from;
	const toRaw = range.to ? clampDate(range.to, minDate, maxDate) : from;

	if (!from || !toRaw) return defaultRange;
	return from > toRaw ? { from: toRaw, to: from } : { from, to: toRaw };
}

function rangeFromSearchParams(
	searchParams: ReadonlyURLSearchParams,
	defaultRange: DateRange,
	minDate: Date,
	maxDate: Date
): { range: DateRange; isValid: boolean } {
	const hasFrom = searchParams.has("from");
	const hasTo = searchParams.has("to");
	const hasDateParams = hasFrom || hasTo;

	const fromParam = parseISODateParam(searchParams.get("from"));
	const toParam = parseISODateParam(searchParams.get("to"));
	const fromRaw = searchParams.get("from");
	const toRaw = searchParams.get("to");

	if (!hasDateParams) return { range: defaultRange, isValid: true };

	if ((hasFrom && !fromParam) || (hasTo && !toParam)) {
		return { range: defaultRange, isValid: false };
	}

	if (
		(fromParam && !isWithinRange(fromParam, minDate, maxDate)) ||
		(toParam && !isWithinRange(toParam, minDate, maxDate))
	) {
		return { range: defaultRange, isValid: false };
	}

	if (fromRaw && fromParam && formatISODateParam(fromParam) !== fromRaw) {
		return { range: defaultRange, isValid: false };
	}

	if (toRaw && toParam && formatISODateParam(toParam) !== toRaw) {
		return { range: defaultRange, isValid: false };
	}

	if (!fromParam && !toParam) return { range: defaultRange, isValid: true };

	if (fromParam && toParam && fromParam > toParam) {
		return { range: defaultRange, isValid: false };
	}

	return {
		range: normalizeRange(
			{
				from: fromParam ?? toParam ?? defaultRange.from,
				to: toParam ?? fromParam ?? defaultRange.to,
			},
			defaultRange,
			minDate,
			maxDate
		),
		isValid: true,
	};
}

function useDebounce<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState(value);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
	useEffect(() => {
		timer.current = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer.current);
	}, [value, delay]);
	return debounced;
}

export const ScheduleSection = ({ matches }: Props) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const minDate = useMemo(() => new Date(2026, 4, 1), []);
	const maxDate = useMemo(() => new Date(2026, 6, 19), []);
	const defaultRange = useMemo<DateRange>(() => {
		const today = new Date();
		const defaultTo = maxDate;
		const defaultFrom = today < minDate ? minDate : today;
		return { from: defaultFrom, to: defaultTo };
	}, [minDate, maxDate]);

	const [countryInput, setCountryInput] = useState("");
	const debouncedCountry = useDebounce(countryInput.trim().toLowerCase(), 300);

	const range = useMemo(
		() => rangeFromSearchParams(searchParams, defaultRange, minDate, maxDate),
		[searchParams, defaultRange, minDate, maxDate]
	);

	useEffect(() => {
		const hasDateParams = searchParams.has("from") || searchParams.has("to");
		if (!hasDateParams || range.isValid) return;

		const nextParams = new URLSearchParams(searchParams.toString());
		nextParams.delete("from");
		nextParams.delete("to");

		const query = nextParams.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, {
			scroll: false,
		});
	}, [range.isValid, searchParams, router, pathname]);

	const updateRangeAndQuery = (next: DateRange) => {
		const normalized = normalizeRange(next, defaultRange, minDate, maxDate);

		const nextFrom = formatISODateParam(normalized.from);
		const nextTo = formatISODateParam(normalized.to);
		const nextParams = new URLSearchParams(searchParams.toString());

		if (nextFrom) nextParams.set("from", nextFrom);
		else nextParams.delete("from");

		if (nextTo) nextParams.set("to", nextTo);
		else nextParams.delete("to");

		const query = nextParams.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, {
			scroll: false,
		});
	};

	const filtered = useMemo(() => {
		const from = range.range.from;
		const to = range.range.to ?? range.range.from;
		return matches.filter((m) => {
			const d = parseDDMMYY(m.date);
			if (
				from &&
				d < new Date(from.getFullYear(), from.getMonth(), from.getDate())
			)
				return false;
			if (to) {
				const toEnd = new Date(
					to.getFullYear(),
					to.getMonth(),
					to.getDate(),
					23,
					59,
					59
				);
				if (d > toEnd) return false;
			}
			if (debouncedCountry) {
				const matchesCountry =
					m.home.name.toLowerCase().includes(debouncedCountry) ||
					m.away.name.toLowerCase().includes(debouncedCountry);
				if (!matchesCountry) return false;
			}
			return true;
		});
	}, [matches, range.range, debouncedCountry]);

	const handleClear = () => {
		updateRangeAndQuery(defaultRange);
		setCountryInput("");
	};

	return (
		<div className={styles.section}>
			<PageTitle label="FIFA World Cup 2026" title="Matchdays" />

			{/* Filters */}
			<div className={styles.filters}>
				<DateRangePicker
					value={range.range}
					onChange={updateRangeAndQuery}
					fromDate={minDate}
					toDate={maxDate}
				/>
				<p className={styles.filterHint}>Select date range to show</p>

				<input
					className={styles.countryInput}
					type="text"
					placeholder="Filter by country…"
					value={countryInput}
					onChange={(e) => setCountryInput(e.target.value)}
				/>

				<div className={styles.actions}>
					<Button
						variant="outline"
						color="neutral"
						size="md"
						onClick={handleClear}
					>
						Clear
					</Button>
				</div>
			</div>

			{/* Match list */}
			<ul className={styles.list}>
				{filtered.length === 0 ? (
					<li className={styles.empty}>No matches for selected range</li>
				) : (
					filtered.map((match) => (
						<li key={match.id}>
							<ScheduleMatchCard match={match} />
						</li>
					))
				)}
			</ul>
		</div>
	);
};
