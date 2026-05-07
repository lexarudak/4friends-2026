import NextAuth, { DefaultSession } from "next-auth";
import { UserService } from "./services/user.service";
import { authConfig } from "./auth.config";

declare module "next-auth" {
	interface Session {
		user: {
			current_room: string | null;
		} & DefaultSession["user"];
	}
}

export { authConfig };

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
	...authConfig,
	logger: {
		error(code, ...message) {
			console.error("[auth:error]", code, ...message);
		},
		warn(code) {
			console.warn("[auth:warn]", code);
		},
	},
	callbacks: {
		...authConfig.callbacks,
		async jwt({ token, user, trigger, session }) {
			if (user?.email) {
				const userInfo = await UserService.getUserById(user.email);
				// Persist name on every login (ensures DB is always up to date)
				await UserService.addUser(user.email, {
					name: user.name ?? token.name ?? null,
					current_room: userInfo?.current_room ?? null,
				});
				token.current_room = userInfo?.current_room ?? null;
			} else if (token.email && token.name) {
				// Existing session — backfill name if it was null in DB
				await UserService.ensureNameSaved(token.email, token.name as string);
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
	},
});
