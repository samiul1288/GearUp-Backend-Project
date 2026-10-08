import { RequestHandler } from "express";

const notFoundHandler: RequestHandler = (req, res) =>
  res.status(404).json({
    success: false,
    message: "Route not found.",
    errorDetails: [],
  });

export default notFoundHandler;
