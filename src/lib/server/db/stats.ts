import { eq, sql } from "drizzle-orm";
import { db } from ".";
import { beer, delivery, deliveryLine } from "./schema";

export async function deliveryCost(id: number) {
  const res = await db
    .select({ count: deliveryLine.count, price: beer.buyingPrice })
    .from(deliveryLine)
    .where(eq(deliveryLine.id, id))
    .innerJoin(beer, eq(beer.id, deliveryLine.beerId));

  return res.reduce((a, b) => a + b.count * b.price, 0);
}

export async function totalDeliveryCost() {
  const res = await db
    .select({
      count: sql<number>`SUM(${deliveryLine.count})`,
      price: beer.buyingPrice,
    })
    .from(deliveryLine)
    .innerJoin(beer, eq(beer.id, deliveryLine.beerId))
    .groupBy(beer.id);

  return res.reduce((a, b) => a + b.count * b.price, 0);
}
