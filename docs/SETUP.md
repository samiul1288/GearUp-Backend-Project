# GearUp backend setup and deployment

## Environment

Copy `.env.example` to `.env` for local development and fill in credentials
locally. Do not commit `.env` or send passwords, database URLs, or gateway
secrets in chat.

Required application settings:

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`: different, long random secrets.
- `API_BASE_URL`: public base URL used for payment callbacks; use
  `http://localhost:5000` locally and the deployed API origin in production.
- `SSLCOMMERZ_STORE_ID` and `SSLCOMMERZ_STORE_PASSWORD`: merchant credentials.
- `SSLCOMMERZ_SANDBOX`: defaults to sandbox unless explicitly set to `false`.

For Vercel, add these in **Project → Settings → Environment Variables**, selecting
the appropriate environments. Add `DATABASE_URL`, both JWT secrets, the
SSLCommerz store credentials, `API_BASE_URL=https://gear-up-backend-project.vercel.app`,
and `SSLCOMMERZ_SANDBOX=true` for testing. Switch to the live merchant
credentials and set `SSLCOMMERZ_SANDBOX=false` only after sandbox verification.

The customer must have a phone number in their profile before a rental payment
can be initiated. A rental must be approved by its provider first. The create
payment endpoint returns a `checkoutUrl`; redirect the customer to it. The
service only marks payment as `PAID` after server-side SSLCommerz validation of
the transaction ID, amount, currency, status, and risk flag. Never trust a
browser callback alone as proof of payment.

## Database changes

The latest schema adds an optional `brand` field to gear. It has an additive SQL
migration in `prisma/migrations/20261008000000_add_gear_brand`.

After reviewing that migration against the target database, apply it:

```bash
npx prisma migrate deploy
npx prisma generate
```

Do not use `prisma migrate reset` against production. The migration is not
automatically run during Vercel builds; run it against the intended database
before relying on brand filters in that deployment.

## Bootstrap the Admin account

Public registration permits only `CUSTOMER` and `PROVIDER`. Create the first
Admin from a trusted terminal after setting `ADMIN_EMAIL` and a unique
`ADMIN_PASSWORD` (at least 12 characters) in the local environment or the
deployment environment:

```bash
npx prisma db seed
```

The seed creates the Admin only if that email does not already exist. It refuses
to promote an existing non-admin account and does not print the password.
For a deliberate password reset on an existing Admin, set
`ADMIN_RESET_PASSWORD=true`, run the seed, and then set it back to `false`.
This switch never promotes a non-admin account.

## Verify

```bash
npm run build
npm test
```

The OpenAPI contract is in [`openapi.yaml`](./openapi.yaml). It covers public
routes, authenticated routes, request bodies, query parameters, and the
SSLCommerz callbacks.
