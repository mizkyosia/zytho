import {
  pgTable,
  pgEnum,
  serial,
  numeric,
  text,
  integer,
  date,
} from "drizzle-orm/pg-core";

export const beer = pgTable("Beer", {
  id: serial("id").primaryKey(),
  name: text("name"),
  buyingPrice: numeric("buyingPrice", { scale: 2, mode: "number" }).notNull(),
  alcohol: numeric("alcohol", { scale: 1, mode: "number" }).notNull(),
});

export const delivery = pgTable("Delivery", {
  id: serial("id").primaryKey(),
  price: numeric("price", { scale: 2, mode: "number" }).notNull(),
  date: date("date").notNull(),
});

export const deliveryLine = pgTable("DeliveryLine", {
  id: serial("id").primaryKey(),
  deliveryId: integer("deliveryId").references(() => delivery.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  beerId: integer("beerId").references(() => beer.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  count: integer("count").notNull(),
});

export const zytho = pgTable("Zytho", {
  id: serial("id").primaryKey(),
  name: text("name"),
  date: date("date").notNull(),
});

export const zythoLine = pgTable("ZythoLine", {
  id: serial("id").primaryKey(),
  beerId: integer("beerId").references(() => beer.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  zythoId: integer("zythoId").references(() => zytho.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  countBefore: integer("countBefore").notNull(),
  countAfter: integer("countAfter").notNull(),
});

export const barrelStatus = pgEnum("BarrelStatus", [
  "closed",
  "opened",
  "emptied",
]);

export const barrel = pgTable("Barrel", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  alcohol: numeric("alcohol", { scale: 1, mode: "number" })
    .notNull()
    .default(0),
  buyingPrice: numeric("buyingPrice", { scale: 2, mode: "number" })
    .notNull()
    .default(0),
  status: barrelStatus("status").notNull().default("closed"),
  opened: date("opened"),
  deliveryId: integer("deliveryId").references(() => delivery.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  // Delivery during which the empty barrel was given back
  returnDeliveryId: integer("returnDeliveryId").references(() => delivery.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});
