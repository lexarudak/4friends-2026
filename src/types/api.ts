import { API_ERROR_CODES } from "@/utils/constants";

export type ApiErrorCode =
	(typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export type ApiError = {
	error: ApiErrorCode;
};
