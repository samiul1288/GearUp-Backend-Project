// src/app/middleware/globalErrorHandler.ts
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import AppError from "../errors/AppError.js";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorDetails: Array<{ path: string; message: string }> = [];

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errorDetails = err.issues.map((issue) => ({
      path: issue.path.map(String).join("."),
      message: issue.message,
    }));
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (
    err instanceof SyntaxError &&
    "status" in err &&
    err.status === 400
  ) {
    statusCode = 400;
    message = "Invalid JSON request body.";
  } else if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof err.code === "string"
  ) {
    if (err.code === "P2002") {
      statusCode = 409;
      message = "A record with this value already exists.";
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "The requested record was not found.";
    } else if (err.code === "P2003") {
      statusCode = 400;
      message = "The request references a record that does not exist.";
    } else {
      console.error("Unhandled Prisma error:", err);
    }
  } else {
    console.error("Unhandled request error:", err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};

export default globalErrorHandler;
