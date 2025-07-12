import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";

const download = (req: Request, res: Response, next: NextFunction) => {
  try {
    const _path = path.resolve(__dirname, `..${decodeURI(req.path)}`);
    if (!fs.existsSync(_path)) {
      return res.status(404).send("File not found.");
    }
    if (req.query && req.query.download === "true") {
      res.download(_path);
    } else {
      res.sendFile(_path);
    }
  } catch (err) {
    console.error(err);
    res.status(404).send("file not exist");
  }
  return;
};
export const MATCHER = /^\/uploads(\/.*)?$/;
export const MIDDLEWARES = [download];
export const METHOD = "GET";
export const PRIORITY = -1000;
