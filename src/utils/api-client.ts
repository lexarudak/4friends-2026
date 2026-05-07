import type { ApiErrorWithMessage } from "@/types/api";

async function readErrorMessage(
	response: Response,
	fallbackMessage: string
): Promise<string> {
	try {
		const payload = (await response.json()) as ApiErrorWithMessage;
		return payload.message ?? fallbackMessage;
	} catch {
		return fallbackMessage;
	}
}

export function requestApi(
	input: RequestInfo | URL,
	init?: RequestInit
): Promise<Response> {
	return fetch(input, init);
}

export async function requestJson<T>(
	input: RequestInfo | URL,
	init: RequestInit = {},
	fallbackErrorMessage: string
): Promise<T> {
	const response = await requestApi(input, init);

	if (!response.ok) {
		throw new Error(await readErrorMessage(response, fallbackErrorMessage));
	}

	return (await response.json()) as T;
}
