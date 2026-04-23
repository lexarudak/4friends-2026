import { AppHeader } from "@/components/features/app-header";
import { HeroSection } from "@/components/features/hero-section";
import styles from "./page.module.scss";
import { Timer } from "@/components/widgets/timer/timer";
import { BetsSection } from "@/components/features/bets-section";

export default async function Home() {
	return (
		<>
			<AppHeader />

			<main className={styles.main}>
				<div className={styles.layout}>
					<div className={styles.left}>
						<HeroSection />
						<BetsSection />
					</div>
					<div className={styles.right}>
						<Timer
							targetDate={new Date("2026-06-11T20:00:00")}
							message="Next match — Group A · Opening"
							homeTeam="Mexico"
							awayTeam="USA"
						/>
					</div>
				</div>
			</main>
		</>
	);
}
