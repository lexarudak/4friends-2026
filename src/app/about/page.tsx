import Link from "next/link";
import { PageTitle } from "@/components/shared/page-title";
import { Button } from "@/components/shared/button";
import { PAGES } from "@/utils/constants";
import styles from "./page.module.scss";

export default function AboutPage() {
	return (
		<div className={styles.page}>
			<div className={styles.inner}>
				<nav className={styles.nav}>
					<Button href={PAGES.HOME} variant="outline" color="neutral" size="md">
						← Home
					</Button>
					<Button
						href={PAGES.LOGIN}
						variant="outline"
						color="primary"
						size="md"
					>
						Start →
					</Button>
				</nav>

				<PageTitle label="How it works" title="Rules" />

				<div className={styles.intro}>
					<p className={styles.introText}>
						4friends is a platform for competitions with friends. Make
						predictions for World Cup 2026 matches, earn points, follow the
						statistics and win! You decide what the prize pool will be and how
						it&apos;s distributed — we make sure the game is fair and all
						results are calculated on time.
					</p>
				</div>

				<div className={styles.sections}>
					{/* Place a bet */}
					<section className={styles.section}>
						<h2 className={styles.sectionTitle}>Place a bet</h2>
						<p className={styles.sectionText}>
							When there are 48 hours left until a match, it appears on the main
							page. You can make and save your prediction before it kicks off.
						</p>
						<ul className={styles.statusList}>
							<li className={styles.statusItem}>
								<span className={styles.dot} data-color="grey" />
								Grey — bet is not placed
							</li>
							<li className={styles.statusItem}>
								<span className={styles.dot} data-color="yellow" />
								Yellow — bet is being edited
							</li>
							<li className={styles.statusItem}>
								<span className={styles.dot} data-color="green" />
								Green — bet is saved
							</li>
						</ul>
					</section>

					{/* Match statuses */}
					<section className={styles.section}>
						<h2 className={styles.sectionTitle}>Match statuses</h2>
						<p className={styles.sectionText}>
							After a match kicks off, you can see the bets made by other
							players. Match cards are color-coded too:
						</p>
						<ul className={styles.statusList}>
							<li className={styles.statusItem}>
								<span className={styles.dot} data-color="grey" />
								Grey — match has not started yet
							</li>
							<li className={styles.statusItem}>
								<span className={styles.dot} data-color="red" />
								Red — match is live right now
							</li>
							<li className={styles.statusItem}>
								<span className={styles.dot} data-color="green" />
								Green — match has ended
							</li>
						</ul>
					</section>

					{/* Point calculation — Group stage */}
					<section className={styles.section}>
						<h2 className={styles.sectionTitle}>
							Point calculation — Group stage
						</h2>
						<p className={styles.sectionText}>
							Points are awarded based on how accurate your prediction was:
						</p>
						<div className={styles.pointsGrid}>
							<span className={styles.pointsBadge}>3</span>
							<p className={styles.pointsLabel}>
								Exact score and correct winner
							</p>
							<span className={styles.pointsBadge}>2</span>
							<p className={styles.pointsLabel}>
								Correct winner and goal difference, but not the exact score
							</p>
							<span className={styles.pointsBadge}>1</span>
							<p className={styles.pointsLabel}>
								Correct outcome (win / draw / loss), but wrong goal difference
							</p>
							<span className={styles.pointsBadge}>0</span>
							<p className={styles.pointsLabel}>Incorrect outcome</p>
						</div>
					</section>

					{/* Point calculation — Playoffs */}
					<section className={styles.section}>
						<h2 className={styles.sectionTitle}>
							Point calculation — Playoffs
						</h2>
						<p className={styles.sectionText}>
							Points follow the same 3-2-1 system based on the final scoreboard
							result — regardless of whether the match ended in regular time or
							extra time.
						</p>
						<p className={styles.sectionText}>
							The <strong>win</strong> checkbox gives{" "}
							<strong>+2 bonus points</strong> if you correctly predicted which
							team advances to the next round.
						</p>
					</section>

					{/* Statistics */}
					<section className={styles.section}>
						<h2 className={styles.sectionTitle}>Statistics</h2>
						<p className={styles.sectionText}>
							On the Statistics page you&apos;ll find the main leaderboard plus
							breakdowns: guessed victories, exact scores, and average points
							per match.
						</p>
						<p className={styles.sectionText}>
							The Overall Rating shows the global ranking across all rooms. If
							you&apos;re in multiple rooms, your best result counts.
						</p>
					</section>
				</div>

				<div className={styles.footer}>
					<p className={styles.footerText}>
						Good luck! To launch a room for your friends, contact{" "}
						<Link href="https://t.me/friendseuro2024">@friendseuro2024</Link> on
						Telegram.
					</p>
					<Button href={PAGES.LOGIN} color="primary" size="lg">
						Start playing →
					</Button>
				</div>
			</div>
		</div>
	);
}
