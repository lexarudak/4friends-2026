"use server";

import { auth, signOut, unstable_update } from "@/auth";
import { RoomService } from "@/services/room.service";
import { PAGES } from "@/utils/constants";
import { redirect } from "next/navigation";
import { DbUnavailableError, UserService } from "@/services/user.service";

export type JoinRoomState = { error: string | null };

export async function joinNewRoom(
	_prevState: JoinRoomState,
	formData: FormData
): Promise<JoinRoomState> {
	const roomName = (formData.get("room_id") as string)?.trim();
	if (!roomName) return { error: "Please enter a room name" };

	const room = await RoomService.getRoomByName(roomName);
	if (!room) return { error: "This room does not exist" };

	const session = await auth();
	if (session?.user?.email) {
		try {
			await UserService.addUser(session.user.email, { current_room: roomName });
		} catch (err) {
			if (err instanceof DbUnavailableError) return { error: err.message };
			throw err;
		}
	}

	await unstable_update({ user: { current_room: roomName } });
	redirect(PAGES.HOME);
}

export async function signOutUser() {
	await signOut({ redirectTo: PAGES.LOGIN });
}

export const selectRoom = async (
	roomId: string,
	_prevState: { error: string } | null
): Promise<{ error: string } | never> => {
	const session = await auth();
	if (session?.user?.email) {
		try {
			await UserService.addUser(session.user.email, { current_room: roomId });
		} catch (err) {
			if (err instanceof DbUnavailableError) return { error: err.message };
			throw err;
		}
	}

	await unstable_update({ user: { current_room: roomId } });
	redirect(PAGES.HOME);
};
