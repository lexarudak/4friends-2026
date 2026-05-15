import Link from "next/link";
import { LogoIcon } from "@/components/icons";
import styles from "./header-nav-bar.module.scss";
import { PAGES } from "@/utils/constants";
import { PageContainer } from "@/components/shared/page-container";
import { NavMenu } from "./nav-menu";

export function HeaderNavBar() {
	return (
		<nav className={styles.bar}>
			<PageContainer className={styles.container}>
				<Link href={PAGES.HOME} className={styles.logoLink}>
					<LogoIcon className={styles.logo} />
				</Link>

				<NavMenu />
			</PageContainer>
		</nav>
	);
}
