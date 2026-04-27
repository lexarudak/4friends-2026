import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.scss";
import { Analytics } from "@vercel/analytics/next";
import { AppHeader } from "@/components/features/app-header";
import { Timer } from "@/components/widgets/timer/timer";
import { LiveSection } from "@/components/features/live-section";
import { TopTable } from "@/components/features/top-table";
import styles from "./layout.module.scss";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "4friends",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<AppHeader />
				<main className={styles.main}>
					<div className={styles.layout}>
						<div className={styles.left}>{children}</div>
						<div className={styles.right}>
							<Timer
								targetDate={new Date("2026-06-11T20:00:00")}
								message="Next match — Group A · Opening"
								homeTeam="Mexico 🇲🇽"
								awayTeam="🇿🇦 South Africa"
							/>
							<LiveSection />
							<TopTable />
						</div>
					</div>
				</main>
				<Analytics />
			</body>
		</html>
	);
}
