import {
  pgTable,
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
  sellingPrice: numeric("sellingPrice", { scale: 2, mode: "number" }).notNull(),
  alcohol: numeric("alcohol", { scale: 1 }).notNull(),
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

export const barrel = pgTable("Barrel", {
  id: serial("id").primaryKey(),
  beerName: text("name").notNull(),
  opened: date("opened"),
});
