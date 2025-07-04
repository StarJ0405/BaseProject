const SuperExpressive = require("super-expressive");

export const emailFormat = {
  exp: SuperExpressive()
    .startOfInput.caseInsensitive.oneOrMore.anyOf.range("a", "z")
    .range("A", "Z")
    .range("0", "9")
    .anyOfChars("._-")
    .end()
    // .oneOrMore.word
    .exactly(1)
    .char("@")
    .oneOrMore.word.exactly(1)
    .char(".")
    .between(2, 4)
    .range("a", "z")
    .endOfInput.toRegex(),
  description: "email format",
  sample: "yourEmail@xxxxx.xxx",
};

export const mobileNoFormat = {
  exp: SuperExpressive()
    .startOfInput.exactly(1)
    .char("0")
    .exactly(1)
    .range(0, 9)
    .exactly(1)
    .char("0")
    .exactly(8)
    .range(0, 9)
    .endOfInput.toRegex(),
  description: "mobile number format",
  sample: "07012345678",
};

export const passwordFormat = {
  exp: SuperExpressive()
    .atLeast(8)
    .anyOf.range("a", "z")
    .range("A", "Z")
    .range("0", "9")
    .anyOfChars("`~!@#$%^&*()-_=+,.<>/?[]{}|;:\\'\"")
    .end()
    .toRegex(),
  description: "password format",
  sample: "asd1231@",
};

export const textFormat = {
  exp: SuperExpressive().startOfInput.caseInsensitive.oneOrMore.anyChar.endOfInput.toRegex(),
  description: "text format",
  sample: "빈칸 없어야 함",
};

export const userNameFormat = {
  exp: /^[a-zA-Z@_\-]{3,30}$/,
  description:
    "Only English letters and @, -, _ are allowed (3 to 30 characters)",
  sample: "abc@-_",
};

export const englishFormat = {
  // exp: /[^a-zA-Z0-9\-\(\)\+\=\,\.\*\&\^\[\]\/_\s]/g,
  exp: /[^a-zA-Z0-9\s]/g,
  description: "Only Enlgish + Special Character",
  sampe: "abc(1+1)",
};

export const numberOnlyFormat = {
  exp: /[^0-9]/g,
  description: "Only Number",
  smaple: "1231",
};

export const numberFormat = {
  exp: /[^0-9.-]/g,
  description: "Number and -",
  smaple: "1231",
};

export const phoneFormat = {
  exp: /[^0-9+]/g,
  description: "Number and Plus",
  sample: "+12)34",
};

export const chinessPhoneFormat = {
  exp: /^\(\+86\)1\d{10}$/,
  description: "",
  smaple: "(+86)13012341234",
};
