import { Request, Response } from "express";

const port = process.env.PORT || 8080;
const FILE_PREFIX =
  (process.env.BACKEND_URL || `http://localhost${port ? `:${port}` : ""}`) +
  (process.env.UPLOAD_PATH_PREFIX || "/uploads");
export const POST = (req: Request, res: Response) => {
  const files: any = req.files || [];
  let urls: string[] = files.map(
    (file: Express.Multer.File) => `${FILE_PREFIX}/${file.filename}`
  );

  res.json({
    urls: urls,
  });
};
