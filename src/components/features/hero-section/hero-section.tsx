import type { HTMLAttributes, FC } from "react";
import { cn } from "@/utils/lib";
import styles from "./hero-section.module.scss";
import { Button } from "@/components/shared/button";
import { SectionLabel } from "@/components/shared/section-label";
import { PAGES } from "@/utils/constants";

type Props = HTMLAttributes<HTMLDivElement>;

export const HeroSection: FC<Props> = ({ className, ...props }) => {
	return (
		<div className={cn(styles.container, className)}>
			<section {...props} className={styles.section}>
				<div className={styles.content}>
					<SectionLabel
						label="4friends tournament"
						className={styles.eyebrow}
					/>
					<h1 className={styles.title}>FIFA World Cup 2026™</h1>
					<div className={styles.meta}>
						<span className={styles.metaItem}>11 June – 19 July 2026</span>
						<span className={styles.metaItem}>48 teams</span>
						<span className={styles.metaItem}>USA · Canada · Mexico</span>
					</div>
					<Button href={PAGES.WORLD_CUP} color="primary" className={styles.cta}>
						Discover the tournament
						<span aria-hidden>→</span>
					</Button>
				</div>
			</section>
		</div>
	);
};
