import type { FC, HTMLAttributes } from "react";
import { cn } from "@/utils/lib";
import styles from "./team-badge.module.scss";

type Props = HTMLAttributes<HTMLSpanElement> & {
	name: string;
	flag: string;
	direction?: "ltr" | "rtl";
	size?: "s" | "m" | "l";
};

export const TeamBadge: FC<Props> = ({
	name,
	flag,
	direction = "ltr",
	size = "m",
	className,
	...props
}) => {
	return (
		<span
			{...props}
			className={cn(styles.root, className)}
			data-direction={direction}
			data-size={size}
		>
			<span className={styles.flag}>{flag}</span>
			<span className={styles.name}>{name}</span>
		</span>
	);
};
