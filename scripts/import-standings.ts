/**
 * Fetches official standings for a tournament from api-football and caches them
 * in StandingsCache. After this, the sync layer refreshes them on match finals.
 *
 * Run: npx tsx scripts/import-standings.ts <leagueId> <season> <slug>
 * Example: npx tsx scripts/import-standings.ts 1 2026 wc2026
 */

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

function normalizeSSLMode(url: string | undefined): string | undefined {
	if (!url) return url;
	try {
		const u = new URL(url);
		const m = u.searchParams.get("sslmode");
		if (m === "require" || m === "prefer" || m === "verify-ca") {
			u.searchParams.set("sslmode", "verify-full");
		}
		return u.toString();
	} catch {
		return url;
	}
}

const adapter = new PrismaPg({
	connectionString: normalizeSSLMode(process.env.DATABASE_URL)!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
	const leagueId = Number(process.argv[2]);
	const season = Number(process.argv[3]);
	const slug = process.argv[4];
	if (!leagueId || !season || !slug) {
		console.error(
			"Usage: tsx scripts/import-standings.ts <leagueId> <season> <slug>"
		);
		process.exit(1);
	}

	const key = process.env.FOOTBALL_API_KEY;
	if (!key) throw new Error("FOOTBALL_API_KEY missing");

	const res = await fetch(
		`https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`,
		{ headers: { "x-apisports-key": key } }
	);
	if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
	const data = await res.json();
	if (data.errors && Object.keys(data.errors).length) {
		throw new Error(`API errors: ${JSON.stringify(data.errors)}`);
	}

	const response = data.response ?? [];
	const groups = response?.[0]?.league?.standings?.length ?? 0;
	await prisma.standingsCache.upsert({
		where: { tournament: slug },
		create: { tournament: slug, payload: response },
		update: { payload: response },
	});
	console.log(`✓ Cached standings for "${slug}" (${groups} group tables)`);
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
