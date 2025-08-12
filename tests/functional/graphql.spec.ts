import { expect } from "@playwright/test";
import { test } from "@/fixtures/test-fixtures";

const query = `
  query Countries { countries { code name } }
`;

test("@functional GraphQL query returns data", async ({ graphql }) => {
  const data = await graphql.query<{ countries: { code: string; name: string }[] }>(query);
  expect(data.countries.length).toBeGreaterThan(0);
});
