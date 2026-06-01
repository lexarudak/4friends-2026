import type { HTMLAttributes } from "react";
import { cn } from "@/utils/lib";
import styles from "./hero-section.module.scss";
import { Button } from "@/components/shared/button";
import { SectionLabel } from "@/components/shared/section-label";
import { PAGES } from "@/utils/constants";
import { getActiveRoomTournament } from "@/lib/active-room";
import { getTournament } from "@/lib/tournaments";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionary";

type Props = HTMLAttributes<HTMLDivElement>;

export const HeroSection = async ({ className, ...props }: Props) => {
	const [slug, locale] = await Promise.all([
		getActiveRoomTournament(),
		getLocale(),
	]);
	const tournament = getTournament(slug);
	const t = getDictionary(locale);

	return (
		<div className={cn(styles.container, className)}>
			<section {...props} className={styles.section}>
				<div className={styles.content}>
					<SectionLabel label={t.home.eyebrow} className={styles.eyebrow} />
					<h1 className={styles.title}>{tournament.title}</h1>
					<div className={styles.meta}>
						{tournament.meta.map((item) => (
							<span key={item} className={styles.metaItem}>
								{item}
							</span>
						))}
					</div>
					<Button
						href={PAGES.TOURNAMENT}
						color="primary"
						className={styles.cta}
					>
						{t.home.discover}
						<span aria-hidden>→</span>
					</Button>
				</div>
			</section>
		</div>
	);
};
