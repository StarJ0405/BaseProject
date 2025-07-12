// import i18n from "@/lang/i18n";
// import NiceModal from "@ebay/nice-modal-react";

export const getCookieOption = ({
  maxAge,
  expires,
  encode,
  httpOnly,
  secure,
}: {
  maxAge?: number;
  expires?: Date | string;
  encode?: boolean;
  httpOnly?: boolean;
  secure?: boolean;
} = {}) => {
  let href = window.location.hostname.replace("www.", "");
  if (href.startsWith("m.")) href = href.substring(2);
  const data: any = { domain: href, path: "/" };
  if (maxAge) {
    data.maxAge = maxAge;
  } else if (expires) data.expires = new Date(expires);

  if (encode) data.encode = encode;
  if (httpOnly) data.httpOnly = httpOnly;
  if (secure) data.secure = secure;
  return data;
};

export const getTokenPayload = (token: string) => {
  try {
    var base64Payload = token.includes(".") ? token.split(".")[1] : token;
    var payload = decode(base64Payload);
    var result = JSON.parse(payload);
    return result;
  } catch (e) {
    return false;
  }
};
export const decode = (encoded: string) => {
  let decoded = Buffer.from(encoded, "base64").toString();
  return decoded;
};
export const encode = (payload: string) => {
  let encoded = Buffer.from(payload).toString("base64");
  return encoded;
};

export const dataToQuery = (data: any) => {
  return new URLSearchParams(
    Object.keys(data || {}).reduce((acc: any, key) => {
      acc[key] = Array.isArray(data[key])
        ? data[key]
        : typeof data[key] === "object"
        ? JSON.stringify(data[key])
        : data[key];
      return acc;
    }, {})
  ).toString();
};

export const toast = ({
  message,
  autoClose = 700,
  icon,
}: {
  message: string;
  autoClose?: number;
  icon?: string;
}) => {
  //   NiceModal.show("toast", {
  //     message: i18n.t(message),
  //     autoClose,
  //     icon,
  //   });
};

export const log = (...message: any[]) => {
  const dev = process.env.NEXT_PUBLIC_DEV;
  if (dev) console.log(...message);
};

export const copy = ({ text, message }: { text: string; message?: string }) => {
  const textArea = document.createElement("textarea");
  textArea.value = text || "";

  // Move textarea out of the viewport so it's not visible
  textArea.style.position = "absolute";
  textArea.style.left = "-999999px";

  document.body.prepend(textArea);
  textArea.select();

  try {
    document.execCommand("copy");
  } catch (error) {
    console.error(error);
  } finally {
    textArea.remove();
    // if (message) toast({ message: message });
  }
};
