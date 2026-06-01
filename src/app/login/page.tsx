import Link from "next/link";
import styles from "./page.module.scss";
import { signInWithGoogle } from "./actions";
import { GoogleIcon, LogoIcon } from "@/components/icons";
import { PAGES } from "@/utils/constants";
import { PrivacyNotice } from "@/components/features/privacy-notice";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionary";

export default async function LoginPage() {
	const t = getDictionary(await getLocale());

	return (
		<div className={styles.page}>
			<div className={styles.card}>
				<div className={styles.logo}>
					<LogoIcon />
				</div>

				<h1 className={styles.title}>{t.login.welcome}</h1>
				<p className={styles.subtitle}>{t.login.chooseContinue}</p>

				<div className={styles.providers}>
					<form action={signInWithGoogle}>
						<button className={styles.btn} type="submit">
							<GoogleIcon />
							{t.login.continueGoogle}
						</button>
					</form>
				</div>

				<p className={styles.rulesLink}>
					<Link href={PAGES.ABOUT}>{t.login.orReadRules}</Link>
				</p>
				<PrivacyNotice />
			</div>
		</div>
	);
}
