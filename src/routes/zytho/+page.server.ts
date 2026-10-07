import { db } from "#lib/server/db/index.js";
import * as schema from "#lib/server/db/schema.js";

export const load = async ({ locals }) => {
  if (!locals.authorized) return { zythos: [] };

  const zythos = await db.query.zytho.findMany({
    with: {
      lines: {
        columns: {
          countAfter: true,
          countBefore: true,
        },
      },
    },
  });

  return {
    zythos: zythos.map(({ lines, ...z }) => ({
      ...z,
      totalBeersSold: lines.reduce(
        (a, b) => a + (b.countBefore - b.countAfter),
        0,
      ),
    })),
  };
};
