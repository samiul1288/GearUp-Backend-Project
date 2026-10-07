import { prisma } from "../../lib/prisma.js";
import AppError from "../../errors/AppError.js";

import { TCreatePayment, TUpdatePaymentStatus } from "./payment.interface.js";

import {
  PaymentGateway,
  PaymentStatus,
  UserRole,
} from "../../../generated/prisma/enums.js";

// Create Payment
const createPaymentIntoDB = async (userId: string, payload: TCreatePayment) => {
  const { rentalId, transactionId } = payload;

  const rental = await prisma.rental.findUnique({
    where: {
      id: rentalId,
    },
    include: {
      payment: true,
    },
  });

  if (!rental) {
    throw new AppError(404, "Rental booking not found!");
  }

  if (rental.customerId !== userId) {
    throw new AppError(403, "You are not authorized to pay for this rental!");
  }

  if (rental.payment) {
    throw new AppError(
      400,
      "Payment for this rental has already been initiated or completed!",
    );
  }

  const generatedTxnId =
    transactionId || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const payment = await prisma.payment.create({
    data: {
      rentalId,
      amount: rental.totalAmount,

      // Required by Payment model
      gateway: PaymentGateway.STRIPE,

      // Simulated successful payment
      status: PaymentStatus.PAID,

      transactionId: generatedTxnId,
    },

    include: {
      rental: {
        include: {
          gear: true,
        },
      },
    },
  });

  return payment;
};

// Get Payments
const getPaymentsFromDB = async (userId: string, userRole: UserRole) => {
  let whereConditions: any = {};

  if (userRole === UserRole.CUSTOMER) {
    whereConditions = {
      rental: {
        customerId: userId,
      },
    };
  }

  if (userRole === UserRole.PROVIDER) {
    whereConditions = {
      rental: {
        gear: {
          providerId: userId,
        },
      },
    };
  }

  // ADMIN gets all payments
  const payments = await prisma.payment.findMany({
    where: whereConditions,

    include: {
      rental: {
        include: {
          gear: {
            select: {
              id: true,
              title: true,
              images: true,
            },
          },

          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};

// Update Payment Status
const updatePaymentStatusInDB = async (
  paymentId: string,
  payload: TUpdatePaymentStatus,
) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    throw new AppError(404, "Payment record not found!");
  }

  const updatedPayment = await prisma.payment.update({
    where: {
      id: paymentId,
    },

    data: {
      status: payload.status,

      ...(payload.transactionId && {
        transactionId: payload.transactionId,
      }),
    },
  });

  return updatedPayment;
};

export const PaymentServices = {
  createPaymentIntoDB,
  getPaymentsFromDB,
  updatePaymentStatusInDB,
};
