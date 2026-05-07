import { Button } from "@/components/shared/button";
import { PageContainer } from "@/components/shared/page-container";
import { PageTitle } from "@/components/shared/page-title";
import { hasAdminAccess } from "@/lib/admin-access";
import { PAGES } from "@/utils/constants";
import { AdminAccessForm } from "./admin-access-form";
import { lockAdmin } from "./actions";
import { AdminRoomsTable } from "@/app/admin/admin-rooms-table";
import styles from "./page.module.scss";

export default async function AdminPage() {
	const hasAccess = await hasAdminAccess();

	if (!hasAccess) {
		return (
			<div className={styles.page}>
				<div className={styles.card}>
					<p className={styles.eyebrow}>Restricted area</p>
					<h1 className={styles.title}>Admin access</h1>
					<p className={styles.subtitle}>
						Enter the password to unlock the admin page. On success we store the
						route path in a cookie and use that to show the page.
					</p>
					<AdminAccessForm />
				</div>
			</div>
		);
	}

	return (
		<PageContainer>
			<PageTitle title="Admin" label="Restricted area" />

			<div className={styles.content}>
				<div className={styles.panel}>
					<h2 className={styles.panelTitle}>Existing rooms</h2>
					<AdminRoomsTable />
				</div>

				<div className={styles.actions}>
					<Button href={PAGES.HOME} color="neutral" variant="outline">
						Back home
					</Button>
					<form action={lockAdmin}>
						<Button type="submit" color="red">
							Lock admin page
						</Button>
					</form>
				</div>
			</div>
		</PageContainer>
	);
}
