import type { HTMLAttributes, FC } from "react";
import { cn } from "@/utils/lib";
import styles from "./page-container.module.scss";

type Props = HTMLAttributes<HTMLDivElement> & {
  
}

export const PageContainer: FC<Props> = ({
	className,
  children,
	...props
}) => {
	return (
    <div {...props} className={cn(styles.container, className)}>
      {children}
    </div>
  );
};
  