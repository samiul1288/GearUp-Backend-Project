import { randomBytes } from "node:crypto";
import { z } from "zod";
import {
  PaymentGateway,
  PaymentStatus,
  RentalStatus,
  UserRole,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../errors/AppError.js";
import config from "../../config/index.js";
import { TCreatePayment } from "./payment.interface.js";

const initiationSchema = z.object({
  status: z.string(),
  GatewayPageURL: z.url().optional(),
  gatewayPageURL: z.url().optional(),
  sessionkey: z.string().optional(),
});

const validationResponseSchema = z.object({
  status: z.string(),
  tran_id: z.string(),
  amount: z.union([z.string(), z.number()]),
  currency: z.string().optional(),
  currency_type: z.string().optional(),
  risk_level: z.union([z.string(), z.number()]).optional(),
});

type PaymentData = {
  checkoutUrl?: string;
  sessionKey?: string;
  verifiedAt?: string;
  valId?: string;
  sandbox?: boolean;
};

const asPaymentData = (data: unknown): PaymentData =>
  typeof data === "object" && data !== null && !Array.isArray(data)
    ? (data as PaymentData)
    : {};

const credentials = () => {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  const apiBaseUrl = config.api_base_url;

  if (!storeId || !storePassword || !apiBaseUrl) {
    throw new AppError(
      503,
      "SSLCommerz is not configured. Set its credentials and API_BASE_URL.",
    );
  }

  let callbackBaseUrl: URL;
  try {
    callbackBaseUrl = new URL(apiBaseUrl);
  } catch {
    throw new AppError(503, "API_BASE_URL must be a valid absolute URL.");
  }

  if (
    process.env.NODE_ENV === "production" &&
    callbackBaseUrl.protocol !== "https:"
  ) {
    throw new AppError(503, "API_BASE_URL must use HTTPS in production.");
  }

  const sandbox = process.env.SSLCOMMERZ_SANDBOX !== "false";
  return {
    storeId,
    storePassword,
    callbackBaseUrl: callbackBaseUrl.toString().replace(/\/$/, ""),
    sandbox,
    gatewayOrigin: sandbox
      ? "https://sandbox.sslcommerz.com"
      : "https://securepay.sslcommerz.com",
  };
};

const newTransactionId = () =>
  `GU${Date.now().toString(36)}${randomBytes(7).toString("hex")}`.slice(0, 30);

const safePayment = <T extends { paymentData?: unknown }>(payment: T) => {
  const { paymentData: _paymentData, ...safeData } = payment;
  return safeData;
};

const createPaymentIntoDB = async (userId: string, payload: TCreatePayment) => {
  const gateway = credentials();
  const rental = await prisma.rental.findUnique({
    where: { id: payload.rentalId },
    include: { payment: true, customer: true, gear: true },
  });

  if (!rental) {
    throw new AppError(404, "Rental booking not found.");
  }
  if (rental.customerId !== userId) {
    throw new AppError(403, "You are not authorized to pay for this rental.");
  }
  if (rental.status !== RentalStatus.APPROVED) {
    throw new AppError(400, "Payment is available after the provider approves the rental.");
  }

  const amount = Number(rental.totalAmount);
  if (!Number.isFinite(amount) || amount < 10 || amount > 500_000) {
    throw new AppError(400, "SSLCommerz accepts payments between BDT 10 and BDT 500,000.");
  }
  if (!rental.customer.phone?.trim()) {
    throw new AppError(400, "Add a phone number to your profile before paying.");
  }

  const existingPayment = rental.payment;
  if (existingPayment?.status === PaymentStatus.PAID) {
    throw new AppError(409, "This rental has already been paid.");
  }
  if (existingPayment?.status === PaymentStatus.PENDING) {
    const paymentData = asPaymentData(existingPayment.paymentData);
    if (paymentData.checkoutUrl) {
      if (paymentData.sandbox !== gateway.sandbox) {
        throw new AppError(
          409,
          "This payment was started in a different SSLCommerz environment.",
        );
      }
      return {
        paymentId: existingPayment.id,
        transactionId: existingPayment.transactionId,
        status: existingPayment.status,
        amount: existingPayment.amount,
        currency: "BDT",
        checkoutUrl: paymentData.checkoutUrl,
      };
    }
    throw new AppError(
      409,
      "A payment session is already being created for this rental. Retry shortly.",
    );
  }

  const transactionId = newTransactionId();
  let paymentId: string;
  if (existingPayment) {
    if (existingPayment.status !== PaymentStatus.FAILED) {
      throw new AppError(409, "The existing payment cannot be retried in its current state.");
    }
    const retry = await prisma.payment.updateMany({
      where: { id: existingPayment.id, status: PaymentStatus.FAILED },
      data: {
        amount,
        gateway: PaymentGateway.SSLCOMMERZ,
        status: PaymentStatus.PENDING,
        transactionId,
        paymentData: {},
      },
    });
    if (retry.count !== 1) {
      throw new AppError(409, "This payment was updated concurrently. Please retry.");
    }
    paymentId = existingPayment.id;
  } else {
    const createdPayment = await prisma.payment.create({
        data: {
          rentalId: rental.id,
          amount,
          gateway: PaymentGateway.SSLCOMMERZ,
          status: PaymentStatus.PENDING,
          transactionId,
        },
      });
    paymentId = createdPayment.id;
  }

  const callbacks = {
    success: `${gateway.callbackBaseUrl}/api/payments/sslcommerz/success`,
    fail: `${gateway.callbackBaseUrl}/api/payments/sslcommerz/fail`,
    cancel: `${gateway.callbackBaseUrl}/api/payments/sslcommerz/cancel`,
    ipn: `${gateway.callbackBaseUrl}/api/payments/sslcommerz/ipn`,
  };
  const requestBody = new URLSearchParams({
    store_id: gateway.storeId,
    store_passwd: gateway.storePassword,
    total_amount: amount.toFixed(2),
    currency: "BDT",
    tran_id: transactionId,
    success_url: callbacks.success,
    fail_url: callbacks.fail,
    cancel_url: callbacks.cancel,
    ipn_url: callbacks.ipn,
    cus_name: rental.customer.name,
    cus_email: rental.customer.email,
    cus_add1: rental.customer.address?.trim() || rental.gear.location,
    cus_city: rental.gear.location,
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: rental.customer.phone,
    shipping_method: "NO",
    product_name: rental.gear.title.slice(0, 200),
    product_category: "Sports and outdoor gear",
    product_profile: "physical-goods",
  });

  try {
    const response = await fetch(
      `${gateway.gatewayOrigin}/gwprocess/v4/api.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: requestBody,
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!response.ok) {
      throw new AppError(502, "SSLCommerz could not start the checkout session.");
    }

    const session = initiationSchema.safeParse(await response.json());
    const checkoutUrl = session.success
      ? session.data.GatewayPageURL ?? session.data.gatewayPageURL
      : undefined;
    if (!session.success || session.data.status !== "SUCCESS" || !checkoutUrl) {
      throw new AppError(502, "SSLCommerz rejected the checkout request.");
    }

    const checkout = new URL(checkoutUrl);
    const expectedHost = gateway.sandbox
      ? "sandbox.sslcommerz.com"
      : "securepay.sslcommerz.com";
    if (checkout.protocol !== "https:" || checkout.hostname !== expectedHost) {
      throw new AppError(502, "SSLCommerz returned an unexpected checkout URL.");
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentData: {
          checkoutUrl,
          sandbox: gateway.sandbox,
          ...(session.data.sessionkey && { sessionKey: session.data.sessionkey }),
        },
      },
    });

    return {
      paymentId,
      transactionId,
      status: PaymentStatus.PENDING,
      amount,
      currency: "BDT",
      checkoutUrl,
    };
  } catch (error) {
    await prisma.payment.updateMany({
      where: { id: paymentId, status: PaymentStatus.PENDING },
      data: {
        status: PaymentStatus.FAILED,
        paymentData: {},
      },
    });
    if (error instanceof AppError) {
      throw error;
    }
    console.error("SSLCommerz checkout initiation failed:", error);
    throw new AppError(502, "Unable to connect to SSLCommerz. Please retry.");
  }
};

const verifyAndCompletePayment = async (callback: {
  valId: unknown;
  transactionId: unknown;
}) => {
  const valId = z.string().min(1).max(100).safeParse(callback.valId);
  const transactionId = z.string().min(1).max(30).safeParse(callback.transactionId);
  if (!valId.success || !transactionId.success) {
    throw new AppError(400, "SSLCommerz callback is missing a valid val_id or tran_id.");
  }

  const gateway = credentials();
  const payment = await prisma.payment.findUnique({
    where: { transactionId: transactionId.data },
  });
  if (!payment || payment.gateway !== PaymentGateway.SSLCOMMERZ) {
    throw new AppError(404, "The payment transaction was not found.");
  }
  const paymentData = asPaymentData(payment.paymentData);
  if (
    paymentData.sandbox !== undefined &&
    paymentData.sandbox !== gateway.sandbox
  ) {
    throw new AppError(
      409,
      "The payment must be verified in the SSLCommerz environment where it was started.",
    );
  }

  const validationUrl = new URL(
    "/validator/api/validationserverAPI.php",
    gateway.gatewayOrigin,
  );
  validationUrl.search = new URLSearchParams({
    val_id: valId.data,
    store_id: gateway.storeId,
    store_passwd: gateway.storePassword,
    format: "json",
  }).toString();

  let validation;
  try {
    const response = await fetch(validationUrl, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      throw new AppError(502, "SSLCommerz transaction validation failed.");
    }
    validation = validationResponseSchema.safeParse(await response.json());
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("SSLCommerz transaction validation request failed:", error);
    throw new AppError(502, "Unable to validate the SSLCommerz transaction.");
  }

  if (!validation.success) {
    throw new AppError(502, "SSLCommerz returned an invalid validation response.");
  }
  const validated = validation.data;
  if (
    !["VALID", "VALIDATED"].includes(validated.status) ||
    validated.tran_id !== transactionId.data ||
    (validated.currency || validated.currency_type) !== "BDT" ||
    (validated.risk_level !== undefined && String(validated.risk_level) !== "0")
  ) {
    throw new AppError(400, "SSLCommerz could not verify this payment.");
  }

  if (Math.abs(Number(validated.amount) - payment.amount) > 0.01) {
    throw new AppError(400, "The verified transaction amount does not match the rental.");
  }

  if (payment.status === PaymentStatus.REFUNDED) {
    throw new AppError(409, "A refunded payment cannot be marked as paid.");
  }

  if (payment.status !== PaymentStatus.PAID) {
    return prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        paymentData: {
          ...asPaymentData(payment.paymentData),
          sandbox: gateway.sandbox,
          valId: valId.data,
          verifiedAt: new Date().toISOString(),
        },
      },
      select: {
        id: true,
        rentalId: true,
        amount: true,
        gateway: true,
        status: true,
        transactionId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  return {
    id: payment.id,
    rentalId: payment.rentalId,
    amount: payment.amount,
    gateway: payment.gateway,
    status: payment.status,
    transactionId: payment.transactionId,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
};

const markPaymentFailed = async (rawTransactionId: unknown) => {
  const transactionId = z.string().min(1).max(30).safeParse(rawTransactionId);
  if (!transactionId.success) {
    throw new AppError(400, "A valid SSLCommerz transaction ID is required.");
  }

  const payment = await prisma.payment.findUnique({
    where: { transactionId: transactionId.data },
  });
  if (!payment || payment.gateway !== PaymentGateway.SSLCOMMERZ) {
    throw new AppError(404, "The payment transaction was not found.");
  }

  if (payment.status === PaymentStatus.PENDING) {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: PaymentStatus.PENDING },
      data: { status: PaymentStatus.FAILED, paymentData: {} },
    });
    const currentPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
    });
    if (!currentPayment) {
      throw new AppError(404, "Payment record not found.");
    }
    return safePayment(currentPayment);
  }
  return safePayment(payment);
};

const paymentSelect = {
  id: true,
  rentalId: true,
  amount: true,
  gateway: true,
  status: true,
  transactionId: true,
  createdAt: true,
  updatedAt: true,
};

const getPaymentsFromDB = async (userId: string, userRole: UserRole) => {
  const whereConditions =
    userRole === UserRole.CUSTOMER
      ? { rental: { customerId: userId } }
      : userRole === UserRole.PROVIDER
        ? { rental: { gear: { providerId: userId } } }
        : {};

  return prisma.payment.findMany({
    where: whereConditions,
    select: {
      ...paymentSelect,
      rental: {
        include: {
          gear: {
            select: { id: true, title: true, images: true },
          },
          customer: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentByIdFromDB = async (
  paymentId: string,
  userId: string,
  userRole: UserRole,
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { rental: { include: { gear: true } } },
  });
  if (!payment) {
    throw new AppError(404, "Payment record not found.");
  }
  if (
    userRole !== UserRole.ADMIN &&
    payment.rental.customerId !== userId &&
    payment.rental.gear.providerId !== userId
  ) {
    throw new AppError(403, "You are not authorized to view this payment.");
  }
  return safePayment(payment);
};

export const PaymentServices = {
  createPaymentIntoDB,
  verifyAndCompletePayment,
  markPaymentFailed,
  getPaymentsFromDB,
  getPaymentByIdFromDB,
};
