"use client";

import { useEffect, type FC, type ReactNode } from "react";
import { cn } from "@/utils/lib";
import styles from "./modal.module.scss";

type Props = {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
	className?: string;
};

export const Modal: FC<Props> = ({ isOpen, onClose, children, className }) => {
	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			className={styles.overlay}
			onClick={onClose}
			role="dialog"
			aria-modal="true"
		>
			<div
				className={cn(styles.panel, className)}
				onClick={(e) => e.stopPropagation()}
			>
				<button
					className={styles.close}
					onClick={onClose}
					aria-label="Close"
					type="button"
				>
					✕
				</button>
				{children}
			</div>
		</div>
	);
};
