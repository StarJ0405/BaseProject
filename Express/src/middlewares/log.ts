import { NextFunction, Request, Response } from "express";
import _ from "lodash";

const winston = require("winston");
require("winston-daily-rotate-file");

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, logType }: any) => {
    if (
      typeof message === "string" ||
      typeof message === "number" ||
      typeof message === "boolean"
    ) {
      message = { message: message };
    }
    return JSON.stringify(_.merge({ timestamp, level }, message));
  })
);
function getLogger(auditFile: string, filename: string) {
  return winston.createLogger({
    format: logFormat,
    transports: [
      new winston.transports.DailyRotateFile({
        // filename: process.env.REQUEST_LOG || "request.log",
        filename,
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        auditFile,
        // auditFile: "req-audit.json",
      }),
    ],
  });
}
// ,
//       new winston.transports.DailyRotateFile({
//         filename: process.env.RESPONSE_LOG || "response.log",
//         datePattern: "YYYY-MM-DD",
//         zippedArchive: true,
//         maxSize: "20m",
//         maxFiles: "14d",
//         auditFile: "res-audit.json",
//       }),
const log = async (req: Request, res: Response, next: NextFunction) => {
  const send = res.send;
  // 접근 로그 저장
  // const ip: string = req.ip;
  // const ips: string[] = req.ips;
  // const hostname: string = req.hostname;
  // const subdomain: string[] = req.subdomains;
  // const url: string = req.url;
  // const path: string = req.path;
  // const baseUrl: string = req.baseUrl;
  // const originalUrl: string = req.originalUrl;
  // const method: string = req.method;
  // const query: string = JSON.stringify(req.query); // json
  // const params: string = JSON.stringify(req.params); // json
  // const cookie: string = JSON.stringify(req.cookies); //json
  // const req_body: string = JSON.stringify(req.body); // json
  if (process.env.LOG) {
    getLogger("req-audit.json", process.env.REQUEST_LOG || "request.log").info(
      {
        ip: req.ip,
        ips: req.ips,
        hostname: req.hostname,
        subdomains: req.subdomains,
        url: req.url,
        path: req.path,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl,
        method: req.method,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
        body: req.body,
      },
      { logType: "request" }
    );

    res.send = function (body: any) {
      // 응답 로그 저장
      getLogger(
        "res-audit.json",
        process.env.RESPONSE_LOG || "response.log"
      ).info(
        {
          ip: req.ip,
          ips: req.ips,
          hostname: req.hostname,
          subdomains: req.subdomains,
          url: req.url,
          path: req.path,
          baseUrl: req.baseUrl,
          originalUrl: req.originalUrl,
          method: req.method,
          query: req.query,
          params: req.params,
          cookies: req.cookies,
          body: req.body,
          status: res.statusCode,
          statusMessage: res.statusMessage,
          response: body,
        },
        { logType: "response" }
      );

      return send.call(this, body);
    };
    res.send;
  }
  next();
};

export const MATCHER = /^.*$/;
export const MIDDLEWARES = [log];
export const METHOD = "ALL";
export const PRIORITY = -10000;
