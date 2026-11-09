# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\fakestore-api.spec.ts >> FakeStore API Tests >> WORKFLOW - User CRUD @master @regression @api
- Location: tests\api\fakestore-api.spec.ts:452:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: undefined
```

# Test source

```ts
  369 |     const created = await response.json();
  370 |     expect(typeof created.id).toBe("number");
  371 |     expect(created.userId).toBe(payload.userId);
  372 |     expect(created.products).toEqual(payload.products);
  373 | 
  374 |     const deleteResponse = await request.delete(
  375 |       `${BASE_URL}${routeWithId(Routes.DELETE_CART, created.id)}`,
  376 |     );
  377 |     expect(deleteResponse.status(), "Created cart cleanup should succeed").toBe(200);
  378 |   });
  379 | 
  380 |   test("PUT - Update cart @master @regression @api", async ({ request }) => {
  381 |     const payload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);
  382 |     const response = await request.put(`${BASE_URL}${routeWithId(Routes.UPDATE_CART, CART_ID)}`, {
  383 |       data: payload,
  384 |     });
  385 |     expect(response.status()).toBe(200);
  386 | 
  387 |     const updated = await response.json();
  388 |     expect(updated.id).toBe(CART_ID);
  389 |     expect(updated.userId).toBe(payload.userId);
  390 |     expect(updated.products).toEqual(payload.products);
  391 |   });
  392 | 
  393 |   test("DELETE - Cart @master @regression @api", async ({ request }) => {
  394 |     const response = await request.delete(`${BASE_URL}${routeWithId(Routes.DELETE_CART, CART_ID)}`);
  395 |     expect(response.status()).toBe(200);
  396 | 
  397 |     const deleted = await response.json();
  398 |     expect(deleted.id).toBe(CART_ID);
  399 |   });
  400 | 
  401 |   test("SCHEMA - Product response @master @api", async ({ request }) => {
  402 |     const schema = DataProvider.readJson("./api/schemas/product_api_schema.json");
  403 |     const validate = ajv.compile(schema);
  404 |     const response = await request.get(
  405 |       `${BASE_URL}${routeWithId(Routes.GET_PRODUCT_BY_ID, PRODUCT_ID)}`,
  406 |     );
  407 |     expect(response.status()).toBe(200);
  408 |     expectSchema(validate, await response.json(), "Product");
  409 |   });
  410 | 
  411 |   test("SCHEMA - User response @master @api", async ({ request }) => {
  412 |     const schema = DataProvider.readJson("./api/schemas/user_api_schema.json");
  413 |     const validate = ajv.compile(schema);
  414 |     const response = await request.get(`${BASE_URL}${routeWithId(Routes.GET_USER_BY_ID, USER_ID)}`);
  415 |     expect(response.status()).toBe(200);
  416 |     expectSchema(validate, await response.json(), "User");
  417 |   });
  418 | 
  419 |   test("SCHEMA - Cart response @master @api", async ({ request }) => {
  420 |     const schema = DataProvider.readJson("./api/schemas/cart_api_schema.json");
  421 |     const validate = ajv.compile(schema);
  422 |     const response = await request.get(`${BASE_URL}${routeWithId(Routes.GET_CART_BY_ID, CART_ID)}`);
  423 |     expect(response.status()).toBe(200);
  424 |     expectSchema(validate, await response.json(), "Cart");
  425 |   });
  426 | 
  427 |   test("WORKFLOW - Product CRUD @master @regression @api", async ({ request }) => {
  428 |     const createPayload = RandomDataUtil.generateProductPayload();
  429 |     const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
  430 |       data: createPayload,
  431 |     });
  432 |     expect(createResponse.status()).toBe(201);
  433 | 
  434 |     const created = await createResponse.json();
  435 |     expect(typeof created.id).toBe("number");
  436 | 
  437 |     const updatePayload = RandomDataUtil.generateUpdatedProductPayload();
  438 |     const updateResponse = await request.put(
  439 |       `${BASE_URL}${routeWithId(Routes.UPDATE_PRODUCT, created.id)}`,
  440 |       { data: updatePayload },
  441 |     );
  442 |     expect(updateResponse.status()).toBe(200);
  443 |     const updated = await updateResponse.json();
  444 |     expect(updated).toMatchObject(updatePayload);
  445 | 
  446 |     const deleteResponse = await request.delete(
  447 |       `${BASE_URL}${routeWithId(Routes.DELETE_PRODUCT, created.id)}`,
  448 |     );
  449 |     expect(deleteResponse.status()).toBe(200);
  450 |   });
  451 | 
  452 |   test("WORKFLOW - User CRUD @master @regression @api", async ({ request }) => {
  453 |     const createPayload = RandomDataUtil.generateUserPayload();
  454 |     const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
  455 |       data: createPayload,
  456 |     });
  457 |     expect(createResponse.status()).toBe(201);
  458 | 
  459 |     const created = await createResponse.json();
  460 |     expect(typeof created.id).toBe("number");
  461 | 
  462 |     const updatePayload = RandomDataUtil.generateUserUpdatePayload();
  463 |     const updateResponse = await request.put(
  464 |       `${BASE_URL}${routeWithId(Routes.UPDATE_USER, created.id)}`,
  465 |       { data: updatePayload },
  466 |     );
  467 |     expect(updateResponse.status()).toBe(200);
  468 |     const updated = await updateResponse.json();
> 469 |     expect(updated.id).toBe(created.id);
      |                        ^ Error: expect(received).toBe(expected) // Object.is equality
  470 |     expect(updated).toMatchObject(updatePayload);
  471 | 
  472 |     const deleteResponse = await request.delete(
  473 |       `${BASE_URL}${routeWithId(Routes.DELETE_USER, created.id)}`,
  474 |     );
  475 |     expect(deleteResponse.status()).toBe(200);
  476 |   });
  477 | 
  478 |   test("WORKFLOW - Cart CRUD @master @regression @api", async ({ request }) => {
  479 |     const createPayload = RandomDataUtil.generateCartPayload(USER_ID);
  480 |     const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
  481 |       data: createPayload,
  482 |     });
  483 |     expect(createResponse.status()).toBe(201);
  484 | 
  485 |     const created = await createResponse.json();
  486 |     expect(typeof created.id).toBe("number");
  487 |     expect(created.userId).toBe(createPayload.userId);
  488 |     expect(created.products).toEqual(createPayload.products);
  489 | 
  490 |     const updatePayload = {
  491 |       ...RandomDataUtil.generateUpdatedCartPayload(USER_ID),
  492 |       products: createPayload.products.map((product) => ({
  493 |         ...product,
  494 |         quantity: product.quantity + 1,
  495 |       })),
  496 |     };
  497 |     const updateResponse = await request.put(
  498 |       `${BASE_URL}${routeWithId(Routes.UPDATE_CART, created.id)}`,
  499 |       { data: updatePayload },
  500 |     );
  501 |     expect(updateResponse.status()).toBe(200);
  502 | 
  503 |     const updated = await updateResponse.json();
  504 |     expect(updated.id).toBe(created.id);
  505 |     expect(updated.products[0].quantity).toBe(updatePayload.products[0].quantity);
  506 | 
  507 |     const deleteResponse = await request.delete(
  508 |       `${BASE_URL}${routeWithId(Routes.DELETE_CART, created.id)}`,
  509 |     );
  510 |     expect(deleteResponse.status()).toBe(200);
  511 |   });
  512 | });
  513 | 
```