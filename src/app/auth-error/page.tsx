import Link from "next/link";
import { PAGES } from "@/utils/constants";
import styles from "./page.module.scss";

type Props = {
	searchParams: Promise<{ error?: string }>;
};

export default async function AuthErrorPage({ searchParams }: Props) {
	const { error } = await searchParams;

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				<h1 className={styles.title}>Authentication Error</h1>
				{error && (
					<p className={styles.code}>
						Error code: <code>{error}</code>
					</p>
				)}
				<p className={styles.hint}>Check the server logs for full details.</p>
				<Link href={PAGES.LOGIN} className={styles.link}>
					← Back to login
				</Link>
			</div>
		</div>
	);
}
