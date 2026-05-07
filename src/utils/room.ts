export const ROOM_NAME_MIN_LENGTH = 3;
export const ROOM_NAME_MAX_LENGTH = 30;

export function normalizeRoomName(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

export function isRoomNameLengthValid(name: string): boolean {
	return (
		name.length >= ROOM_NAME_MIN_LENGTH && name.length <= ROOM_NAME_MAX_LENGTH
	);
}

export function getRoomNameLengthErrorMessage(): string {
	return `Room name should be between ${ROOM_NAME_MIN_LENGTH} and ${ROOM_NAME_MAX_LENGTH} characters.`;
}
