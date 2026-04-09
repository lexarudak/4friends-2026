import { HeaderInfoBar } from "@/components/widgets/header-info-bar";
import { HeaderNavBar } from "@/components/widgets/header-nav-bar";
import styles from "./app-header.module.scss";
import { auth } from "@/auth";

export async function AppHeader() {
	const session = await auth();
	const user = session?.user;

	return (
		<header className={styles.header}>
			<HeaderInfoBar
				roomName={user?.current_room}
				userName={user?.name}
				userImage={user?.image}
			/>
			<HeaderNavBar />
		</header>
	);
}
