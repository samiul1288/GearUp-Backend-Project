import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
import test from "node:test";
import app from "../src/app.js";
import { AuthValidations } from "../src/modules/Auth/auth.validation.js";
import { PaymentValidation } from "../src/modules/Payment/payment.validation.js";
import { gearQuerySchema, idParamSchema } from "../src/middleware/requestSchemas.js";

test("public registration accepts customer/provider but rejects admin role", () => {
  const common = {
    name: "Test User",
    email: "test@example.com",
    password: "safe-test-password",
  };

  assert.equal(
    AuthValidations.registerValidationSchema.safeParse({
      body: { ...common, role: "CUSTOMER" },
    }).success,
    true,
  );
  assert.equal(
    AuthValidations.registerValidationSchema.safeParse({
      body: { ...common, role: "ADMIN" },
    }).success,
    false,
  );
});

test("gear query validates availability and price ranges", () => {
  assert.equal(
    gearQuerySchema.safeParse({
      query: { isAvailable: "false", minPrice: "10", maxPrice: "20" },
    }).success,
    true,
  );
  assert.equal(
    gearQuerySchema.safeParse({
      query: { minPrice: "30", maxPrice: "20" },
    }).success,
    false,
  );
  assert.equal(
    gearQuerySchema.safeParse({ query: { isAvailable: "sometimes" } }).success,
    false,
  );
});

test("routes reject malformed UUIDs and payment requests cannot supply transaction state", () => {
  assert.equal(
    idParamSchema.safeParse({ params: { id: "not-a-uuid" } }).success,
    false,
  );
  assert.equal(
    PaymentValidation.createPaymentValidationSchema.safeParse({
      body: { rentalId: "not-a-uuid" },
    }).success,
    false,
  );
  assert.equal(
    PaymentValidation.createPaymentValidationSchema.safeParse({
      body: {
        rentalId: "550e8400-e29b-41d4-a716-446655440000",
        status: "PAID",
      },
    }).success,
    false,
  );
});

test("HTTP app serves health and structured 404 and malformed-body errors", async () => {
  const server = app.listen(0);
  try {
    await new Promise<void>((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    const address = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const health = await fetch(`${baseUrl}/`);
    assert.equal(health.status, 200);
    assert.equal(await health.text(), "Hello, World!");

    const missing = await fetch(`${baseUrl}/no-such-route`);
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), {
      success: false,
      message: "Route not found.",
      errorDetails: [],
    });

    const adminSignup = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Should Not Be Admin",
        email: "blocked-admin@example.com",
        password: "safe-test-password",
        role: "ADMIN",
      }),
    });
    assert.equal(adminSignup.status, 400);
    const validationBody = await adminSignup.json();
    assert.equal(validationBody.success, false);
    assert.equal(validationBody.message, "Validation Error");
    assert.ok(validationBody.errorDetails.length > 0);

    const malformed = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    assert.equal(malformed.status, 400);
    const errorBody = await malformed.json();
    assert.equal(errorBody.success, false);
    assert.equal(errorBody.message, "Invalid JSON request body.");
    assert.deepEqual(errorBody.errorDetails, []);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
