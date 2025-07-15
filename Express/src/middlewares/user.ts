import { NextFunction, Request, Response } from "express";
import { UserService } from "services/user";
import { container } from "tsyringe";
import { verifyToken } from "utils/functions";

const logInUser = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = verifyToken(authorization);
    if (!token.keep || token.iat > new Date().getTime() / 1000) {
      const user_id = token.user_id;
      const service = container.resolve(UserService);
      req.user = await service.getById(user_id);
    }
  }
  next(); // 다음 미들웨어 또는 라우트 핸들러로 진행
  return;
};

export const MATCHER = /^(?!uploads(?:\/|$)).*$/;
export const MIDDLEWARES = [logInUser];
export const METHOD = "ALL";
export const PRIORITY = -10000;
