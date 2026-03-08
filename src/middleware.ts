export { auth as middleware } from "@/auth";

export const config = {
  // Protect everything except static files, api/auth, and the login page itself
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
