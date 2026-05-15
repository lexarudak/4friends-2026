import { HeroSection } from "@/components/features/hero-section";
import { BetsSection } from "@/components/features/bets-section";
import { Timer } from "@/components/widgets/timer/timer";
import { LiveSection } from "@/components/features/live-section";
import { TopTable } from "@/components/features/top-table";
import styles from "./page.module.scss";

export default async function Home() {
	return (
		<>
			<HeroSection />
			<div className={styles.mobileWidgetsTop}>
				<Timer
					targetDate={new Date("2026-06-11T20:00:00")}
					message="Next match — Group A · Opening"
					homeTeam="Mexico"
					homeFlag="🇲🇽"
					awayTeam="South Africa"
					awayFlag="🇿🇦"
				/>
			</div>
			<BetsSection />
			<div className={styles.mobileWidgetsBottom}>
				<LiveSection />
				<TopTable />
			</div>
		</>
	);
}
