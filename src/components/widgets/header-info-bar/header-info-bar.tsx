import Image from "next/image";
import styles from "./header-info-bar.module.scss";

interface HeaderInfoBarProps {
	roomName?: string | null;
	userName?: string | null;
	userImage?: string | null;
}

export function HeaderInfoBar({ roomName, userName, userImage }: HeaderInfoBarProps) {
	return (
		<div className={styles.topBar}>
			<div className={styles.roomSection}>
				<span className={styles.roomLabel}>Room</span>
				<span className={styles.roomName}>{roomName ?? "—"}</span>
			</div>
			<div className={styles.userSection}>
				{userImage && (
					<Image
						src={userImage}
						alt={userName ?? ""}
						width={22}
						height={22}
						className={styles.avatar}
					/>
				)}
				<span className={styles.userName}>{userName}</span>
			</div>
		</div>
	);
}
