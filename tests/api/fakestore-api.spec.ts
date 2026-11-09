import { Ajv, type ValidateFunction } from "ajv";
import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
import { Routes } from "../../api/endpoints/routes.js";
import { DataProvider } from "../../utils/DataReader.js";
import { RandomDataUtil } from "../../utils/dataGenerator.js";

dotenv.config();

const BASE_URL = (process.env.API_BASE_URL || Routes.BASE_URL).replace(/\/$/, "");
const PRODUCT_ID = Number(process.env.PRODUCT_ID || "1");
const USER_ID = Number(process.env.USER_ID || "1");
const CART_ID = Number(process.env.CART_ID || "1");
const LIMIT = Number(process.env.LIMIT || "3");
const START_DATE = process.env.START_DATE || "2019-12-10";
const END_DATE = process.env.END_DATE || "2020-10-10";
const ajv = new Ajv();

function routeWithId(route: string, id: number): string {
  return route.replace("{id}", String(id));
}

function routeWithLimit(route: string, limit: number): string {
  return route.replace("{limit}", String(limit));
}

function routeWithSort(route: string, order: "asc" | "desc"): string {
  return route.replace("{order}", order);
}

function expectSchema(
  validator: ValidateFunction,
  responseBody: unknown,
  schemaName: string,
): void {
  const isValid = validator(responseBody);
  expect(
    isValid,
    `${schemaName} response schema validation failed: ${ajv.errorsText(validator.errors)}`,
  ).toBe(true);
}

test.describe("FakeStore API Tests", () => {
  test("POST - Successful login @master @sanity @api", async ({ request }) => {
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: {
        username: process.env.API_USERNAME,
        password: process.env.PASSWORD,
      },
    });

    expect(response.status(), "A valid login should return status 201").toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty("token");
    expect(typeof body.token).toBe("string");
    expect(body.token.length, "The authentication token should not be empty").toBeGreaterThan(0);
  });

  test("POST - Invalid login @master @api", async ({ request }) => {
    const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
      data: RandomDataUtil.generateInvalidLoginPayload(),
    });

    expect(response.status(), "An invalid login should return status 401").toBe(401);
    const body = await response.text();
    expect(body).toBe("username or password is incorrect");
  });

  test("GET - All products @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
    expect(response.status()).toBe(200);

    const products = await response.json();
    expect(Array.isArray(products), "Products response should be an array").toBe(true);
    expect(products.length, "At least one product should be returned").toBeGreaterThan(0);
    for (const product of products) {
      expect(product).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          price: expect.any(Number),
          category: expect.any(String),
          image: expect.any(String),
        }),
      );
    }
  });

  test("GET - Product by ID @master @api", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${routeWithId(Routes.GET_PRODUCT_BY_ID, PRODUCT_ID)}`,
    );
    expect(response.status()).toBe(200);

    const product = await response.json();
    expect(product.id).toBe(PRODUCT_ID);
    expect(product).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        price: expect.any(Number),
        category: expect.any(String),
        image: expect.any(String),
      }),
    );
  });

  test("GET - Products with limit @master @api", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${routeWithLimit(Routes.GET_PRODUCTS_WITH_LIMIT, LIMIT)}`,
    );
    expect(response.status()).toBe(200);

    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length, "Product count should match the requested limit").toBe(LIMIT);
  });

  test("GET - Products sorted ascending @master @api", async ({ request }) => {
    const route = routeWithSort(Routes.GET_PRODUCTS_SORTED, "asc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const products = await response.json();
    const ids = products.map((product: { id: number }) => product.id);
    expect(ids).toEqual([...ids].sort((a: number, b: number) => a - b));
  });

  test("GET - Products sorted descending @master @api", async ({ request }) => {
    const route = routeWithSort(Routes.GET_PRODUCTS_SORTED, "desc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const products = await response.json();
    const ids = products.map((product: { id: number }) => product.id);
    expect(ids).toEqual([...ids].sort((a: number, b: number) => b - a));
  });

  test("GET - All product categories @master @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
    expect(response.status()).toBe(200);

    const categories = await response.json();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length, "At least one category should be returned").toBeGreaterThan(0);
  });

  test("GET - Products by category @master @api", async ({ request }) => {
    const category = "electronics";
    const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace("{category}", category);
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length, "The valid category should contain products").toBeGreaterThan(0);
    for (const product of products) {
      expect(product.category, "Each product should belong to the requested category").toBe(
        category,
      );
    }
  });

  test("POST - Create product @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateProductPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: payload });
    expect(response.status()).toBe(201);

    const created = await response.json();
    expect(typeof created.id).toBe("number");
    expect(created).toMatchObject(payload);

    const deleteResponse = await request.delete(
      `${BASE_URL}${routeWithId(Routes.DELETE_PRODUCT, created.id)}`,
    );
    expect(deleteResponse.status(), "Created product cleanup should succeed").toBe(200);
  });

  test("PUT - Update product @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUpdatedProductPayload();
    const response = await request.put(
      `${BASE_URL}${routeWithId(Routes.UPDATE_PRODUCT, PRODUCT_ID)}`,
      { data: payload },
    );
    expect(response.status()).toBe(200);

    const updated = await response.json();
    expect(updated.id).toBe(PRODUCT_ID);
    expect(updated).toMatchObject(payload);
  });

  test("DELETE - Product @master @regression @api", async ({ request }) => {
    const response = await request.delete(
      `${BASE_URL}${routeWithId(Routes.DELETE_PRODUCT, PRODUCT_ID)}`,
    );
    expect(response.status()).toBe(200);

    const deleted = await response.json();
    expect(deleted.id).toBe(PRODUCT_ID);
  });

  test("GET - All users @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length, "At least one user should be returned").toBeGreaterThan(0);
  });

  test("GET - User by ID @master @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${routeWithId(Routes.GET_USER_BY_ID, USER_ID)}`);
    expect(response.status()).toBe(200);

    const user = await response.json();
    expect(user.id).toBe(USER_ID);
  });

  test("GET - Users with limit @master @api", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${routeWithLimit(Routes.GET_USERS_WITH_LIMIT, LIMIT)}`,
    );
    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length, "User count should match the requested limit").toBe(LIMIT);
  });

  test("GET - Users sorted ascending @master @api", async ({ request }) => {
    const route = routeWithSort(Routes.GET_USERS_SORTED, "asc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const users = await response.json();
    const ids = users.map((user: { id: number }) => user.id);
    expect(ids).toEqual([...ids].sort((a: number, b: number) => a - b));
  });

  test("GET - Users sorted descending @master @api", async ({ request }) => {
    const route = routeWithSort(Routes.GET_USERS_SORTED, "desc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const users = await response.json();
    const ids = users.map((user: { id: number }) => user.id);
    expect(ids).toEqual([...ids].sort((a: number, b: number) => b - a));
  });

  test("POST - Create user @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUserPayload();
    const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: payload });
    expect(response.status()).toBe(201);

    const created = await response.json();
    expect(typeof created.id).toBe("number");

    const deleteResponse = await request.delete(
      `${BASE_URL}${routeWithId(Routes.DELETE_USER, created.id)}`,
    );
    expect(deleteResponse.status(), "Created user cleanup should succeed").toBe(200);
  });

  test("PUT - Update user @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUserUpdatePayload();
    const response = await request.put(`${BASE_URL}${routeWithId(Routes.UPDATE_USER, USER_ID)}`, {
      data: payload,
    });
    expect(response.status()).toBe(200);

    const updated = await response.json();
    expect(updated).toMatchObject(payload);
  });

  test("DELETE - User @master @regression @api", async ({ request }) => {
    const response = await request.delete(`${BASE_URL}${routeWithId(Routes.DELETE_USER, USER_ID)}`);
    expect(response.status()).toBe(200);

    const deleted = await response.json();
    expect(deleted.id).toBe(USER_ID);
  });

  test("GET - All carts @master @sanity @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
    expect(response.status()).toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts)).toBe(true);
    expect(carts.length, "At least one cart should be returned").toBeGreaterThan(0);
  });

  test("GET - Cart by ID @master @api", async ({ request }) => {
    const response = await request.get(`${BASE_URL}${routeWithId(Routes.GET_CART_BY_ID, CART_ID)}`);
    expect(response.status()).toBe(200);

    const cart = await response.json();
    expect(cart.id).toBe(CART_ID);
  });

  test("GET - Carts by date range @master @api", async ({ request }) => {
    const route = Routes.GET_CARTS_BY_DATE_RANGE
      .replace("{startdate}", START_DATE)
      .replace("{enddate}", END_DATE);
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts)).toBe(true);
    const startTime = new Date(START_DATE).getTime();
    const endTime = new Date(END_DATE).getTime();
    for (const cart of carts) {
      const cartTime = new Date(cart.date).getTime();
      expect(cartTime, "Cart date should not precede the requested range").toBeGreaterThanOrEqual(
        startTime,
      );
      expect(cartTime, "Cart date should not exceed the requested range").toBeLessThanOrEqual(
        endTime,
      );
    }
  });

  test("GET - Carts by user @master @api", async ({ request }) => {
    const route = Routes.GET_USER_CART.replace("{userId}", String(USER_ID));
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts)).toBe(true);
    for (const cart of carts) {
      expect(cart.userId, "Each cart should belong to the requested user").toBe(USER_ID);
    }
  });

  test("GET - Carts with limit @master @api", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}${routeWithLimit(Routes.GET_CARTS_WITH_LIMIT, LIMIT)}`,
    );
    expect(response.status()).toBe(200);

    const carts = await response.json();
    expect(Array.isArray(carts)).toBe(true);
    expect(carts.length, "Cart count should match the requested limit").toBe(LIMIT);
  });

  test("GET - Carts sorted ascending @master @api", async ({ request }) => {
    const route = routeWithSort(Routes.GET_CARTS_SORTED, "asc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const carts = await response.json();
    const ids = carts.map((cart: { id: number }) => cart.id);
    expect(ids).toEqual([...ids].sort((a: number, b: number) => a - b));
  });

  test("GET - Carts sorted descending @master @api", async ({ request }) => {
    const route = routeWithSort(Routes.GET_CARTS_SORTED, "desc");
    const response = await request.get(`${BASE_URL}${route}`);
    expect(response.status()).toBe(200);

    const carts = await response.json();
    const ids = carts.map((cart: { id: number }) => cart.id);
    expect(ids).toEqual([...ids].sort((a: number, b: number) => b - a));
  });

  test("POST - Create cart @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateCartPayload(USER_ID);
    const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: payload });
    expect(response.status()).toBe(201);

    const created = await response.json();
    expect(typeof created.id).toBe("number");
    expect(created.userId).toBe(payload.userId);
    expect(created.products).toEqual(payload.products);

    const deleteResponse = await request.delete(
      `${BASE_URL}${routeWithId(Routes.DELETE_CART, created.id)}`,
    );
    expect(deleteResponse.status(), "Created cart cleanup should succeed").toBe(200);
  });

  test("PUT - Update cart @master @regression @api", async ({ request }) => {
    const payload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);
    const response = await request.put(`${BASE_URL}${routeWithId(Routes.UPDATE_CART, CART_ID)}`, {
      data: payload,
    });
    expect(response.status()).toBe(200);

    const updated = await response.json();
    expect(updated.id).toBe(CART_ID);
    expect(updated.userId).toBe(payload.userId);
    expect(updated.products).toEqual(payload.products);
  });

  test("DELETE - Cart @master @regression @api", async ({ request }) => {
    const response = await request.delete(`${BASE_URL}${routeWithId(Routes.DELETE_CART, CART_ID)}`);
    expect(response.status()).toBe(200);

    const deleted = await response.json();
    expect(deleted.id).toBe(CART_ID);
  });

  test("SCHEMA - Product response @master @api", async ({ request }) => {
    const schema = DataProvider.readJson("./api/schemas/product_api_schema.json");
    const validate = ajv.compile(schema);
    const response = await request.get(
      `${BASE_URL}${routeWithId(Routes.GET_PRODUCT_BY_ID, PRODUCT_ID)}`,
    );
    expect(response.status()).toBe(200);
    expectSchema(validate, await response.json(), "Product");
  });

  test("SCHEMA - User response @master @api", async ({ request }) => {
    const schema = DataProvider.readJson("./api/schemas/user_api_schema.json");
    const validate = ajv.compile(schema);
    const response = await request.get(`${BASE_URL}${routeWithId(Routes.GET_USER_BY_ID, USER_ID)}`);
    expect(response.status()).toBe(200);
    expectSchema(validate, await response.json(), "User");
  });

  test("SCHEMA - Cart response @master @api", async ({ request }) => {
    const schema = DataProvider.readJson("./api/schemas/cart_api_schema.json");
    const validate = ajv.compile(schema);
    const response = await request.get(`${BASE_URL}${routeWithId(Routes.GET_CART_BY_ID, CART_ID)}`);
    expect(response.status()).toBe(200);
    expectSchema(validate, await response.json(), "Cart");
  });

  test("WORKFLOW - Product CRUD @master @regression @api", async ({ request }) => {
    const createPayload = RandomDataUtil.generateProductPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
      data: createPayload,
    });
    expect(createResponse.status()).toBe(201);

    const created = await createResponse.json();
    expect(typeof created.id).toBe("number");

    const updatePayload = RandomDataUtil.generateUpdatedProductPayload();
    const updateResponse = await request.put(
      `${BASE_URL}${routeWithId(Routes.UPDATE_PRODUCT, created.id)}`,
      { data: updatePayload },
    );
    expect(updateResponse.status()).toBe(200);
    const updated = await updateResponse.json();
    expect(updated).toMatchObject(updatePayload);

    const deleteResponse = await request.delete(
      `${BASE_URL}${routeWithId(Routes.DELETE_PRODUCT, created.id)}`,
    );
    expect(deleteResponse.status()).toBe(200);
  });

  test("WORKFLOW - User CRUD @master @regression @api", async ({ request }) => {
    const createPayload = RandomDataUtil.generateUserPayload();
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
      data: createPayload,
    });
    expect(createResponse.status()).toBe(201);

    const created = await createResponse.json();
    expect(typeof created.id).toBe("number");

    const updatePayload = RandomDataUtil.generateUserUpdatePayload();
    const updateResponse = await request.put(
      `${BASE_URL}${routeWithId(Routes.UPDATE_USER, created.id)}`,
      { data: updatePayload },
    );
    expect(updateResponse.status()).toBe(200);
    const updated = await updateResponse.json();
    expect(updated).toMatchObject(updatePayload);

    const deleteResponse = await request.delete(
      `${BASE_URL}${routeWithId(Routes.DELETE_USER, created.id)}`,
    );
    expect(deleteResponse.status()).toBe(200);
  });

  test("WORKFLOW - Cart CRUD @master @regression @api", async ({ request }) => {
    const createPayload = RandomDataUtil.generateCartPayload(USER_ID);
    const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
      data: createPayload,
    });
    expect(createResponse.status()).toBe(201);

    const created = await createResponse.json();
    expect(typeof created.id).toBe("number");
    expect(created.userId).toBe(createPayload.userId);
    expect(created.products).toEqual(createPayload.products);

    const updatePayload = {
      ...RandomDataUtil.generateUpdatedCartPayload(USER_ID),
      products: createPayload.products.map((product) => ({
        ...product,
        quantity: product.quantity + 1,
      })),
    };
    const updateResponse = await request.put(
      `${BASE_URL}${routeWithId(Routes.UPDATE_CART, created.id)}`,
      { data: updatePayload },
    );
    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();
    expect(updated.id).toBe(created.id);
    expect(updated.products[0].quantity).toBe(updatePayload.products[0].quantity);

    const deleteResponse = await request.delete(
      `${BASE_URL}${routeWithId(Routes.DELETE_CART, created.id)}`,
    );
    expect(deleteResponse.status()).toBe(200);
  });
});
