import { test, expect } from "@/fixtures/test-fixtures";

import { Client } from "pg";

test("@db postgres SELECT * FROM public.cards returns results", async ({ pg }) => {
  try {
    const result = await pg.query("SELECT * FROM public.cards");
    expect(result.rows).toBeDefined();
    expect(Array.isArray(result.rows)).toBe(true);
    expect(result.rows.length).toBeGreaterThan(0);
  } catch (error) {
    console.error("Error querying public.cards:", error);
    throw error;
  }
});


test("@db postgres SELECT * FROM public.cards returns results 2", async ({ pg }) => {
  try {
    const connectionString = "postgresql://neondb_owner:npg_MDT9SqrLX8nb@ep-soft-smoke-ae8g4lj8-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false } // Neon requires SSL
    });

    await client.connect();
    const res = await client.query("SELECT * FROM public.cards");
    console.log(res.rows);
    await client.end();

  } catch (error) {
    console.error("Error querying public.cards:", error);
    throw error;
  }
});
