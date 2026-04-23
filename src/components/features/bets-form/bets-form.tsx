"use client";

import type { FC } from "react";
import { useState } from "react";
import { useFormik } from "formik";
import type { Match, Bet, BetsFormValues } from "@/types/api";
import type { CardStatus } from "@/components/widgets/match-card";
import { MatchCard } from "@/components/widgets/match-card";
import { Button } from "@/components/shared/button";
import styles from "./bets-form.module.scss";

type Props = {
	matches: Match[];
	initialBets: Bet[];
};

function buildInitialValues(matches: Match[], bets: Bet[]): BetsFormValues {
	const betsMap = Object.fromEntries(bets.map((b) => [b.matchId, b]));
	const result: BetsFormValues["bets"] = {};

	for (const match of matches) {
		const existing = betsMap[match.id];
		result[match.id] = {
			home: existing?.home != null ? String(existing.home) : "",
			away: existing?.away != null ? String(existing.away) : "",
		};
	}
	return { bets: result };
}

function isValidScore(val: string): boolean {
	if (val === "") return false;
	const n = Number(val);
	return Number.isInteger(n) && n >= 0 && n <= 99;
}

export const BetsForm: FC<Props> = ({ matches, initialBets }) => {
	const [savedValues, setSavedValues] = useState<BetsFormValues>(() =>
		buildInitialValues(matches, initialBets)
	);

	const getMatchStatus = (
		matchId: string,
		currentValues: BetsFormValues,
		showErrors: boolean,
		errors: Record<string, string>
	): CardStatus => {
		if (showErrors && errors[matchId]) return "error";
		const cur = currentValues.bets[matchId];
		const sav = savedValues.bets[matchId];
		if (!cur || (cur.home === "" && cur.away === "")) return "default";
		if (cur.home === sav?.home && cur.away === sav?.away) return "saved";
		return "dirty";
	};

	const formik = useFormik<BetsFormValues>({
		initialValues: buildInitialValues(matches, initialBets),
		validate: (values) => {
			const betErrors: Record<string, string> = {};
			for (const match of matches) {
				const bet = values.bets[match.id];
				const home = bet?.home ?? "";
				const away = bet?.away ?? "";
				if (home === "" && away === "") continue;
				if (!isValidScore(home) || !isValidScore(away)) {
					betErrors[match.id] = "Both scores required";
				}
			}
			return Object.keys(betErrors).length ? { bets: betErrors } : {};
		},
		onSubmit: async (values) => {
			const bets: Bet[] = matches.map((match) => ({
				matchId: match.id,
				home:
					values.bets[match.id]?.home !== ""
						? Number(values.bets[match.id]?.home)
						: null,
				away:
					values.bets[match.id]?.away !== ""
						? Number(values.bets[match.id]?.away)
						: null,
			}));
			const res = await fetch("/api/bets", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ bets }),
			});
			if (res.ok) {
				setSavedValues(values);
			}
		},
	});

	const showErrors = formik.submitCount > 0;
	const betErrors = (formik.errors.bets ?? {}) as Record<string, string>;

	const handleClear = async () => {
		const empty = buildInitialValues(matches, []);
		await fetch("/api/bets", { method: "DELETE" });
		setSavedValues(empty);
		formik.resetForm({ values: empty });
	};

	return (
		<form onSubmit={formik.handleSubmit} className={styles.form}>
			<ul className={styles.list}>
				{matches.map((match) => (
					<li key={match.id}>
						<MatchCard
							match={match}
							homeFieldName={`bets.${match.id}.home`}
							awayFieldName={`bets.${match.id}.away`}
							homeValue={formik.values.bets[match.id]?.home ?? ""}
							awayValue={formik.values.bets[match.id]?.away ?? ""}
							status={getMatchStatus(
								match.id,
								formik.values,
								showErrors,
								betErrors
							)}
							onChange={formik.handleChange}
						/>
					</li>
				))}
			</ul>

			<p className={styles.hint}>Make your bets</p>

			<div className={styles.actions}>
				<Button
					type="submit"
					color="primary"
					isLoading={formik.isSubmitting}
					disabled={showErrors && Object.keys(betErrors).length > 0}
				>
					Save
				</Button>
				<Button type="button" variant="outline" onClick={handleClear}>
					Clear
				</Button>
			</div>
			<p
				className={styles.error}
				data-visible={
					(showErrors && Object.keys(betErrors).length > 0) || undefined
				}
			>
				Fix invalid bets before saving
			</p>
		</form>
	);
};
