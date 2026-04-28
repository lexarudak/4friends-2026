import Link from "next/link";
import styles from "./page.module.scss";

const STORIES = [{ href: "/dev/bet-item", label: "BetItem", description: "Bet row — all status states" }];

export default function DevPage() {
	return (
		<div className={styles.page}>
			<h1 className={styles.title}>Component Stories</h1>
			<ul className={styles.storyList}>
				{STORIES.map(({ href, label, description }) => (
					<li key={href}>
						<Link href={href} className={styles.storyLink}>
							<span className={styles.storyLabel}>{label}</span>
							<span className={styles.storyDescription}>{description}</span>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

