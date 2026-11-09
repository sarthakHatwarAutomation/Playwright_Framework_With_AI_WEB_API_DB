import type { Locator, Page } from "@playwright/test";

export class RegisterPage {
  private readonly page: Page;
  private readonly firstNameField: Locator;
  private readonly lastNameField: Locator;
  private readonly emailField: Locator;
  private readonly telephoneField: Locator;
  private readonly passwordField: Locator;
  private readonly confirmPasswordField: Locator;
  private readonly privacyPolicyCheckbox: Locator;
  private readonly continueButton: Locator;
  private readonly accountCreatedMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with selectors verified on the live application.
    this.firstNameField = page.getByPlaceholder("First Name");
    this.lastNameField = page.getByPlaceholder("Last Name");
    this.emailField = page.getByPlaceholder("E-Mail");
    this.telephoneField = page.getByPlaceholder("Telephone");
    this.passwordField = page.getByPlaceholder("Password", { exact: true });
    this.confirmPasswordField = page.getByPlaceholder("Password Confirm");
    this.privacyPolicyCheckbox = page.locator('input[name="agree"]');
    this.continueButton = page.getByRole("button", { name: "Continue", exact: true });
    this.accountCreatedMessage = page.getByText("Your Account Has Been Created!", { exact: true });
  }

  /**
   * Completes and submits the customer registration form.
   */
  async registerCustomer(details: {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    password: string;
  }): Promise<void> {
    await this.firstNameField.fill(details.firstName);
    await this.lastNameField.fill(details.lastName);
    await this.emailField.fill(details.email);
    await this.telephoneField.fill(details.telephone);
    await this.passwordField.fill(details.password);
    await this.confirmPasswordField.fill(details.password);
    await this.privacyPolicyCheckbox.check();
    await this.continueButton.click();
  }

  /**
   * Returns the registration confirmation text.
   */
  async getAccountCreatedMessage(): Promise<string> {
    return this.accountCreatedMessage.innerText();
  }

  /**
   * Returns whether the registration form is displayed.
   */
  async isRegistrationPageVisible(): Promise<boolean> {
    await this.firstNameField.waitFor({ state: "visible" });
    return this.firstNameField.isVisible();
  }

  /**
   * Continues from the registration confirmation to the account dashboard.
   */
  async continueToAccount(): Promise<void> {
    await this.page.getByRole("link", { name: "Continue", exact: true }).click();
  }
}
