import { PageTitle } from "@/components/shared/page-title";
import { StatCard } from "@/components/shared/stat-card";
import { BetHistoryList } from "@/components/widgets/bet-history-list";
import { PERSONAL_STATS } from "@/db/personal-statistic";
import { BET_HISTORY } from "@/db/bet-history";
import { auth } from "@/auth";
import styles from "./page.module.scss";

export default async function PersonalStatisticPage() {
	const session = await auth();
	const userName = session?.user?.name ?? "Player";

	return (
		<div className={styles.page}>
			<PageTitle title={userName} label="Personal statistic" />
			<div className={styles.grid}>
				{PERSONAL_STATS.map((stat) => (
					<StatCard
						key={stat.label}
						label={stat.label}
						value={stat.value}
						sub={stat.sub}
						size={stat.size}
						variant={stat.variant}
					/>
				))}
			</div>
			<div className={styles.history}>
				<BetHistoryList items={BET_HISTORY} />
			</div>
		</div>
	);
}
