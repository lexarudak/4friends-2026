import type { FC, SVGProps } from "react";
import { CrownIcon } from "@/components/icons";
import { PAGES } from "@/utils/constants";

type NavLink = {
	label: string;
	href: string;
	icon?: FC<SVGProps<SVGSVGElement>>;
};

export const NAV_LINKS: NavLink[] = [
	{
		label: "Home",
		href: PAGES.HOME,
	},
	{
		label: "Schedule",
		href: PAGES.SCHEDULE,
	},
	{
		label: "Room statistic",
		href: PAGES.ROOM_STATISTIC,
	},
	{
		label: "Personal statistic",
		href: PAGES.PERSONAL_STATISTIC,
	},
	{
		label: "Global top",
		href: PAGES.GLOBAL_TOP,
		icon: CrownIcon,
	},
	{
		label: "Rules",
		href: PAGES.ABOUT,
	},
	{
		label: "FIFA World Cup 2026™",
		href: PAGES.WORLD_CUP,
	},
];
