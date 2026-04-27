import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.scss";
import { Analytics } from "@vercel/analytics/next";
import { ConditionalLayout } from "@/components/features/conditional-layout";
import { AppHeader } from "@/components/features/app-header";
import { Timer } from "@/components/widgets/timer/timer";
import { LiveSection } from "@/components/features/live-section";
import { TopTable } from "@/components/features/top-table";

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
				<ConditionalLayout
					header={<AppHeader />}
					sidebar={
						<>
							<Timer
								targetDate={new Date("2026-06-11T20:00:00")}
								message="Next match — Group A · Opening"
								homeTeam="Mexico"
								homeFlag="🇲🇽"
								awayTeam="South Africa"
								awayFlag="🇿🇦"
							/>
							<LiveSection />
							<TopTable />
						</>
					}
				>
					{children}
				</ConditionalLayout>
				<Analytics />
			</body>
		</html>
	);
}
