import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { UserService } from "./services/user.service";
import { PAGES } from "./utils/constants";

declare module "next-auth" {
	interface Session {
		user: {
			current_room: string | null;
		} & DefaultSession["user"];
	}
}

const publicPaths = [PAGES.LOGIN, PAGES.ABOUT, PAGES.ADMIN];

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
	providers: [Google],
	pages: {
		signIn: PAGES.LOGIN,
	},
	callbacks: {
		async jwt({ token, user, trigger, session }) {
			if (user?.email) {
				const userInfo = await UserService.getUserById(user.email);
				token.current_room = userInfo?.current_room ?? null;
			}

			if (trigger === "update" && !!session?.user?.current_room) {
				token.current_room = session.user.current_room;
			}

			return token;
		},
		async session({ session, token }) {
			session.user.current_room = (token.current_room as string) ?? null;
			return session;
		},
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

			const hasRoom = !!auth?.user?.current_room;
			const isRoomsPage = nextUrl.pathname.startsWith(PAGES.ROOMS);
			if (!hasRoom && !isRoomsPage) {
				return Response.redirect(new URL(PAGES.ROOMS, nextUrl));
			}

			return true;
		},
	},
});
