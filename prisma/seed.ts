import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { UserRole } from "../generated/prisma/enums.js";

const databaseUrl = process.env.DATABASE_URL;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME?.trim() || "GearUp Administrator";
const resetAdminPassword = process.env.ADMIN_RESET_PASSWORD === "true";

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the administrator.");
}
if (!adminEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
  throw new Error("Set ADMIN_EMAIL to a valid administrator email.");
}
if (!adminPassword || adminPassword.length < 12) {
  throw new Error("Set ADMIN_PASSWORD to a password of at least 12 characters.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

try {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { id: true, role: true },
  });

  if (existingAdmin) {
    if (existingAdmin.role !== UserRole.ADMIN) {
      throw new Error(
        "ADMIN_EMAIL belongs to a non-admin account; refusing to promote it automatically.",
      );
    }
    if (resetAdminPassword) {
      const password = await bcrypt.hash(
        adminPassword,
        Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
      );
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { password },
      });
      console.info(`Administrator password updated for: ${adminEmail}`);
    } else {
      console.info(`Administrator account already exists: ${adminEmail}`);
    }
  } else {
    const password = await bcrypt.hash(
      adminPassword,
      Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
    );
    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password,
        role: UserRole.ADMIN,
      },
    });
    console.info(`Administrator account created: ${adminEmail}`);
  }
} finally {
  await prisma.$disconnect();
}
