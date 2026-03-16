"use client";

import { useEffect, useState, type FC } from "react";
import { cn } from "@/utils/lib";
import styles from "./shadow-card.module.scss";
import { Color } from "@/types/api";

type Props = {
  className?: string;
  children: React.ReactNode;
  color?: Color
}

export const ShadowCard: FC<Props> = ({ className, children, color = "neutral" }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

	return (
		<div  className={cn(styles.card, className, styles[color], {
      [styles.mounted]: isMounted
    })}>
			{children}
		</div>
	);
}
