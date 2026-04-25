import type { FC, HTMLAttributes } from "react";
import { cn } from "@/utils/lib";
import styles from "./section-label.module.scss";

type Props = HTMLAttributes<HTMLDivElement> & {
	label: string;
};

export const SectionLabel: FC<Props> = ({ label, className, ...props }) => {
	return (
		<div {...props} className={cn(styles.root, className)}>
			<p className={styles.text}>{label}</p>
		</div>
	);
};
