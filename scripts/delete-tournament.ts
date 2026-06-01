/**
 * Removes a tournament's data: bets, matches, and cached standings.
 * (Rooms are managed separately via the admin UI.)
 *
 * Run: npx tsx scripts/delete-tournament.ts <slug>
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
	const slug = process.argv[2];
	if (!slug) {
		console.error("Usage: tsx scripts/delete-tournament.ts <slug>");
		process.exit(1);
	}

	const bets = await prisma.bet.deleteMany({
		where: { match: { tournament: slug } },
	});
	const matches = await prisma.match.deleteMany({ where: { tournament: slug } });
	const standings = await prisma.standingsCache.deleteMany({
		where: { tournament: slug },
	});

	console.log(
		`✓ Deleted "${slug}": ${matches.count} matches, ${bets.count} bets, ${standings.count} standings`
	);
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
