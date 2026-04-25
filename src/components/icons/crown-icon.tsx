import type { SVGProps } from "react";

export const CrownIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		aria-hidden
		{...props}
	>
		<path d="M2 19h20v2H2v-2ZM2 6l5 5 5-7 5 7 5-5-2 11H4L2 6Z" />
	</svg>
);
