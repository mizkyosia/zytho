import { beforeEach, describe, expect, inject, it } from "vitest";
import { connect, resetDb } from "./helpers";
import * as s from "#lib/server/db/schema.js";
import {
  beerStocks,
  deliverySummaries,
  lastDelivery,
  openedBarrels,
  soldDuringYear,
  zythoSummaries,
} from "#lib/server/db/stats.js";
import { addDays, today } from "#lib/stats.js";
import { eq } from "drizzle-orm";

const db = connect(inject("databaseUrl"));

beforeEach(async () => {
  await resetDb(db);

  await db.insert(s.beer).values([
    { id: 1, name: "Chouffe", alcohol: 8, buyingPrice: 1.5 },
    { id: 2, name: "Kasteel Rouge", alcohol: 8.2, buyingPrice: 2 },
    { id: 3, name: "Jamais livrée", alcohol: 5, buyingPrice: 1 },
  ]);
  await db.insert(s.delivery).values([
    { id: 1, date: "2025-12-01", price: 0 },
    { id: 2, date: "2026-02-01", price: 100 },
  ]);
  await db.insert(s.deliveryLine).values([
    { deliveryId: 1, beerId: 1, count: 24 },
    { deliveryId: 2, beerId: 1, count: 12 },
    { deliveryId: 2, beerId: 2, count: 10 },
  ]);
  await db.insert(s.zytho).values([
    { id: 1, name: "Zytho de Noël", date: "2025-12-20" },
    { id: 2, name: "Zytho de rentrée", date: "2026-02-10" },
    { id: 3, name: "Zytho vide", date: "2026-03-01" },
  ]);
  await db.insert(s.zythoLine).values([
    { zythoId: 1, beerId: 1, countBefore: 20, countAfter: 5 },
    { zythoId: 2, beerId: 1, countBefore: 10, countAfter: 2 },
    { zythoId: 2, beerId: 2, countBefore: 6, countAfter: 6 },
  ]);
  await db.insert(s.barrel).values([
    { name: "Fût blonde", buyingPrice: 80, deliveryId: 2 },
    { name: "Fût rouge", buyingPrice: 90.5, deliveryId: 2 },
  ]);
});

describe("beerStocks", () => {
  it("computes the stock as delivered minus sold", async () => {
    const stocks = await beerStocks(db);
    const byId = Object.fromEntries(stocks.map((b) => [b.id, b]));

    // Chouffe : 24 + 12 delivered, 15 + 8 sold
    expect(byId[1]).toMatchObject({
      delivered: 36,
      sold: 23,
      stock: 13,
      lastDelivery: "2026-02-01",
    });
    // Kasteel : 10 delivered, nothing sold
    expect(byId[2]).toMatchObject({ delivered: 10, sold: 0, stock: 10 });
    // Never delivered
    expect(byId[3]).toMatchObject({
      delivered: 0,
      sold: 0,
      stock: 0,
      lastDelivery: null,
    });
  });

  it("can be filtered", async () => {
    const stocks = await beerStocks(db, eq(s.beer.id, 2));
    expect(stocks).toHaveLength(1);
    expect(stocks[0].name).toBe("Kasteel Rouge");
  });
});

describe("deliverySummaries", () => {
  it("computes totals and the theoretical cost", async () => {
    const deliveries = await deliverySummaries(db);

    // Most recent first
    expect(deliveries.map((d) => d.id)).toEqual([2, 1]);
    expect(deliveries[0]).toMatchObject({
      beerCount: 22,
      barrelCount: 2,
      // 12 * 1.5 + 10 * 2 + 80 + 90.5
      theoreticalCost: 208.5,
    });
    expect(deliveries[1]).toMatchObject({
      beerCount: 24,
      barrelCount: 0,
      theoreticalCost: 36,
    });
  });
});

describe("zythoSummaries", () => {
  it("sums beers taken out, brought back and sold", async () => {
    const zythos = await zythoSummaries(db);
    const byId = Object.fromEntries(zythos.map((z) => [z.id, z]));

    expect(byId[1]).toMatchObject({ countBefore: 20, countAfter: 5, sold: 15 });
    expect(byId[2]).toMatchObject({ countBefore: 16, countAfter: 8, sold: 8 });
    expect(byId[3]).toMatchObject({ countBefore: 0, countAfter: 0, sold: 0 });
  });

  it("totals the beers sold during a year", async () => {
    expect((await soldDuringYear(db, 2025)).total).toBe(15);
    const y2026 = await soldDuringYear(db, 2026);
    expect(y2026.total).toBe(8);
    expect(y2026.zythos).toHaveLength(2);
  });
});

describe("lastDelivery", () => {
  it("returns the most recent delivery with its beers", async () => {
    const last = await lastDelivery(db);
    expect(last?.id).toBe(2);
    expect(last?.lines.map((l) => l.beer?.name).sort()).toEqual([
      "Chouffe",
      "Kasteel Rouge",
    ]);
  });
});

describe("openedBarrels", () => {
  it("lists opened barrels, closest to expiry first", async () => {
    await db.insert(s.barrel).values([
      { name: "Vieux", status: "opened", opened: addDays(today(), -20) },
      { name: "Récent", status: "opened", opened: addDays(today(), -2) },
      { name: "Vidé", status: "emptied", opened: addDays(today(), -30) },
    ]);

    const barrels = await openedBarrels(db);
    expect(barrels.map((b) => b.name)).toEqual(["Vieux", "Récent"]);
    expect(barrels[0].daysLeft).toBe(1);
    expect(barrels[0].expiry).toBe(addDays(today(), 1));
    expect(barrels[1].daysLeft).toBe(19);
  });
});
