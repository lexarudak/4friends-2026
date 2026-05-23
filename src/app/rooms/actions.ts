"use server";

import { auth, signOut, unstable_update } from "@/auth";
import { RoomService } from "@/services/room.service";
import { PAGES } from "@/utils/constants";
import { redirect } from "next/navigation";

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
	if (!session?.user?.email) return { error: "You are not authorized" };

	const updated = await RoomService.joinRoomAndSetCurrent(
		session.user.email,
		session.user.name,
		roomName
	);
	if (!updated) return { error: "Could not join room" };

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
	if (!session?.user?.email) return { error: "You are not authorized" };

	const room = await RoomService.getRoomByName(roomId);
	if (!room) return { error: "This room does not exist" };

	const updated = await RoomService.joinRoomAndSetCurrent(
		session.user.email,
		session.user.name,
		roomId
	);
	if (!updated) return { error: "Could not switch room" };

	await unstable_update({ user: { current_room: roomId } });
	redirect(PAGES.HOME);
};
