import { API_ERROR_CODES } from "@/utils/constants";

export type ApiErrorCode =
	(typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export type ApiError = {
	error: ApiErrorCode;
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
