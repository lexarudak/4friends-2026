"use client";

import { useState } from "react";
import Link from "next/link";
import { signOutUser } from "@/app/rooms/actions";
import { NAV_LINKS } from "./header-nav-bar.constants";
import styles from "./header-nav-bar.module.scss";

export function NavMenu() {
	const [open, setOpen] = useState(false);

	const close = () => setOpen(false);

	return (
		<>
			{/* Desktop nav */}
			<ul className={styles.navLinks}>
				{NAV_LINKS.map((link) => (
					<li key={link.href} className={styles.navItem}>
						<Link
							href={link.href}
							prefetch={false}
							className={link.icon ? styles.navLinkWithIcon : undefined}
						>
							{link.icon && <link.icon className={styles.navIcon} />}
							{link.label}
						</Link>
					</li>
				))}
				<li className={styles.navItem}>
					<button onClick={signOutUser} className={styles.navBtn}>
						Logout
					</button>
				</li>
			</ul>

			{/* Burger button – visible on tablet/mobile */}
			<button
				className={styles.burger}
				onClick={() => setOpen(true)}
				aria-label="Open menu"
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
							aria-label="Close menu"
						>
							<span />
							<span />
						</button>
						<ul className={styles.drawerLinks}>
							{NAV_LINKS.map((link) => (
								<li key={link.href} className={styles.drawerItem}>
									<Link
										href={link.href}
										prefetch={false}
										className={link.icon ? styles.navLinkWithIcon : undefined}
										onClick={close}
									>
										{link.icon && <link.icon className={styles.navIcon} />}
										{link.label}
									</Link>
								</li>
							))}
							<li className={styles.drawerItem}>
								<button onClick={signOutUser} className={styles.navBtn}>
									Logout
								</button>
							</li>
						</ul>
					</nav>
				</>
			)}
		</>
	);
}
