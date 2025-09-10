import { test as base } from "@/fixtures/test-fixtures";
import { HomePage } from "@/pages/HomePage";
import { DocsPage } from "@/pages/DocsPage";


export type PageFixtures = {
  homePage: HomePage;
  docsPage: DocsPage;
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    const home = new HomePage(page);
    await use(home);
  },
  docsPage: async ({ page }, use) => {
    const docs = new DocsPage(page);
    await use(docs);
  }
});
export const expect = base.expect;
