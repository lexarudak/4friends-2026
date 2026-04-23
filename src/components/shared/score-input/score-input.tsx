import type { InputHTMLAttributes, FC } from "react";
import { cn } from "@/utils/lib";
import styles from "./score-input.module.scss";

type Props = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	"type" | "min" | "max"
> & {
	name: string;
};

export const ScoreInput: FC<Props> = ({ className, ...props }) => {
	return (
		<input
			{...props}
			type="number"
			min={0}
			max={99}
			placeholder="–"
			className={cn(styles.input, className)}
		/>
	);
};
