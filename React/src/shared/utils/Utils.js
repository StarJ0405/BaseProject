import NiceModal from "@ebay/nice-modal-react";
import imageCompression from "browser-image-compression";
import { Buffer } from "buffer";
import CryptoJS from "crypto-js";
import deepdash from "deepdash";
import html2canvas from "html2canvas";
import { t } from "i18next";
import i18n from "lang/i18n";
import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import QueryBuilder from "./QueryBuilder";
deepdash(_);
export const clone = (obj) => JSON.parse(JSON.stringify(obj));
const dev = process.env.REACT_APP_DEV;
export const getUniqColumns = (list, column, seperator) => {
  let combined = "";
  list.forEach((item) => {
    combined += item[column];
  });
  let combinedList = combined.split(seperator).slice(1);

  let set = new Set(combinedList);
  let uniqArray = [...set];

  return uniqArray;
};
export const dataToQuery = (data) => {
  return new URLSearchParams(
    Object.keys(data || {}).reduce((acc, key) => {
      acc[key] = Array.isArray(data[key])
        ? data[key]
        : typeof data[key] === "object"
          ? JSON.stringify(data[key])
          : data[key];
      return acc;
    }, {})
  ).toString();
};
export const deepFind = (list, columnName, condition) => {
  let result = [];
  _.mapDeep(list, (item, key, parentValue) => {
    if (item && item[columnName] && item[columnName] === condition) {
      let cloneItem = clone(item);
      cloneItem.children = null;
      result.push(cloneItem);
    }
  });
  return result;
};

export const getSpreadArray = (list, column, seperator, defaultValue) => {
  let resultList = [];
  list.forEach((item) => {
    if (!item[column]) {
      item[column] = seperator + defaultValue;
    }
    let needToSpread = item[column].split(seperator).slice(1);
    needToSpread.forEach((splitedValue) => {
      let copiedItem = clone(item);
      copiedItem[column] = splitedValue;
      resultList.push(copiedItem);
    });
  });

  return resultList;
};

export const normalizeArrayHeight = (list, arrayCount) => {
  let lengths = [];
  for (let i = 0; i < arrayCount; i++) {
    lengths.push(0);
  }
  let resultArray = [];
  for (let i = 0; i < arrayCount; i++) {
    resultArray.push([]);
  }
  list.forEach((group) => {
    let array = [...lengths];
    let minIndex = array.indexOf(Math.min(...array));
    resultArray[minIndex].push(group);
    lengths[minIndex] += group.children.length + 1;
  });

  return resultArray;
};

export const getGroupedList = (list, columnBy, valuesName) => {
  const result = _.chain(list)
    .groupBy(columnBy)
    .map((value, key) => {
      let row = {};
      row[columnBy] = key;
      row[valuesName] = value;
      return row;
    })
    // .map((value, key) => ({ hashTag : key, items : value}))
    .value();

  return result;
};

export const getMultipleGroupedList = (
  list,
  columnBy,
  multipleColumns,
  valuesName
) => {
  const result = _.chain(list)
    .groupBy(columnBy)
    .map((value, key) => {
      let row = {};
      multipleColumns.forEach((column) => {
        let firstItem = value[0];
        row[column] = firstItem[column];
      });
      if (valuesName) {
        row[valuesName] = value;
      }
      return row;
    })
    // .map((value, key) => ({ hashTag : key, items : value}))
    .value();

  return result;
};

export const rpad = (list, cols, initialData) => {
  let result = clone(list);
  let originLength = list.length;
  let resultLength = Math.ceil(list.length / cols) * cols;
  let needToPad = resultLength - originLength;
  for (let i = 0; i < needToPad; i++) {
    if (initialData) {
      result.push(initialData);
    } else {
      result.push({});
    }
  }

  return result;
};

export const rpad2D = (list, cols, initialData) => {
  var result = new Array(Math.ceil(list?.length / cols));
  for (let i = 0; i < result.length; i++) {
    result[i] = [];
    for (var j = 0; j < cols; j++) {
      if (initialData) {
        result[i][j] = initialData;
      } else {
        result[i][j] = {};
      }
    }
  }

  for (let i = 0; i < list.length; i++) {
    result[parseInt(i / cols)][i % cols] = list[i];
  }

  return result;
};

export const getRoleFromTokenPayload = (tokenPayload) => {
  // var roles = tokenPayload.sub.split(",");
  var roles = tokenPayload.domain.split(",");
  return roles;
};

export const getTokenPayload = (token) => {
  try {
    var base64Payload = token.includes(".") ? token.split(".")[1] : token;
    // //value 0 -> header, 1 -> payload, 2 -> VERIFY SIGNATURE
    var payload = decode(base64Payload);
    var result = JSON.parse(payload);
    return result;
  } catch (e) {
    return false;
  }
};

export const validateToken = (token) => {
  let isValid = false;
  var base64Payload = token.includes(".") ? token.split(".")[1] : token;
  // //value 0 -> header, 1 -> payload, 2 -> VERIFY SIGNATURE
  var payload = decode(base64Payload);
  // var payload = decode(token);
  var result = JSON.parse(payload);
  return result;
};

export const compressImage = async (
  image,
  fileName,
  maxSizeMb,
  maxWidthOrHeight
) => {
  console.log("passed");
  return image;
  let size = maxSizeMb || 0.1;
  try {
    if (image.type.match("gif")) return image;
    const options = {
      maxSizeMB: size, // 허용하는 최대 사이즈 지정
      // maxWidthOrHeight: 1920, // 허용하는 최대 width, height 값 지정
      maxWidthOrHeight: maxWidthOrHeight || 1920,
      useWebWorker: true, // webworker 사용 여부
    };
    let compressed = await imageCompression(image, options);
    return await new File([compressed], fileName, { type: compressed.type });
  } catch (e) { }
};

export const dataURLtoBlob = (dataURL) => {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURL.split(",")[0].indexOf("base64") >= 0)
    byteString = atob(dataURL.split(",")[1]);
  else byteString = unescape(dataURL.split(",")[1]);
  // 마임타입 추출
  var mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], { type: mimeString });
};

export const getExtFromFileType = (type) => {
  const parts = type.split("/");
  return parts[parts.length - 1];
};

// const getExtFromFileName = (name) => {
//   const parts = name.split(".");
//   return parts[parts.length - 1];
// };

export const generateFileName = (blob) => {
  let fileExt = getExtFromFileType(blob.type);
  let fileName = uuidv4() + "." + fileExt;

  return fileName;
};

export const createImageFileFromDom = async (domRef) => {
  let result = "";
  try {
    return new Promise(function (resolve, reject) {
      html2canvas(domRef, { backgroundColor: null, scale: 1 })
        .then((blob) => {
          let jsFile = dataURLtoBlob(blob.toDataURL());
          let fileName = generateFileName(jsFile);
          result = new File([jsFile], fileName, { type: jsFile.type });
        })
        .catch((ex) => {
          result = ex;
        })
        .finally(() => {
          resolve(result);
        });
    });
  } catch (e) { }
};

export const createImageFileFromDataUrl = (dataUrl) => {
  let result = "";
  let jsFile = dataURLtoBlob(dataUrl);
  let fileName = generateFileName(jsFile);
  result = new File([jsFile], fileName, { type: jsFile.type });
  return result;
};

export const getDifference = (a, b) => {
  // let result;
  if (a.length > b.length) {
    return _.differenceWith(a, b, _.isEqual);
  } else {
    return _.differenceWith(b, a, _.isEqual);
  }
};

export const flattenTree = (treeData) => {
  let result = [];
  _.mapDeep(treeData, (item, key, parentValue) => {
    if (item && item.id && item.id !== "root") {
      let cloneItem = clone(item);
      cloneItem.children = null;
      result.push(cloneItem);
    }
  });
  return result;
};

// export const validateInputs = async (inputs) => {
//     return new Promise(async (resolve, reject) => {
//         let result = true;
//         let index = 0;

//         for (let i = 0; i < inputs.length; i++) {
//             index = i;
//             let input = inputs[i];

//             let validateFn = input.isValid;

//             let isAsyncFn = validateFn.constructor.name === "AsyncFunction" ? true : false;
//             let isValid = false;
//             if (isAsyncFn) {
//                 await validateFn().then((validationResult) => {
//                     isValid = validationResult;
//                 });
//             } else {
//                 isValid = validateFn();
//             }
//             if (!isValid) {
//                 input.focus();
//                 result = false;
//                 break;
//             }
//         }
//         resolve({ isValid: result, index: index });
//     });
// }

export const validateInputs = async (inputs) => {
  return new Promise(async (resolve, reject) => {
    let result = false;
    let index = 0;

    const validationPromises = inputs.map((input, i) => {
      index = i;
      const validateFn = input.isValid;
      const isAsyncFn = validateFn.constructor.name === "AsyncFunction";

      if (isAsyncFn) {
        return validateFn().then((validationResult) => ({
          isValid: validationResult,
          input,
          index: i,
        }));
      } else {
        const isValid = validateFn();
        return Promise.resolve({ isValid, input, index: i });
      }
    });

    try {
      const results = await Promise.all(validationPromises);

      result = results.some((res) => res.isValid);

      const invalidInput = results.find((res) => !res.isValid);
      if (invalidInput) {
        invalidInput?.input?.focus?.();
      }

      resolve({ isValid: result, index: invalidInput?.index ?? 0 });
    } catch (err) {
      reject(err);
    }
  });
};

export const validateInput = async (input) => {
  return new Promise(async (resolve, reject) => {
    let result = true;
    let validateFn = input.isValid;
    let isAsyncFn =
      validateFn.constructor.name === "AsyncFunction" ? true : false;
    let isValid = false;
    if (isAsyncFn) {
      await validateFn().then((validationResult) => {
        isValid = validationResult;
      });
    } else {
      isValid = validateFn();
    }

    if (!isValid) {
      input.focus();
      result = false;
    }
    resolve(result);
  });
};

export const emptyInputs = async (inputs) => {
  return new Promise(async (resolve, reject) => {
    let result = true;
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      let emptyFn = input.empty;
      let isAsyncFn =
        emptyFn.constructor.name === "AsyncFunction" ? true : false;
      let isEmpty = false;
      if (isAsyncFn) {
        await emptyFn().then((emptyResult) => {
          isEmpty = emptyResult;
        });
      } else {
        isEmpty = emptyFn();
      }

      if (!isEmpty) {
        input.focus();
        result = false;
        break;
      }
    }
    resolve(result);
  });
};

export const encode = (payload) => {
  let encoded = Buffer.from(payload).toString("base64");
  return encoded;
};

export const decode = (encoded) => {
  let decoded = Buffer.from(encoded, "base64").toString();
  return decoded;
};

export const isEqual = (a, b) => {
  return _.isEqual(a, b);
};

Array.matrix = function (m, n, initial) {
  var a,
    i,
    j,
    mat = [];
  for (i = 0; i < m; i += 1) {
    a = [];
    for (j = 0; j < n; j += 1) {
      a[j] = initial;
    }
    mat[i] = a;
  }
  return mat;
};

export const convertLanguageCode = (value) => {
  let fullCode = value;
  let split = fullCode.split("-")[1];
  // let result = split.charAt(0) + split.charAt(1).toLowerCase();
  return split;
};

export const hexToRgb = (hex) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
};

export const between = (x, min, max) => {
  return x >= min && x <= max;
};

export const calculateDeliveryFee = (totalPrice, num) => {
  // let productWeightStandard = 40;
  // let boxWeightStandard = 120;
  // let additionalBoxStandard = 10;

  // let productQuantity = num;
  // let productWeight = productQuantity * productWeightStandard;
  // let additionalBoxQuantity = Math.max(Math.floor((productQuantity - 1) / additionalBoxStandard), 0);
  // let boxWeight = (additionalBoxQuantity + 1) * boxWeightStandard;
  // let totalWeight = productWeight + boxWeight;

  // let deliveryFee = 0;

  // let exchangeRate = 0.0053;
  // if (productQuantity === 0) {
  //     deliveryFee = 0;
  // } else {
  //     if (between(totalWeight, 0, 100)) {
  //         deliveryFee = 4780;
  //     } else if (between(totalWeight, 100, 200)) {
  //         deliveryFee = 6120;
  //     } else if (between(totalWeight, 200, 300)) {
  //         deliveryFee = 7440;
  //     } else if (between(totalWeight, 300, 400)) {
  //         deliveryFee = 8770;
  //     } else if (between(totalWeight, 400, 500)) {
  //         deliveryFee = 10120;
  //     } else if (between(totalWeight, 500, 600)) {
  //         deliveryFee = 11200;
  //     } else if (between(totalWeight, 600, 700)) {
  //         deliveryFee = 12280;
  //     } else if (between(totalWeight, 700, 800)) {
  //         deliveryFee = 13370;
  //     } else if (between(totalWeight, 800, 900)) {
  //         deliveryFee = 14440;
  //     } else if (between(totalWeight, 900, 1000)) {
  //         deliveryFee = 15530;
  //     } else if (between(totalWeight, 1000, 1100)) {
  //         deliveryFee = 16500;
  //     } else if (between(totalWeight, 1100, 1200)) {
  //         deliveryFee = 17460;
  //     } else if (between(totalWeight, 1200, 1300)) {
  //         deliveryFee = 18430;
  //     } else if (between(totalWeight, 1300, 1400)) {
  //         deliveryFee = 19390;
  //     } else if (between(totalWeight, 1400, 1500)) {
  //         deliveryFee = 20400;
  //     } else if (between(totalWeight, 1500, 1600)) {
  //         deliveryFee = 21010;
  //     } else if (between(totalWeight, 1600, 1700)) {
  //         deliveryFee = 21640;
  //     } else if (between(totalWeight, 1700, 1800)) {
  //         deliveryFee = 22260;
  //     } else if (between(totalWeight, 1800, 1900)) {
  //         deliveryFee = 22870;
  //     } else if (between(totalWeight, 1900, 2000)) {
  //         deliveryFee = 23520;
  //     } else if (totalWeight > 2000) {
  //         deliveryFee = 23520;
  //     }
  // }
  // return Math.ceil(deliveryFee * exchangeRate);
  let deliveryFee = 0;

  if (totalPrice >= 50000) {
    deliveryFee = 0;
  } else if (totalPrice === 0) {
    deliveryFee = 0;
  } else {
    deliveryFee = 2500;
  }
  return deliveryFee;
};

export const getDepth = ({ children }) =>
  1 +
  (children && children.length > 0 ? Math.max(...children.map(getDepth)) : 0);

export const isBase64 = (str) => {
  if (str) {
    if (str === "" || str.trim() === "") {
      return false;
    }
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
};

export const addCommas = (number) => {
  if (number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return "0";
  }
};

export const intersectionSize = (arr1, arr2) => {
  // arr1과 arr2의 중복된 요소를 찾아낸 후, Set으로 중복 제거
  const intersection = new Set(
    arr1.filter((element) => arr2.includes(element))
  );

  // Set의 크기를 반환하면 교집합 크기가 됨
  return intersection.size;
};

export const calculateTotals = (items, DELIVERY_FEE = 3000, VAT_RATE = 0.1) => {
  const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const vat = Math.floor(subtotal * VAT_RATE);
  const deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + vat + deliveryFee;

  return { subtotal, vat, deliveryFee, total };
};

export const formattedDate = (time) => {
  let date = new Date(time);
  let formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  return formattedDate;
};

export const calculateDiscountPercentage = (originalPrice, discountPrice) => {
  if (!originalPrice || !discountPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
};

export const applyDiscount = (price, discountPercentage, money) => {
  if (!discountPercentage) return price;
  const numericPrice = parseInt(price.replace(/[^0-9]/g, ""));
  const discountedPrice = Math.round(
    numericPrice * (1 - discountPercentage / 100)
  );
  return discountedPrice.toLocaleString() + { money };
};

export const getCustomPriceDisplay = (productId, data, money) => {
  const discountPercentage = calculateDiscountPercentage(
    data?.price,
    data?.discount_price
  );

  switch (productId) {
    case "pro_tbl_10063": {
      const prices = [
        { original: "9,000", size: "30ml" },
        { original: "12,000", size: "60ml" },
      ];

      return prices.map(({ original, size }) =>
        discountPercentage > 0
          ? `${size} : ${applyDiscount(original, discountPercentage, money)}`
          : `${size} : ${original}${money}`
      );
    }
    case "pro_tbl_10015": {
      const prices = [
        { original: "24,000", type: "트리플 블랙" },
        { original: "23,000", type: "나머지" },
      ];

      return prices.map(({ original, type }) =>
        discountPercentage > 0
          ? `${type} : ${applyDiscount(original, discountPercentage, money)}`
          : `${type} : ${original}${money}`
      );
    }
    case "pro_tbl_10065": {
      const prices = [
        { original: "9,000", size: "30ml" },
        { original: "12,000", size: "60ml" },
      ];

      return prices.map(({ original, size }) =>
        discountPercentage > 0
          ? `${size} : ${applyDiscount(original, discountPercentage, money)}`
          : `${size} : ${original}${money}`
      );
    }
    case "pro_tbl_10031": {
      const prices = [
        { original: "12,000", size: "30ml" },
        { original: "16,000", size: "60ml" },
      ];

      return prices.map(({ original, size }) =>
        discountPercentage > 0
          ? `${size} : ${applyDiscount(original, discountPercentage, money)}`
          : `${size} : ${original}${money}`
      );
    }
    case "pro_tbl_10012": {
      const prices = [
        { original: "4,500", type: "공팟" },
        { original: "8,500", type: "1.1옴 코일" },
        { original: "8,500", type: "0.8옴 코일" },
      ];

      return prices.map(({ original, type }) =>
        discountPercentage > 0
          ? `${type} : ${applyDiscount(original, discountPercentage, money)}`
          : `${type} : ${original}${money}`
      );
    }
    case "pro_tbl_10074": {
      const prices = [
        { original: "11,000", size: "30ml" },
        { original: "15,000", size: "60ml" },
      ];

      return prices.map(({ original, size }) =>
        discountPercentage > 0
          ? `${size} : ${applyDiscount(original, discountPercentage, money)}`
          : `${size} : ${original}${money}`
      );
    }
    default:
      return null;
  }
};

export const renderPrice = (
  data,
  userName,
  displayFormat = "default",
  money
) => {
  if (!userName) return "회원공개";
  if (!data) return "";

  const customDisplay = getCustomPriceDisplay(data.id, data, money);
  if (customDisplay) {
    if (displayFormat === "inline") {
      // DeskTopProductDetail3에서 사용하는 인라인 형식
      return Array.isArray(customDisplay)
        ? customDisplay.join(" / ")
        : customDisplay;
    }
    // 기본 형식 (다른 컴포넌트들에서 사용)
    return customDisplay;
  }

  if (data.variants?.length > 0 && data.discount_price) {
    return `₩${addCommas(data.discount_price)}`;
  }

  return `₩${addCommas(data.price)}`;
};

// DeskTopProductDetail3에서 사용할 수 있는 래퍼 함수, money는 원,元 등 화폐 단위

export const renderPriceInline = (data, userName, money) => {
  return renderPrice(data, userName, "inline", money);
};

export const Cookies = {
  JWT: "_ecommerce_jwt",
  LANG: "i18nextLng",
  MODE: "deviceMode",
  CART: "_medusa_cart_id",
  POPUP: "_popup",
  INFO: "_info",
  APP: "_APP",
};

export const getCookieOption = ({
  maxAge,
  expires,
  encode,
  httpOnly,
  secure,
} = {}) => {
  let href = window.location.hostname.replace("www.", "");
  if (href.startsWith("m.")) href = href.substring(2);
  const data = { domain: href, path: "/" };
  if (maxAge) {
    data.maxAge = maxAge;
  } else if (expires) data.expires = expires;
  if (encode) data.encode = encode;
  if (httpOnly) data.httpOnly = httpOnly;
  if (secure) data.secure = secure;
  return data;
};

export const toast = ({
  // type,
  message,
  autoClose = 700,
  icon,
  // position = "bottom-center",
}) => {
  // switch (type) {
  //   case "warning":
  //     return reactToast.warning(i18n.t(message), { autoClose, position });
  //   case "error":
  //     return reactToast.error(i18n.t(message), { autoClose, position });
  //   default:
  //     return reactToast.success(i18n.t(message), { autoClose, position });
  // }
  NiceModal.show("toast", {
    message: i18n.t(message),
    autoClose,
    icon,
  });
};

export const copy = ({ text, message }) => {
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
    if (message) toast({ type: "success", message: message });
  }
};

export const shareLink = async ({
  partnerId,
  title,
  text,
  url = `${window.location.origin?.replace(
    "/m",
    ""
  )}${window.location.pathname.replace("/m/", "/")}${window?.location?.search ? `${window?.location?.search}&` : "?"
  }${partnerId ? `partner=${partnerId}` : ""}`,
}) => {
  if (navigator.share) {
    try {
      await navigator.share({
        // title: i18n.t(title),
        // text: i18n.t(text),
        url: url,
      });
    } catch (error) {
      if (navigator.userAgent.toLowerCase().includes("webview")) {
        // const encodedMessage = encodeURIComponent(text);
        // const encodedUrl = encodeURIComponent(url);
        window.location.href = `shareapp://message?=${text}&url=${url}`;
      }
      copy({ text: url, message: text });
    }
  } else {
    if (navigator.userAgent.toLowerCase().includes("webview")) {
      // const encodedMessage = encodeURIComponent(text);
      // const encodedUrl = encodeURIComponent(url);
      window.location.href = `shareapp://message?=${text}&url=${url}`;
    }
    copy({ text: url, message: text });
  }
};

// 파트너 정보 가져오기
export const getStoredPartnerInfo = () => {
  const storedLink = localStorage.getItem(PARTNER_LINK_KEY);

  if (!storedLink) return null;

  // 예: PARTNER123240209 형식에서 정보 추출
  // const partnerId = storedLink.slice(0, -6); // 날짜 6자리를 제외한 부분이 파트너 ID
  // const dateString = storedLink.slice(-6); // 마지막 6자리가 날짜

  return {
    partnerId: storedLink,
    // partnerId,
    // date: dateString,
    // fullCode: storedLink,
  };
};

export const PARTNER_LINK_KEY = "partnerLink";

export const createProductString = (items) => {
  if (!items || items.length === 0) return "";

  if (items.length === 1) {
    return items[0].title;
  }

  return `${items[0].title} 외 ${items.length - 1}건`;
};

// S000 타입용 trade_information 생성
export const createS000TradeInfo = (cart) => {
  if (!cart?.items || cart.items.length === 0) {
    return "";
  }

  const goodsInfo = cart.items
    .map((item) => `${item.title}^${item.quantity}`)
    .join("|");

  const totalQuantity = cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const tradeInfo = {
    business_type: 4,
    goods_info: goodsInfo,
    total_quantity: totalQuantity,
  };

  return JSON.stringify(tradeInfo);
};

// S001 타입용 trade_information 생성
export const createS001TradeInfo = (cart) => {
  if (!cart?.items || cart.items.length === 0) {
    return "";
  }

  const goodsDetail = cart.items.map((item) => ({
    goods_name: item.title,
    quantity: item.quantity,
  }));

  const tradeInfo = {
    goods_detail: goodsDetail,
  };

  return JSON.stringify(tradeInfo);
};
export const createNestTradeInfo = (cart) => {
  if (!cart?.items || cart.items.length === 0) {
    return "";
  }

  return JSON.stringify(
    cart.items.map((item) => ({
      name: item.title,
      qty: item.quantity,
      price: item.total,
    }))
  );
};

const mode = process.env.REACT_APP_MODE;
const origin = mode
  ? process.env["REACT_APP_ORIGIN_" + mode.toUpperCase()] ||
  process.env.REACT_APP_ORIGIN
  : process.env.REACT_APP_ORIGIN;

// 결제 파라미터 생성 함수
export const createPaymentParams = (
  cart,
  customer = { first_name: "Guest", email: "", phone: "" },
  isMobile = false,
  serviceType = { name: "S000", type: "funpay" },
  flagCode = "cn",
  totalPrice
) => {
  const now = new Date();
  const timestamp =
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0");

  // 결제 시간초과로 재요청 하기 위해서는 결제 시간을 포함한 refno를 사용해야 함
  const refno = `ORDER_${cart.id}_${timestamp}`;
  const tradeInfo = (function () {
    switch (serviceType.name) {
      case "S000":
        return createS000TradeInfo(cart);
      case "S001":
        return createS001TradeInfo(cart);
      case "card":
        return createNestTradeInfo(cart);
      default:
        return null;
    }
  })();
  if (!tradeInfo) {
    return;
  }

  switch (serviceType.type) {
    case "nestpay":
      return {
        paytype: serviceType.type,
        servicetype: serviceType.name,
        trackId: refno,
        // refno : refno,
        payerId: customer.id,
        payerName: customer.first_name,
        payerEmail: customer.email,
        payerTel: customer.phone,
        payMethod: "card",
        amount: totalPrice,
        returnUrl: `${origin}/payment/paysuccess2`,
        products: tradeInfo,
      };
    case "funpay":
      let reqtype = "P";
      let restype = "PAGE";

      if (serviceType.name === "S000") {
        //알리페이
        reqtype = "P";
        restype = "PAGE";
      } else if (serviceType.name === "S001") {
        //위챗페이
        if (isMobile) {
          reqtype = "M";
          restype = "JSON";
        } else {
          reqtype = "P";
          restype = "PAGE";
        }
      }
      return {
        paytype: serviceType.type,
        servicetype: serviceType.name,
        refno: refno,
        reqcur: "CNY",
        reqamt: totalPrice,
        buyername: customer?.first_name || "Guest",
        product: createProductString(cart.items),
        refer_url: `${process.env.REACT_APP_FRONT}/${flagCode}/payment`,
        returnurl: `${process.env.REACT_APP_FRONT}/${flagCode}/paysuccess`,
        statusurl: `${origin}/payment/paysuccess`,
        reqtype: reqtype,
        restype: restype,
        trade_information: tradeInfo,
      };
    default:
      return null;
  }
};

export const getFilePath = (path, file) => {
  let seperator = "";
  let lastCharInPath = path.charAt(path.length - 1);
  if (lastCharInPath === "/") {
    seperator = "";
  } else {
    seperator = "/";
  }
  let filePath = window.location.host + "/" + path + seperator + file.name;

  return filePath;
};
export const isDev = () => {
  return !!dev;
};
export const log = (...message) => {
  if (dev) console.log(...message);
};

export const getOrderStatus = (order) => {
  const { status, payment_status, fulfillment_status } = order;

  switch (status) {
    case "pending":
      if (payment_status === "captured") {
        switch (fulfillment_status) {
          case "not_fulfilled":
            if (order?.metadata?.packaging_start === true) {
              if (!order?.metadata?.shipping) {
                return "orderReceived";
              }
              return "waitingForDelivery";
            } else {
              return "waitingForProduct";
            }
          case "fulfilled":
            if (
              order?.metadata?.packaging_start === true ||
              order?.metadata?.shipping
            ) {
              if (!order?.metadata?.shipping) {
                return "orderReceived";
              }
              return "waitingForDelivery";
            } else return "waitingForProduct";
          case "partially_shipped":
            return "inDelivery";
          default:
            return "waitingForDeposit";
        }
      }
      break;

    case "completed":
      if (payment_status === "captured" && fulfillment_status === "shipped") {
        return "completeDelivery";
      }
      break;

    case "canceled":
      if (payment_status === "awaiting" && fulfillment_status === "canceled") {
        return "cancelPurchase";
      }
      if (payment_status === "canceled" && fulfillment_status === "canceled") {
        return "cancelComplete";
      }
      break;

    case "exchange":
      if (payment_status === "captured") {
        switch (fulfillment_status) {
          case "not_fulfilled":
            return "waitingForExchange";
          case "returned":
            return "waitingForRefund";
          case "partially_returned":
            return "exchangePartiallyReturned";
          case "shipped":
            return "exchangeComplete";
          default:
            return "waitingForDeposit";
        }
      }
      break;

    case "refund":
      if (payment_status === "awaiting") {
        if (fulfillment_status === "not_fulfilled") return "refundRequested";
        if (fulfillment_status === "returned") return "refundReturned";
      }
      if (payment_status === "refunded") {
        if (fulfillment_status === "not_fulfilled") return "refundNotReturned";
        if (fulfillment_status === "returned") return "refundComplete";
      }
      break;

    default:
      return "waitingForDeposit";
  }

  return "waitingForDeposit";
};
export const generateFgKey = (params) => {
  const { fgkey, ...restParams } = params;

  // 1. 폼 데이터 형식으로 변환 (key=value&key=value)
  const paramString = Object.entries(restParams)
    .map(([key, value]) => `${key}=${value ?? ""}`)
    .join("&");

  // 2. 모든 문자를 개별적으로 정렬
  const sortedText = paramString.split("").sort().join("");

  // 3. SECRET_KEY와 결합
  const textB = `${"F9F3E54B7D9849DB51C7CA480285D6A3"}?${sortedText}`;

  // 4. SHA-256 해시 생성
  const textC = CryptoJS.SHA256(textB).toString();

  // 5. 대문자 변환
  return textC.toUpperCase();
};
export const addFgKeyToParams = (params) => {
  const fgkey = generateFgKey(params);
  return { ...params, fgkey };
};
export const isAdult = (userBirthday) => {
  // userBirthday는 'YYYYMMDD' 형식의 문자열로 전달됩니다.
  const birthYear = parseInt(userBirthday.substring(0, 4));
  const birthMonth = parseInt(userBirthday.substring(4, 6));
  const birthDay = parseInt(userBirthday.substring(6, 8));

  // 현재 날짜
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // getMonth() returns 0-based month
  const currentDay = today.getDate();

  // 만 19세가 되는 해의 1월 1일
  const adultYear = birthYear + 19;
  const adultDate = new Date(adultYear, 0, 1); // 0: January, 1: 1st day

  // 현재 날짜와 비교하여 성인인지 여부를 결정
  if (today >= adultDate) {
    return true; // 성인
  } else {
    return false; // 청소년
  }
};
export const getShippingColor = (method) => {
  switch (method) {
    case "EMS":
      return "#FFA100";
    case "K-Packet":
    case "K_Packet":
      return "#ED1B23";
    case "Sea-Express":
    case "Sea_Express":
    case "S-EXPRESS":
      return "#1B4F8B";
    case "EMS 프리미엄":
    case "EMS Premium":
    case "EMS_Premium":
      return "#0186D4";
    default:
      return "";
  }
};

export const paymentLists = [
  {
    name: "알리PAY",
    value: "AliPay",
  },
  {
    name: "위챗PAY",
    value: "WeChatPay",
  },
  {
    name: "NESTPAY",
    value: "NestPay",
  },
];
export const shippingLists = [
  {
    name: "K-Packet",
    badge: "KP",
    value: "KPACKET",
    color: "#ED1B23",
    limitWeight: 2000,
    minPrice: 0,
    description: `${t("N4")}~${t("N7")}${t("takeDays")}`,
    boxShadow: "0 0 8px rgba(237, 27, 35, 0.25)",
  },
  {
    name: "EMS",
    badge: "ES",
    value: "EMS",
    color: "#FFA100",
    limitWeight: 30000,
    minPrice: 0,
    description: `${t("N4")}~${t("N6")}${t("takeDays")}`,
    boxShadow: "0 0 8px rgba(255, 161, 0, 0.25)",
  },
  {
    name: "EMS Premium",
    badge: "EP",
    value: "EMSPREMIUM",
    color: "#0186D4",
    limitWeight: 30000,
    minPrice: 0,
    description: `${t("N4")}~${t("N6")}${t("takeDays")}`,
    boxShadow: "0 0 8px rgba(1, 134, 212, 0.25)",
  },
  {
    name: "Sea-Express",
    badge: "SE",
    value: "SEAEXPRESS",
    color: "#1B4F8B",
    limitWeight: 30000,
    minPrice: 0,
    description: `${t("N4")}~${t("N5")}${t("takeDays")}`,
    boxShadow: "0 0 8px rgba(27, 79, 139, 0.25)",
  },
  {
    name: "CJ",
    badge: "CJ",
    value: "CJ",
    color: "#2E8B57",
    // description: `${t("N2")}~${t("N3")}${t("takeDays")}`,
    boxShadow: "0 0 8px rgba(46, 139, 87, 0.25)",
  },
];
export const cancelReasons = [
  {
    label: "고객 단순 변심",
    value: "R000",
  },
  {
    label: "상품 하자",
    value: "R001",
  },
  { label: "결제 오류", value: "R002" },
  {
    label: "기타 사유(직접 입력)",
    value: "R003",
    message: true,
  },
  {
    label: "망상 취소",
    value: "R005",
  },
];

export const getDay = (day) => {
  switch (String(day)) {
    case "0":
      return "일";
    case "1":
      return "월";
    case "2":
      return "화";
    case "3":
      return "수";
    case "4":
      return "목";
    case "5":
      return "금";
    case "6":
      return "토";
    default:
      return "알 수 없음";
  }
};

export const dateBetween = (date, start_date, end_date) => {
  date = new Date(date);
  start_date = new Date(start_date);
  end_date = new Date(end_date);

  return (
    date.getTime() >= start_date.getTime() &&
    date.getTime() <= end_date.getTime()
  );
};

export const getAdjustmentPrice = (
  row,
  option = { origin: false, originP: false }
) => {
  if (row && row.type) {
    switch (row.type) {
      case "pay":
        if (option.originP)
          return (
            (Number(row?.metadata?.originP || row.price) *
              Number(row.metadata.USD)) /
            Number(row.metadata.CNY)
          );

        if (option.origin)
          return (
            (Number(row?.metadata?.origin || row.price) *
              Number(row.metadata.USD)) /
            Number(row.metadata.CNY)
          );
        return (
          (Number(row.price) * Number(row.metadata.USD)) /
          Number(row.metadata.CNY)
        );
      case "refund":
      case "exchange":
        return -Number(row.price);
      default:
        return 0;
    }
  }
  return 0;
};
export const getAdjustmentType = (type) => {
  if (type) {
    switch (type) {
      case "pay":
        return "정산";
      case "refund":
        return "환불";
      case "exchange":
        return "교환";
      default:
        return "기타";
    }
  }
  return "알 수 없음";
};

export const getAdjustmentPaymentStatus = (status) => {
  switch (status) {
    case "awaiting":
      return "정산 대기";
    case "captured":
      return "정산 완료";
    default:
      return "알 수 없음";
  }
};

export const getAdjustmentTypeColor = (type) => {
  if (type) {
    switch (type) {
      case "pay":
      case "정산":
        return "#28A745";
      case "refund":
      case "환불":
        return "var(--main-color)";
      case "exchange":
      case "교환":
        return "#FF6600";
      default:
        return "#DADADA";
    }
  }
  return "inherit";
};

export const BankList = [
  { label: "KB국민은행" },
  { label: "하나은행" },
  { label: "신한은행" },
  { label: "우리은행" },
  { label: "IBK기업은행" },
  { label: "NH농협은행" },
  { label: "KDB산업은행" },
  { label: "SC제일은행" },
  { label: "BNK부산은행" },
  { label: "iM뱅크" },
  { label: "카카오뱅크" },
  { label: "수협은행" },
  { label: "BNK경남은행" },
  { label: "한국씨티은행" },
  { label: "케이뱅크" },
  { label: "광주은행" },
  { label: "토스뱅크" },
  { label: "전북은행" },
  { label: "제주은행" },
];



export const numberToChinese = (num) => {
  if (typeof num !== "number") {
    throw new Error("Input must be a number.");
  }
  if (num === 0) {
    return "零";
  }

  const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const units = ["", "十", "百", "千"];
  const bigUnits = ["", "万", "亿"]; // '兆' (trillion) 등 더 큰 단위도 추가 가능

  // 4자리 숫자를 중국어 문자열로 변환하는 헬퍼 함수
  function convertFourDigits(n) {
    let result = "";
    n = parseInt(n, 10); // 숫자로 변환

    if (n === 0) return digits[0]; // 0인 경우 '零' 반환

    let zeroFlag = false; // 연속된 '零' 처리용
    for (let i = 0; i < 4; i++) {
      const digit = Math.floor(n % 10);
      n = Math.floor(n / 10);

      if (digit === 0) {
        if (!zeroFlag) {
          // '零'이 연속되지 않을 때만 추가
          result = digits[0] + result;
          zeroFlag = true;
        }
      } else {
        result = digits[digit] + units[i] + result;
        zeroFlag = false;
      }
    }
    // '零'으로 시작하는 경우 제거 (예: '零百二十三' -> '百二十三')
    if (result.startsWith("零") && result.length > 1) {
      result = result.substring(1);
    }
    // '零'으로만 끝나는 경우 제거 (예: '一百零' -> '一百')
    if (result.endsWith("零") && result.length > 1) {
      result = result.slice(0, -1);
    }
    // 예외 처리: '十'만 있는 경우 '一十' 대신 '十'
    if (result === "一十") {
      result = "十";
    }

    return result;
  }

  let result = "";
  let i = 0; // bigUnits 인덱스

  while (num > 0) {
    const fourDigits = num % 10000; // 4자리씩 끊기
    const chineseFourDigits = convertFourDigits(fourDigits);

    if (chineseFourDigits === "零") {
      // 4자리가 모두 0일 경우, 큰 단위는 추가하지 않음
      num = Math.floor(num / 10000);
      i++;
      continue;
    }

    // '万' 단위에 해당하는 숫자가 0이 아닌 경우
    if (bigUnits[i] === "万" && fourDigits < 1000 && num >= 10000) {
      // 예: 10000 -> "一万", 100000 -> "十万", 20000 -> "两万"
      // '零万'과 같이 불필요한 '零'이 붙지 않도록 처리
      // 또한 10000, 20000, 30000 등 0이 아닌 숫자가 '万' 뒤에 0으로 시작하면 '零'을 붙이지 않음
      if (fourDigits % 1000 === 0 && fourDigits > 0) {
        // 1000, 2000...
        // do nothing
      } else if (
        fourDigits < 1000 &&
        num >= 10000 &&
        !result.startsWith("零") &&
        i > 0
      ) {
        result = digits[0] + result; // 예: 10005 -> "一万零五"
      }
    }

    result = chineseFourDigits + bigUnits[i] + result;
    num = Math.floor(num / 10000);
    i++;
  }

  // 최종 정리: 연속된 '零' 제거, '零'으로 시작/끝나는 경우 정리
  result = result.replace(/零+/g, "零");
  if (result.endsWith("零") && result.length > 1) {
    result = result.slice(0, -1);
  }
  if (
    result.startsWith("零") &&
    result.length > 1 &&
    !result.startsWith("零零")
  ) {
    // '零零' 예외 방지
    result = result.substring(1);
  }
  // 예: 10 -> "一十" 대신 "十"
  if (result === "一十") {
    result = "十";
  }
  // 2의 특별한 발음 '两' (liǎng) 처리
  // 숫자 '2'가 100, 1000, 100000000 등의 단위 앞에 올 때 '二' 대신 '两'을 쓰는 경우가 많음
  // 복잡하므로 간단한 예시만 추가: 200, 2000, 20000
  // 이 부분은 규칙이 복잡하여 완벽하게 처리하려면 더 많은 로직이 필요합니다.
  result = result.replace(/二百/g, "两百");
  result = result.replace(/二千/g, "两千");
  result = result.replace(/二万/g, "两万");
  result = result.replace(/二亿/g, "两亿");

  return result;
};

export const getAuthorizationMessage = (code) => {
  switch (code) {
    case -1:
      return `등록되지않는 코드 입니다`;
    case -2:
      return `코드가 일치하지않습니다.`;
    case -3:
      return `사용 횟수를 초과했습니다.`;
    case -4:
      return `사용 기간이 만료되었습니다.`;
    default:
      return `알 수 없는 오류`;
  }
};

export const getDateStatus = (start_date, end_date, date = new Date()) => {
  start_date = new Date(start_date);
  end_date = new Date(end_date);
  if (start_date.getTime() > end_date.getTime()) return "오류";
  if (date.getTime() < start_date.getTime()) return "예정";
  if (date.getTime() > end_date.getTime()) return "종료";
  return "진행중";
};

export const getPointLogType = (type) => {
  switch (type) {
    case "admin":
      return "byAdmin";
    case "파트너스":
      return "shareLinkActivity";
    case "구매":
      return "purchaseProduct";
    default:
      return "-";
  }
};

// export const Portal = ({
//   children,
//   targetRect,
//   portalRoot = document.body,
//   style,
//   className,
// }) => {
//   const modalRef = useRef(null);
//   const [modalStyle, setModalStyle] = useState({});
//   useEffect(() => {
//     if (!targetRect || !modalRef.current) return;

//     // 모달의 너비와 높이를 고려하여 위치 계산
//     const modalWidth = modalRef.current.offsetWidth;
//     const modalHeight = modalRef.current.offsetHeight;

//     const top = targetRect.top - modalHeight - 10; // input 위, 10px 여백
//     const left = targetRect.left + targetRect.width / 2 - modalWidth / 2; // input 중앙 정렬

//     setModalStyle({
//       position: "absolute", // portal-root 안에서 absolute로 위치 지정
//       top: `${top}px`,
//       left: `${left}px`,
//       zIndex: 11000, // 다른 요소 위에 나타나도록 높은 z-index 설정
//       // backgroundColor: "white",
//       // border: "1px solid #ccc",
//       // padding: "10px",
//       // boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
//     });
//   }, [targetRect]);

//   if (!targetRect) return <></>;

//   if (!portalRoot) {
//     return null;
//   }

//   return ReactDOM.createPortal(
//     <div
//       ref={modalRef}
//       style={{ ...modalStyle, ...(style || {}) }}
//       className={className}
//     >
//       {children}
//     </div>,
//     portalRoot
//   );
// };

export function getRandomColor(seed = Math.random()) {
  const seededGenerator = new SeededRandom(seed);
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color +=
      letters[Math.floor((seededGenerator?.next() ?? Math.random()) * 16)];
  }
  return color;
}

export function getContrastTextColor(hexColor) {
  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

export function getUniqueRandomColors({
  N,
  maxAttempts_ = 1000,
  seededGenerator = new SeededRandom(),
}) {
  const usedColors = new Set();
  const uniqueColorPairs = [];

  let attempts = 0;
  while (uniqueColorPairs.length < N && attempts < maxAttempts_) {
    const newColor = getRandomColor(seededGenerator?.next() ?? Math.random());

    if (!usedColors.has(newColor)) {
      usedColors.add(newColor);
      const textColor = getContrastTextColor(newColor);
      uniqueColorPairs.push({
        backgroundColor: newColor,
        textColor: textColor,
      });
    }
    attempts++;
  }

  if (uniqueColorPairs.length < N) {
    console.warn(
      `경고: 요청된 ${N}개의 고유한 색상을 모두 생성하지 못했습니다. ${uniqueColorPairs.length}개만 생성됨. (시도 횟수: ${maxAttempts_}회 초과)`
    );
  }

  return uniqueColorPairs;
}

class SeededRandom {
  constructor(seed) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}
export function getSeededRandomGenerator(seed = (Math.random() * 100000) % 1) {
  return new SeededRandom(seed);
}

export const getMessageBathData = ({
  title,
  message: body,
  link = "",
  condition,
}) => {
  if (typeof condition === "string") {
    condition = QueryBuilder.create().andWhere(condition);
  } else if (!(condition instanceof QueryBuilder)) {
    throw Error("not allowed condition");
  }
  if (!!dev) condition = condition.andWhere("dev");

  condition.option({
    prefix: "'",
    suffix: "' in topics",
    AND: "&&",
    OR: "||",
    NOT: "!",
  });
  const now = new Date();
  let utcHours = now.getUTCHours() + 8;
  if (utcHours >= 24) utcHours -= utcHours;

  if (utcHours >= 21 || utcHours < 8) {
    // 야간
    const night = condition.clone();
    condition.andWhere("nightAlarmAgree");
    night.andNotWhere("nightAlarmAgree");
    const night_date = new Date(now);

    if (utcHours >= 21) {
      night_date.setDate(night_date.getDate() + 1);
    }
    night_date.setHours(8 - (night_date.getTimezoneOffset() / 60 + 8), 0, 0, 0);
    return [
      {
        type: "message",
        start_date: now,
        config: {
          title,
          body,
          link,
          condition: condition.build(),
        },
        status: "ready",
        dev: !!dev,
      },
      {
        type: "message",
        start_date: night_date,
        config: {
          title,
          body,
          link,
          condition: night.build(),
        },
        status: "ready",
        dev: !!dev,
      },
    ];
  } else {
    // 주간
    return [
      {
        type: "message",
        start_date: new Date(),
        config: {
          title,
          body,
          link,
          condition: condition.build(),
        },
        status: "ready",
        dev: !!dev,
      },
    ];
  }
};
