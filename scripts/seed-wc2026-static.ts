/**
 * Static seed for FIFA World Cup 2026 matches.
 * Data sourced from Wikipedia / FIFA official schedule (December 2025 draw).
 * Uses placeholder IDs (1-104) since Football API hasn't published fixture IDs yet.
 * Run: npm run seed:wc2026
 */

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── League constants ────────────────────────────────────────────────────────
const WC = {
	leagueId: 1,
	leagueName: "FIFA World Cup",
	leagueCountry: "World",
	leagueLogo: "https://media.api-sports.io/football/leagues/1.png",
	leagueSeason: 2026,
	statusLong: "Not Started",
	statusShort: "NS",
	referee: null,
	periodsFirst: null,
	periodsSecond: null,
	statusElapsed: null,
	statusExtra: null,
	homeTeamWinner: null,
	awayTeamWinner: null,
	goalsHome: null,
	goalsAway: null,
	halftimeHome: null,
	halftimeAway: null,
	fulltimeHome: null,
	fulltimeAway: null,
	extratimeHome: null,
	extratimeAway: null,
	penaltyHome: null,
	penaltyAway: null,
} as const;

// ─── Teams ───────────────────────────────────────────────────────────────────
const T = {
	Mexico: { id: 1, name: "Mexico", logo: "https://flagcdn.com/w40/mx.png" },
	SouthAfrica: {
		id: 2,
		name: "South Africa",
		logo: "https://flagcdn.com/w40/za.png",
	},
	SouthKorea: {
		id: 3,
		name: "South Korea",
		logo: "https://flagcdn.com/w40/kr.png",
	},
	Czech: {
		id: 4,
		name: "Czech Republic",
		logo: "https://flagcdn.com/w40/cz.png",
	},
	Canada: { id: 5, name: "Canada", logo: "https://flagcdn.com/w40/ca.png" },
	Bosnia: {
		id: 6,
		name: "Bosnia and Herzegovina",
		logo: "https://flagcdn.com/w40/ba.png",
	},
	Qatar: { id: 7, name: "Qatar", logo: "https://flagcdn.com/w40/qa.png" },
	Switzerland: {
		id: 8,
		name: "Switzerland",
		logo: "https://flagcdn.com/w40/ch.png",
	},
	Brazil: { id: 9, name: "Brazil", logo: "https://flagcdn.com/w40/br.png" },
	Morocco: { id: 10, name: "Morocco", logo: "https://flagcdn.com/w40/ma.png" },
	Haiti: { id: 11, name: "Haiti", logo: "https://flagcdn.com/w40/ht.png" },
	Scotland: {
		id: 12,
		name: "Scotland",
		logo: "https://flagcdn.com/w40/gb-sct.png",
	},
	USA: {
		id: 13,
		name: "United States",
		logo: "https://flagcdn.com/w40/us.png",
	},
	Paraguay: {
		id: 14,
		name: "Paraguay",
		logo: "https://flagcdn.com/w40/py.png",
	},
	Australia: {
		id: 15,
		name: "Australia",
		logo: "https://flagcdn.com/w40/au.png",
	},
	Turkey: { id: 16, name: "Turkey", logo: "https://flagcdn.com/w40/tr.png" },
	Germany: { id: 17, name: "Germany", logo: "https://flagcdn.com/w40/de.png" },
	Curacao: { id: 18, name: "Curaçao", logo: "https://flagcdn.com/w40/cw.png" },
	IvoryCoast: {
		id: 19,
		name: "Ivory Coast",
		logo: "https://flagcdn.com/w40/ci.png",
	},
	Ecuador: { id: 20, name: "Ecuador", logo: "https://flagcdn.com/w40/ec.png" },
	Netherlands: {
		id: 21,
		name: "Netherlands",
		logo: "https://flagcdn.com/w40/nl.png",
	},
	Japan: { id: 22, name: "Japan", logo: "https://flagcdn.com/w40/jp.png" },
	Sweden: { id: 23, name: "Sweden", logo: "https://flagcdn.com/w40/se.png" },
	Tunisia: { id: 24, name: "Tunisia", logo: "https://flagcdn.com/w40/tn.png" },
	Belgium: { id: 25, name: "Belgium", logo: "https://flagcdn.com/w40/be.png" },
	Egypt: { id: 26, name: "Egypt", logo: "https://flagcdn.com/w40/eg.png" },
	Iran: { id: 27, name: "Iran", logo: "https://flagcdn.com/w40/ir.png" },
	NewZealand: {
		id: 28,
		name: "New Zealand",
		logo: "https://flagcdn.com/w40/nz.png",
	},
	Spain: { id: 29, name: "Spain", logo: "https://flagcdn.com/w40/es.png" },
	CapeVerde: {
		id: 30,
		name: "Cape Verde",
		logo: "https://flagcdn.com/w40/cv.png",
	},
	SaudiArabia: {
		id: 31,
		name: "Saudi Arabia",
		logo: "https://flagcdn.com/w40/sa.png",
	},
	Uruguay: { id: 32, name: "Uruguay", logo: "https://flagcdn.com/w40/uy.png" },
	France: { id: 33, name: "France", logo: "https://flagcdn.com/w40/fr.png" },
	Senegal: { id: 34, name: "Senegal", logo: "https://flagcdn.com/w40/sn.png" },
	Iraq: { id: 35, name: "Iraq", logo: "https://flagcdn.com/w40/iq.png" },
	Norway: { id: 36, name: "Norway", logo: "https://flagcdn.com/w40/no.png" },
	Argentina: {
		id: 37,
		name: "Argentina",
		logo: "https://flagcdn.com/w40/ar.png",
	},
	Algeria: { id: 38, name: "Algeria", logo: "https://flagcdn.com/w40/dz.png" },
	Austria: { id: 39, name: "Austria", logo: "https://flagcdn.com/w40/at.png" },
	Jordan: { id: 40, name: "Jordan", logo: "https://flagcdn.com/w40/jo.png" },
	Portugal: {
		id: 41,
		name: "Portugal",
		logo: "https://flagcdn.com/w40/pt.png",
	},
	DRCongo: { id: 42, name: "DR Congo", logo: "https://flagcdn.com/w40/cd.png" },
	Uzbekistan: {
		id: 43,
		name: "Uzbekistan",
		logo: "https://flagcdn.com/w40/uz.png",
	},
	Colombia: {
		id: 44,
		name: "Colombia",
		logo: "https://flagcdn.com/w40/co.png",
	},
	England: {
		id: 45,
		name: "England",
		logo: "https://flagcdn.com/w40/gb-eng.png",
	},
	Croatia: { id: 46, name: "Croatia", logo: "https://flagcdn.com/w40/hr.png" },
	Ghana: { id: 47, name: "Ghana", logo: "https://flagcdn.com/w40/gh.png" },
	Panama: { id: 48, name: "Panama", logo: "https://flagcdn.com/w40/pa.png" },
	TBD: { id: 0, name: "TBD", logo: "" },
} as const;

// ─── Venues ──────────────────────────────────────────────────────────────────
const V = {
	Azteca: { id: 901, name: "Estadio Azteca", city: "Mexico City" },
	Akron: { id: 902, name: "Estadio Akron", city: "Zapopan" },
	BBVA: { id: 903, name: "Estadio BBVA", city: "Guadalupe" },
	BMO: { id: 904, name: "BMO Field", city: "Toronto" },
	Levis: { id: 905, name: "Levi's Stadium", city: "Santa Clara" },
	SoFi: { id: 906, name: "SoFi Stadium", city: "Inglewood" },
	MetLife: { id: 907, name: "MetLife Stadium", city: "East Rutherford" },
	Gillette: { id: 908, name: "Gillette Stadium", city: "Foxborough" },
	Lincoln: { id: 909, name: "Lincoln Financial Field", city: "Philadelphia" },
	Mercedes: { id: 910, name: "Mercedes-Benz Stadium", city: "Atlanta" },
	HardRock: { id: 911, name: "Hard Rock Stadium", city: "Miami Gardens" },
	ATT: { id: 912, name: "AT&T Stadium", city: "Arlington" },
	NRG: { id: 913, name: "NRG Stadium", city: "Houston" },
	Arrowhead: { id: 914, name: "Arrowhead Stadium", city: "Kansas City" },
	LumenField: { id: 915, name: "Lumen Field", city: "Seattle" },
	BCPlace: { id: 916, name: "BC Place", city: "Vancouver" },
} as const;

// ─── Helper ──────────────────────────────────────────────────────────────────
type TeamKey = keyof typeof T;
type VenueKey = keyof typeof V;

function match(
	id: number,
	isoUtc: string,
	round: string,
	home: TeamKey,
	away: TeamKey,
	venue: VenueKey,
	timezone: string = "UTC"
) {
	const date = new Date(isoUtc);
	const timestamp = Math.floor(date.getTime() / 1000);
	const h = T[home];
	const a = T[away];
	const v = V[venue];
	return {
		id,
		...WC,
		date,
		timestamp,
		timezone,
		round,
		homeTeamId: h.id,
		homeTeamName: h.name,
		homeTeamLogo: h.logo,
		awayTeamId: a.id,
		awayTeamName: a.name,
		awayTeamLogo: a.logo,
		venueId: v.id,
		venueName: v.name,
		venueCity: v.city,
	};
}

// ─── Match data ───────────────────────────────────────────────────────────────
// All dates stored as UTC. Local times from FIFA/Wikipedia schedule.
// Knockout matches use TBD teams (id=0) — teams determined after group stage.
const matches = [
	// ══════════════ GROUP A: Mexico, South Africa, South Korea, Czech Republic
	match(
		1,
		"2026-06-11T19:00:00Z",
		"Group Stage - Group A",
		"Mexico",
		"SouthAfrica",
		"Azteca",
		"America/Mexico_City"
	),
	match(
		2,
		"2026-06-12T02:00:00Z",
		"Group Stage - Group A",
		"SouthKorea",
		"Czech",
		"Akron",
		"America/Mexico_City"
	),
	match(
		25,
		"2026-06-18T16:00:00Z",
		"Group Stage - Group A",
		"Czech",
		"SouthAfrica",
		"Mercedes",
		"America/New_York"
	),
	match(
		28,
		"2026-06-19T01:00:00Z",
		"Group Stage - Group A",
		"Mexico",
		"SouthKorea",
		"Akron",
		"America/Mexico_City"
	),
	match(
		53,
		"2026-06-25T01:00:00Z",
		"Group Stage - Group A",
		"Czech",
		"Mexico",
		"Azteca",
		"America/Mexico_City"
	),
	match(
		54,
		"2026-06-25T01:00:00Z",
		"Group Stage - Group A",
		"SouthAfrica",
		"SouthKorea",
		"BBVA",
		"America/Mexico_City"
	),

	// ══════════════ GROUP B: Canada, Bosnia and Herzegovina, Qatar, Switzerland
	match(
		3,
		"2026-06-12T19:00:00Z",
		"Group Stage - Group B",
		"Canada",
		"Bosnia",
		"BMO",
		"America/Toronto"
	),
	match(
		8,
		"2026-06-13T19:00:00Z",
		"Group Stage - Group B",
		"Qatar",
		"Switzerland",
		"Levis",
		"America/Los_Angeles"
	),
	match(
		26,
		"2026-06-18T19:00:00Z",
		"Group Stage - Group B",
		"Switzerland",
		"Bosnia",
		"SoFi",
		"America/Los_Angeles"
	),
	match(
		27,
		"2026-06-18T22:00:00Z",
		"Group Stage - Group B",
		"Canada",
		"Qatar",
		"BCPlace",
		"America/Vancouver"
	),
	match(
		51,
		"2026-06-24T19:00:00Z",
		"Group Stage - Group B",
		"Switzerland",
		"Canada",
		"BCPlace",
		"America/Vancouver"
	),
	match(
		52,
		"2026-06-24T19:00:00Z",
		"Group Stage - Group B",
		"Bosnia",
		"Qatar",
		"LumenField",
		"America/Los_Angeles"
	),

	// ══════════════ GROUP C: Brazil, Morocco, Haiti, Scotland
	match(
		7,
		"2026-06-13T22:00:00Z",
		"Group Stage - Group C",
		"Brazil",
		"Morocco",
		"MetLife",
		"America/New_York"
	),
	match(
		5,
		"2026-06-14T01:00:00Z",
		"Group Stage - Group C",
		"Haiti",
		"Scotland",
		"Gillette",
		"America/New_York"
	),
	match(
		30,
		"2026-06-19T22:00:00Z",
		"Group Stage - Group C",
		"Scotland",
		"Morocco",
		"Gillette",
		"America/New_York"
	),
	match(
		29,
		"2026-06-20T00:30:00Z",
		"Group Stage - Group C",
		"Brazil",
		"Haiti",
		"Lincoln",
		"America/New_York"
	),
	match(
		49,
		"2026-06-24T22:00:00Z",
		"Group Stage - Group C",
		"Scotland",
		"Brazil",
		"HardRock",
		"America/New_York"
	),
	match(
		50,
		"2026-06-24T22:00:00Z",
		"Group Stage - Group C",
		"Morocco",
		"Haiti",
		"Mercedes",
		"America/New_York"
	),

	// ══════════════ GROUP D: United States, Paraguay, Australia, Turkey
	match(
		4,
		"2026-06-13T01:00:00Z",
		"Group Stage - Group D",
		"USA",
		"Paraguay",
		"SoFi",
		"America/Los_Angeles"
	),
	match(
		6,
		"2026-06-14T04:00:00Z",
		"Group Stage - Group D",
		"Australia",
		"Turkey",
		"BCPlace",
		"America/Vancouver"
	),
	match(
		32,
		"2026-06-19T19:00:00Z",
		"Group Stage - Group D",
		"USA",
		"Australia",
		"LumenField",
		"America/Los_Angeles"
	),
	match(
		31,
		"2026-06-20T03:00:00Z",
		"Group Stage - Group D",
		"Turkey",
		"Paraguay",
		"Levis",
		"America/Los_Angeles"
	),
	match(
		59,
		"2026-06-26T02:00:00Z",
		"Group Stage - Group D",
		"Turkey",
		"USA",
		"Levis",
		"America/Los_Angeles"
	),
	match(
		60,
		"2026-06-26T02:00:00Z",
		"Group Stage - Group D",
		"Paraguay",
		"Australia",
		"SoFi",
		"America/Los_Angeles"
	),

	// ══════════════ GROUP E: Germany, Curaçao, Ivory Coast, Ecuador
	match(
		10,
		"2026-06-14T17:00:00Z",
		"Group Stage - Group E",
		"Germany",
		"Curacao",
		"NRG",
		"America/Chicago"
	),
	match(
		9,
		"2026-06-14T23:00:00Z",
		"Group Stage - Group E",
		"IvoryCoast",
		"Ecuador",
		"Lincoln",
		"America/New_York"
	),
	match(
		33,
		"2026-06-20T20:00:00Z",
		"Group Stage - Group E",
		"Germany",
		"IvoryCoast",
		"BMO",
		"America/Toronto"
	),
	match(
		34,
		"2026-06-21T00:00:00Z",
		"Group Stage - Group E",
		"Ecuador",
		"Curacao",
		"Arrowhead",
		"America/Chicago"
	),
	match(
		55,
		"2026-06-25T20:00:00Z",
		"Group Stage - Group E",
		"Curacao",
		"IvoryCoast",
		"Lincoln",
		"America/New_York"
	),
	match(
		56,
		"2026-06-25T20:00:00Z",
		"Group Stage - Group E",
		"Ecuador",
		"Germany",
		"MetLife",
		"America/New_York"
	),

	// ══════════════ GROUP F: Netherlands, Japan, Sweden, Tunisia
	match(
		11,
		"2026-06-14T20:00:00Z",
		"Group Stage - Group F",
		"Netherlands",
		"Japan",
		"ATT",
		"America/Chicago"
	),
	match(
		12,
		"2026-06-15T02:00:00Z",
		"Group Stage - Group F",
		"Sweden",
		"Tunisia",
		"BBVA",
		"America/Mexico_City"
	),
	match(
		35,
		"2026-06-20T17:00:00Z",
		"Group Stage - Group F",
		"Netherlands",
		"Sweden",
		"BBVA",
		"America/Chicago"
	),
	match(
		36,
		"2026-06-21T04:00:00Z",
		"Group Stage - Group F",
		"Tunisia",
		"Japan",
		"NRG",
		"America/Chicago"
	),
	match(
		57,
		"2026-06-25T23:00:00Z",
		"Group Stage - Group F",
		"Japan",
		"Sweden",
		"ATT",
		"America/Chicago"
	),
	match(
		58,
		"2026-06-25T23:00:00Z",
		"Group Stage - Group F",
		"Tunisia",
		"Netherlands",
		"Arrowhead",
		"America/Chicago"
	),

	// ══════════════ GROUP G: Belgium, Egypt, Iran, New Zealand
	match(
		16,
		"2026-06-15T19:00:00Z",
		"Group Stage - Group G",
		"Belgium",
		"Egypt",
		"LumenField",
		"America/Los_Angeles"
	),
	match(
		15,
		"2026-06-16T01:00:00Z",
		"Group Stage - Group G",
		"Iran",
		"NewZealand",
		"SoFi",
		"America/Los_Angeles"
	),
	match(
		39,
		"2026-06-21T19:00:00Z",
		"Group Stage - Group G",
		"Belgium",
		"Iran",
		"SoFi",
		"America/Los_Angeles"
	),
	match(
		40,
		"2026-06-22T01:00:00Z",
		"Group Stage - Group G",
		"NewZealand",
		"Egypt",
		"SoFi",
		"America/Los_Angeles"
	),
	match(
		63,
		"2026-06-27T03:00:00Z",
		"Group Stage - Group G",
		"Egypt",
		"Iran",
		"BCPlace",
		"America/Vancouver"
	),
	match(
		64,
		"2026-06-27T03:00:00Z",
		"Group Stage - Group G",
		"NewZealand",
		"Belgium",
		"LumenField",
		"America/Los_Angeles"
	),

	// ══════════════ GROUP H: Spain, Cape Verde, Saudi Arabia, Uruguay
	match(
		14,
		"2026-06-15T16:00:00Z",
		"Group Stage - Group H",
		"Spain",
		"CapeVerde",
		"Mercedes",
		"America/New_York"
	),
	match(
		13,
		"2026-06-15T22:00:00Z",
		"Group Stage - Group H",
		"SaudiArabia",
		"Uruguay",
		"HardRock",
		"America/New_York"
	),
	match(
		38,
		"2026-06-21T16:00:00Z",
		"Group Stage - Group H",
		"Spain",
		"SaudiArabia",
		"HardRock",
		"America/New_York"
	),
	match(
		37,
		"2026-06-21T22:00:00Z",
		"Group Stage - Group H",
		"Uruguay",
		"CapeVerde",
		"Mercedes",
		"America/New_York"
	),
	match(
		65,
		"2026-06-27T00:00:00Z",
		"Group Stage - Group H",
		"CapeVerde",
		"SaudiArabia",
		"NRG",
		"America/Chicago"
	),
	match(
		66,
		"2026-06-27T00:00:00Z",
		"Group Stage - Group H",
		"Uruguay",
		"Spain",
		"Akron",
		"America/Mexico_City"
	),

	// ══════════════ GROUP I: France, Senegal, Iraq, Norway
	match(
		17,
		"2026-06-16T19:00:00Z",
		"Group Stage - Group I",
		"France",
		"Senegal",
		"MetLife",
		"America/New_York"
	),
	match(
		18,
		"2026-06-16T22:00:00Z",
		"Group Stage - Group I",
		"Iraq",
		"Norway",
		"Gillette",
		"America/New_York"
	),
	match(
		42,
		"2026-06-22T21:00:00Z",
		"Group Stage - Group I",
		"France",
		"Iraq",
		"Gillette",
		"America/New_York"
	),
	match(
		41,
		"2026-06-23T00:00:00Z",
		"Group Stage - Group I",
		"Norway",
		"Senegal",
		"Lincoln",
		"America/New_York"
	),
	match(
		61,
		"2026-06-26T19:00:00Z",
		"Group Stage - Group I",
		"Norway",
		"France",
		"MetLife",
		"America/New_York"
	),
	match(
		62,
		"2026-06-26T19:00:00Z",
		"Group Stage - Group I",
		"Senegal",
		"Iraq",
		"Gillette",
		"America/New_York"
	),

	// ══════════════ GROUP J: Argentina, Algeria, Austria, Jordan
	match(
		19,
		"2026-06-17T01:00:00Z",
		"Group Stage - Group J",
		"Argentina",
		"Algeria",
		"Arrowhead",
		"America/Chicago"
	),
	match(
		20,
		"2026-06-17T04:00:00Z",
		"Group Stage - Group J",
		"Austria",
		"Jordan",
		"Levis",
		"America/Los_Angeles"
	),
	match(
		43,
		"2026-06-22T17:00:00Z",
		"Group Stage - Group J",
		"Argentina",
		"Austria",
		"ATT",
		"America/Chicago"
	),
	match(
		44,
		"2026-06-23T03:00:00Z",
		"Group Stage - Group J",
		"Jordan",
		"Algeria",
		"ATT",
		"America/Chicago"
	),
	match(
		69,
		"2026-06-28T02:00:00Z",
		"Group Stage - Group J",
		"Algeria",
		"Austria",
		"Levis",
		"America/Los_Angeles"
	),
	match(
		70,
		"2026-06-28T02:00:00Z",
		"Group Stage - Group J",
		"Jordan",
		"Argentina",
		"Arrowhead",
		"America/Chicago"
	),

	// ══════════════ GROUP K: Portugal, DR Congo, Uzbekistan, Colombia
	match(
		23,
		"2026-06-17T17:00:00Z",
		"Group Stage - Group K",
		"Portugal",
		"DRCongo",
		"NRG",
		"America/Chicago"
	),
	match(
		24,
		"2026-06-18T02:00:00Z",
		"Group Stage - Group K",
		"Uzbekistan",
		"Colombia",
		"Azteca",
		"America/Mexico_City"
	),
	match(
		47,
		"2026-06-23T17:00:00Z",
		"Group Stage - Group K",
		"Portugal",
		"Uzbekistan",
		"NRG",
		"America/Chicago"
	),
	match(
		48,
		"2026-06-24T02:00:00Z",
		"Group Stage - Group K",
		"Colombia",
		"DRCongo",
		"Akron",
		"America/Mexico_City"
	),
	match(
		71,
		"2026-06-27T23:30:00Z",
		"Group Stage - Group K",
		"Colombia",
		"Portugal",
		"HardRock",
		"America/New_York"
	),
	match(
		72,
		"2026-06-27T23:30:00Z",
		"Group Stage - Group K",
		"DRCongo",
		"Uzbekistan",
		"Mercedes",
		"America/New_York"
	),

	// ══════════════ GROUP L: England, Croatia, Ghana, Panama
	match(
		22,
		"2026-06-17T20:00:00Z",
		"Group Stage - Group L",
		"England",
		"Croatia",
		"ATT",
		"America/Chicago"
	),
	match(
		21,
		"2026-06-17T23:00:00Z",
		"Group Stage - Group L",
		"Ghana",
		"Panama",
		"BMO",
		"America/Toronto"
	),
	match(
		45,
		"2026-06-23T20:00:00Z",
		"Group Stage - Group L",
		"England",
		"Ghana",
		"BMO",
		"America/Toronto"
	),
	match(
		46,
		"2026-06-23T23:00:00Z",
		"Group Stage - Group L",
		"Panama",
		"Croatia",
		"Gillette",
		"America/New_York"
	),
	match(
		67,
		"2026-06-27T21:00:00Z",
		"Group Stage - Group L",
		"Panama",
		"England",
		"BMO",
		"America/Toronto"
	),
	match(
		68,
		"2026-06-27T21:00:00Z",
		"Group Stage - Group L",
		"Croatia",
		"Ghana",
		"MetLife",
		"America/New_York"
	),

	// ══════════════ ROUND OF 32 (knockout — teams TBD)
	match(
		73,
		"2026-06-28T19:00:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"SoFi",
		"America/Los_Angeles"
	), // Runner-up A vs Runner-up B
	match(
		74,
		"2026-06-29T20:30:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"Gillette",
		"America/New_York"
	), // Winner E vs 3rd A/B/C/D/F
	match(
		75,
		"2026-06-30T01:00:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"BBVA",
		"America/Mexico_City"
	), // Winner F vs Runner-up C
	match(
		76,
		"2026-06-29T17:00:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"NRG",
		"America/Chicago"
	), // Winner C vs Runner-up F
	match(
		77,
		"2026-06-30T21:00:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"MetLife",
		"America/New_York"
	), // Winner I vs 3rd C/D/F/G/H
	match(
		78,
		"2026-06-30T17:00:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"ATT",
		"America/Chicago"
	), // Runner-up E vs Runner-up I
	match(
		79,
		"2026-07-01T01:00:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"Azteca",
		"America/Mexico_City"
	), // Winner A vs 3rd C/E/F/H/I
	match(
		80,
		"2026-07-01T16:00:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"Mercedes",
		"America/New_York"
	), // Winner L vs 3rd E/H/I/J/K
	match(
		81,
		"2026-07-02T00:00:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"LumenField",
		"America/Los_Angeles"
	), // Winner D vs 3rd B/E/F/I/J
	match(
		82,
		"2026-07-01T20:00:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"Levis",
		"America/Los_Angeles"
	), // Winner G vs 3rd A/E/H/I/J
	match(
		83,
		"2026-07-02T23:00:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"BMO",
		"America/Toronto"
	), // Runner-up K vs Runner-up L
	match(
		84,
		"2026-07-02T19:00:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"SoFi",
		"America/Los_Angeles"
	), // Winner H vs Runner-up J
	match(
		85,
		"2026-07-03T03:00:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"BCPlace",
		"America/Vancouver"
	), // Winner B vs 3rd E/F/G/I/J
	match(
		86,
		"2026-07-03T22:00:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"HardRock",
		"America/New_York"
	), // Winner J vs Runner-up H
	match(
		87,
		"2026-07-04T01:30:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"Arrowhead",
		"America/Chicago"
	), // Winner K vs 3rd D/E/I/J/L
	match(
		88,
		"2026-07-03T18:00:00Z",
		"Round of 32",
		"TBD",
		"TBD",
		"ATT",
		"America/Chicago"
	), // Runner-up D vs Runner-up G

	// ══════════════ ROUND OF 16
	match(
		89,
		"2026-07-04T21:00:00Z",
		"Round of 16",
		"TBD",
		"TBD",
		"Lincoln",
		"America/New_York"
	),
	match(
		90,
		"2026-07-04T17:00:00Z",
		"Round of 16",
		"TBD",
		"TBD",
		"NRG",
		"America/Chicago"
	),
	match(
		91,
		"2026-07-05T20:00:00Z",
		"Round of 16",
		"TBD",
		"TBD",
		"Lincoln",
		"America/New_York"
	),
	match(
		92,
		"2026-07-06T00:00:00Z",
		"Round of 16",
		"TBD",
		"TBD",
		"Azteca",
		"America/Mexico_City"
	),
	match(
		93,
		"2026-07-06T19:00:00Z",
		"Round of 16",
		"TBD",
		"TBD",
		"ATT",
		"America/Chicago"
	),
	match(
		94,
		"2026-07-07T00:00:00Z",
		"Round of 16",
		"TBD",
		"TBD",
		"LumenField",
		"America/Los_Angeles"
	),
	match(
		95,
		"2026-07-07T16:00:00Z",
		"Round of 16",
		"TBD",
		"TBD",
		"Mercedes",
		"America/New_York"
	),
	match(
		96,
		"2026-07-07T20:00:00Z",
		"Round of 16",
		"TBD",
		"TBD",
		"BCPlace",
		"America/Vancouver"
	),

	// ══════════════ QUARTERFINALS
	match(
		97,
		"2026-07-09T20:00:00Z",
		"Quarter-finals",
		"TBD",
		"TBD",
		"Gillette",
		"America/New_York"
	),
	match(
		98,
		"2026-07-10T19:00:00Z",
		"Quarter-finals",
		"TBD",
		"TBD",
		"SoFi",
		"America/Los_Angeles"
	),
	match(
		99,
		"2026-07-11T21:00:00Z",
		"Quarter-finals",
		"TBD",
		"TBD",
		"HardRock",
		"America/New_York"
	),
	match(
		100,
		"2026-07-12T01:00:00Z",
		"Quarter-finals",
		"TBD",
		"TBD",
		"Arrowhead",
		"America/Chicago"
	),

	// ══════════════ SEMI-FINALS
	match(
		101,
		"2026-07-14T19:00:00Z",
		"Semi-finals",
		"TBD",
		"TBD",
		"Mercedes",
		"America/New_York"
	),
	match(
		102,
		"2026-07-15T19:00:00Z",
		"Semi-finals",
		"TBD",
		"TBD",
		"ATT",
		"America/Chicago"
	),

	// ══════════════ THIRD PLACE
	match(
		103,
		"2026-07-18T21:00:00Z",
		"3rd Place Final",
		"TBD",
		"TBD",
		"HardRock",
		"America/New_York"
	),

	// ══════════════ FINAL
	match(
		104,
		"2026-07-19T19:00:00Z",
		"Final",
		"TBD",
		"TBD",
		"MetLife",
		"America/New_York"
	),
];

// ─── Seed ────────────────────────────────────────────────────────────────────
async function main() {
	console.log("🗑️  Clearing existing Match records...");
	const deleted = await prisma.match.deleteMany();
	console.log(`   Deleted ${deleted.count} records.`);

	console.log("⚽ Seeding FIFA World Cup 2026 matches...");
	let count = 0;
	for (const m of matches) {
		await prisma.match.upsert({
			where: { id: m.id },
			update: m,
			create: m,
		});
		count++;
	}

	const groups = matches.filter((m) => m.round.startsWith("Group")).length;
	const knockouts = matches.filter((m) => !m.round.startsWith("Group")).length;

	console.log(`\n✅ Done!`);
	console.log(`   ${count} total matches seeded`);
	console.log(`   ${groups} group stage matches (Groups A–L)`);
	console.log(`   ${knockouts} knockout matches (Round of 32 → Final)`);
	console.log(`\n📌 Note: Knockout matches use TBD teams (id=0).`);
	console.log(
		`   Fixture IDs 1-104 are placeholders — update when Football API publishes real IDs.`
	);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
