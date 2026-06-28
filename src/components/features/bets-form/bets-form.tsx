"use client";

import type { FC } from "react";
import { useMemo, useState, useEffect } from "react";
import { useFormik } from "formik";
import type { Match, Bet, BetsFormValues } from "@/types/api";
import type { CardStatus } from "@/components/widgets/match-card";
import { MatchCard } from "@/components/widgets/match-card";
import { Button } from "@/components/shared/button";
import { requestApi } from "@/utils/api-client";
import { isKnockoutRound } from "@/utils/knockout";
import { useI18n } from "@/i18n/provider";
import styles from "./bets-form.module.scss";

type Props = {
	matches: Match[];
	initialBets: Bet[];
};

function isPlayoffMatch(match: Match): boolean {
	return isKnockoutRound(match.group);
}

function getAutoWinner(home: string, away: string): "home" | "away" | "" {
	if (!isValidScore(home) || !isValidScore(away)) return "";
	const homeScore = Number(home);
	const awayScore = Number(away);
	if (homeScore === awayScore) return "";
	return homeScore > awayScore ? "home" : "away";
}

function buildInitialValues(matches: Match[], bets: Bet[]): BetsFormValues {
	const betsMap = Object.fromEntries(bets.map((b) => [b.matchId, b]));
	const result: BetsFormValues["bets"] = {};

	for (const match of matches) {
		const existing = betsMap[match.id];
		const home = existing?.home != null ? String(existing.home) : "";
		const away = existing?.away != null ? String(existing.away) : "";
		const autoWinner = isPlayoffMatch(match) ? getAutoWinner(home, away) : "";
		result[match.id] = {
			home,
			away,
			winPick: existing?.winPick ?? autoWinner,
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
	const { t } = useI18n();
	const reinitializedValues = useMemo(
		() => buildInitialValues(matches, initialBets),
		[matches, initialBets]
	);

	const [savedValues, setSavedValues] = useState<BetsFormValues>(
		() => reinitializedValues
	);

	useEffect(() => {
		setSavedValues(reinitializedValues);
	}, [reinitializedValues]);

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
		if (
			cur.home === sav?.home &&
			cur.away === sav?.away &&
			cur.winPick === sav?.winPick
		)
			return "saved";
		return "dirty";
	};

	const formik = useFormik<BetsFormValues>({
		initialValues: reinitializedValues,
		enableReinitialize: true,
		validate: (values) => {
			const betErrors: Record<string, string> = {};
			for (const match of matches) {
				const bet = values.bets[match.id];
				const home = bet?.home ?? "";
				const away = bet?.away ?? "";
				const winPick = bet?.winPick ?? "";
				if (home === "" && away === "") continue;
				if (!isValidScore(home) || !isValidScore(away)) {
					betErrors[match.id] = "Both scores required";
					continue;
				}

				if (
					isPlayoffMatch(match) &&
					Number(home) === Number(away) &&
					winPick === ""
				) {
					betErrors[match.id] = "Pick winner";
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
				winPick: (() => {
					const bet = values.bets[match.id];
					if (!bet) return null;
					if (!isPlayoffMatch(match)) return null;
					if (!isValidScore(bet.home) || !isValidScore(bet.away)) return null;
					const autoWinner = getAutoWinner(bet.home, bet.away);
					if (autoWinner !== "") return autoWinner;
					return bet.winPick === "" ? null : bet.winPick;
				})(),
			}));
			const res = await requestApi("/api/bets", {
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

	const handleScoreChange = (
		match: Match,
		side: "home" | "away",
		value: string
	) => {
		const basePath = `bets.${match.id}`;
		formik.setFieldValue(`${basePath}.${side}`, value);

		if (!isPlayoffMatch(match)) return;

		const current = formik.values.bets[match.id] ?? {
			home: "",
			away: "",
			winPick: "",
		};
		const nextHome = side === "home" ? value : (current.home ?? "");
		const nextAway = side === "away" ? value : (current.away ?? "");
		const autoWinner = getAutoWinner(nextHome, nextAway);

		if (autoWinner !== "") {
			formik.setFieldValue(`${basePath}.winPick`, autoWinner);
			return;
		}

		formik.setFieldValue(`${basePath}.winPick`, "");
	};

	const handleClear = () => {
		// Form-only: clear the visible inputs without touching the backend.
		// Saved bets stay in the DB until the user explicitly Saves. (Previously
		// this called DELETE /api/bets, which wiped the user's entire bet history
		// in the room — including finished matches not shown in the form.)
		const empty = buildInitialValues(matches, []);
		formik.resetForm({ values: empty });
	};

	return (
		<form onSubmit={formik.handleSubmit} className={styles.form}>
			<ul className={styles.list}>
				{matches.map((match) =>
					(() => {
						const rawCurrentBet = formik.values.bets[match.id] ?? {
							home: "",
							away: "",
							winPick: "",
						};
						const currentBet = {
							home: rawCurrentBet.home ?? "",
							away: rawCurrentBet.away ?? "",
							winPick: rawCurrentBet.winPick ?? "",
						};
						const autoWinner = isPlayoffMatch(match)
							? getAutoWinner(currentBet.home, currentBet.away)
							: "";
						const effectiveWinner =
							autoWinner !== "" ? autoWinner : currentBet.winPick;

						return (
							<MatchCard
								key={match.id}
								match={match}
								homeFieldName={`bets.${match.id}.home`}
								awayFieldName={`bets.${match.id}.away`}
								winnerFieldName={`bets.${match.id}.winPick`}
								homeValue={currentBet.home}
								awayValue={currentBet.away}
								winnerValue={effectiveWinner}
								isPlayoff={isPlayoffMatch(match)}
								winnerDisabled={autoWinner !== ""}
								status={getMatchStatus(
									match.id,
									formik.values,
									showErrors,
									betErrors
								)}
								onChange={formik.handleChange}
								onScoreChange={(side, value) =>
									handleScoreChange(match, side, value)
								}
							/>
						);
					})()
				)}
			</ul>

			<p className={styles.hint}>{t.home.makeBets}</p>

			<div className={styles.actions}>
				<Button
					type="submit"
					color="primary"
					size="lg"
					isLoading={formik.isSubmitting}
					disabled={showErrors && Object.keys(betErrors).length > 0}
				>
					{t.home.save}
				</Button>
				<Button type="button" variant="outline" size="lg" onClick={handleClear}>
					{t.home.clear}
				</Button>
			</div>
			<p
				className={styles.error}
				data-visible={
					(showErrors && Object.keys(betErrors).length > 0) || undefined
				}
			>
				{t.home.fixInvalid}
			</p>
		</form>
	);
};
