import type { Locator, Page } from "@playwright/test";

export class ProductPage {
  private readonly page: Page;
  private readonly productHeading: Locator;
  private readonly productPrice: Locator;
  private readonly quantityField: Locator;
  private readonly addToCartButton: Locator;
  private readonly addToCartConfirmation: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with selectors verified on the live application.
    this.productHeading = page.locator("#content h1");
    this.productPrice = page.locator("#content h2").last();
    this.quantityField = page.locator("#input-quantity");
    this.addToCartButton = page.locator("#button-cart");
    this.addToCartConfirmation = page.locator(".alert-success");
  }

  /**
   * Returns the product detail heading.
   */
  async getProductName(): Promise<string> {
    return this.productHeading.innerText();
  }

  /**
   * Returns the displayed product price.
   */
  async getProductPrice(): Promise<string> {
    return this.productPrice.innerText();
  }

  /**
   * Adds the selected quantity to the cart.
   * @param quantity - Quantity to add
   */
  async addToCart(quantity: number): Promise<void> {
    await this.quantityField.fill(String(quantity));
    await this.addToCartButton.click();
  }

  /**
   * Returns the add-to-cart confirmation text.
   */
  async getAddToCartConfirmation(): Promise<string> {
    return this.addToCartConfirmation.innerText();
  }

  /**
   * Opens the cart from the add-to-cart confirmation.
   */
  async openCart(): Promise<void> {
    await this.addToCartConfirmation.getByRole("link", { name: "shopping cart" }).click();
  }
}
