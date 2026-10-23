import { db } from "#lib/server/db/index.js";
import { zytho, zythoLine } from "#lib/server/db/schema.js";
import { requireAuth } from "#lib/server/auth.js";
import { command, query } from "$app/server";
import { eq, sql } from "drizzle-orm";
import * as v from "valibot";

const zythoLineSchema = v.object({
  id: v.number(),
  beerId: v.optional(v.number()),
  zythoId: v.optional(v.number()),
  countBefore: v.optional(v.number()),
  countAfter: v.optional(v.number()),
});

const zythoSchema = v.object({
  date: v.optional(v.string()),
  name: v.optional(v.string()),
});

export const getAll = query(async () => {
  requireAuth();

  const zythos = await db.select().from(zytho);

  return { success: true, zythos };
});

export const editZytho = command(
  v.object({
    id: v.number(),
    ...zythoSchema.entries,
  }),
  async ({ id, ...row }) => {
    requireAuth();
    await db.update(zytho).set(row).where(eq(zytho.id, id));

    return { success: true };
  },
);

export const addZytho = command(zythoSchema, async (row) => {
  requireAuth();
  let res = await db
    .insert(zytho)
    .values({
      date: sql`NOW()`,
      ...row,
    })
    .returning();

  return res[0];
});

export const deleteZytho = command(v.number(), async (id) => {
  requireAuth();
  await db.delete(zytho).where(eq(zytho.id, id));

  return { success: true };
});

export const getDetails = query(v.number(), async (zythoId) => {
  requireAuth();

  return await db.query.zytho.findFirst({
    where: {
      id: zythoId,
    },
    with: { lines: true },
  });
});

export const editZythoLine = command(
  zythoLineSchema,
  async ({ id, ...row }) => {
    requireAuth();
    await db.update(zythoLine).set(row).where(eq(zythoLine.id, id));

    return { success: true };
  },
);

export const addZythoLine = command(
  v.object({
    beerId: v.optional(v.number()),
    zythoId: v.optional(v.number()),
    countBefore: v.optional(v.number()),
    countAfter: v.optional(v.number()),
  }),
  async (row) => {
    requireAuth();
    const res = await db
      .insert(zythoLine)
      .values({ countBefore: 0, countAfter: 0, ...row })
      .returning();

    return res[0];
  },
);

export const deleteZythoLine = command(v.number(), async (id) => {
  requireAuth();
  await db.delete(zythoLine).where(eq(zythoLine.id, id));

  return { success: true };
});
