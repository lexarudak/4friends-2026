import { getStatSections } from "@/db/room-statistic";
import { PaginatedTable } from "@/components/features/paginated-table";
import { PageTitle } from "@/components/shared/page-title";
import { auth } from "@/auth";
import styles from "./page.module.scss";

export default async function RoomStatisticPage() {
	const session = await auth();
	const userName = session?.user?.name ?? "me";
	const sections = getStatSections(userName);

	return (
		<div className={styles.page}>
			<PageTitle title="Statistic" label="Room overview" />
			<div className={styles.sections}>
				{sections.map((section) => (
					<PaginatedTable
						key={section.title}
						title={section.title}
						rows={section.rows}
						pageSize={10}
					/>
				))}
			</div>
		</div>
	);
}
