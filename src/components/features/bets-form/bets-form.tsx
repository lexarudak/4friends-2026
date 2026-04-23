"use client";

import type { FC } from "react";
import { useFormik } from "formik";
import type { Match, Bet, BetsFormValues } from "@/types/api";
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

export const BetsForm: FC<Props> = ({ matches, initialBets }) => {
	const formik = useFormik<BetsFormValues>({
		initialValues: buildInitialValues(matches, initialBets),
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
			await fetch("/api/bets", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ bets }),
			});
		},
	});

	const handleClear = async () => {
		await fetch("/api/bets", { method: "DELETE" });
		const empty = buildInitialValues(matches, []);
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
							onChange={formik.handleChange}
						/>
					</li>
				))}
			</ul>

			<p className={styles.hint}>Make your bets</p>

			<div className={styles.actions}>
				<Button type="submit" color="primary" isLoading={formik.isSubmitting}>
					Save
				</Button>
				<Button type="button" variant="outline" onClick={handleClear}>
					Clear
				</Button>
			</div>
		</form>
	);
};
