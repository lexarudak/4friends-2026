import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.scss";
import { Analytics } from "@vercel/analytics/next";
import { ConditionalLayout } from "@/components/features/conditional-layout";
import { AppHeader } from "@/components/features/app-header";
import { NextMatchTimer } from "@/components/widgets/timer";
import { LiveSection } from "@/components/features/live-section";
import { TopTable } from "@/components/features/top-table";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionary";
import { I18nProvider } from "@/i18n/provider";

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
	const locale = await getLocale();
	const dict = getDictionary(locale);
	const header = await AppHeader();

	return (
		<html lang={locale}>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<I18nProvider locale={locale} dict={dict}>
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
				</I18nProvider>
				<Analytics />
			</body>
		</html>
	);
}
