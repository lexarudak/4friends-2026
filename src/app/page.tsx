import { HeroSection } from "@/components/features/hero-section";
import { BetsSection } from "@/components/features/bets-section";

export default async function Home() {
	return (
		<>
			<HeroSection />
			<BetsSection />
		</>
	);
}
