"use client";

import Image from "next/image";
import styles from "./header-info-bar.module.scss";
import { PAGES } from "@/utils/constants";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/shared/button";
import { useI18n } from "@/i18n/provider";

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
	const { t } = useI18n();

	return (
		<div className={styles.bar}>
			<PageContainer className={styles.container}>
				<div className={styles.roomSection}>
					{roomName ? (
						<>
							<span className={styles.roomLabel}>{t.headerInfoBar.room}</span>
							<Button
								href={PAGES.ROOMS}
								variant="inline"
								color="primary"
								className={styles.roomName}
							>
								{roomName}
							</Button>
						</>
					) : (
						<span className={styles.noRoom}>{t.headerInfoBar.selectRoom}</span>
					)}
				</div>
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
