"use server";

import { auth, signOut, unstable_update } from "@/auth";
import { RoomService } from "@/services/room.service";
import { PAGES } from "@/utils/constants";
import { redirect } from "next/navigation";

export type JoinRoomState = { error: string | null };

function logActionResponse(action: string, response: unknown) {
	console.info(`[rooms:${action}] response`, response);
}

function logActionRedirect(action: string, to: string) {
	console.info(`[rooms:${action}] redirect`, { to });
}

function logActionError(action: string, error: unknown) {
	console.error(`[rooms:${action}] error`, error);
}

function isNextRedirectError(err: unknown): err is { digest: string } {
	if (!err || typeof err !== "object") return false;
	const maybe = err as { digest?: unknown };
	return (
		typeof maybe.digest === "string" && maybe.digest.startsWith("NEXT_REDIRECT")
	);
}

export async function joinNewRoom(
	_prevState: JoinRoomState,
	formData: FormData
): Promise<JoinRoomState> {
	try {
		const roomName = (formData.get("room_id") as string)?.trim();
		if (!roomName) {
			const response = { error: "Please enter a room name" };
			logActionResponse("join-new-room", response);
			return response;
		}

		const room = await RoomService.getRoomByName(roomName);
		if (!room) {
			const response = { error: "This room does not exist" };
			logActionResponse("join-new-room", response);
			return response;
		}

		if (room.password) {
			const entered = ((formData.get("password") as string) ?? "").trim();
			if (entered !== room.password) {
				const response = { error: "Incorrect password" };
				logActionResponse("join-new-room", response);
				return response;
			}
		}

		const session = await auth();
		if (!session?.user?.email) {
			const response = { error: "You are not authorized" };
			logActionResponse("join-new-room", response);
			return response;
		}

		const updated = await RoomService.joinRoomAndSetCurrent(
			session.user.email,
			session.user.name,
			roomName
		);
		if (!updated) {
			const response = { error: "Could not join room" };
			logActionResponse("join-new-room", response);
			return response;
		}

		await unstable_update({ user: { current_room: roomName } });
		logActionRedirect("join-new-room", PAGES.HOME);
		redirect(PAGES.HOME);
	} catch (err) {
		if (isNextRedirectError(err)) {
			throw err;
		}

		logActionError("join-new-room", err);
		const response = { error: "Could not join room" };
		logActionResponse("join-new-room", response);
		return response;
	}
}

export const leaveRoom = async (
	roomId: string,
	_prevState: { error: string } | null
): Promise<{ error: string } | never> => {
	void _prevState;

	try {
		const session = await auth();
		if (!session?.user?.email) {
			const response = { error: "You are not authorized" };
			logActionResponse("leave-room", response);
			return response;
		}

		const result = await RoomService.leaveRoom(session.user.email, roomId);
		if (!result.left) {
			const response = { error: "Could not leave room" };
			logActionResponse("leave-room", response);
			return response;
		}

		// Push the (possibly changed) active room into the session immediately;
		// the jwt callback also re-reads it from the DB on the next request.
		await unstable_update({
			user: { current_room: result.newCurrentRoom },
		});
		logActionRedirect("leave-room", PAGES.ROOMS);
		redirect(PAGES.ROOMS);
	} catch (err) {
		if (isNextRedirectError(err)) {
			throw err;
		}

		logActionError("leave-room", err);
		const response = { error: "Could not leave room" };
		logActionResponse("leave-room", response);
		return response;
	}
};

export async function signOutUser() {
	logActionRedirect("sign-out", PAGES.LOGIN);
	await signOut({ redirectTo: PAGES.LOGIN });
}

export const selectRoom = async (
	roomId: string,
	_prevState: { error: string } | null
): Promise<{ error: string } | never> => {
	void _prevState;

	try {
		const session = await auth();
		if (!session?.user?.email) {
			const response = { error: "You are not authorized" };
			logActionResponse("select-room", response);
			return response;
		}

		const room = await RoomService.getRoomByName(roomId);
		if (!room) {
			const response = { error: "This room does not exist" };
			logActionResponse("select-room", response);
			return response;
		}

		const updated = await RoomService.joinRoomAndSetCurrent(
			session.user.email,
			session.user.name,
			roomId
		);
		if (!updated) {
			const response = { error: "Could not switch room" };
			logActionResponse("select-room", response);
			return response;
		}

		await unstable_update({ user: { current_room: roomId } });
		logActionRedirect("select-room", PAGES.HOME);
		redirect(PAGES.HOME);
	} catch (err) {
		if (isNextRedirectError(err)) {
			throw err;
		}

		logActionError("select-room", err);
		const response = { error: "Could not switch room" };
		logActionResponse("select-room", response);
		return response;
	}
};
