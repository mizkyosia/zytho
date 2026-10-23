import {
  DateFormatter,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";

const df = new DateFormatter("fr-FR", { dateStyle: "medium" });
const shortDf = new DateFormatter("fr-FR", { day: "numeric", month: "short" });
const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

/** Formats an ISO date (YYYY-MM-DD) for display */
export function formatDate(date: string | null | undefined, short = false) {
  if (!date) return "—";
  return (short ? shortDf : df).format(
    parseDate(date).toDate(getLocalTimeZone()),
  );
}

export function formatPrice(price: number) {
  return priceFormatter.format(price);
}

/** Display name of a zytho, which may not have one */
export function zythoName(z: { name: string | null; date: string }) {
  return z.name || "Zytho du " + formatDate(z.date);
}
