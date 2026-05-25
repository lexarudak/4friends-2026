import { config } from "dotenv";
import { resolve } from "path";

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
const allowNonLocalSeed = process.env.ALLOW_NON_LOCAL_SEED === "true";

if (!databaseUrl) {
	console.error("❌ DATABASE_URL is not set. Refusing to run seed.");
	process.exit(1);
}

if (allowNonLocalSeed) {
	console.warn("⚠️ ALLOW_NON_LOCAL_SEED=true set. Local guard is bypassed.");
	process.exit(0);
}

if (isVercelRuntime || isProductionNode || !isLocalHost(host)) {
	console.error("❌ Local-only seed guard blocked execution.");
	console.error(`   DATABASE_URL host: ${host ?? "unknown"}`);
	console.error(
		"   Seeding is allowed only for localhost/127.0.0.1 by default."
	);
	console.error(
		"   If this is intentional, run with ALLOW_NON_LOCAL_SEED=true."
	);
	process.exit(1);
}

console.log(`✅ Local seed guard passed for host: ${host}`);
