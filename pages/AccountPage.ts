import type { Locator, Page } from "@playwright/test";

export class AccountPage {
  private readonly page: Page;
  private readonly accountCreatedHeading: Locator;
  private readonly logoutMessage: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with selectors verified on the live application.
    this.accountCreatedHeading = page
      .locator("#content")
      .getByRole("heading", { name: "My Account", exact: true });
    this.logoutMessage = page.getByText("You have been logged off your account.", { exact: false });
    this.continueButton = page.getByRole("link", { name: "Continue", exact: true });
  }

  /**
   * Returns whether the authenticated account dashboard is visible.
   */
  async isDashboardVisible(): Promise<boolean> {
    return this.accountCreatedHeading.isVisible();
  }

  /**
   * Logs out through the My Account menu.
   */
  async logout(): Promise<void> {
    await this.page.locator('a[title="My Account"]').click();
    await this.page
      .locator("#top-links")
      .getByRole("link", { name: "Logout", exact: true })
      .click();
  }

  /**
   * Returns the logout confirmation text.
   */
  async getLogoutMessage(): Promise<string> {
    return this.logoutMessage.innerText();
  }

  /**
   * Continues after logout to the home page.
   */
  async continueAfterLogout(): Promise<void> {
    await this.continueButton.click();
  }

  /**
   * Returns whether the authenticated Logout navigation is available.
   */
  async isLogoutAvailable(): Promise<boolean> {
    await this.page.locator('a[title="My Account"]').click();
    return this.page
      .locator("#top-links")
      .getByRole("link", { name: "Logout", exact: true })
      .isVisible();
  }
}
