import { getGlobalTopSections } from "@/db/global-top";
import { PaginatedTable } from "@/components/features/paginated-table";
import { PageTitle } from "@/components/shared/page-title";
import { CrownIcon } from "@/components/icons";
import { auth } from "@/auth";
import styles from "./page.module.scss";

export default async function GlobalTopPage() {
	const session = await auth();
	const userName = session?.user?.name ?? "me";
	const sections = getGlobalTopSections(userName);

	return (
		<div className={styles.page}>
			<PageTitle title="Global Top" label="All rooms" icon={<CrownIcon />} />
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
