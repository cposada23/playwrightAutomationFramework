import { Page, expect } from "@playwright/test";
import { BasePage } from "@/pages/BasePage";

export class HomePage extends BasePage {
  constructor(page: Page) { super(page); }

  async goto() { await this.page.goto("/"); }
  async title() { return this.page.title(); }
  async expectHeaderVisible(text: string) { await expect(this.page.getByRole('heading', { name: text })).toBeVisible(); }
}
