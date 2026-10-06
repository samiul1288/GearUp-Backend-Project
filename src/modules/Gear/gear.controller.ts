import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse  from "../../utils/sendResponse";
import { GearServices } from "./gear.service";

const createGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const result = await GearServices.createGearIntoDB(providerId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Gear listed successfully",
    data: result,
  });
});

const getAllGears = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query;
  const result = await GearServices.getAllGearsFromDB(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gears retrieved successfully",
    data: result,
  });
});

const getGearById = catchAsync(async (req: Request, res: Response) => {
  const id  = req.params.id as string;
  const result = await GearServices.getGearByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gear retrieved successfully",
    data: result,
  });
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const  id  = req.params.id as string;
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const result = await GearServices.updateGearInDB(
    id,
    userId,
    userRole,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gear updated successfully",
    data: result,
  });
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const  id  = req.params.id as string;
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const result = await GearServices.deleteGearFromDB(id, userId, userRole);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gear deleted successfully",
    data: result,
  });
});

export const GearController = {
  createGear,
  getAllGears,
  getGearById,
  updateGear,
  deleteGear,
};
