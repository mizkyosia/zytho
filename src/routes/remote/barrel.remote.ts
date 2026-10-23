import { db } from "#lib/server/db/index.js";
import { barrel } from "#lib/server/db/schema.js";
import { requireAuth } from "#lib/server/auth.js";
import { today } from "#lib/stats.js";
import { command } from "$app/server";
import { eq } from "drizzle-orm";
import * as v from "valibot";

const barrelSchema = v.object({
  name: v.optional(v.string()),
  alcohol: v.optional(v.number()),
  buyingPrice: v.optional(v.number()),
  status: v.optional(v.picklist(["closed", "opened", "emptied"])),
  opened: v.optional(v.nullable(v.string())),
  deliveryId: v.optional(v.nullable(v.number())),
  returnDeliveryId: v.optional(v.nullable(v.number())),
});

export const editBarrel = command(
  v.object({
    id: v.number(),
    ...barrelSchema.entries,
  }),
  async ({ id, ...row }) => {
    requireAuth();
    const res = await db
      .update(barrel)
      .set(row)
      .where(eq(barrel.id, id))
      .returning();

    // Opening a barrel without a date : it was opened today
    if (row.status === "opened" && res[0] && !res[0].opened) {
      const updated = await db
        .update(barrel)
        .set({ opened: today() })
        .where(eq(barrel.id, id))
        .returning();
      return updated[0];
    }

    return res[0];
  },
);

export const addBarrel = command(barrelSchema, async (row) => {
  requireAuth();
  const res = await db
    .insert(barrel)
    .values({ name: "", ...row })
    .returning();

  return res[0];
});

export const deleteBarrel = command(v.number(), async (id) => {
  requireAuth();
  await db.delete(barrel).where(eq(barrel.id, id));

  return { success: true };
});
