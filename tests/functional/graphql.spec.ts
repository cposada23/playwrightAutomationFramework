import { expect } from "@playwright/test";
import { test } from "@/fixtures/test-fixtures";
import { COUNTRIES_QUERY, CONTINENT_QUERY } from "@/api/graphql/countriesAPI";

test("@functional @graphql GraphQL query returns data", async ({ graphql }) => {
  const data = await graphql.query<{ countries: { code: string; name: string }[] }>(COUNTRIES_QUERY);
  expect(data.countries.length).toBeGreaterThan(0);
});

test("@functional @graphql GraphQL query gets continent by id", async ({ graphql }) => {
  const variables = { code: "AN", name: "Antarctica" };
  const data = await graphql.query<{ continent: { code: string; name: string; countries: { code: string; name: string }[] } }>(CONTINENT_QUERY, variables);
  expect(data.continent).toBeDefined();
  expect(data.continent.code).toBe(variables.code);
  expect(data.continent.name).toBe(variables.name);
});