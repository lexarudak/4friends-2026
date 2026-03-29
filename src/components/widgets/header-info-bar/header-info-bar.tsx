import Image from "next/image";
import styles from "./header-info-bar.module.scss";
import Link from "next/link";
import { PAGES } from "@/utils/constants";
import { PageContainer } from "@/components/shared/page-container";

interface HeaderInfoBarProps {
	roomName?: string | null;
	userName?: string | null;
	userImage?: string | null;
}

export function HeaderInfoBar({
	roomName,
	userName,
	userImage,
}: HeaderInfoBarProps) {
	return (
		<div className={styles.bar}>
			<PageContainer className={styles.container}>
				<Link href={PAGES.ROOMS} className={styles.roomSection}>
					{roomName ? (
						<>
							<span className={styles.roomLabel}>Room</span>
							<span className={styles.roomName}>{roomName}</span>
						</>
					) : (
						<span className={styles.noRoom}>Select a room</span>
					)}
				</Link>
				<div className={styles.userSection}>
					{userImage && (
						<Image
							src={userImage}
							alt={""}
							width={16}
							height={16}
							className={styles.avatar}
						/>
					)}
					<span className={styles.userName}>{userName}</span>
				</div>
			</PageContainer>
		</div>
	);
}
