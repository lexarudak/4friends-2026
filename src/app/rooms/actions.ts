"use server";

import { auth, signOut, unstable_update } from "@/auth";
import { RoomService } from "@/services/room.service";
import { PAGES } from "@/utils/constants";
import { redirect } from "next/navigation";
import { UserService } from "@/services/user.service";

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
		await UserService.addUser(session.user.email, { current_room: roomName });
	}

	await unstable_update({ user: { current_room: roomName } });
	redirect(PAGES.HOME);
}

export async function signOutUser() {
	await signOut({ redirectTo: PAGES.LOGIN });
}

export const selectRoom = async (roomId: string) => {
	const session = await auth();
	if (session?.user?.email) {
		await UserService.addUser(session.user.email, { current_room: roomId });
	}

	await unstable_update({ user: { current_room: roomId } });
	redirect(PAGES.HOME);
};
