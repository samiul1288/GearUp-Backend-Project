// src/app/middleware/validateRequest.ts
import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

const validateRequest = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        cookies: req.cookies,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
