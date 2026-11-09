import type { Locator, Page } from "@playwright/test";

export class HomePage {
  private readonly page: Page;
  private readonly accountMenu: Locator;
  private readonly searchField: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with selectors verified on the live application.
    this.accountMenu = page.locator('a[title="My Account"]');
    this.searchField = page.getByPlaceholder("Search");
  }

  /**
   * Returns the current page title.
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Opens the registration page from the My Account menu.
   */
  async openRegistrationPage(): Promise<void> {
    await this.accountMenu.click();
    await this.page.getByRole("link", { name: "Register", exact: true }).click();
  }

  /**
   * Opens the login page from the My Account menu.
   */
  async openLoginPage(): Promise<void> {
    await this.accountMenu.click();
    await this.page.getByRole("link", { name: "Login", exact: true }).click();
  }

  /**
   * Searches for a product and waits for the results page.
   * @param productName - Product name to search for
   */
  async searchForProduct(productName: string): Promise<void> {
    await this.searchField.fill(productName);
    await this.searchField.press("Enter");
    await this.page.waitForURL(/route=product\/search/);
  }

  /**
   * Opens the exact product name from the search results.
   * @param productName - Product name to open
   */
  async openProductFromResults(productName: string): Promise<void> {
    await this.page.getByRole("link", { name: productName, exact: true }).last().click();
  }

  /**
   * Returns whether the exact product appears in search results.
   * @param productName - Product name to find
   */
  async isProductInResults(productName: string): Promise<boolean> {
    return this.page.getByRole("link", { name: productName, exact: true }).last().isVisible();
  }
}
