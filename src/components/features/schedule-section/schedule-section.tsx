"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import type { DateRange } from "react-day-picker";
import type { ScheduleMatch } from "@/components/widgets/schedule-match-card";
import { ScheduleMatchCard } from "@/components/widgets/schedule-match-card";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Button } from "@/components/shared/button";
import { PageTitle } from "@/components/shared/page-title";
import styles from "./schedule-section.module.scss";

type Props = {
	matches: ScheduleMatch[];
};

function parseDDMMYY(date: string): Date {
	const [d, m, y] = date.split("/").map(Number);
	return new Date(2000 + y, m - 1, d);
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
	const today = new Date();
	const minDate = new Date(2026, 5, 11);
	const maxDate = new Date(2026, 6, 19);
	const defaultRange: DateRange = { from: today, to: today };

	const [range, setRange] = useState<DateRange>(defaultRange);
	const [countryInput, setCountryInput] = useState("");
	const debouncedCountry = useDebounce(countryInput.trim().toLowerCase(), 300);

	const filtered = useMemo(() => {
		const from = range.from;
		const to = range.to ?? range.from;
		return matches.filter((m) => {
			const d = parseDDMMYY(m.date);
			if (from && d < new Date(from.getFullYear(), from.getMonth(), from.getDate())) return false;
			if (to) {
				const toEnd = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59);
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
	}, [matches, range, debouncedCountry]);

	const handleClear = () => {
		setRange(defaultRange);
		setCountryInput("");
	};

	return (
		<div className={styles.section}>
			<PageTitle label="FIFA World Cup 2026" title="Matchdays" />

			{/* Filters */}
			<div className={styles.filters}>
				<DateRangePicker
					value={range}
					onChange={setRange}
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
					<Button variant="outline" color="neutral" size="md" onClick={handleClear}>
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
