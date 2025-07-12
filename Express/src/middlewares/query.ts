import { NextFunction, Request, Response } from "express";

const parseGetStringifiedQuery = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.query) {
    const parsedQuery: any = req.query;
    for (const key in req.query) {
      try {
        // JSON.parse()를 시도하여 stringify된 JSON 형태인지 확인하고 파싱
        parsedQuery[key] = JSON.parse(String(req.query[key]));
      } catch (e) {
        // 파싱에 실패하면 그대로 둡니다 (일반 문자열 쿼리 파라미터).
        parsedQuery[key] = req.query[key];
      }
    }

    // Object.assign(req.query, parsedQuery);
    req.parsedQuery = parsedQuery; // 파싱된 쿼리 객체로 변경
  }
  next(); // 다음 미들웨어 또는 라우트 핸들러로 진행
  return;
};

export const MATCHER = /^(?!uploads(?:\/|$)).*$/;
export const MIDDLEWARES = [parseGetStringifiedQuery];
export const METHOD = "GET";
export const PRIORITY = -10000;
