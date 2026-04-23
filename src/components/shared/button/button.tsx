import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/utils/lib";
import styles from "./button.module.scss";

export type ButtonColor = "neutral" | "green" | "primary" | "yellow" | "red";
export type ButtonVariant = "solid" | "inline" | "outline";
export type ButtonSize = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	color?: ButtonColor;
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
	href?: string;
}

export function Button({
	color = "neutral",
	variant = "solid",
	size = "md",
	isLoading = false,
	disabled,
	href,
	children,
	className,
	...props
}: ButtonProps) {
	const cls = cn(styles.btn, styles[variant], size === "lg" && styles.lg, className);

	if (href !== undefined) {
		return (
			<Link href={href} data-color={color} className={cls}>
				{children}
			</Link>
		);
	}

	return (
		<button
			{...props}
			disabled={disabled || isLoading}
			data-color={color}
			data-loading={isLoading || undefined}
			className={cls}
		>
			<span className={cn({ [styles.contentHidden]: isLoading })}>
				{children}
			</span>
			{isLoading && <span className={styles.spinner} aria-hidden="true" />}
		</button>
	);
}
