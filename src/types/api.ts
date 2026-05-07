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

export type Bet = {
	matchId: string;
	home: number | null;
	away: number | null;
};

export type TableRow = {
	position: number;
	name: string;
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
	bets: Record<string, { home: string; away: string }>;
};
