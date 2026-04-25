import type { FC, HTMLAttributes } from "react";
import { cn } from "@/utils/lib";
import styles from "./stat-card.module.scss";

type Props = HTMLAttributes<HTMLDivElement> & {
	label: string;
	value: string | number;
	sub?: string;
	size?: "sm" | "md" | "lg";
	variant?: "default" | "highlight" | "warm";
};

export const StatCard: FC<Props> = ({
	label,
	value,
	sub,
	size = "md",
	variant = "default",
	className,
	...props
}) => {
	return (
		<div
			{...props}
			data-size={size}
			data-variant={variant}
			className={cn(styles.card, className)}
		>
			<span className={styles.label}>{label}</span>
			<span className={styles.value}>{value}</span>
			{sub && <span className={styles.sub}>{sub}</span>}
		</div>
	);
};
