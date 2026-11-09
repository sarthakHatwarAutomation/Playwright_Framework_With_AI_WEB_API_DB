# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\shopping-flow.spec.ts >> End-to-end shopping flow @master @end-to-end @web
- Location: tests\web\shopping-flow.spec.ts:4:1

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('link', { name: 'Logout', exact: true }) resolved to 2 elements:
    1) <a href="https://tutorialsninja.com/demo/index.php?route=account/logout">Logout</a> aka locator('#top-links').getByRole('link', { name: 'Logout' })
    2) <a class="list-group-item" href="https://tutorialsninja.com/demo/index.php?route=account/logout">Logout</a> aka locator('#column-right').getByRole('link', { name: 'Logout' })

Call log:
  - waiting for getByRole('link', { name: 'Logout', exact: true })

```

# Test source

```ts
  1  | import type { Locator, Page } from "@playwright/test";
  2  | 
  3  | export class AccountPage {
  4  |   private readonly page: Page;
  5  |   private readonly accountCreatedHeading: Locator;
  6  |   private readonly logoutMessage: Locator;
  7  |   private readonly continueButton: Locator;
  8  | 
  9  |   constructor(page: Page) {
  10 |     this.page = page;
  11 | 
  12 |     // Initialize locators with selectors verified on the live application.
  13 |     this.accountCreatedHeading = page
  14 |       .locator("#content")
  15 |       .getByRole("heading", { name: "My Account", exact: true });
  16 |     this.logoutMessage = page.getByText("You have been logged off your account.", { exact: false });
  17 |     this.continueButton = page.getByRole("link", { name: "Continue", exact: true });
  18 |   }
  19 | 
  20 |   /**
  21 |    * Returns whether the authenticated account dashboard is visible.
  22 |    */
  23 |   async isDashboardVisible(): Promise<boolean> {
  24 |     return this.accountCreatedHeading.isVisible();
  25 |   }
  26 | 
  27 |   /**
  28 |    * Logs out through the My Account menu.
  29 |    */
  30 |   async logout(): Promise<void> {
  31 |     await this.page.locator('a[title="My Account"]').click();
> 32 |     await this.page.getByRole("link", { name: "Logout", exact: true }).click();
     |                                                                        ^ Error: locator.click: Error: strict mode violation: getByRole('link', { name: 'Logout', exact: true }) resolved to 2 elements:
  33 |   }
  34 | 
  35 |   /**
  36 |    * Returns the logout confirmation text.
  37 |    */
  38 |   async getLogoutMessage(): Promise<string> {
  39 |     return this.logoutMessage.innerText();
  40 |   }
  41 | 
  42 |   /**
  43 |    * Continues after logout to the home page.
  44 |    */
  45 |   async continueAfterLogout(): Promise<void> {
  46 |     await this.continueButton.click();
  47 |   }
  48 | }
  49 | 
```