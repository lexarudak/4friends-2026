import type { FC, ReactNode } from "react";
import styles from "./page-title.module.scss";

type Props = {
	title: string;
	label?: string;
	icon?: ReactNode;
};

export const PageTitle: FC<Props> = ({ title, label, icon }) => {
	return (
		<div className={styles.root}>
			{label && <p className={styles.label}>{label}</p>}
			<h1 className={styles.title}>
				{icon && <span className={styles.icon}>{icon}</span>}
				{title}
			</h1>
		</div>
	);
};
