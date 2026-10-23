import { drizzle } from "drizzle-orm/postgres-js";
import { relations } from "./relations";

export const createDb = (url: string) => drizzle(url, { relations });

export type DB = ReturnType<typeof createDb>;
