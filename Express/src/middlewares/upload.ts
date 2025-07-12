import { Request } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  // 저장될 파일 경로 설정
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ): void => {
    let subPath = req.params?.[0] || ""; // URL에서 subPath를 가져오고, 없으면 'general' 폴더 사용
    if (subPath.startsWith("/")) subPath = subPath.slice(1);
    const uploadDir = path.resolve(__dirname, "../../uploads", subPath); // uploads/subPath 형태
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  // 저장될 파일명 설정
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    // 파일명: 현재 시간_원본 파일명 (중복 방지를 위해)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB로 일시적으로 늘려 테스트
  },
  //   fileFilter: (
  //     req: Request,
  //     file: Express.Multer.File,
  //     cb: multer.FileFilterCallback
  //   ) => {
  //     // 파일 필터링 (예: 이미지 파일만 허용)
  //     const allowedMimeTypes = [
  //       "image/jpeg",
  //       "image/png",
  //       "image/gif",
  //       "image/webp",
  //     ];
  //     if (allowedMimeTypes.includes(file.mimetype)) {
  //       cb(null, true); // 허용
  //     } else {
  //       cb(new Error("Only image files (JPEG, PNG, GIF, WEBP) are allowed!")); // 거부
  //     }
  //   },
});
// const uploadSingleFile = (fieldName: string) => upload.single(fieldName);

// 여러 파일 업로드용 미들웨어 (같은 폼 필드 이름)
const uploadArrayOfFiles = (fieldName: string, maxCount?: number) =>
  upload.array(fieldName, maxCount);

// 여러 파일 업로드용 미들웨어 (여러 폼 필드 이름)
// const uploadFields = (fields: multer.Field[]) => upload.fields(fields);

export const MATCHER = /^\/uploads(\/.*)?$/;
export const MIDDLEWARES = [uploadArrayOfFiles("files")];
export const PRIORITY = -1000;
export const METHOD = "POST";
