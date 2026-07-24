import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import config from "../../config";
import { TLoginUser } from "./auth.interface";
import { User } from "../../../generated/prisma/client";

// Register User
const registerUserIntoDB = async (payload: User) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(400, "User with this email already exists!");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  // Create new user
  const result = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      address: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

// Login User
const loginUserFromDB = async (payload: TLoginUser) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(404, "User does not exist!");
  }

  // Check if user is active
  if (
    user.status === UserStatus.BLOCKED ||
    user.status === UserStatus.SUSPENDED
  ) {
    throw new AppError(403, `Your account is ${user.status.toLowerCase()}!`);
  }

  // Verify password
  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );
  if (!isPasswordMatched) {
    throw new AppError(401, "Invalid credentials!");
  }

  // JWT Payload
  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // Generate Access Token
  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: config.jwt_access_expires_in as any,
  });

  // Generate Refresh Token
  const refreshToken = jwt.sign(
    jwtPayload,
    (config.jwt_refresh_secret || config.jwt_access_secret) as string,
    {
      expiresIn: (config.jwt_refresh_expires_in || "30d") as any,
    },
  );

  return {
    accessToken,
    refreshToken, // Controlled cookie set করার জন্য প্রয়োজন
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
};

// Get Profile (Get Me)
const getMeFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      address: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found!");
  }

  return user;
};

export const AuthServices = {
  registerUserIntoDB,
  loginUserFromDB,
  getMeFromDB,
};
