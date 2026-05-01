export const PAGES = {
	LOGIN: "/login",
	ABOUT: "/about",
	ADMIN: "/admin",
	ROOMS: "/rooms",
	HOME: "/",
	SCHEDULE: "/schedule",
	ROOM_STATISTIC: "/room-statistic",
	PERSONAL_STATISTIC: "/personal-statistic",
	GLOBAL_TOP: "/global-top",
	WORLD_CUP: "/world-cup",
} as const;

export const COOKIES_KEYS = {
	ROOM_ID: "room_id",
	ADMIN_ACCESS_PATH: "admin_access_path",
} as const;

export const ADMIN_PAGE_PASSWORD = "dfrkam";

export const API_ERROR_CODES = {
	NO_ACTIVE_ROOM: "NO_ACTIVE_ROOM",
	UNAUTHORIZED: "UNAUTHORIZED",
} as const;

export const ROOM_WHITELIST: string[] = ["test", "room1"];
