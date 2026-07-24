import { UserRole } from "../../../generated/prisma/enums";

export type TLoginUser = {
  email: string;
  password: string;
};

export type TAuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type TLoginUserResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
};

declare global {
  namespace Express {
    interface Request {
      user?: TAuthUser;
    }
  }
}
