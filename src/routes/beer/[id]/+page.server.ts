import { db } from "#lib/server/db/index.js";
import { delivery, zytho, beer as beerTable } from "#lib/server/db/schema.js";
import { error } from "@sveltejs/kit";
import { eq, not } from "drizzle-orm";

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

  const beers = await db
    .select({ id: beerTable.id, name: beerTable.name })
    .from(beerTable)
    .where(not(eq(beerTable.id, beer.id)));

  const deliveries = (
    await db.select({ id: delivery.id, date: delivery.date }).from(delivery)
  ).map((z) => ({
    value: z.id,
    name: z.date,
  }));

  const zythos = (await db.select().from(zytho)).map((z) => ({
    value: z.id,
    name: z.name || "Zytho du " + z.date,
  }));

  return { beer, beers, deliveries, zythos };
};
