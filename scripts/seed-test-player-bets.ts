import { config } from "dotenv";
import { resolve } from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

function normalizeSSLMode(url: string | undefined): string | undefined {
	if (!url) return url;
	try {
		const u = new URL(url);
		const sslmode = u.searchParams.get("sslmode");
		if (
			sslmode === "require" ||
			sslmode === "prefer" ||
			sslmode === "verify-ca"
		) {
			u.searchParams.set("sslmode", "verify-full");
		}
		return u.toString();
	} catch {
		return url;
	}
}

const adapter = new PrismaPg({
	connectionString: normalizeSSLMode(process.env.DATABASE_URL),
});

const prisma = new PrismaClient({ adapter });

function hashString(input: string): number {
	let h = 0;
	for (let i = 0; i < input.length; i++) {
		h = (h * 31 + input.charCodeAt(i)) >>> 0;
	}
	return h;
}

function clampGoals(value: number): number {
	if (value < 0) return 0;
	if (value > 9) return 9;
	return value;
}

function isPlayoffRound(round: string): boolean {
	return !/group/i.test(round);
}

function basePoints(
	betHome: number,
	betAway: number,
	actualHome: number,
	actualAway: number
): number {
	if (betHome === actualHome && betAway === actualAway) return 3;

	const predictedOutcome = Math.sign(betHome - betAway);
	const actualOutcome = Math.sign(actualHome - actualAway);
	if (predictedOutcome !== actualOutcome) return 0;

	const predictedDiff = betHome - betAway;
	const actualDiff = actualHome - actualAway;
	if (predictedDiff === actualDiff) return 2;

	return 1;
}

async function main() {
	const now = new Date();
	const finishedMatches = await prisma.match.findMany({
		where: {
			date: { lte: now },
		},
		orderBy: { date: "asc" },
		select: {
			id: true,
			round: true,
			homeTeamId: true,
			awayTeamId: true,
			homeTeamWinner: true,
			awayTeamWinner: true,
			goalsHome: true,
			goalsAway: true,
			fulltimeHome: true,
			fulltimeAway: true,
		},
	});

	if (finishedMatches.length === 0) {
		console.warn("No past matches found. Nothing to seed.");
		return;
	}

	const testUsers = await prisma.user.findMany({
		where: { id: { endsWith: "@local.test" } },
		select: {
			id: true,
			rooms: {
				select: {
					room: {
						select: { name: true },
					},
				},
			},
		},
		orderBy: { id: "asc" },
	});

	if (testUsers.length === 0) {
		console.warn("No test users found. Nothing to seed.");
		return;
	}

	let createdOrUpdated = 0;
	let skipped = 0;

	for (const user of testUsers) {
		const userHash = hashString(user.id);
		const skipRate = 15 + (userHash % 35);
		const roomNames = user.rooms.map((r) => r.room.name);

		for (const roomId of roomNames) {
			let seededInRoom = 0;
			for (const match of finishedMatches) {
				const key = `${user.id}:${roomId}:${match.id}`;
				const rnd = hashString(key) % 100;

				if (rnd < skipRate) {
					skipped++;
					continue;
				}

				const actualHome = match.fulltimeHome ?? match.goalsHome;
				const actualAway = match.fulltimeAway ?? match.goalsAway;
				const hasActualResult = actualHome != null && actualAway != null;

				const variant = hashString(`${key}:variant`) % 6;
				let betHome = hasActualResult ? actualHome : hashString(`${key}:h`) % 5;
				let betAway = hasActualResult ? actualAway : hashString(`${key}:a`) % 5;

				if (hasActualResult) {
					switch (variant) {
						case 0:
							betHome = actualHome;
							betAway = actualAway;
							break;
						case 1:
							betHome = clampGoals(actualHome + 1);
							betAway = clampGoals(actualAway + 1);
							break;
						case 2: {
							const shift = (hashString(`${key}:shift`) % 2) + 1;
							betHome = clampGoals(actualHome + shift);
							betAway = clampGoals(actualAway);
							break;
						}
						case 3: {
							const shift = (hashString(`${key}:shift`) % 2) + 1;
							betHome = clampGoals(actualHome);
							betAway = clampGoals(actualAway + shift);
							break;
						}
						case 4:
							betHome = actualAway;
							betAway = actualHome;
							break;
						case 5: {
							const drawGoal = clampGoals((actualHome + actualAway) >> 1);
							betHome = drawGoal;
							betAway = drawGoal;
							break;
						}
					}
				} else {
					switch (variant) {
						case 0:
							break;
						case 1:
							betHome = clampGoals(betHome + 1);
							betAway = clampGoals(betAway + 1);
							break;
						case 2:
							betHome = clampGoals(betHome + 1);
							break;
						case 3:
							betAway = clampGoals(betAway + 1);
							break;
						case 4: {
							const temp = betHome;
							betHome = betAway;
							betAway = temp;
							break;
						}
						case 5: {
							const drawGoal = clampGoals(((betHome + betAway) >> 1) + 1);
							betHome = drawGoal;
							betAway = drawGoal;
							break;
						}
					}
				}

				let winPick: number | null = null;
				if (betHome > betAway) winPick = match.homeTeamId;
				if (betAway > betHome) winPick = match.awayTeamId;

				const isPlayoff = isPlayoffRound(match.round);
				if (isPlayoff && betHome === betAway) {
					const drawPick = hashString(`${key}:drawPick`) % 2;
					winPick = drawPick === 0 ? match.homeTeamId : match.awayTeamId;
				}

				const points = hasActualResult
					? basePoints(betHome, betAway, actualHome, actualAway)
					: null;

				let bonusPoints: number | null = 0;
				if (!hasActualResult) {
					bonusPoints = null;
				} else if (isPlayoff && winPick != null) {
					const actualWinnerTeamId =
						match.homeTeamWinner === true
							? match.homeTeamId
							: match.awayTeamWinner === true
								? match.awayTeamId
								: null;

					if (actualWinnerTeamId != null && actualWinnerTeamId === winPick) {
						bonusPoints = 2;
					}
				}

				await prisma.bet.upsert({
					where: {
						userId_matchId_roomId: {
							userId: user.id,
							matchId: match.id,
							roomId,
						},
					},
					update: {
						betHome,
						betAway,
						winPick,
						points,
						bonusPoints,
					},
					create: {
						userId: user.id,
						matchId: match.id,
						roomId,
						betHome,
						betAway,
						winPick,
						points,
						bonusPoints,
					},
				});

				createdOrUpdated++;
				seededInRoom++;
			}

			if (seededInRoom === 0 && finishedMatches.length > 0) {
				const match = finishedMatches[0];
				const key = `${user.id}:${roomId}:${match.id}:fallback`;
				const betHome = hashString(`${key}:h`) % 4;
				const betAway = hashString(`${key}:a`) % 4;
				const isPlayoff = isPlayoffRound(match.round);

				let winPick: number | null = null;
				if (betHome > betAway) winPick = match.homeTeamId;
				if (betAway > betHome) winPick = match.awayTeamId;
				if (isPlayoff && betHome === betAway) {
					winPick =
						hashString(`${key}:drawPick`) % 2 === 0
							? match.homeTeamId
							: match.awayTeamId;
				}

				await prisma.bet.upsert({
					where: {
						userId_matchId_roomId: {
							userId: user.id,
							matchId: match.id,
							roomId,
						},
					},
					update: {
						betHome,
						betAway,
						winPick,
						points: null,
						bonusPoints: null,
					},
					create: {
						userId: user.id,
						matchId: match.id,
						roomId,
						betHome,
						betAway,
						winPick,
						points: null,
						bonusPoints: null,
					},
				});

				createdOrUpdated++;
			}
		}
	}

	console.log(
		JSON.stringify(
			{
				finishedMatches: finishedMatches.length,
				testUsers: testUsers.length,
				createdOrUpdated,
				skipped,
			},
			null,
			2
		)
	);
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
