import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import crypto from "crypto";

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

export function verifyToken(token: string, options?: VerifyOptions): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(Number(process.env.saltRounds || 10));
    return await bcrypt.hash(password, salt);
  } catch (err) {
    return "";
  }
}
export async function comparePasswords(
  inputPassword: string,
  storedHashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(inputPassword, storedHashedPassword);
  } catch (err) {
    return false;
  }
}

const AUTHORIZATION_KEY = process.env.AUTHORIZATION_KEY || "";
if (!AUTHORIZATION_KEY || AUTHORIZATION_KEY.length !== 32) {
  console.error(
    "Error: AES_SECRET_KEY is not defined or its length is not 32 bytes in .env file."
  );
  console.error("Please ensure AES_SECRET_KEY is a 32-byte (256-bit) string.");
  process.exit(1); // 키가 없거나 길이가 잘못되면 애플리케이션 종료
}
const ALGORITHM = process.env.AUTH_ALGORITHM || "aes-256-cbc";

export function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(AUTHORIZATION_KEY),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}
export function decrypt(encryptedText: string) {
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted format.");
    }
    const iv = Buffer.from(parts[0], "hex");
    const ciphertext = parts[1];

    if (iv.length !== 16) {
      // IV 길이가 16바이트가 아니면 오류
      throw new Error("Invalid IV length.");
    }

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(AUTHORIZATION_KEY),
      iv
    );

    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error: any) {
    console.error("복호화 실패:", error.message);
    return null; // 복호화 실패 시 null 반환
  }
}
