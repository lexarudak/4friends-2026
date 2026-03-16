"use client";

import Link from "next/link";
import styles from "./close-button.module.scss";
import React, { FC } from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	linkArgs?: React.ComponentProps<typeof Link>;
};

export const CloseButton: FC<Props> = ({linkArgs, ...buttonArgs}) => {

	if (linkArgs) {
		return (
			<Link {...linkArgs} className={styles.btn} aria-label="Close">
				✕
			</Link>
		);
	}

	return (
		<button
			{...buttonArgs}
			type="button"
			className={styles.btn}
			aria-label="Close"
		>
			✕
		</button>
	);
}
