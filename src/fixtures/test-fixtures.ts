import { test as base } from "@playwright/test";
import { RestClient } from "@/api/restClient";
import { GraphQLClient } from "@/api/graphqlClient";
import { getPostgresPool } from "@/db/postgresClient";
import { getMongoDb } from "@/db/mongoClient";
import { faker } from "@faker-js/faker";

export type Fixtures = {
  rest: RestClient;
  graphql: GraphQLClient;
  pg: ReturnType<typeof getPostgresPool>;
  mongo: Awaited<ReturnType<typeof getMongoDb>>;
  fake: typeof faker;
};

export const debugTest = base; // Use debugTest.pause() in your tests

export const test = base.extend<Fixtures>({
  rest: async ({}, use) => {
    const env = process.env.ENV || "dev";
    const client = new RestClient(env);
    await client.init();
    await use(client);
    await client.dispose();
  },
  graphql: async ({}, use) => {
    const env = process.env.ENV || "dev";
    const client = new GraphQLClient(env);
    await client.init();
    await use(client);
    await client.dispose();
  },
  pg: async ({}, use: (pool: ReturnType<typeof getPostgresPool>) => Promise<void>) => {
    const env = process.env.ENV || "dev";
    const pool = getPostgresPool(env);
    try {
      await use(pool);
    } finally {
      const { closePool } = await import("@/db/postgresClient");
      await closePool();
    }
  },
  mongo: async ({}, use) => {
    const env = process.env.ENV || "dev";
    const db = await getMongoDb(env);
    await use(db);
  },
  fake: async ({}, use) => {
    await use(faker);
  }
});

export const expect = base.expect;
