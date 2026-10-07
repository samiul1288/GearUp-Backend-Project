import { PaymentStatus } from "../../../generated/prisma/enums.js";

export type TCreatePayment = {
  rentalId: string;
  transactionId?: string;
};

export type TUpdatePaymentStatus = {
  status: PaymentStatus;
  transactionId?: string;
};
