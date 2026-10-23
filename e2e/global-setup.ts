import { prepareTestDb } from "../tests/test-db.ts";

export default async function setup() {
  await prepareTestDb();
}
