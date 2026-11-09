import { test, expect } from "../../fixtures/pageFixtures.js";
import { DataProvider } from "../../utils/DataReader.js";
import { RandomDataUtil } from "../../utils/dataGenerator.js";
import { Helper } from "../../utils/helper.js";

test("Customer registration @master @sanity @web", async ({
  homePage,
  registerPage,
  accountPage,
}) => {
  await test.step("1) Open the registration page", async () => {
    await homePage.openRegistrationPage();
    await expect(await registerPage.isRegistrationPageVisible()).toBe(true);
  });

  await test.step("2) Register a unique customer and verify account creation", async () => {
    const email = RandomDataUtil.getEmail().replace("@", `+${Date.now()}@`);
    await registerPage.registerCustomer({
      firstName: RandomDataUtil.getFirstName(),
      lastName: RandomDataUtil.getLastName(),
      email,
      telephone: RandomDataUtil.getPhoneNumber(),
      password: RandomDataUtil.getPassword(14),
    });

    await expect(await registerPage.getAccountCreatedMessage()).toContain(
      "Your Account Has Been Created!",
    );
    await registerPage.continueToAccount();
    await expect(await accountPage.isDashboardVisible()).toBe(true);
  });

  console.log("Customer registration completed.");
});

test("Valid customer login @master @sanity @web", async ({
  homePage,
  loginPage,
  accountPage,
}) => {
  const { email, password } = Helper.getLoginDetails();

  await test.step("1) Open the login page", async () => {
    await homePage.openLoginPage();
    await expect(await loginPage.isLoginPageVisible()).toBe(true);
  });

  await test.step("2) Log in and verify the account dashboard", async () => {
    await loginPage.login(email, password);
    await expect(await accountPage.isDashboardVisible()).toBe(true);
  });

  console.log("Valid customer login completed.");
});

test("Invalid customer login @master @web", async ({ homePage, loginPage, accountPage }) => {
  await test.step("1) Open the login page and submit invalid credentials", async () => {
    await homePage.openLoginPage();
    await loginPage.login("invalid.customer@example.invalid", "InvalidPassword123!");
  });

  await test.step("2) Verify login is rejected and the customer remains logged out", async () => {
    await expect(await loginPage.getWarningMessage()).toContain(
      "Warning: No match for E-Mail Address and/or Password.",
    );
    await expect(await accountPage.isDashboardVisible()).toBe(false);
  });

  console.log("Invalid customer login was rejected.");
});

test("Customer logout @master @sanity @web", async ({
  homePage,
  loginPage,
  accountPage,
}) => {
  const { email, password } = Helper.getLoginDetails();

  await test.step("1) Log in with valid customer credentials", async () => {
    await homePage.openLoginPage();
    await loginPage.login(email, password);
    await expect(await accountPage.isDashboardVisible()).toBe(true);
  });

  await test.step("2) Log out and verify the confirmation", async () => {
    await accountPage.logout();
    await expect(await accountPage.getLogoutMessage()).toContain(
      "You have been logged off your account.",
    );
  });

  await test.step("3) Continue to the home page and verify logged-out navigation", async () => {
    await accountPage.continueAfterLogout();
    await expect(await homePage.getTitle()).toBe("Your Store");
    await expect(await accountPage.isLogoutAvailable()).toBe(false);
  });

  console.log("Customer logout completed.");
});

test("Product search @master @sanity @web", async ({ homePage }) => {
  const { productName } = Helper.getProductDetails();

  await test.step("1) Search for the configured product", async () => {
    await homePage.searchForProduct(productName);
    await expect(await homePage.getTitle()).toContain(`Search - ${productName}`);
  });

  await test.step("2) Verify the exact product appears in search results", async () => {
    await expect(await homePage.isProductInResults(productName)).toBe(true);
  });

  console.log("Product search completed.");
});

test("Add product to cart @master @sanity @web", async ({
  homePage,
  productPage,
  cartPage,
}) => {
  const { productName, productQuantity } = Helper.getProductDetails();

  await test.step("1) Find the product and open its details", async () => {
    await homePage.searchForProduct(productName);
    await homePage.openProductFromResults(productName);
    await expect(await productPage.getProductName()).toBe(productName);
  });

  await test.step("2) Add the product and verify the cart contents", async () => {
    await productPage.addToCart(Number(productQuantity));
    await expect(await productPage.getAddToCartConfirmation()).toContain(productName);
    await productPage.openCart();
    await expect(await cartPage.getProductRowText()).toContain(productName);
    await expect(await cartPage.getProductQuantity()).toBe(productQuantity);
  });

  console.log("Product was added to the cart.");
});

const loginData = DataProvider.readJson("./testdata/opencart_logindata.json") as Array<{
  testName?: string;
  TestName?: string;
  email: string;
  password: string;
  expected: "success" | "failure";
}>;

for (const [index, row] of loginData.entries()) {
  const testName = row.testName || row.TestName || `Login data row ${index + 1}`;

  test(`${testName} (row ${index + 1}) @master @datadriven @web`, async ({
    homePage,
    loginPage,
    accountPage,
  }) => {
    await test.step("1) Open the login page and submit the row credentials", async () => {
      await homePage.openLoginPage();
      await loginPage.login(row.email, row.password);
    });

    await test.step("2) Validate the actual result against the expected result", async () => {
      if (row.expected === "success") {
        await expect(await accountPage.isDashboardVisible()).toBe(true);
      } else {
        await expect(await loginPage.isLoginPageVisible()).toBe(true);
        await expect(await loginPage.getWarningMessage()).toContain(
          "Warning: No match for E-Mail Address and/or Password.",
        );
        await expect(await accountPage.isDashboardVisible()).toBe(false);
      }
    });

    console.log(`Data-driven login completed: ${testName}.`);
  });
}
