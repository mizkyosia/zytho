import { createDb } from "./client";
import { DATABASE_URL } from "$app/env/private";

if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

export const db = createDb(DATABASE_URL);
