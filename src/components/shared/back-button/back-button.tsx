"use client";

import { useRouter } from "next/navigation";
import styles from "./back-button.module.scss";

export function BackButton() {
	const router = useRouter();

	return (
		<button
			type="button"
			className={styles.btn}
			aria-label="Go back"
			onClick={() => router.back()}
		>
			✕
		</button>
	);
}
