import { Page, expect } from "@playwright/test";

export class BasePage {
  constructor(protected readonly page: Page) {}

  async waitForUrl(regex: RegExp) {
    await expect(this.page).toHaveURL(regex);
  }

  async findElement(selector: string) {
    return this.page.locator(selector);
  }
}
