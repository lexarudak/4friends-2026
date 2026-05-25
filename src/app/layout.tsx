import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.scss";
import { Analytics } from "@vercel/analytics/next";
import { ConditionalLayout } from "@/components/features/conditional-layout";
import { AppHeader } from "@/components/features/app-header";
import { NextMatchTimer } from "@/components/widgets/timer";
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

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const header = await AppHeader();

	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<ConditionalLayout
					header={header}
					sidebar={
						<>
							<NextMatchTimer />
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
