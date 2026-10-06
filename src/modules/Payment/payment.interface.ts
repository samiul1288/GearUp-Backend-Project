import { PaymentStatus } from "../../../generated/prisma/enums";

export type TCreatePayment = {
  rentalId: string;
  transactionId?: string;
};

export type TUpdatePaymentStatus = {
  status: PaymentStatus;
  transactionId?: string;
};
