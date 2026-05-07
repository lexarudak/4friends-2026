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
			} else if (token.email && token.name) {
				try {
					await UserService.ensureNameSaved(token.email, token.name as string);
				} catch (err) {
					console.error("[auth:jwt] DB error on ensureNameSaved:", err);
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
