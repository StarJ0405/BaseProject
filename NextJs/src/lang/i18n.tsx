"use client";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import langKo from "./lang.ko.json";
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
      default: ["ko-KR"],
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
