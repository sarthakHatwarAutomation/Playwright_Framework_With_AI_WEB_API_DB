import { test, expect } from "../../fixtures/pageFixtures.js";
import { RandomDataUtil } from "../../utils/dataGenerator.js";

test("End-to-end shopping flow @master @end-to-end @web", async ({
  homePage,
  registerPage,
  loginPage,
  accountPage,
  productPage,
  cartPage,
}) => {
  const firstName = RandomDataUtil.getFirstName();
  const lastName = RandomDataUtil.getLastName();
  const generatedEmail = RandomDataUtil.getEmail();
  const email = generatedEmail.replace("@", `+${Date.now()}@`);
  const password = RandomDataUtil.getPassword(14);
  const productName = process.env.PRODUCT_NAME || "MacBook";
  const productQuantity = Number(process.env.PRODUCT_QUANTITY || "1");
  const expectedTotal = process.env.TOTAL_PRICE || "$602.00";

  await test.step("1) Open the live application", async () => {
    await expect(await homePage.getTitle()).toBe("Your Store");
  });

  await test.step("2) Register a unique customer", async () => {
    await homePage.openRegistrationPage();
    await registerPage.registerCustomer({
      firstName,
      lastName,
      email,
      telephone: RandomDataUtil.getPhoneNumber(),
      password,
    });
    await expect(await registerPage.getAccountCreatedMessage()).toContain(
      "Your Account Has Been Created!",
    );
    await registerPage.continueToAccount();
    await expect(await accountPage.isDashboardVisible()).toBeTruthy();
  });

  await test.step("3) Log out and re-login with the new credentials", async () => {
    await accountPage.logout();
    await expect(await accountPage.getLogoutMessage()).toContain(
      "You have been logged off your account.",
    );
    await accountPage.continueAfterLogout();
    await homePage.openLoginPage();
    await loginPage.login(email, password);
    await expect(await accountPage.isDashboardVisible()).toBeTruthy();
  });

  await test.step("4) Search for the configured product and open its details", async () => {
    await homePage.searchForProduct(productName);
    await homePage.openProductFromResults(productName);
    await expect(await productPage.getProductName()).toBe(productName);
  });

  await test.step("5) Add the product and validate the cart", async () => {
    const displayedProductPrice = await productPage.getProductPrice();
    await productPage.addToCart(productQuantity);
    await expect(await productPage.getAddToCartConfirmation()).toContain(productName);
    await productPage.openCart();
    await expect(await cartPage.getProductRowText()).toContain(productName);
    await expect(await cartPage.getProductQuantity()).toBe(String(productQuantity));
    await expect(await cartPage.getProductPrice()).toBe(displayedProductPrice);
    await expect(await cartPage.getCartTotal()).toBe(expectedTotal);
  });

  console.log("End-to-end shopping flow completed.");
});
