import dotenv from "dotenv";
import { test as base, expect } from "@playwright/test";
import { AccountPage } from "../pages/AccountPage.js";
import { CartPage } from "../pages/CartPage.js";
import { HomePage } from "../pages/HomePage.js";
import { LoginPage } from "../pages/LoginPage.js";
import { ProductPage } from "../pages/ProductPage.js";
import { RegisterPage } from "../pages/RegisterPage.js";

dotenv.config();

const APP_URL = process.env.WEB_APP_URL;

type PageFixtures = {
  homePage: HomePage;
  registerPage: RegisterPage;
  loginPage: LoginPage;
  accountPage: AccountPage;
  productPage: ProductPage;
  cartPage: CartPage;
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    if (!APP_URL) {
      throw new Error("WEB_APP_URL must be set in the .env file.");
    }

    await page.goto(APP_URL);
    await use(new HomePage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});

test.afterEach(async ({ page, context }) => {
  if (!page.isClosed()) {
    await page.close();
  }
  await context.close();
});

export { expect };
