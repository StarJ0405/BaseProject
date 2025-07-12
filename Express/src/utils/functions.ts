import { randomUUID } from "crypto";

export function generateEntityId(idProperty?: string, prefix?: string) {
  if (idProperty) return idProperty;
  let uuid = randomUUID().replace(/-/g, "");
  if (prefix) uuid = prefix + "_" + uuid;
  return uuid;
}
