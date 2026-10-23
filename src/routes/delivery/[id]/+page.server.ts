import { db } from "#lib/server/db/index.js";
import { barrel, beer } from "#lib/server/db/schema.js";
import { error } from "@sveltejs/kit";
import { and, eq, isNull } from "drizzle-orm";

export const load = async ({ params }) => {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return error(400, "ID inexistante");
  }

  const delivery = await db.query.delivery.findFirst({
    where: {
      id,
    },
    with: {
      lines: {
        columns: {
          count: true,
          id: true,
          beerId: true,
        },
      },
      barrels: {
        orderBy: { id: "asc" },
      },
      returnedBarrels: {
        columns: { id: true, name: true, opened: true },
      },
    },
  });

  if (!delivery) return error(400, "Livraison non répertoriée");

  const deliveries = await db.query.delivery.findMany({
    columns: {
      id: true,
      date: true,
    },
    where: {
      NOT: {
        id: delivery.id,
      },
    },
    orderBy: { date: "desc" },
  });

  const options = (
    await db
      .select({
        value: beer.id,
        name: beer.name,
        buyingPrice: beer.buyingPrice,
      })
      .from(beer)
  ).map((o) => ({ ...o, name: o.name || "Sans nom" }));

  // Empty barrels which haven't been given back yet
  const returnable = (
    await db
      .select({ value: barrel.id, name: barrel.name, opened: barrel.opened })
      .from(barrel)
      .where(and(eq(barrel.status, "emptied"), isNull(barrel.returnDeliveryId)))
  ).map((b) => ({ ...b, name: `${b.name || "Sans nom"} (#${b.value})` }));

  return { delivery, deliveries, options, returnable };
};
