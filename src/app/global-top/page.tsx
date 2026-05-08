import { GlobalTopService } from "@/services/global-top.service";
import { PaginatedTable } from "@/components/features/paginated-table";
import { PageTitle } from "@/components/shared/page-title";
import { CrownIcon } from "@/components/icons";
import { auth } from "@/auth";
import styles from "./page.module.scss";

export default async function GlobalTopPage() {
	const session = await auth();
	const userId = session?.user?.email;
	const sections = await GlobalTopService.getSections(userId);

	return (
		<div className={styles.page}>
			<PageTitle title="Global Top" label="All rooms" icon={<CrownIcon />} />
			{sections.length === 0 ? (
				<p className={styles.empty}>
					No data yet — users will appear here soon.
				</p>
			) : (
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
			)}
		</div>
	);
}
