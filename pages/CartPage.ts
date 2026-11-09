import type { Locator, Page } from "@playwright/test";

export class CartPage {
  private readonly productRow: Locator;
  private readonly cartTotalRow: Locator;

  constructor(page: Page) {
    this.productRow = page
      .getByRole("row")
      .filter({ has: page.locator('input[name^="quantity["]') });
    this.cartTotalRow = page
      .locator("#content table")
      .filter({ has: page.getByText("Total:", { exact: true }) })
      .getByRole("row")
      .filter({ has: page.getByText("Total:", { exact: true }) });
  }

  /**
   * Returns the product row text from the cart.
   */
  async getProductRowText(): Promise<string> {
    return this.productRow.innerText();
  }

  /**
   * Returns the quantity displayed for the cart product.
   */
  async getProductQuantity(): Promise<string> {
    return this.productRow.locator('input[name^="quantity["]').inputValue();
  }

  /**
   * Returns the unit price displayed for the cart product.
   */
  async getProductPrice(): Promise<string> {
    return this.productRow.getByRole("cell").nth(4).innerText();
  }

  /**
   * Returns the applicable cart total.
   */
  async getCartTotal(): Promise<string> {
    return this.cartTotalRow.getByRole("cell").last().innerText();
  }
}
