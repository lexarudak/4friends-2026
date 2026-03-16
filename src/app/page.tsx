import { auth } from "@/auth";
import { TableService } from "@/services/table.service";
import { AppHeader } from "@/components/widgets/app-header";
import styles from "./page.module.scss";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  const table = await TableService.getSmallTable();

  return (
    <>
      {user && (
        <AppHeader
          roomName={user.current_room}
          userName={user.name}
          userImage={user.image}
        />
      )}
      <main className={styles.page}>
        <pre>{JSON.stringify(table, null, 2)}</pre>
      </main>
    </>
  );
}

