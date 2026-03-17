import { HeaderInfoBar } from "@/components/widgets/header-info-bar";
import { HeaderNavBar } from "@/components/widgets/header-nav-bar";
import styles from "./app-header.module.scss";

interface AppHeaderProps {
	roomName?: string | null;
	userName?: string | null;
	userImage?: string | null;
}

export function AppHeader({ roomName, userName, userImage }: AppHeaderProps) {
	return (
		<header className={styles.header}>
			<HeaderInfoBar roomName={roomName} userName={userName} userImage={userImage} />
			<HeaderNavBar />
		</header>
	);
}
