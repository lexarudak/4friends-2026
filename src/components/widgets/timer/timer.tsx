import type { HTMLAttributes, FC } from "react";
import { cn } from "@/utils/lib";
import styles from "./timer.module.scss";
import { ShadowCard } from "@/components/shared/shadow-card";

type Props = HTMLAttributes<HTMLDivElement> & {};

export const Timer: FC<Props> = ({ className, ...props }) => {
	return (
		<ShadowCard
			{...props}
			className={cn(styles.container, className)}
			color="primary"
		>
			sss
		</ShadowCard>
	);
};
