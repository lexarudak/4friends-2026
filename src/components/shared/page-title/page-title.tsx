import type { FC } from "react";
import styles from "./page-title.module.scss";

type Props = {
	title: string;
	label?: string;
};

export const PageTitle: FC<Props> = ({ title, label }) => {
	return (
		<div className={styles.root}>
			{label && <p className={styles.label}>{label}</p>}
			<h1 className={styles.title}>{title}</h1>
		</div>
	);
};
