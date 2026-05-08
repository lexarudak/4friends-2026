import { PageTitle } from "@/components/shared/page-title";
import { StatCard } from "@/components/shared/stat-card";
import { BetHistoryList } from "@/components/widgets/bet-history-list";
import { auth } from "@/auth";
import { getActiveRoomId } from "@/lib/active-room";
import {
	getDefaultPersonalStatisticData,
	PersonalStatisticService,
} from "@/services/personal-statistic.service";
import styles from "./page.module.scss";

export default async function PersonalStatisticPage() {
	const session = await auth();
	const userId = session?.user?.email;
	const roomId = await getActiveRoomId();
	const userName = session?.user?.name ?? "Player";
	const data =
		userId && roomId
			? await PersonalStatisticService.getPersonalStatistic(userId, roomId)
			: getDefaultPersonalStatisticData();

	return (
		<div className={styles.page}>
			<PageTitle title={userName} label="Personal statistic" />
			<div className={styles.grid}>
				{data.stats.map((stat) => (
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
				<BetHistoryList items={data.history} />
			</div>
		</div>
	);
}
