import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import  sendResponse  from "../../utils/sendResponse.js";
import { AnalyticsServices } from "./analytics.service.js";

const getMetaData = catchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getMetaDataFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Analytics metadata retrieved successfully",
    data: result,
  });
});

export const AnalyticsController = {
  getMetaData,
};
