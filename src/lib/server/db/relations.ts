import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  zytho: {
    lines: r.many.zythoLine(),
  },
  delivery: {
    lines: r.many.deliveryLine(),
    barrels: r.many.barrel({
      from: r.delivery.id,
      to: r.barrel.deliveryId,
      alias: "delivered",
    }),
    returnedBarrels: r.many.barrel({
      from: r.delivery.id,
      to: r.barrel.returnDeliveryId,
      alias: "returned",
    }),
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
  barrel: {
    delivery: r.one.delivery({
      from: r.barrel.deliveryId,
      to: r.delivery.id,
      alias: "delivered",
    }),
    returnDelivery: r.one.delivery({
      from: r.barrel.returnDeliveryId,
      to: r.delivery.id,
      alias: "returned",
    }),
  },
}));
