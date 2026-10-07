import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import sendResponse  from "../../utils/sendResponse.js";

import { PaymentServices } from "./payment.service.js";
import { UserRole } from "../../../generated/prisma/enums.js";

// Create Payment
const createPayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const result = await PaymentServices.createPaymentIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Payment processed successfully",
    data: result,
  });
});

// Get Payments
const getPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role as UserRole;

  const result = await PaymentServices.getPaymentsFromDB(userId, userRole);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payments retrieved successfully",
    data: result,
  });
});

// Update Payment Status
const updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new Error("Payment ID is required");
  }

  // Express 5 typing can make params values string | string[]
  if (Array.isArray(id)) {
    throw new Error("Invalid Payment ID");
  }

  const result = await PaymentServices.updatePaymentStatusInDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment status updated successfully",
    data: result,
  });
});

export const PaymentController = {
  createPayment,
  getPayments,
  updatePaymentStatus,
};
