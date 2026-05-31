import { API_ERROR_CODES } from "@/utils/constants";

export type ApiErrorCode =
	(typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export type ApiError = {
	error: ApiErrorCode;
};

export type ApiErrorWithMessage = ApiError & {
	message?: string;
};

export type RoomItem = {
	id: string;
	name: string;
	tournament?: string;
	password?: string | null;
};

export type UserResponse = {
	name: string | null;
	email: string;
	image: string | null;
	current_room: string | null;
};

export type Color =
	| "neutral"
	| "primary"
	| "green"
	| "red"
	| "alpha"
	| "yellow";
export type Team = {
	name: string;
	flag: string; // emoji
};

export type Match = {
	id: string;
	group: string;
	time: string; // "HH:MM"
	date: string; // "DD/MM/YY"
	home: Team;
	away: Team;
};

export type NextMatch = {
	id: string;
	group: string;
	targetDateIso: string;
	home: Team;
	away: Team;
};

export type LiveMatchInfo = {
	id: string;
	round: string;
	statusShort: string;
	statusElapsed: number | null;
	statusExtra: number | null;
	home: Team & { goals: number | null };
	away: Team & { goals: number | null };
};

export type NextMatchTimerPayload = {
	tournament: string;
	serverNow: string;
	isTournamentFinished: boolean;
	nextMatch: NextMatch | null;
	hasLive: boolean;
	lastSyncAt: string | null;
	liveMatches: LiveMatchInfo[];
};

export type Bet = {
	matchId: string;
	home: number | null;
	away: number | null;
	winPick?: "home" | "away" | null;
};

export type TableRow = {
	position: number;
	name: string;
	sub?: string;
	score: number;
	isCurrentUser?: boolean;
	tag?: string;
	status?: string;
};

export type ScoreTableData = {
	rows: TableRow[];
	currentUserRow?: TableRow;
};

export type StatSection = {
	title: string;
	rows: TableRow[];
};

export type BetsFormValues = {
	bets: Record<
		string,
		{ home: string; away: string; winPick: "" | "home" | "away" }
	>;
};

export type PersonalStat = {
	label: string;
	value: string | number;
	sub?: string;
	size?: "sm" | "md" | "lg";
	variant?: "default" | "highlight" | "warm";
};

export type BetHistoryItem = {
	id: string;
	group: string;
	homeTeam: string;
	homeFlag: string;
	awayTeam: string;
	awayFlag: string;
	betHome: number;
	betAway: number;
	resultHome: number | null;
	resultAway: number | null;
	time: string;
	date: string;
	points: number | null;
	winner?: "home" | "away" | null;
};
