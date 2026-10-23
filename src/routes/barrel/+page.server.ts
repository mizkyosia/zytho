import { db } from "#lib/server/db/index.js";
import { delivery } from "#lib/server/db/schema.js";
import { formatDate } from "#lib/format.js";
import { desc } from "drizzle-orm";

export const load = async () => {
  const barrels = await db.query.barrel.findMany({
    orderBy: { id: "asc" },
  });

  const deliveries = (
    await db
      .select({ id: delivery.id, date: delivery.date })
      .from(delivery)
      .orderBy(desc(delivery.date))
  ).map((d) => ({ value: d.id, name: formatDate(d.date) }));

  return { barrels, deliveries };
};
