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
      const token =
        req.headers.authorization?.split(" ")[1] || req.cookies?.refreshToken;

      if (!token) {
        throw new AppError(401, "You are not authorized!");
      }

      // 2. Verify Token
      const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload & TAuthUser;

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
