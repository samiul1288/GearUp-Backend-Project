import { prisma } from "../../lib/prisma.js";
import AppError from "../../errors/AppError.js";
import { TCreateCategory, TUpdateCategory } from "./category.interface.js";

// Create Category (Admin only)
const createCategoryIntoDB = async (payload: TCreateCategory) => {
  const existingCategory = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (existingCategory) {
    throw new AppError(400, "Category with this name already exists!");
  }

  const category = await prisma.category.create({
    data: payload,
  });

  return category;
};

// Get All Categories (Public)
const getAllCategoriesFromDB = async () => {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { gears: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return categories;
};

// Get Single Category By ID
const getCategoryByIdFromDB = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      gears: true,
    },
  });

  if (!category) {
    throw new AppError(404, "Category not found!");
  }

  return category;
};

// Update Category (Admin only)
const updateCategoryInDB = async (
  categoryId: string,
  payload: TUpdateCategory,
) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError(404, "Category not found!");
  }

  if (payload.name && payload.name !== category.name) {
    const existingName = await prisma.category.findUnique({
      where: { name: payload.name },
    });
    if (existingName) {
      throw new AppError(400, "Category name already in use!");
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id: categoryId },
    data: payload,
  });

  return updatedCategory;
};

// Delete Category (Admin only)
const deleteCategoryFromDB = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError(404, "Category not found!");
  }

  const deletedCategory = await prisma.category.delete({
    where: { id: categoryId },
  });

  return deletedCategory;
};

export const CategoryServices = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  getCategoryByIdFromDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
};
