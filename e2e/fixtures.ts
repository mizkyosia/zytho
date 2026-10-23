import { test as base, expect } from "@playwright/test";
import { connect, resetDb } from "../tests/helpers.ts";
import { testDatabaseUrl } from "../tests/test-db.ts";
import * as s from "../src/lib/server/db/schema.ts";

export const db = connect(testDatabaseUrl());

/** Seeds the database, and logs in */
export const test = base.extend({
  page: async ({ page, context, baseURL }, use, testInfo) => {
    await resetDb(db);
    await db.insert(s.beer).values([
      { name: "Chouffe", alcohol: 8, buyingPrice: 1.5 },
      { name: "Kasteel Rouge", alcohol: 8.2, buyingPrice: 2 },
    ]);
    await db.insert(s.delivery).values({ date: "2026-02-01", price: 0 });
    await db.insert(s.deliveryLine).values([
      { deliveryId: 1, beerId: 1, count: 24 },
      { deliveryId: 1, beerId: 2, count: 10 },
    ]);
    await db.insert(s.zytho).values({ name: "Zytho test", date: "2026-02-10" });
    await db
      .insert(s.zythoLine)
      .values({ zythoId: 1, beerId: 1, countBefore: 20, countAfter: 9 });

    await context.addCookies([
      {
        name: "adminToken",
        value: testInfo.config.metadata.adminToken,
        url: baseURL!,
      },
    ]);
    await use(page);
  },
});

export { expect };
