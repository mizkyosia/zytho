import { sql } from "drizzle-orm";
import { createDb, type DB } from "../src/lib/server/db/client.ts";

export function connect(url: string) {
  return createDb(url);
}

export async function resetDb(db: DB) {
  await db.execute(
    sql`truncate "Barrel", "ZythoLine", "Zytho", "DeliveryLine", "Delivery", "Beer" restart identity cascade`,
  );
}
