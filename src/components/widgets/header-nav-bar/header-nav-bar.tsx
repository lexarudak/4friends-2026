import Link from "next/link";
import { FwcLogoIcon } from "@/components/icons";
import styles from "./header-nav-bar.module.scss";
import { NAV_LINKS } from "./header-nav-bar.constants";

export function HeaderNavBar() {
	return (
		<nav className={styles.bar}>
			<FwcLogoIcon className={styles.logo} />
			<div className={styles.navLinks}>
        {NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href} className={styles.navLink}>{link.label}</Link>
        ))}
			</div>
		</nav>
	);
}
