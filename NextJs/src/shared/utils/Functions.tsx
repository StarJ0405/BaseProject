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
  const NiceModal = require("@ebay/nice-modal-react");
  const i18n = require("i18next");
  NiceModal.show("toast", {
    message: i18n.t(message),
    autoClose,
    icon,
  });
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

export function getDeviceType(userAgent: string | null): DeviceType {
  if (!userAgent) return "unknown";

  userAgent = userAgent.toLowerCase(); // 대소문자 구분 없이 비교하기 위해 소문자로 변환

  const isAndroid = /android/.test(userAgent);
  const isiPad = /ipad/.test(userAgent);
  const isiPhone = /iphone/.test(userAgent);
  const isiPod = /ipod/.test(userAgent);
  const isBlackBerry = /blackberry/.test(userAgent);
  const isWindowsPhone = /windows phone/.test(userAgent);
  const isOperaMini = /opera mini/.test(userAgent);
  const isWebOS = /webos/.test(userAgent);
  const isKindle = /kindle/.test(userAgent); // 아마존 킨들

  // 태블릿 판별 (일반적인 모바일 키워드가 없으면서 태블릿 특유의 키워드가 있을 때)
  // 'android'이면서 'mobile' 키워드가 없으면 안드로이드 태블릿일 가능성이 높습니다.
  if (
    isiPad ||
    (isAndroid && !/mobile/.test(userAgent)) ||
    isKindle ||
    /tablet|playbook|silk/i.test(userAgent)
  ) {
    return "tablet";
  }

  // 모바일 판별
  if (
    isiPhone ||
    isiPod ||
    isAndroid ||
    isBlackBerry ||
    isWindowsPhone ||
    isOperaMini ||
    isWebOS
  ) {
    return "mobile";
  }

  // 위 조건에 해당하지 않으면 데스크톱으로 간주
  return "desktop";
}

export function getOperatingSystem(userAgent: string | null): OSType {
  if (!userAgent) return "unknown";

  userAgent = userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "ios";
  }
  if (/android/.test(userAgent)) {
    return "android";
  }
  if (
    /windows phone|windows ce|windows mobile/.test(userAgent) ||
    /windows nt/.test(userAgent)
  ) {
    return "windows";
  }
  if (/macintosh|mac os x/.test(userAgent)) {
    return "macos";
  }
  if (/linux/.test(userAgent)) {
    // Android도 Linux 기반이지만, 위에서 먼저 처리되었으므로 여기는 주로 데스크톱 Linux
    return "linux";
  }

  return "unknown";
}

export function getWebView(userAgent: string | null): boolean {
  if (!userAgent) return false;

  return /webview/.test(userAgent);
}
