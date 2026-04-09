import type { HTMLAttributes, FC } from "react";
import { cn } from "@/utils/lib";
import styles from "./hero-section.module.scss";
import { ShadowCard } from "@/components/shared/shadow-card";
import { Button } from "@/components/shared/button";

type Props = HTMLAttributes<HTMLDivElement>;

export const HeroSection: FC<Props> = ({ className, ...props }) => {
	return (
		<ShadowCard className={cn(styles.container, className)}>
			<section {...props} className={styles.section}>
				<img
					src="/FWC-26-Logo.svg"
					alt=""
					aria-hidden
					className={styles.logo}
				/>
				<div className={styles.band} aria-hidden />
				<div className={styles.content}>
					<p className={styles.welcome}>
						<span>Welcome to</span>
						<span className={styles.brand}>4friends</span>
					</p>
					<h1 className={styles.title}>FIFA World Cup 2026™</h1>
					<p className={styles.dates}>
						<span>11 June</span>
						<span className={styles.dateSep} aria-hidden>
							—
						</span>
						<span>19 July 2026</span>
					</p>
					<Button
						href="/tournament"
						color="primary"
						className={styles.cta}
					>
						Discover the tournament
						<span aria-hidden>→</span>
					</Button>
				</div>
			</section>
		</ShadowCard>
	);
};
