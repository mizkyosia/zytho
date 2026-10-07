import { db } from "#lib/server/db/index.js";
import { zytho, zythoLine } from "#lib/server/db/schema.js";
import { command, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
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
  const { locals } = getRequestEvent();
  if (!locals.authorized)
    return error(401, { message: "Veuillez vous authentifier" });

  const zythos = await db.select().from(zytho);

  return { success: true, zythos };
});

export const editZytho = command(
  v.object({
    id: v.number(),
    ...zythoSchema.entries,
  }),
  async ({ id, ...row }) => {
    await db.update(zytho).set(row).where(eq(zytho.id, id));

    return { success: true };
  },
);

export const addZytho = command(zythoSchema, async (row) => {
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
  await db.delete(zytho).where(eq(zytho.id, id));

  return { success: true };
});

export const getDetails = query(v.number(), async (zythoId) => {
  const { locals } = getRequestEvent();
  if (!locals.authorized)
    return error(401, { message: "Veuillez vous authentifier" });

  const zytho = await db.query.zytho.findFirst({
    where: {
      id: zythoId,
    },
    with: {},
  });
});

export const editZythoLine = command(
  zythoLineSchema,
  async ({ id, ...row }) => {
    await db.update(zythoLine).set(row).where(eq(zythoLine.id, id));

    return { success: true };
  },
);

export const addZythoLine = command(
  v.object({
    beerName: v.string(),
    zythoId: v.number(),
    countBefore: v.number(),
    countAfter: v.number(),
  }),
  async (row) => {
    const res = await db.insert(zythoLine).values(row).returning();

    return res[0];
  },
);

export const deleteZythoLine = command(v.number(), async (id) => {
  await db.delete(zythoLine).where(eq(zythoLine.id, id));

  return { success: true };
});
