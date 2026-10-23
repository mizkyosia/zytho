import { db } from "#lib/server/db/index.js";
import { deliveryLine, delivery } from "#lib/server/db/schema.js";
import { requireAuth } from "#lib/server/auth.js";
import { command, query } from "$app/server";
import { eq, sql } from "drizzle-orm";
import * as v from "valibot";

export const getAll = query(async () => {
  requireAuth();

  const deliveries = await db.select().from(delivery);

  return { success: true, deliveries };
});

export const getDetails = query(v.number(), async (zythoId) => {
  requireAuth();

  const delivery = await db.query.delivery.findFirst({
    where: {
      id: zythoId,
    },
    with: {},
  });

  return delivery;
});

export const editDelivery = command(
  v.object({
    id: v.number(),
    date: v.optional(v.string()),
    price: v.optional(v.number()),
  }),
  async ({ id, ...row }) => {
    requireAuth();
    await db.update(delivery).set(row).where(eq(delivery.id, id));

    return { success: true };
  },
);

export const addDelivery = command(
  v.object({
    date: v.optional(v.string()),
    price: v.optional(v.number()),
  }),
  async (row) => {
    requireAuth();
    let res = await db
      .insert(delivery)
      .values({
        date: sql`NOW()`,
        price: 0,
        ...row,
      })
      .returning();

    return res[0];
  },
);

export const deleteDelivery = command(v.number(), async (id) => {
  requireAuth();
  await db.delete(delivery).where(eq(delivery.id, id));

  return { success: true };
});

const deliveryLineSchema = v.object({
  count: v.optional(v.number()),
  beerId: v.optional(v.number()),
  deliveryId: v.optional(v.number()),
});

export const editDeliveryLine = command(
  v.object({
    id: v.number(),
    ...deliveryLineSchema.entries,
  }),
  async ({ id, ...row }) => {
    requireAuth();
    await db.update(deliveryLine).set(row).where(eq(deliveryLine.id, id));

    return { success: true };
  },
);

export const addDeliveryLine = command(deliveryLineSchema, async (row) => {
  requireAuth();
  const res = await db
    .insert(deliveryLine)
    .values({ count: 0, ...row })
    .returning();

  return res[0];
});

export const deleteDeliveryLine = command(v.number(), async (id) => {
  requireAuth();
  await db.delete(deliveryLine).where(eq(deliveryLine.id, id));

  return { success: true };
});
