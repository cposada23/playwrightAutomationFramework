import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "@/pages/BasePage";

export class DocsPage extends BasePage {

  readonly searchButton: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page); 
    this.searchButton = page.locator('//button[@class="DocSearch DocSearch-Button"]');
    this.searchInput = page.locator('input.DocSearch-Input');
  }

  async goto() { await this.page.goto("/docs/intro"); }
  async title() { return this.page.title(); }
  async expectHeaderVisible(text: string) { 
    await expect(this.page.getByRole('heading', { name: text })).toBeVisible();
  }

  async doSearch(query: string) {
    // Wait until the search button is visible and clickable
    await this.searchButton.waitFor({ state: 'visible' });
    await this.searchButton.click();
    // This click will open a modal with the search input
    // Wait for the input to be visible and interactable and then type the query
    await this.searchInput.waitFor({ state: 'visible' });
    await this.searchInput.fill(query);
    await this.page.locator('#docsearch-hits0-item-0').waitFor({ state: 'visible', timeout: 5000 });
    await this.searchInput.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }
}
