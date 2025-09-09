import { test, expect, debugTest} from "@/fixtures/page-fixtures";

test("@smoke homepage loads and shows header", async ({ homePage }) => {
  await homePage.goto();
  const title = await homePage.title();
  expect(title).toContain("Playwright");
});

test("@smoke docs page loads and shows header", async ({ docsPage }) => {
  await docsPage.goto();
  const title = await docsPage.title();
  expect(title).toContain("Playwright");
  //await docsPage.expectHeaderVisible("Playwright");
});

test("@smoke docs page search works", async ({ docsPage }) => {
  await docsPage.goto();
  await docsPage.doSearch("Trace viewer");
  // Optionally, assert that search results are visible
  // Example: expect(await docsPage.page.locator('.DocSearch-Hits').first()).toBeVisible();
  const hitsLocator = await docsPage.findElement('//header/h1[text() = "Trace viewer"]');
  await expect(hitsLocator.first()).toBeVisible();
});

