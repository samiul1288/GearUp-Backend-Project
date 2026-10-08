import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync.js";
import sendResponse  from "../../utils/sendResponse.js";

import { PaymentServices } from "./payment.service.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import AppError from "../../errors/AppError.js";

// Create Payment
const createPayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const result = await PaymentServices.createPaymentIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "SSLCommerz checkout session created",
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

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id || Array.isArray(id)) {
    throw new AppError(400, "A valid payment ID is required.");
  }

  const result = await PaymentServices.getPaymentByIdFromDB(
    id,
    req.user!.id,
    req.user!.role,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment retrieved successfully",
    data: result,
  });
});

const completeSslCommerzPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.verifyAndCompletePayment({
    valId: req.body.val_id ?? req.query.val_id,
    transactionId: req.body.tran_id ?? req.query.tran_id,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment verified successfully",
    data: result,
  });
});

const failSslCommerzPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.markPaymentFailed(
    req.body.tran_id ?? req.query.tran_id,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment failure recorded",
    data: result,
  });
});

export const PaymentController = {
  createPayment,
  getPayments,
  getPaymentById,
  completeSslCommerzPayment,
  failSslCommerzPayment,
};
