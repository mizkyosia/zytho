import { db } from "#lib/server/db/index.js";
import { error } from "@sveltejs/kit";

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

  const beers = await db.query.beer.findMany({
    columns: {
      id: true,
      name: true,
    },
    where: {
      NOT: {
        id: beer.id,
      },
    },
  });

  return { beer, beers };
};
