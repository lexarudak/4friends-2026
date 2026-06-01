import { auth } from "@/auth";
import { RoomService } from "@/services/room.service";
import { signOutUser } from "./actions";
import { JoinRoomForm } from "@/components/features/join-room-form";
import { RoomItem } from "@/components/widgets/room-item";
import { CloseButton } from "@/components/shared/close-button";
import styles from "./page.module.scss";
import { PAGES } from "@/utils/constants";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionary";

export default async function RoomsPage() {
	const session = await auth();
	const t = getDictionary(await getLocale());

	const userId = session?.user?.email;
	const currentRoom = session?.user?.current_room ?? null;
	const userRooms = userId ? await RoomService.getUserRooms(userId) : [];
	const rooms = [...(currentRoom ? [currentRoom] : []), ...userRooms].filter(
		(roomId, index, allRooms) => allRooms.indexOf(roomId) === index
	);

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				<div className={styles.header}>
					{currentRoom && (
						<CloseButton
							linkArgs={{
								href: PAGES.HOME,
							}}
						/>
					)}

					<h1 className={styles.title}>{t.rooms.selectRoom}</h1>
				</div>
				<ul className={styles.list}>
					{rooms.map((roomId) => (
						<li key={roomId}>
							<RoomItem roomId={roomId} isActive={roomId === currentRoom} />
						</li>
					))}
				</ul>
				<JoinRoomForm />
				<form action={signOutUser} className={styles.logoutRow}>
					<span>{t.rooms.or}</span>
					<button type="submit" className={styles.logoutBtn}>
						{t.rooms.logout}
					</button>
				</form>
			</div>
		</div>
	);
}
