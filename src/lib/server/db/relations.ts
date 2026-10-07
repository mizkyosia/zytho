import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  zytho: {
    lines: r.many.zythoLine(),
  },
  delivery: {
    lines: r.many.deliveryLine(),
  },

  beer: {
    deliveries: r.many.deliveryLine(),
    zythos: r.many.zythoLine(),
  },

  zythoLine: {
    zytho: r.one.zytho({
      from: r.zythoLine.zythoId,
      to: r.zytho.id,
    }),
    beer: r.one.beer({
      from: r.zythoLine.beerId,
      to: r.beer.id,
    }),
  },
  deliveryLine: {
    beer: r.one.beer({
      from: r.deliveryLine.beerId,
      to: r.beer.id,
    }),
    fullDelivery: r.one.delivery({
      from: r.deliveryLine.deliveryId,
      to: r.delivery.id,
    }),
  },
}));
