import Link from "next/link";
import { FwcLogoIcon } from "@/components/icons";
import styles from "./header-nav-bar.module.scss";

export function HeaderNavBar() {
	return (
		<nav className={styles.bottomBar}>
			<FwcLogoIcon className={styles.logo} />
			<div className={styles.navLinks}>
				<Link href="/" className={styles.navLink}>Scores &amp; Fixtures</Link>
				<Link href="/rooms" className={styles.navLink}>Rooms</Link>
				<Link href="/about" className={styles.navLink}>About</Link>
			</div>
		</nav>
	);
}
