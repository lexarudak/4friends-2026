"use client";

import { useState, useRef, useEffect, type FC } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { cn } from "@/utils/lib";
import styles from "./date-range-picker.module.scss";

type Props = {
	value: DateRange;
	onChange: (range: DateRange) => void;
	fromDate?: Date;
	toDate?: Date;
	className?: string;
};

function fmt(d?: Date): string {
	if (!d) return "—";
	return d.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "2-digit",
	});
}

export const DateRangePicker: FC<Props> = ({
	value,
	onChange,
	fromDate,
	toDate,
	className,
}) => {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div ref={ref} className={cn(styles.root, className)}>
			<button
				type="button"
				className={styles.trigger}
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
			>
				<span className={styles.triggerIcon}>📅</span>
				<span className={styles.range}>
					{fmt(value.from)} — {fmt(value.to)}
				</span>
				<span className={cn(styles.arrow, open && styles.arrowOpen)}>▾</span>
			</button>

			{open && (
				<div className={styles.popover}>
					<DayPicker
						mode="range"
						selected={value}
						onSelect={(r) => {
							if (r) onChange(r);
						}}
						startMonth={fromDate}
						endMonth={toDate}
						disabled={[
							...(fromDate ? [{ before: fromDate }] : []),
							...(toDate ? [{ after: toDate }] : []),
						]}
						classNames={{
							root: styles.picker,
							months: styles.months,
							month: styles.month,
							month_caption: styles.caption,
							caption_label: styles.captionLabel,
							nav: styles.nav,
							button_previous: styles.navBtn,
							button_next: styles.navBtn,
							month_grid: styles.table,
							weekdays: styles.headRow,
							weekday: styles.headCell,
							week: styles.row,
							day: styles.cell,
							day_button: styles.day,
							today: styles.today,
							selected: styles.selected,
							range_start: styles.rangeStart,
							range_end: styles.rangeEnd,
							range_middle: styles.rangeMiddle,
							outside: styles.outside,
							disabled: styles.disabled,
						}}
					/>
				</div>
			)}
		</div>
	);
};
