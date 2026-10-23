import { describe, expect, it } from "vitest";
import { addDays, barrelExpiry, daysBetween, sold } from "#lib/stats.js";
import { niceTicks } from "#lib/components/charts/chart-utils.js";

describe("date helpers", () => {
  it("adds days across months and years", () => {
    expect(addDays("2026-12-25", 10)).toBe("2027-01-04");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("computes the days between two dates", () => {
    expect(daysBetween("2026-01-01", "2026-01-22")).toBe(21);
    expect(daysBetween("2026-01-22", "2026-01-01")).toBe(-21);
  });

  it("expires a barrel three weeks after opening", () => {
    expect(barrelExpiry("2026-10-01")).toBe("2026-10-22");
    expect(barrelExpiry(null)).toBeNull();
  });
});

it("counts sold beers", () => {
  expect(sold({ countBefore: 10, countAfter: 3 })).toBe(7);
});

describe("niceTicks", () => {
  it("covers the max value with round steps", () => {
    expect(niceTicks(37)).toEqual([0, 10, 20, 30, 40]);
    expect(niceTicks(4)).toEqual([0, 1, 2, 3, 4]);
    expect(niceTicks(0)).toEqual([0, 1]);
  });
});
