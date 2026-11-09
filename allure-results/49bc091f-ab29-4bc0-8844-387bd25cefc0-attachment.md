# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\fakestore-api.spec.ts >> FakeStore API Tests >> WORKFLOW - User CRUD @master @regression @api
- Location: tests\api\fakestore-api.spec.ts:455:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: undefined
```

# Test source

```ts
  372 |     expect(typeof created.id).toBe("number");
  373 |     expect(created.userId).toBe(payload.userId);
  374 |     expect(created.products).toEqual(payload.products);
  375 | 
  376 |     const deleteResponse = await request.delete(
  377 |       `${BASE_URL}${routeWithId(Routes.DELETE_CART, created.id)}`,
  378 |     );
  379 |     expect(deleteResponse.status(), "Created cart cleanup should succeed").toBe(200);
  380 |   });
  381 | 
  382 |   test("PUT - Update cart @master @regression @api", async ({ request }) => {
  383 |     const payload = RandomDataUtil.generateUpdatedCartPayload(USER_ID);
  384 |     const response = await request.put(`${BASE_URL}${routeWithId(Routes.UPDATE_CART, CART_ID)}`, {
  385 |       data: payload,
  386 |     });
  387 |     expect(response.status()).toBe(200);
  388 | 
  389 |     const updated = await response.json();
  390 |     expect(updated.id).toBe(CART_ID);
  391 |     expect(updated.userId).toBe(payload.userId);
  392 |     expect(updated.products).toEqual(payload.products);
  393 |   });
  394 | 
  395 |   test("DELETE - Cart @master @regression @api", async ({ request }) => {
  396 |     const response = await request.delete(`${BASE_URL}${routeWithId(Routes.DELETE_CART, CART_ID)}`);
  397 |     expect(response.status()).toBe(200);
  398 | 
  399 |     const deleted = await response.json();
  400 |     expect(deleted.id).toBe(CART_ID);
  401 |   });
  402 | 
  403 |   test("SCHEMA - Product response @master @api", async ({ request }) => {
  404 |     const schema = DataProvider.readJson("./api/schemas/product_api_schema.json");
  405 |     const validate = ajv.compile(schema);
  406 |     const response = await request.get(
  407 |       `${BASE_URL}${routeWithId(Routes.GET_PRODUCT_BY_ID, PRODUCT_ID)}`,
  408 |     );
  409 |     expect(response.status()).toBe(200);
  410 |     expectSchema(validate, await response.json(), "Product");
  411 |   });
  412 | 
  413 |   test("SCHEMA - User response @master @api", async ({ request }) => {
  414 |     const schema = DataProvider.readJson("./api/schemas/user_api_schema.json");
  415 |     const validate = ajv.compile(schema);
  416 |     const response = await request.get(`${BASE_URL}${routeWithId(Routes.GET_USER_BY_ID, USER_ID)}`);
  417 |     expect(response.status()).toBe(200);
  418 |     expectSchema(validate, await response.json(), "User");
  419 |   });
  420 | 
  421 |   test("SCHEMA - Cart response @master @api", async ({ request }) => {
  422 |     const schema = DataProvider.readJson("./api/schemas/cart_api_schema.json");
  423 |     const validate = ajv.compile(schema);
  424 |     const response = await request.get(`${BASE_URL}${routeWithId(Routes.GET_CART_BY_ID, CART_ID)}`);
  425 |     expect(response.status()).toBe(200);
  426 |     expectSchema(validate, await response.json(), "Cart");
  427 |   });
  428 | 
  429 |   test("WORKFLOW - Product CRUD @master @regression @api", async ({ request }) => {
  430 |     const createPayload = RandomDataUtil.generateProductPayload();
  431 |     const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, {
  432 |       data: createPayload,
  433 |     });
  434 |     expect(createResponse.status()).toBe(201);
  435 | 
  436 |     const created = await createResponse.json();
  437 |     expect(typeof created.id).toBe("number");
  438 | 
  439 |     const updatePayload = RandomDataUtil.generateUpdatedProductPayload();
  440 |     const updateResponse = await request.put(
  441 |       `${BASE_URL}${routeWithId(Routes.UPDATE_PRODUCT, created.id)}`,
  442 |       { data: updatePayload },
  443 |     );
  444 |     expect(updateResponse.status()).toBe(200);
  445 |     const updated = await updateResponse.json();
  446 |     expect(updated.id).toBe(created.id);
  447 |     expect(updated).toMatchObject(updatePayload);
  448 | 
  449 |     const deleteResponse = await request.delete(
  450 |       `${BASE_URL}${routeWithId(Routes.DELETE_PRODUCT, created.id)}`,
  451 |     );
  452 |     expect(deleteResponse.status()).toBe(200);
  453 |   });
  454 | 
  455 |   test("WORKFLOW - User CRUD @master @regression @api", async ({ request }) => {
  456 |     const createPayload = RandomDataUtil.generateUserPayload();
  457 |     const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, {
  458 |       data: createPayload,
  459 |     });
  460 |     expect(createResponse.status()).toBe(201);
  461 | 
  462 |     const created = await createResponse.json();
  463 |     expect(typeof created.id).toBe("number");
  464 | 
  465 |     const updatePayload = RandomDataUtil.generateUserUpdatePayload();
  466 |     const updateResponse = await request.put(
  467 |       `${BASE_URL}${routeWithId(Routes.UPDATE_USER, created.id)}`,
  468 |       { data: updatePayload },
  469 |     );
  470 |     expect(updateResponse.status()).toBe(200);
  471 |     const updated = await updateResponse.json();
> 472 |     expect(updated.id).toBe(created.id);
      |                        ^ Error: expect(received).toBe(expected) // Object.is equality
  473 |     expect(updated).toMatchObject(updatePayload);
  474 | 
  475 |     const deleteResponse = await request.delete(
  476 |       `${BASE_URL}${routeWithId(Routes.DELETE_USER, created.id)}`,
  477 |     );
  478 |     expect(deleteResponse.status()).toBe(200);
  479 |   });
  480 | 
  481 |   test("WORKFLOW - Cart CRUD @master @regression @api", async ({ request }) => {
  482 |     const createPayload = RandomDataUtil.generateCartPayload(USER_ID);
  483 |     const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, {
  484 |       data: createPayload,
  485 |     });
  486 |     expect(createResponse.status()).toBe(201);
  487 | 
  488 |     const created = await createResponse.json();
  489 |     expect(typeof created.id).toBe("number");
  490 |     expect(created.userId).toBe(createPayload.userId);
  491 |     expect(created.products).toEqual(createPayload.products);
  492 | 
  493 |     const updatePayload = {
  494 |       ...RandomDataUtil.generateUpdatedCartPayload(USER_ID),
  495 |       products: createPayload.products.map((product) => ({
  496 |         ...product,
  497 |         quantity: product.quantity + 1,
  498 |       })),
  499 |     };
  500 |     const updateResponse = await request.put(
  501 |       `${BASE_URL}${routeWithId(Routes.UPDATE_CART, created.id)}`,
  502 |       { data: updatePayload },
  503 |     );
  504 |     expect(updateResponse.status()).toBe(200);
  505 | 
  506 |     const updated = await updateResponse.json();
  507 |     expect(updated.id).toBe(created.id);
  508 |     expect(updated.products[0].quantity).toBe(updatePayload.products[0].quantity);
  509 | 
  510 |     const deleteResponse = await request.delete(
  511 |       `${BASE_URL}${routeWithId(Routes.DELETE_CART, created.id)}`,
  512 |     );
  513 |     expect(deleteResponse.status()).toBe(200);
  514 |   });
  515 | });
  516 | 
```