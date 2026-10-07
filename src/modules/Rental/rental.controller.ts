import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import  sendResponse  from "../../utils/sendResponse.js";
import { RentalServices } from "./rental.service.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const createRental = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const result = await RentalServices.createRentalIntoDB(customerId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Rental requested successfully",
    data: result,
  });
});

const getMyRentals = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role as UserRole;
  const result = await RentalServices.getMyRentalsFromDB(userId, userRole);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Rentals retrieved successfully",
    data: result,
  });
});

const getRentalById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      throw new Error("Invalid rental ID");
    }
  const userId = req.user!.id;
  const userRole = req.user!.role as UserRole;
  const result = await RentalServices.getRentalByIdFromDB(id, userId, userRole);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Rental details retrieved successfully",
    data: result,
  });
});

const updateRentalStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
  if (!id || Array.isArray(id)) {
    throw new Error("Invalid rental ID");
    }
    
  const userId = req.user!.id;
  const userRole = req.user!.role as UserRole;
  const { status } = req.body;
  const result = await RentalServices.updateRentalStatusInDB(
    id,
    userId,
    userRole,
    status,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Rental status updated successfully",
    data: result,
  });
});

export const RentalController = {
  createRental,
  getMyRentals,
  getRentalById,
  updateRentalStatus,
};
