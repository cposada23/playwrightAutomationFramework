import { test, expect } from "@/fixtures/page-fixtures";

test("@smoke homepage loads and shows header", async ({ homePage }) => {
  await homePage.goto();
  const title = await homePage.title();
  expect(title).toContain("Playwright");
});
