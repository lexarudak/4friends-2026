"use client";

import { useActionState, useState } from "react";
import { cn } from "@/utils/lib";
import { leaveRoom, selectRoom } from "@/app/rooms/actions";
import { useI18n } from "@/i18n/provider";
import styles from "./room-item.module.scss";

interface RoomItemProps {
	roomId: string;
	isActive: boolean;
}

export function RoomItem({ roomId, isActive }: RoomItemProps) {
	const { t } = useI18n();
	const [selectState, selectAction, isSelecting] = useActionState(
		selectRoom.bind(null, roomId),
		null
	);
	const [leaveState, leaveAction, isLeaving] = useActionState(
		leaveRoom.bind(null, roomId),
		null
	);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

	const error = selectState?.error ?? leaveState?.error;

	return (
		<div className={styles.row}>
			<div className={styles.main}>
				<form action={selectAction} className={styles.selectForm}>
					<button
						type="submit"
						disabled={isSelecting || isLeaving}
						className={cn(styles.roomItem, { [styles.active]: isActive })}
					>
						{roomId}
					</button>
				</form>

				<button
					type="button"
					className={styles.leaveBtn}
					aria-label={`${t.rooms.leave}: ${roomId}`}
					disabled={isSelecting || isLeaving}
					onClick={() => setIsConfirmOpen(true)}
				>
					✕
				</button>
			</div>

			{error && <p className={styles.error}>{error}</p>}

			{isConfirmOpen && (
				<div
					className={styles.modalOverlay}
					onClick={() => !isLeaving && setIsConfirmOpen(false)}
				>
					<div
						className={styles.modal}
						role="dialog"
						aria-modal="true"
						onClick={(e) => e.stopPropagation()}
					>
						<p className={styles.modalText}>
							{t.rooms.leaveTitle} &laquo;{roomId}&raquo;?
						</p>
						<p className={styles.modalWarning}>{t.rooms.leaveWarning}</p>
						<div className={styles.modalActions}>
							<form action={leaveAction}>
								<button
									type="submit"
									disabled={isLeaving}
									className={styles.confirmBtn}
								>
									{t.rooms.leaveConfirm}
								</button>
							</form>
							<button
								type="button"
								disabled={isLeaving}
								className={styles.cancelBtn}
								onClick={() => setIsConfirmOpen(false)}
							>
								{t.rooms.leaveCancel}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
