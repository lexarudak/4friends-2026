import type { HTMLAttributes, FC } from "react";
import Link from "next/link";
import { cn } from "@/utils/lib";
import styles from "./hero-section.module.scss";

type Props = HTMLAttributes<HTMLDivElement>;

export const HeroSection: FC<Props> = ({ className, ...props }) => {
	return (
		<section {...props} className={cn(styles.container, className)}>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src="/FWC-26-Logo.svg" alt="" aria-hidden className={styles.logo} />
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
				<Link href="/tournament" className={styles.cta}>
					Discover the tournament
					<span className={styles.arrow} aria-hidden>
						→
					</span>
				</Link>
			</div>
		</section>
	);
};
