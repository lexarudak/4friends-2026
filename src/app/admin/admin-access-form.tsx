"use client";

import { useActionState } from "react";
import { Button } from "@/components/shared/button";
import { unlockAdmin, type AdminAccessState } from "./actions";
import styles from "./page.module.scss";

const initialState: AdminAccessState = { error: null };

export function AdminAccessForm() {
	const [state, formAction, isPending] = useActionState(
		unlockAdmin,
		initialState
	);

	return (
		<form action={formAction} className={styles.form}>
			<input type="hidden" name="path" value="/admin" />
			<label className={styles.label} htmlFor="admin-password">
				Password
			</label>
			<input
				id="admin-password"
				name="password"
				type="password"
				autoComplete="current-password"
				placeholder="Enter admin password"
				className={styles.input}
			/>
			{state.error && <p className={styles.error}>{state.error}</p>}
			<Button type="submit" color="primary" isLoading={isPending}>
				Open admin page
			</Button>
		</form>
	);
}
