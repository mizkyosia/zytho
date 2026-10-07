import { db } from "#lib/server/db/index.js";
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

  return { delivery, deliveries };
};
