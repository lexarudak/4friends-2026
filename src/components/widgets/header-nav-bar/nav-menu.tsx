"use client";

import { useState } from "react";
import { signOutUser } from "@/app/rooms/actions";
import { NAV_LINKS } from "./header-nav-bar.constants";
import { PreservedQueryLink } from "@/components/shared/preserved-query-link";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useI18n } from "@/i18n/provider";
import styles from "./header-nav-bar.module.scss";

export function NavMenu() {
	const { t } = useI18n();
	const [open, setOpen] = useState(false);

	const close = () => setOpen(false);

	return (
		<>
			{/* Desktop nav */}
			<ul className={styles.navLinks}>
				{NAV_LINKS.map((link) => (
					<li key={link.href} className={styles.navItem}>
						<PreservedQueryLink
							href={link.href}
							prefetch={false}
							className={link.icon ? styles.navLinkWithIcon : undefined}
						>
							{link.icon && <link.icon className={styles.navIcon} />}
							{t.nav[link.key]}
						</PreservedQueryLink>
					</li>
				))}
				<li className={styles.navItem}>
					<button onClick={signOutUser} className={styles.navBtn}>
						{t.nav.logout}
					</button>
				</li>
				<li className={styles.navItem}>
					<LanguageSwitcher />
				</li>
			</ul>

			{/* Burger button – visible on tablet/mobile */}
			<button
				className={styles.burger}
				onClick={() => setOpen(true)}
				aria-label={t.nav.openMenu}
				aria-expanded={open}
			>
				<span />
				<span />
				<span />
			</button>

			{/* Drawer */}
			{open && (
				<>
					<div className={styles.overlay} onClick={close} aria-hidden="true" />
					<nav className={styles.drawer}>
						<button
							className={styles.drawerClose}
							onClick={close}
							aria-label={t.nav.closeMenu}
						>
							<span />
							<span />
						</button>
						<ul className={styles.drawerLinks}>
							{NAV_LINKS.map((link) => (
								<li key={link.href} className={styles.drawerItem}>
									<PreservedQueryLink
										href={link.href}
										prefetch={false}
										className={link.icon ? styles.navLinkWithIcon : undefined}
										onClick={close}
									>
										{link.icon && <link.icon className={styles.navIcon} />}
										{t.nav[link.key]}
									</PreservedQueryLink>
								</li>
							))}
							<li className={styles.drawerItem}>
								<button onClick={signOutUser} className={styles.navBtn}>
									{t.nav.logout}
								</button>
							</li>
							<li className={styles.drawerItem}>
								<LanguageSwitcher className={styles.languageSwitcher} />
							</li>
						</ul>
					</nav>
				</>
			)}
		</>
	);
}
