"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import styles from "./conditional-layout.module.scss";

const MINIMAL_PATHS = ["/login", "/rooms", "/about"];

type Props = {
	children: ReactNode;
	header: ReactNode;
	sidebar: ReactNode;
};

export const ConditionalLayout = ({ children, header, sidebar }: Props) => {
	const pathname = usePathname();
	const isMinimal = MINIMAL_PATHS.includes(pathname);

	if (isMinimal) {
		return <>{children}</>;
	}

	return (
		<>
			{header}
			<main className={styles.main}>
				<div className={styles.layout}>
					<div className={styles.left}>{children}</div>
					<div className={styles.right}>{sidebar}</div>
				</div>
			</main>
		</>
	);
};
