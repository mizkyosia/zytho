import type { TestProject } from "vitest/node";
import { prepareTestDb } from "./test-db";

export default async function setup(project: TestProject) {
  project.provide("databaseUrl", await prepareTestDb());
}

declare module "vitest" {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}
