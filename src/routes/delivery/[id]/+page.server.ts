import { db } from "#lib/server/db/index.js";
import { beer } from "#lib/server/db/schema.js";
import { error } from "@sveltejs/kit";

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
  });

  const options = (
    await db.select({ value: beer.id, name: beer.name }).from(beer)
  ).map((o) => ({ value: o.value, name: o.name || "Sans nom" }));

  return { delivery, deliveries, options };
};
