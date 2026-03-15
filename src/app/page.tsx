import { auth } from "@/auth";
import Image from "next/image";
import { TableService } from "@/services/table.service";
import styles from "./page.module.scss";

export default async function Home() {
  const session = await auth();
  const user = session?.user;


  const table = await TableService.getSmallTable();

  return (
    <main className={styles.page}>
      {user && (
        <div className={styles.greeting}>
          {user.image && (
            <Image
              src={user.image}
              alt={user.name ?? ""}
              width={64}
              height={64}
              className={styles.avatar}
            />
          )}
          <h1 className={styles.title}>Hello, {user.name}!</h1>
        </div>
      )}
      <pre>{JSON.stringify(table, null, 2)}</pre>
    </main>
  );
}
