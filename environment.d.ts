declare namespace NodeJS {
	interface ProcessEnv {
		API_KEY?: string;
		FOOTBALL_API_KEY?: string;
		DATABASE_URL?: string;
		DATABASE_URL_UNPOOLED?: string;
		ADMIN_PAGE_PASSWORD?: string;
	}
}

export {};
