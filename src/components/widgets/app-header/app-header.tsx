import Image from "next/image";
import Link from "next/link";
import { FwcLogoIcon } from "@/components/icons";
import styles from "./app-header.module.scss";

interface AppHeaderProps {
  roomName?: string | null;
  userName?: string | null;
  userImage?: string | null;
}

export function AppHeader({ roomName, userName, userImage }: AppHeaderProps) {
  return (
    <header className={styles.header}>

      {/* Top strip: room name ← gap → user info */}
      <div className={styles.topBar}>
        <div className={styles.roomSection}>
          <span className={styles.roomLabel}>Room</span>
          <span className={styles.roomName}>{roomName ?? "—"}</span>
        </div>
        <div className={styles.userSection}>
          {userImage && (
            <Image
              src={userImage}
              alt={userName ?? ""}
              width={22}
              height={22}
              className={styles.avatar}
            />
          )}
          <span className={styles.userName}>{userName}</span>
        </div>
      </div>

      {/* Bottom nav bar */}
      <nav className={styles.bottomBar}>
        <FwcLogoIcon className={styles.logo} />
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>Scores &amp; Fixtures</Link>
          <Link href="/rooms" className={styles.navLink}>Rooms</Link>
          <Link href="/about" className={styles.navLink}>About</Link>
        </div>
      </nav>

    </header>
  );
}
