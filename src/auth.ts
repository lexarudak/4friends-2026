import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [Google, Apple],
	pages: {
		signIn: "/login",
	},
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;
			const isOnLogin = nextUrl.pathname.startsWith("/login");
			if (isOnLogin)
				return isLoggedIn ? Response.redirect(new URL("/", nextUrl)) : true;
			return isLoggedIn;
		},
	},
});
