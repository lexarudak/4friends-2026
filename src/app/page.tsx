import { HeroSection } from "@/components/features/hero-section";
import { BetsSection } from "@/components/features/bets-section";
import { NextMatchTimer } from "@/components/widgets/timer";
import { LiveSection } from "@/components/features/live-section";
import { TopTable } from "@/components/features/top-table";
import styles from "./page.module.scss";

export default async function Home() {
	return (
		<>
			<HeroSection />
			<div className={styles.mobileWidgetsTop}>
				<NextMatchTimer />
				<LiveSection />
			</div>
			<BetsSection />
			<div className={styles.mobileWidgetsBottom}>
				<TopTable />
			</div>
		</>
	);
}
