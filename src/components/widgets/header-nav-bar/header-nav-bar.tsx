

import Link from "next/link";
import { FwcLogoIcon } from "@/components/icons";
import styles from "./header-nav-bar.module.scss";
import { NAV_LINKS } from "./header-nav-bar.constants";
import { signOutUser } from "@/app/rooms/actions";
import { PAGES } from "@/utils/constants";
import { PageContainer } from "@/components/shared/page-container";

export  function HeaderNavBar() {
	return (
		<nav className={styles.bar}>
      <PageContainer className={styles.container}>
        <Link href={PAGES.HOME}><FwcLogoIcon className={styles.logo} /></Link>
        
        <ul className={styles.navLinks}>
          {NAV_LINKS.map(link => (
            <li key={link.href} className={styles.navItem}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}

          <li className={styles.navItem}>
            <button onClick={signOutUser} className={styles.navBtn}>Logout</button>
          </li>
        </ul>
      </PageContainer>
		</nav>
	);
}
