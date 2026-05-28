import { LogoIcon } from "@/components/icons";
import styles from "./header-nav-bar.module.scss";
import { PAGES } from "@/utils/constants";
import { PageContainer } from "@/components/shared/page-container";
import { NavMenu } from "./nav-menu";
import { PreservedQueryLink } from "@/components/shared/preserved-query-link";

export function HeaderNavBar() {
	return (
		<nav className={styles.bar}>
			<PageContainer className={styles.container}>
				<PreservedQueryLink href={PAGES.HOME} className={styles.logoLink}>
					<LogoIcon className={styles.logo} />
				</PreservedQueryLink>

				<NavMenu />
			</PageContainer>
		</nav>
	);
}
