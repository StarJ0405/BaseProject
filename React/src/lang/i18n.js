import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import langCn from "lang/lang.cn";
import langKo from "lang/lang.ko";
import { initReactI18next } from "react-i18next";

export const languages = [
  {
    code: "ko-KR",
    title: "korea",
    flag: "kr",
    translation: langKo,
    currency_code: "krw",
    name: "kor",
    money: "₩",
  },
  {
    code: "zh-CN",
    title: "china",
    flag: "cn",
    translation: langCn,
    currency_code: "cny",
    name: "chn",
    money: "元",
  },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // resources: resource,
    resources: languages
      .map((lang) => ({
        [lang.code]: { translation: lang.translation },
      }))
      .reduce((acc, lang) => ({ ...acc, ...lang }), {}),
    // 초기 설정 언어
    // lng: 'zh-CN',
    fallbackLng: {
      "zh-CN": ["zh-CN"],
      // default: ["ko-KR"],
      default: ["zh-CN"],
    },
    // debug: true,
    defaultNS: "translation",
    ns: "translation",
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
