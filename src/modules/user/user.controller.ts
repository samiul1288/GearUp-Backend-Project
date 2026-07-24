import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import  sendResponse  from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const id  = req.params.id as string
  const result = await UserServices.getUserByIdFromDB(id)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await UserServices.updateProfileInDB(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const  id  = req.params.id as string;
  const { status } = req.body;
  const result = await UserServices.updateUserStatusInDB(id, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

export const UserController = {
  getAllUsers,
  getUserById,
  updateMyProfile,
  updateUserStatus,
};
