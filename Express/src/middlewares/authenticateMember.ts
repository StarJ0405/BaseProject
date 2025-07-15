import { NextFunction, Request, Response } from "express";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (req?.user) {
    next();
  } else {
    res.status(404).send("Unauthorized");
  }
};
export const MATCHER = /^\/customer\/me(\/.*)?$/;
export const MIDDLEWARES = [authenticate];
export const METHOD = "ALL";
export const PRIORITY = -1000;
