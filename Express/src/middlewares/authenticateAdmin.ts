import { NextFunction, Request, Response } from "express";
import { UserRole } from "models/user";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (req?.user?.role === UserRole.ADMIN) {
    next();
  } else {
    res.status(404).send("Unauthorized");
  }
};
export const MATCHER = /^\/admin(?!\/auth)(\/.*)?$/;
export const MIDDLEWARES = [authenticate];
export const METHOD = "ALL";
export const PRIORITY = -1000;
