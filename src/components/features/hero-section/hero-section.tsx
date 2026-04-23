import type { HTMLAttributes, FC } from "react";
import { cn } from "@/utils/lib";
import styles from "./hero-section.module.scss";
import { Button } from "@/components/shared/button";

type Props = HTMLAttributes<HTMLDivElement>;

export const HeroSection: FC<Props> = ({ className, ...props }) => {
	return (
		<div className={cn(styles.container, className)}>
			<section {...props} className={styles.section}>
				<div className={styles.content}>
					<div className={styles.eyebrow}>
						<p className={styles.eyebrowText}>4friends tournament</p>
					</div>
					<h1 className={styles.title}>FIFA World Cup 2026™</h1>
					<div className={styles.meta}>
						<span className={styles.metaItem}>11 June – 19 July 2026</span>
						<span className={styles.metaItem}>48 teams</span>
						<span className={styles.metaItem}>USA · Canada · Mexico</span>
					</div>
					<Button href="/tournament" color="primary" className={styles.cta}>
						Discover the tournament
						<span aria-hidden>→</span>
					</Button>
				</div>
				<img
					src="/FWC-26-Logo.svg"
					alt=""
					aria-hidden
					className={styles.logo}
				/>
			</section>
		</div>
	);
};
