import { prisma } from "../../lib/prisma.js";
import AppError from "../../errors/AppError.js";
import { TCreateGear, TGearFilterOptions, TUpdateGear } from "./gear.interface.js";

// Create Gear (PROVIDER or ADMIN)
const createGearIntoDB = async (providerId: string, payload: TCreateGear) => {
  // Check if category exists
  const categoryExists = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!categoryExists) {
    throw new AppError(404, "Category not found!");
  }

  const gear = await prisma.gear.create({
    data: {
      ...payload,
      providerId,
    },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return gear;
};

// Get All Gears with Search & Filtering
const getAllGearsFromDB = async (filters: TGearFilterOptions) => {
  const { searchTerm, categoryId, location, minPrice, maxPrice, isAvailable } =
    filters;
  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { location: { contains: searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (categoryId) {
    andConditions.push({ categoryId });
  }

  if (location) {
    andConditions.push({
      location: { contains: location, mode: "insensitive" },
    });
  }

  if (minPrice !== undefined) {
    andConditions.push({ pricePerDay: { gte: Number(minPrice) } });
  }

  if (maxPrice !== undefined) {
    andConditions.push({ pricePerDay: { lte: Number(maxPrice) } });
  }

  if (isAvailable !== undefined) {
    andConditions.push({ isAvailable: Boolean(isAvailable) });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const gears = await prisma.gear.findMany({
    where: whereConditions,
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return gears;
};

// Get Single Gear By ID
const getGearByIdFromDB = async (gearId: string) => {
  const gear = await prisma.gear.findUnique({
    where: { id: gearId },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      },
    },
  });

  if (!gear) {
    throw new AppError(404, "Gear not found!");
  }

  return gear;
};

// Update Gear
const updateGearInDB = async (
  gearId: string,
  userId: string,
  userRole: string,
  payload: TUpdateGear,
) => {
  const gear = await prisma.gear.findUnique({
    where: { id: gearId },
  });

  if (!gear) {
    throw new AppError(404, "Gear not found!");
  }

  // Allow update only if user is ADMIN or the Owner Provider
  if (userRole !== "ADMIN" && gear.providerId !== userId) {
    throw new AppError(403, "You can only update your own gear listings!");
  }

  const updatedGear = await prisma.gear.update({
    where: { id: gearId },
    data: payload,
    include: {
      category: true,
    },
  });

  return updatedGear;
};

// Delete Gear
const deleteGearFromDB = async (
  gearId: string,
  userId: string,
  userRole: string,
) => {
  const gear = await prisma.gear.findUnique({
    where: { id: gearId },
  });

  if (!gear) {
    throw new AppError(404, "Gear not found!");
  }

  // Allow delete only if user is ADMIN or the Owner Provider
  if (userRole !== "ADMIN" && gear.providerId !== userId) {
    throw new AppError(403, "You can only delete your own gear listings!");
  }

  const deletedGear = await prisma.gear.delete({
    where: { id: gearId },
  });

  return deletedGear;
};

export const GearServices = {
  createGearIntoDB,
  getAllGearsFromDB,
  getGearByIdFromDB,
  updateGearInDB,
  deleteGearFromDB,
};
