import { randomUUID } from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";

export function generateEntityId(idProperty?: string, prefix?: string) {
  if (idProperty) return idProperty;
  let uuid = randomUUID().replace(/-/g, "");
  if (prefix) uuid = prefix + "_" + uuid;
  return uuid;
}

const JWT_SECRET = process.env.JWT_SECRET || "puffu";
export function generateToken(
  data: any,
  options: SignOptions = {
    expiresIn: "1h",
  }
): string {
  return jwt.sign(data, JWT_SECRET, options);
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
