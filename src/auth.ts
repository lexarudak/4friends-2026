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
	callbacks: {
		...authConfig.callbacks,
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
	},
});
