import { db } from "#lib/server/db/index.js";

export const load = async () => {
  const deliveries = await db.query.delivery.findMany({
    with: {
      lines: {
        columns: {
          count: true,
        },
      },
    },
  });

  return {
    deliveries: deliveries.map(({ lines, ...r }) => ({
      ...r,
      beerCount: lines.reduce((a, b) => a + b.count, 0),
    })),
  };
};
