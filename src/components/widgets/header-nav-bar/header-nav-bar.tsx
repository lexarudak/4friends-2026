import { LogoIcon } from "@/components/icons";
import styles from "./header-nav-bar.module.scss";
import { PAGES } from "@/utils/constants";
import { PageContainer } from "@/components/shared/page-container";
import { NavMenu } from "./nav-menu";
import { PreservedQueryLink } from "@/components/shared/preserved-query-link";
import { getActiveRoomImage } from "@/lib/active-room";

export async function HeaderNavBar() {
	const roomImage = await getActiveRoomImage();

	return (
		<nav className={styles.bar}>
			<PageContainer className={styles.container}>
				<PreservedQueryLink href={PAGES.HOME} className={styles.logoLink}>
					{roomImage ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={roomImage} alt="" className={styles.logoImage} />
					) : (
						<LogoIcon className={styles.logo} />
					)}
				</PreservedQueryLink>

				<NavMenu />
			</PageContainer>
		</nav>
	);
}
