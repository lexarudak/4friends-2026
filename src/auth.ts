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
				try {
					const userInfo = await UserService.getUserById(user.email);
					await UserService.addUser(user.email, {
						name: user.name ?? (token.name as string | null) ?? null,
						current_room: userInfo?.current_room ?? null,
					});
					token.current_room = userInfo?.current_room ?? null;
				} catch (err) {
					console.error("[auth:jwt] DB error on login:", err);
					// Don't throw — session must be created even if DB is down
				}
			} else if (token.email) {
				// On every authenticated request, refresh the active room from the DB
				// (the source of truth) so the session reflects room switches that
				// didn't go through this session's `unstable_update` — e.g. a switch
				// made on another device, or the room being deleted. Without this the
				// token's `current_room` goes stale and room-scoped views (top-3,
				// bets, stats) show another room's data.
				try {
					const userInfo = await UserService.getUserById(token.email as string);
					if (userInfo) {
						token.current_room = userInfo.current_room ?? null;
						if (!userInfo.name && token.name) {
							await UserService.ensureNameSaved(
								token.email as string,
								token.name as string
							);
						}
					}
				} catch (err) {
					console.error("[auth:jwt] DB error on refresh:", err);
				}
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
