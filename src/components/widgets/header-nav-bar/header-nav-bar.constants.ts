import type { FC, SVGProps } from "react";
import { CrownIcon } from "@/components/icons";
import { PAGES } from "@/utils/constants";
import type { Dictionary } from "@/i18n/dictionary";

type NavLink = {
	key: keyof Dictionary["nav"];
	href: string;
	icon?: FC<SVGProps<SVGSVGElement>>;
};

export const NAV_LINKS: NavLink[] = [
	{ key: "home", href: PAGES.HOME },
	{ key: "schedule", href: PAGES.SCHEDULE },
	{ key: "roomStatistic", href: PAGES.ROOM_STATISTIC },
	{ key: "personalStatistic", href: PAGES.PERSONAL_STATISTIC },
	{ key: "globalTop", href: PAGES.GLOBAL_TOP, icon: CrownIcon },
	{ key: "rules", href: PAGES.ABOUT },
	{ key: "tournament", href: PAGES.TOURNAMENT },
];
