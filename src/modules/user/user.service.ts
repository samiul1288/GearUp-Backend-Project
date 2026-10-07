import { prisma } from "../../lib/prisma.js";
import AppError from "../../errors/AppError.js";
import { TUpdateProfile } from "./user.interface.js";
import { UserStatus } from "../../../generated/prisma/enums.js";

// Get All Users (Admin only)
const getAllUsersFromDB = async () => {
  const users = await prisma.user.findMany({
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};

// Get Single User Profile By ID
const getUserByIdFromDB = async (userId: string) => {
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

// Update Own Profile
const updateProfileInDB = async (userId: string, payload: TUpdateProfile) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found!");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      address: true,
      avatar: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

// Update User Status (Admin Block/Suspend)
const updateUserStatusInDB = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found!");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const UserServices = {
  getAllUsersFromDB,
  getUserByIdFromDB,
  updateProfileInDB,
  updateUserStatusInDB,
};
