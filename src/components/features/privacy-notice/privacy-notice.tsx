"use client";

import { useState, type FC } from "react";
import { Modal } from "@/components/shared/modal";
import styles from "./privacy-notice.module.scss";

export const PrivacyNotice: FC = () => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<p className={styles.notice}>
				By continuing you agree to our{" "}
				<button
					className={styles.link}
					type="button"
					onClick={() => setOpen(true)}
				>
					Terms &amp; Privacy Policy
				</button>
			</p>

			<Modal isOpen={open} onClose={() => setOpen(false)}>
				<div className={styles.content}>
					<h2 className={styles.title}>Terms &amp; Privacy Policy</h2>

					<div className={styles.badge18}>18+</div>

					<section className={styles.section}>
						<h3 className={styles.sectionTitle}>Adults Only</h3>
						<p className={styles.text}>
							This application is intended for users aged 18 and over.
						</p>
					</section>

					<section className={styles.section}>
						<h3 className={styles.sectionTitle}>Not a Bookmaker</h3>
						<p className={styles.text}>
							4friends is not a betting or gambling service. We do not accept
							payments, make payouts, or offer prizes of any kind. Bookmaking
							companies exploit addictive behaviour and cause real harm to
							people. We want no part of that.
						</p>
					</section>

					<section className={styles.section}>
						<h3 className={styles.sectionTitle}>What We Actually Are</h3>
						<p className={styles.text}>
							We are a free score-prediction game. You predict match results,
							earn points, and see who performs best among your friends. We help
							you keep track of the score and maintain statistics so you and
							your friends can compete — nothing more. Any personal stakes
							between friends are entirely your own arrangement; we have no
							involvement whatsoever.
						</p>
					</section>

					<section className={styles.section}>
						<h3 className={styles.sectionTitle}>Your Data</h3>
						<p className={styles.text}>
							We do not collect, sell, or share your personal data. Registration
							is handled exclusively via{" "}
							<a
								href="https://accounts.google.com"
								target="_blank"
								rel="noopener noreferrer"
								className={styles.externalLink}
							>
								Google Sign-In
							</a>
							. During sign-in, Google provides us with:
						</p>
						<ul className={styles.list}>
							<li>Your display name (as set in your Google account)</li>
							<li>Your email address</li>
							<li>Your profile picture</li>
						</ul>
						<p className={styles.text}>
							These are used solely to identify your account within the app and
							are not shared with any third party.
						</p>
					</section>

					<section className={styles.section}>
						<h3 className={styles.sectionTitle}>No Newsletters</h3>
						<p className={styles.text}>
							We do not send emails, push notifications, or promotional messages
							of any kind.
						</p>
					</section>

					<section className={styles.section}>
						<h3 className={styles.sectionTitle}>Cookies</h3>
						<p className={styles.text}>
							We use a single cookie to store your authentication token, which
							keeps you logged in between sessions. No tracking, analytics,
							advertising, or third-party cookies are used.
						</p>
					</section>
				</div>
			</Modal>
		</>
	);
};
