import Image from "next/image";
import styles from "./page.module.scss";
import { signInWithGoogle, signInWithApple } from "./actions";
import { GoogleIcon, AppleIcon } from "@/components/icons";

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>

        <div className={styles.logo}>
          <Image src="/logo.svg" alt="4friends" width={64} height={64} priority />
        </div>

        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Choose how you&apos;d like to continue</p>

        <div className={styles.providers}>

          <form action={signInWithGoogle}>
            <button className={styles.btn} type="submit">
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <form action={signInWithApple}>
            <button className={`${styles.btn} ${styles.btnApple}`} type="submit">
              <AppleIcon />
              Continue with Apple
            </button>
          </form>

        </div>

      </div>
    </main>
  );
}

