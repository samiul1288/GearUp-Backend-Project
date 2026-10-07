import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";

import sendResponse from "../../utils/sendResponse.js";

import { ReviewServices } from "./review.service.js";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const result = await ReviewServices.createReviewIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review added successfully",
    data: result,
  });
});

const getGearReviews = catchAsync(async (req: Request, res: Response) => {
  const { gearId } = req.params;

  if (!gearId || Array.isArray(gearId)) {
    throw new Error("Invalid gear ID");
  }

  const result = await ReviewServices.getGearReviewsFromDB(gearId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new Error("Invalid review ID");
  }

  const userId = req.user!.id;

  const result = await ReviewServices.updateReviewInDB(id, userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new Error("Invalid review ID");
  }

  const userId = req.user!.id;
  const userRole = req.user!.role;

  const result = await ReviewServices.deleteReviewFromDB(id, userId, userRole);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getGearReviews,
  updateReview,
  deleteReview,
};
