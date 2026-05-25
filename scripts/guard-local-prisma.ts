import { config } from "dotenv";
import { resolve } from "path";
import { spawn } from "child_process";

// Load .env then .env.local (local wins)
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

function getHostFromDatabaseUrl(value: string | undefined): string | null {
	if (!value) return null;
	try {
		return new URL(value).hostname;
	} catch {
		return null;
	}
}

function isLocalHost(host: string | null): boolean {
	if (!host) return false;
	return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

const databaseUrl = process.env.DATABASE_URL;
const host = getHostFromDatabaseUrl(databaseUrl);
const isVercelRuntime = process.env.VERCEL === "1";
const isProductionNode = process.env.NODE_ENV === "production";
const allowNonLocalPrisma = process.env.ALLOW_NON_LOCAL_PRISMA === "true";
const studioPort = process.env.PRISMA_STUDIO_PORT ?? "5555";

if (!databaseUrl) {
	console.error("❌ DATABASE_URL is not set. Refusing to run Prisma Studio.");
	process.exit(1);
}

if (allowNonLocalPrisma) {
	console.warn("⚠️ ALLOW_NON_LOCAL_PRISMA=true set. Local guard is bypassed.");
	process.exit(0);
}

if (isVercelRuntime || isProductionNode || !isLocalHost(host)) {
	console.error("❌ Local-only Prisma Studio guard blocked execution.");
	console.error(`   DATABASE_URL host: ${host ?? "unknown"}`);
	console.error(
		"   Prisma Studio is allowed only for localhost/127.0.0.1 by default."
	);
	console.error(
		"   If this is intentional, run with ALLOW_NON_LOCAL_PRISMA=true."
	);
	process.exit(1);
}

console.log(`✅ Local Prisma Studio guard passed for host: ${host}`);

const child = spawn(
	"npx",
	["prisma", "studio", "--url", databaseUrl, "--port", studioPort],
	{
		stdio: "inherit",
		env: process.env,
		shell: process.platform === "win32",
	}
);

child.on("exit", (code) => {
	process.exit(code ?? 0);
});

child.on("error", (error) => {
	console.error("❌ Failed to start Prisma Studio", error);
	process.exit(1);
});
