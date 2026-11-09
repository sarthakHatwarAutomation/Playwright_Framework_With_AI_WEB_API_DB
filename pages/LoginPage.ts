import type { Locator, Page } from "@playwright/test";

export class LoginPage {
  private readonly page: Page;
  private readonly emailField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;
  private readonly warningMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with selectors verified on the live application.
    this.emailField = page.getByRole("textbox", { name: "E-Mail Address" });
    this.passwordField = page.getByLabel("Password", { exact: true });
    this.loginButton = page.getByRole("button", { name: "Login", exact: true });
    this.warningMessage = page.locator(".alert-danger");
  }

  /**
   * Submits the customer login form.
   * @param email - Registered customer email
   * @param password - Registered customer password
   */
  async login(email: string, password: string): Promise<void> {
    if (email.trim()) {
      await this.emailField.fill(email);
    }
    if (password.trim()) {
      await this.passwordField.fill(password);
    }
    await this.loginButton.click();
  }

  /**
   * Returns whether the login form is displayed.
   */
  async isLoginPageVisible(): Promise<boolean> {
    return this.loginButton.isVisible();
  }

  /**
   * Returns the visible login warning.
   */
  async getWarningMessage(): Promise<string> {
    return this.warningMessage.innerText();
  }
}
