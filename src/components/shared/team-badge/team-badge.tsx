import type { FC, HTMLAttributes } from "react";
import { cn } from "@/utils/lib";
import styles from "./team-badge.module.scss";

type Props = HTMLAttributes<HTMLSpanElement> & {
	name: string;
	flag: string;
	direction?: "ltr" | "rtl";
	size?: "s" | "m" | "l";
};

const FLAG_SIZE: Record<NonNullable<Props["size"]>, number> = {
	s: 18,
	m: 24,
	l: 32,
};

export const TeamBadge: FC<Props> = ({
	name,
	flag,
	direction = "ltr",
	size = "m",
	className,
	...props
}) => {
	const isUrl = flag.startsWith("http");
	const px = FLAG_SIZE[size];

	return (
		<span
			{...props}
			className={cn(styles.root, className)}
			data-direction={direction}
			data-size={size}
		>
			<span className={styles.flag} style={{ width: px * 1.4, height: px }}>
				{isUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={flag} alt={name} />
				) : (
					flag
				)}
			</span>
			<span className={styles.name}>{name}</span>
		</span>
	);
};
