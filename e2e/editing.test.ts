import { eq } from "drizzle-orm";
import { db, expect, test } from "./fixtures.ts";
import * as s from "../src/lib/server/db/schema.ts";
import { today } from "../src/lib/stats.ts";
import type { Page } from "@playwright/test";

/** Waits for the page to be hydrated, so that inputs are interactive */
async function goto(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

test("dashboard shows stocks and the last delivery", async ({ page }) => {
  await goto(page, "/");

  const stocks = page.locator("li", { hasText: "Chouffe" }).first();
  // 24 delivered - 11 sold
  await expect(stocks).toContainText("13");
  await expect(page.getByText("Dernière livraison")).toBeVisible();
  await expect(page.getByText("11 bières vendues sur 1 zytho")).toBeVisible();
});

test("editing a beer saves it without any confirmation", async ({ page }) => {
  await goto(page, "/beer");

  const row = page.getByRole("row", { name: /13/ });
  const price = row.locator("input").nth(2);
  await price.fill("1.75");
  await price.press("Tab");

  await expect
    .poll(async () => (await db.select().from(s.beer).where(eq(s.beer.id, 1)))[0].buyingPrice)
    .toBe(1.75);
});

test("adding a beer line to a zytho", async ({ page }) => {
  await goto(page, "/zytho/1");
  await expect(page.getByText("11 vendues")).toBeVisible();

  await page.getByRole("button", { name: "+" }).click();
  await expect(page.getByRole("combobox").nth(1)).toBeVisible();

  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: "Kasteel Rouge" }).click();

  const row = page.getByRole("row").nth(2);
  await row.locator("input").nth(0).fill("6");
  await row.locator("input").nth(0).press("Tab");
  await row.locator("input").nth(1).fill("2");
  await row.locator("input").nth(1).press("Tab");

  // Aggregates are updated live
  await expect(page.getByText("15 vendues")).toBeVisible();

  await expect
    .poll(async () =>
      db.select().from(s.zythoLine).where(eq(s.zythoLine.beerId, 2)),
    )
    .toEqual([
      expect.objectContaining({ zythoId: 1, countBefore: 6, countAfter: 2 }),
    ]);
});

test("opening a barrel sets its opening and expiry dates", async ({ page }) => {
  await goto(page, "/barrel");

  await page.getByRole("button", { name: /\+|Plus/ }).first().click();
  const row = page.getByRole("row").nth(1);
  await row.locator("input").first().fill("Fût blonde");
  await row.locator("input").first().press("Tab");
  await row.locator("select").selectOption("opened");

  await expect(row).toContainText("21 j restants");
  await expect
    .poll(async () => (await db.select().from(s.barrel))[0])
    .toMatchObject({ name: "Fût blonde", status: "opened", opened: today() });

  // Shows up on the dashboard
  await goto(page, "/");
  await expect(page.locator("li", { hasText: "Fût blonde" })).toContainText(
    "21 j",
  );
});

test("delivery shows its theoretical cost", async ({ page }) => {
  await db.insert(s.barrel).values({ name: "Fût", buyingPrice: 80, deliveryId: 1 });
  await goto(page, "/delivery");

  // 24 * 1.5 + 10 * 2 + 80
  await expect(page.getByRole("row", { name: /136,00/ })).toBeVisible();

  await goto(page, "/delivery/1");
  await expect(page.getByText("Coût théorique : 136,00")).toBeVisible();
});
