import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PAGES } from "./utils/constants";

const publicPaths = [PAGES.LOGIN, PAGES.ABOUT];

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [Google],
	pages: {
		signIn: PAGES.LOGIN,
	},
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;

			const isPublic = publicPaths.some((path) =>
				nextUrl.pathname.startsWith(path),
			);
			if (isPublic) {
				return isLoggedIn && nextUrl.pathname.startsWith(PAGES.LOGIN)
					? Response.redirect(new URL(PAGES.HOME, nextUrl))
					: true;
			}

			if (!isLoggedIn) {
				return Response.redirect(new URL(PAGES.LOGIN, nextUrl));
			}

			return true;
		},
	},
});
