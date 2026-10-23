import { db } from "#lib/server/db/index.js";
import { delivery, zytho, beer as beerTable } from "#lib/server/db/schema.js";
import { beerStocks } from "#lib/server/db/stats.js";
import { formatDate, zythoName } from "#lib/format.js";
import { error } from "@sveltejs/kit";
import { desc, eq, not } from "drizzle-orm";

export const load = async ({ params }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return error(400, "Bière non répertoriée");
  }

  const beer = await db.query.beer.findFirst({
    where: {
      id,
    },
    with: {
      deliveries: {
        columns: {
          count: true,
          id: true,
          deliveryId: true,
        },
        with: {
          fullDelivery: {
            columns: {
              date: true,
            },
          },
        },
      },
      zythos: {
        with: {
          zytho: true,
        },
      },
    },
  });

  if (!beer) return error(400, "Bière non répertoriée");

  const [stock] = await beerStocks(db, eq(beerTable.id, id));

  const beers = await db
    .select({ id: beerTable.id, name: beerTable.name })
    .from(beerTable)
    .where(not(eq(beerTable.id, beer.id)));

  const deliveries = (
    await db
      .select({ id: delivery.id, date: delivery.date })
      .from(delivery)
      .orderBy(desc(delivery.date))
  ).map((d) => ({
    value: d.id,
    name: formatDate(d.date),
    date: d.date,
  }));

  const zythos = (
    await db.select().from(zytho).orderBy(desc(zytho.date))
  ).map((z) => ({
    value: z.id,
    name: zythoName(z),
    zytho: z,
  }));

  return { beer, stock, beers, deliveries, zythos };
};
