# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\opencart-ui.spec.ts >> Customer registration @master @sanity @web
- Location: tests\web\opencart-ui.spec.ts:6:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
  1   | import { test, expect } from "../../fixtures/pageFixtures.js";
  2   | import { DataProvider } from "../../utils/DataReader.js";
  3   | import { RandomDataUtil } from "../../utils/dataGenerator.js";
  4   | import { Helper } from "../../utils/helper.js";
  5   | 
  6   | test("Customer registration @master @sanity @web", async ({
  7   |   homePage,
  8   |   registerPage,
  9   |   accountPage,
  10  | }) => {
  11  |   await test.step("1) Open the registration page", async () => {
  12  |     await homePage.openRegistrationPage();
> 13  |     await expect(await registerPage.isRegistrationPageVisible()).toBe(true);
      |                                                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  14  |   });
  15  | 
  16  |   await test.step("2) Register a unique customer and verify account creation", async () => {
  17  |     const email = RandomDataUtil.getEmail().replace("@", `+${Date.now()}@`);
  18  |     await registerPage.registerCustomer({
  19  |       firstName: RandomDataUtil.getFirstName(),
  20  |       lastName: RandomDataUtil.getLastName(),
  21  |       email,
  22  |       telephone: RandomDataUtil.getPhoneNumber(),
  23  |       password: RandomDataUtil.getPassword(14),
  24  |     });
  25  | 
  26  |     await expect(await registerPage.getAccountCreatedMessage()).toContain(
  27  |       "Your Account Has Been Created!",
  28  |     );
  29  |     await registerPage.continueToAccount();
  30  |     await expect(await accountPage.isDashboardVisible()).toBe(true);
  31  |   });
  32  | 
  33  |   console.log("Customer registration completed.");
  34  | });
  35  | 
  36  | test("Valid customer login @master @sanity @web", async ({
  37  |   homePage,
  38  |   loginPage,
  39  |   accountPage,
  40  | }) => {
  41  |   const { email, password } = Helper.getLoginDetails();
  42  | 
  43  |   await test.step("1) Open the login page", async () => {
  44  |     await homePage.openLoginPage();
  45  |     await expect(await loginPage.isLoginPageVisible()).toBe(true);
  46  |   });
  47  | 
  48  |   await test.step("2) Log in and verify the account dashboard", async () => {
  49  |     await loginPage.login(email, password);
  50  |     await expect(await accountPage.isDashboardVisible()).toBe(true);
  51  |   });
  52  | 
  53  |   console.log("Valid customer login completed.");
  54  | });
  55  | 
  56  | test("Invalid customer login @master @web", async ({ homePage, loginPage, accountPage }) => {
  57  |   await test.step("1) Open the login page and submit invalid credentials", async () => {
  58  |     await homePage.openLoginPage();
  59  |     await loginPage.login("invalid.customer@example.invalid", "InvalidPassword123!");
  60  |   });
  61  | 
  62  |   await test.step("2) Verify login is rejected and the customer remains logged out", async () => {
  63  |     await expect(await loginPage.getWarningMessage()).toContain(
  64  |       "Warning: No match for E-Mail Address and/or Password.",
  65  |     );
  66  |     await expect(await accountPage.isDashboardVisible()).toBe(false);
  67  |   });
  68  | 
  69  |   console.log("Invalid customer login was rejected.");
  70  | });
  71  | 
  72  | test("Customer logout @master @sanity @web", async ({
  73  |   homePage,
  74  |   loginPage,
  75  |   accountPage,
  76  | }) => {
  77  |   const { email, password } = Helper.getLoginDetails();
  78  | 
  79  |   await test.step("1) Log in with valid customer credentials", async () => {
  80  |     await homePage.openLoginPage();
  81  |     await loginPage.login(email, password);
  82  |     await expect(await accountPage.isDashboardVisible()).toBe(true);
  83  |   });
  84  | 
  85  |   await test.step("2) Log out and verify the confirmation", async () => {
  86  |     await accountPage.logout();
  87  |     await expect(await accountPage.getLogoutMessage()).toContain(
  88  |       "You have been logged off your account.",
  89  |     );
  90  |   });
  91  | 
  92  |   await test.step("3) Continue to the home page and verify logged-out navigation", async () => {
  93  |     await accountPage.continueAfterLogout();
  94  |     await expect(await homePage.getTitle()).toBe("Your Store");
  95  |     await expect(await accountPage.isLogoutAvailable()).toBe(false);
  96  |   });
  97  | 
  98  |   console.log("Customer logout completed.");
  99  | });
  100 | 
  101 | test("Product search @master @sanity @web", async ({ homePage }) => {
  102 |   const { productName } = Helper.getProductDetails();
  103 | 
  104 |   await test.step("1) Search for the configured product", async () => {
  105 |     await homePage.searchForProduct(productName);
  106 |     await expect(await homePage.getTitle()).toContain(`Search - ${productName}`);
  107 |   });
  108 | 
  109 |   await test.step("2) Verify the exact product appears in search results", async () => {
  110 |     await expect(await homePage.isProductInResults(productName)).toBe(true);
  111 |   });
  112 | 
  113 |   console.log("Product search completed.");
```