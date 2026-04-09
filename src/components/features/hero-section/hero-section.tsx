import type { HTMLAttributes, FC } from "react";
import { cn } from "@/utils/lib";
import styles from "./hero-section.module.scss";

type Props = HTMLAttributes<HTMLDivElement> & {};

export const HeroSection: FC<Props> = ({ className, ...props }) => {
	return (
		<section {...props} className={cn(styles.container, className)}></section>
	);
};
