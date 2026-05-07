import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { PAGES } from "./utils/constants";

export const authConfig = {
	providers: [Google],
	pages: {
		signIn: PAGES.LOGIN,
		error: "/auth-error",
	},
	callbacks: {
		jwt({ token, trigger, session }) {
			if (
				trigger === "update" &&
				(session?.user as { current_room?: string | null } | undefined)
					?.current_room
			) {
				token.current_room = (
					session?.user as { current_room?: string | null }
				).current_room;
			}

			return token;
		},
		session({ session, token }) {
			(session.user as { current_room?: string | null }).current_room =
				(token.current_room as string | null | undefined) ?? null;
			return session;
		},
		authorized({ auth, request: { nextUrl } }) {
			const publicPaths = [PAGES.LOGIN, PAGES.ABOUT, PAGES.ADMIN];
			const isLoggedIn = !!auth?.user;

			const isPublic = publicPaths.some((path) =>
				nextUrl.pathname.startsWith(path)
			);
			if (isPublic) {
				return isLoggedIn && nextUrl.pathname.startsWith(PAGES.LOGIN)
					? Response.redirect(new URL(PAGES.HOME, nextUrl))
					: true;
			}

			if (!isLoggedIn) {
				return Response.redirect(new URL(PAGES.LOGIN, nextUrl));
			}

			const hasRoom = !!(auth?.user as { current_room?: string | null })
				?.current_room;
			const isRoomsPage = nextUrl.pathname.startsWith(PAGES.ROOMS);
			if (!hasRoom && !isRoomsPage) {
				return Response.redirect(new URL(PAGES.ROOMS, nextUrl));
			}

			return true;
		},
	},
} satisfies NextAuthConfig;
