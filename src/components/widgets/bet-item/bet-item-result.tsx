import type { FC } from "react";
import styles from "./bet-item.module.scss";

export type BetItemResultData = {
	home: number | null;
	away: number | null;
	points: number | null;
};

type Props = {
	result?: BetItemResultData | null;
};

export const BetItemResult: FC<Props> = ({ result }) => {
	const hasResult = result?.home != null && result?.away != null;

	return (
		<>
			<span className={styles.result}>
				{hasResult ? (
					<>
						<span className={styles.resultLabel}>Result</span>
						<span className={styles.resultScore}>
							{result!.home} : {result!.away}
						</span>
					</>
				) : (
					<span className={styles.resultLabel}>Pending</span>
				)}
			</span>

			<span className={styles.points}>
				{result?.points != null ? (
					<>
						<span className={styles.pointsValue}>{result.points}</span>
						<span className={styles.pointsLabel}>pts</span>
					</>
				) : (
					<span className={styles.pointsDash}>—</span>
				)}
			</span>
		</>
	);
};
