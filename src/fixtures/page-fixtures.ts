import { test as base } from "@/fixtures/test-fixtures";
import { HomePage } from "@/pages/HomePage";

export type PageFixtures = {
  homePage: HomePage;
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    const home = new HomePage(page);
    await use(home);
  }
});
export const expect = base.expect;
