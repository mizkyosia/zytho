import { and, asc, desc, eq, gte, lt, sql, type SQL } from "drizzle-orm";
import type { DB } from "./client";
import { barrel, beer, delivery, deliveryLine, zytho, zythoLine } from "./schema";
import { BARREL_LIFETIME_DAYS } from "#lib/stats.js";

/**
 * Every beer type with its theoretical stock :
 * delivered beers minus beers sold during zythos
 */
export async function beerStocks(db: DB, where?: SQL) {
  const delivered = db
    .select({
      beerId: deliveryLine.beerId,
      total: sql<number>`sum(${deliveryLine.count})::int`.as("delivered_total"),
      last: sql<string | null>`max(${delivery.date})`.as("last_delivery"),
    })
    .from(deliveryLine)
    .leftJoin(delivery, eq(delivery.id, deliveryLine.deliveryId))
    .groupBy(deliveryLine.beerId)
    .as("delivered");

  const soldSq = db
    .select({
      beerId: zythoLine.beerId,
      total:
        sql<number>`sum(${zythoLine.countBefore} - ${zythoLine.countAfter})::int`.as(
          "sold_total",
        ),
    })
    .from(zythoLine)
    .groupBy(zythoLine.beerId)
    .as("sold");

  const rows = await db
    .select({
      id: beer.id,
      name: beer.name,
      alcohol: beer.alcohol,
      buyingPrice: beer.buyingPrice,
      delivered: sql<number>`coalesce(${delivered.total}, 0)`.mapWith(Number),
      sold: sql<number>`coalesce(${soldSq.total}, 0)`.mapWith(Number),
      lastDelivery: delivered.last,
    })
    .from(beer)
    .leftJoin(delivered, eq(delivered.beerId, beer.id))
    .leftJoin(soldSq, eq(soldSq.beerId, beer.id))
    .where(where)
    .orderBy(asc(beer.name));

  return rows.map((r) => ({ ...r, stock: r.delivered - r.sold }));
}

/** Every delivery with its totals and theoretical cost (beers + barrels) */
export async function deliverySummaries(db: DB, where?: SQL) {
  const beers = db
    .select({
      deliveryId: deliveryLine.deliveryId,
      count: sql<number>`sum(${deliveryLine.count})::int`.as("beer_count"),
      cost: sql<number>`sum(${deliveryLine.count} * coalesce(${beer.buyingPrice}, 0))::float8`.as(
        "beer_cost",
      ),
    })
    .from(deliveryLine)
    .leftJoin(beer, eq(beer.id, deliveryLine.beerId))
    .groupBy(deliveryLine.deliveryId)
    .as("beers");

  const barrels = db
    .select({
      deliveryId: barrel.deliveryId,
      count: sql<number>`count(*)::int`.as("barrel_count"),
      cost: sql<number>`sum(${barrel.buyingPrice})::float8`.as("barrel_cost"),
    })
    .from(barrel)
    .groupBy(barrel.deliveryId)
    .as("barrels");

  const rows = await db
    .select({
      id: delivery.id,
      date: delivery.date,
      price: delivery.price,
      beerCount: sql<number>`coalesce(${beers.count}, 0)`.mapWith(Number),
      barrelCount: sql<number>`coalesce(${barrels.count}, 0)`.mapWith(Number),
      beerCost: sql<number>`coalesce(${beers.cost}, 0)`.mapWith(Number),
      barrelCost: sql<number>`coalesce(${barrels.cost}, 0)`.mapWith(Number),
    })
    .from(delivery)
    .leftJoin(beers, eq(beers.deliveryId, delivery.id))
    .leftJoin(barrels, eq(barrels.deliveryId, delivery.id))
    .where(where)
    .orderBy(desc(delivery.date), desc(delivery.id));

  return rows.map((r) => ({
    ...r,
    theoreticalCost: Math.round((r.beerCost + r.barrelCost) * 100) / 100,
  }));
}

/** Every zytho with the beers taken out, brought back and sold */
export async function zythoSummaries(db: DB, where?: SQL) {
  const rows = await db
    .select({
      id: zytho.id,
      name: zytho.name,
      date: zytho.date,
      countBefore:
        sql<number>`coalesce(sum(${zythoLine.countBefore}), 0)`.mapWith(Number),
      countAfter:
        sql<number>`coalesce(sum(${zythoLine.countAfter}), 0)`.mapWith(Number),
    })
    .from(zytho)
    .leftJoin(zythoLine, eq(zythoLine.zythoId, zytho.id))
    .where(where)
    .groupBy(zytho.id)
    .orderBy(desc(zytho.date), desc(zytho.id));

  return rows.map((r) => ({ ...r, sold: r.countBefore - r.countAfter }));
}

/** Zythos of a given year, and the total of beers sold during them */
export async function soldDuringYear(db: DB, year: number) {
  const zythos = await zythoSummaries(
    db,
    and(gte(zytho.date, `${year}-01-01`), lt(zytho.date, `${year + 1}-01-01`)),
  );

  return {
    zythos,
    total: zythos.reduce((a, z) => a + z.sold, 0),
  };
}

/** The most recent delivery, with the beers it contained */
export async function lastDelivery(db: DB) {
  return await db.query.delivery.findFirst({
    orderBy: { date: "desc", id: "desc" },
    with: {
      lines: {
        columns: { count: true },
        with: { beer: { columns: { id: true, name: true } } },
      },
    },
  });
}

/**
 * Opened barrels, the closest to expiry first.
 * `expiry` is computed as opening date + BARREL_LIFETIME_DAYS
 */
export async function openedBarrels(db: DB) {
  const expiry = sql<string>`(${barrel.opened} + ${BARREL_LIFETIME_DAYS}::int)::text`;

  return await db
    .select({
      id: barrel.id,
      name: barrel.name,
      opened: barrel.opened,
      expiry,
      daysLeft: sql<number>`(${barrel.opened} + ${BARREL_LIFETIME_DAYS}::int) - current_date`.mapWith(
        Number,
      ),
    })
    .from(barrel)
    .where(and(eq(barrel.status, "opened"), sql`${barrel.opened} is not null`))
    .orderBy(asc(barrel.opened));
}
