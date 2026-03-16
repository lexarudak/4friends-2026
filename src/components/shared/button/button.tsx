import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/lib";
import styles from "./button.module.scss";

export type ButtonColor = "neutral" | "green" | "primary" | "yellow" | "red";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	color?: ButtonColor;
	isLoading?: boolean;
}

export function Button({
	color = "neutral",
	isLoading = false,
	disabled,
	children,
	className,
	...props
}: ButtonProps) {
	return (
		<button
			{...props}
			disabled={disabled || isLoading}
			data-color={color}
			data-loading={isLoading || undefined}
			className={cn(styles.btn, className)}
		>
			<span className={cn({ [styles.contentHidden]: isLoading })}>
				{children}
			</span>
			{isLoading && <span className={styles.spinner} aria-hidden="true" />}
		</button>
	);
}
