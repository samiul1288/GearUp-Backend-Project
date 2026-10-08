import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import AppError from "../errors/AppError.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/index.js";
import { TAuthUser } from "../modules/Auth/auth.interface.js";
import { UserRole, UserStatus } from "../../generated/prisma/enums.js";

export const auth = (...requiredRoles: UserRole[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authorization = req.headers.authorization;
      const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

      if (!token) {
        throw new AppError(
          401,
          "A valid access token is required. Send it as a Bearer token.",
        );
      }

      let decoded: JwtPayload & TAuthUser;
      try {
        const verified = jwt.verify(token, config.jwt_access_secret as string);
        if (
          typeof verified === "string" ||
          typeof verified.id !== "string" ||
          typeof verified.email !== "string" ||
          !Object.values(UserRole).includes(verified.role as UserRole)
        ) {
          throw new AppError(401, "Invalid access token payload.");
        }
        decoded = verified as JwtPayload & TAuthUser;
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          throw new AppError(401, "Access token has expired. Please log in again.");
        }
        if (error instanceof jwt.JsonWebTokenError) {
          throw new AppError(401, "Invalid access token. Please log in again.");
        }
        throw error;
      }

      // 3. Check if User Exists in Database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        throw new AppError(404, "User not found!");
      }

      // 4. Check User Status
      if (
        user.status === UserStatus.SUSPENDED ||
        user.status === UserStatus.BLOCKED
      ) {
        throw new AppError(
          403,
          `Your account is ${user.status.toLowerCase()}!`,
        );
      }

      // 5. Role-Based Authorization Check
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new AppError(
          403,
          "You do not have permission to access this resource!",
        );
      }

      // Attach decoded user payload to request object
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
