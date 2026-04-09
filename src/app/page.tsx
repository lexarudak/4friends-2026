import { TableService } from "@/services/table.service";
import { AppHeader } from "@/components/features/app-header";
import { HeroSection } from "@/components/features/hero-section";
import styles from "./page.module.scss";
import { Section } from "@/components/shared/section";
import { Timer } from "@/components/widgets/timer/timer";

export default async function Home() {
	const table = await TableService.getSmallTable();

	return (
		<>
			<AppHeader />

			<main className={styles.main}>
				<Section className={styles.grid}>
					<HeroSection />
					<div className={styles.secondChild}>
						<Timer
							className={styles.timer}
							targetDate={new Date("2026-06-11T20:00:00")}
							message="Next match — Group A · Opening"
							homeTeam="Mexico"
							awayTeam="USA"
						/>
					</div>
					<HeroSection />
					<HeroSection />
				</Section>
			</main>
		</>
	);
}
