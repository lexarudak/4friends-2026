export const PAGES = {
	LOGIN: "/login",
	ABOUT: "/about",
	ROOMS: "/rooms",
	HOME: "/",
} as const;

export const COOKIES_KEYS = {
	ROOM_ID: "room_id",
} as const;

export const API_ERROR_CODES = {
	NO_ACTIVE_ROOM: "NO_ACTIVE_ROOM",
	UNAUTHORIZED: "UNAUTHORIZED",
} as const;
