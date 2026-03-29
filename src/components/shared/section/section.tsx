import type { HTMLAttributes, FC } from "react";
import { cn } from "@/utils/lib";
import styles from "./section.module.scss";

type Props = HTMLAttributes<HTMLDivElement> & {
  
}

export const Section: FC<Props> = ({
	className,
	...props
}) => {
	return (
    <section {...props} className={cn(styles.container, className)}>
      {props.children}
    </section>
  );
};
  