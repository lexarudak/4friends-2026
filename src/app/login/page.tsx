import Link from "next/link";
import styles from "./page.module.scss";
import { signInWithGoogle } from "./actions";
import { GoogleIcon, LogoIcon } from "@/components/icons";
import { PAGES } from "@/utils/constants";
import { ShadowCard } from "@/components/shared/shadow-card/shadow-card";

export default function LoginPage() {
	return (
		<div className={styles.page}>
			<ShadowCard className={styles.card}>
				<div className={styles.logo}>
					<LogoIcon />
				</div>

				<h1 className={styles.title}>Welcome to 4Friends!</h1>
				<p className={styles.subtitle}>
					Choose how you&apos;d like to continue
				</p>

				<div className={styles.providers}>
					<form action={signInWithGoogle}>
						<button className={styles.btn} type="submit">
							<GoogleIcon />
							Continue with Google
						</button>
					</form>
				</div>

				<p className={styles.rulesLink}>
					Or read our <Link href={PAGES.ABOUT}>rules</Link>
				</p>
			</ShadowCard>
		</div>
	);
}
