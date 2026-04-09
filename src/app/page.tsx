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
						<Timer className={styles.a} />
					</div>
					<HeroSection />
					<HeroSection />
				</Section>
			</main>
		</>
	);
}
