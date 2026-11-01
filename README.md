# ⚙️ GearUp — Outdoor & Sports Gear Rental (Backend API)

The GearUp Backend API is the server-side engine powering the GearUp rental platform. It handles secure authentication, product catalog management, booking lifecycles, and database seeding.

---

## 🚀 Tech Stack

* Runtime Environment: Node.js / Bun
* Framework: Express.js (with TypeScript)
* Database & ORM: PostgreSQL & Prisma ORM
* Validation: Zod
* Authentication: JWT (JSON Web Tokens) & bcryptjs

---

## ✨ Features

* JWT Authentication & Access Control: Role-based authorization (ADMIN and USER permissions).
* Gear & Inventory Management: Full CRUD operations for gear items and live status tracking.
* Booking Lifecycle: Order processing, security deposit calculations, and pickup/return status management.
* Data Validation: Type-safe request validation using Zod schemas.
* Custom Database Seeder: Custom seed scripts for fast testing and development setup.

---

## 🛠️ Getting Started (Local Setup)

1. Clone the repository:
git clone https://github.com/samiul1288/GearUp-Backend-Project.git
cd GearUp-Backend-Project

2. Install dependencies:
bun install
# or
npm install

3. Configure environment variables:
Create a `.env` file in the root directory and set the following variables:
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/gearup_db?schema=public"
JWT_SECRET="your_jwt_secret_key"
EXPIRES_IN="7d"

4. Run database migrations and sync schema:
npx prisma migrate dev

5. (Optional) Seed the database:
npx prisma db seed

6. Start the development server:
bun dev
# or
npm run dev

The server will run at http://localhost:5000.

---

## 📌 Primary API Endpoints

* POST /api/v1/auth/signup — Register a new user
* POST /api/v1/auth/login — User login & token generation
* GET /api/v1/items — Retrieve all available gear items
* POST /api/v1/items — Add a new gear item (Admin)
* POST /api/v1/orders — Create a booking/rental order
* GET /api/v1/orders/my-orders — Fetch user's own rental orders

---

## 🔗 Related Project

* Frontend Repository: https://github.com/samiul1288/GearUp-Backend-ForntEnd
