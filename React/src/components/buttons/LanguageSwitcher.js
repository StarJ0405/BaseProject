import Div from "components/div/Div";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import Image from "components/Image/Image";
import P from "components/P/P";
import Tooltip from "components/tooltip/Tooltip";
import { languages } from "lang/i18n";
import { BrowserDetectContext } from "providers/BrowserEventProvider";
import { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Cookies, getCookieOption } from "shared/utils/Utils";
import style from "./LanguageSwitcher.module.css";
import Icon from "components/icons/Icon";
function LanguageSwitcher({
  width,
  height,
  hideLabelTop = false,
  hideLabelList = false,
  callback = (lang) => {},
}) {
  const { isMobile } = useContext(BrowserDetectContext);
  const location = useLocation();
  let [, lang, ...others] = location.pathname.split("/");
  if (isMobile) {
    lang = others?.[0];
    others = others.slice(1);
  }
  const [selectedLanguage, setSelectedLanguage] = useState(
    languages.find((language) => language.flag === lang) || languages[0]
  );
  const [searchParams] = useSearchParams();
  const navigator = useNavigate();
  const [, setCookie] = useCookies();

  const onLanguageClick = (e, language) => {
    e.stopPropagation();

    const other = others.join("/");
    setSelectedLanguage(language);
    if (callback && typeof callback === "function") callback(language);
    navigator(
      `${isMobile ? "/m" : ""}/${language?.flag || lang}${
        other ? `/${other}` : ""
      }${
        searchParams.toString().length > 0 ? "?" : ""
      }${searchParams.toString()}`,
      { replace: false }
    );
    setCookie(Cookies.LANG, language.flag, getCookieOption());
  };
  return (
    <Tooltip
      position="bottom_center"
      content={
        <Div
          marginTop={9}
          backgroundColor={"white"}
          borderRadius={7}
          border={"1px solid #ebebeb"}
          overflow={"hidden"}
        >
          {languages
            .filter((f) => f.flag !== selectedLanguage.flag)
            .map((language, index) => (
              <Div
                onClick={(e) => onLanguageClick(e, language)}
                key={index}
                cursor={"pointer"}
                className={style.line}
                paddingLeft={20}
                paddingRight={20}
              >
                <HorizontalFlex gap={10} padding={"15px 0px"}>
                  <FlexChild width={"max-content"}>
                    <Image
                      src={`https://flagcdn.com/64x48/${language.flag}.png`}
                      width={width}
                      height={height}
                    />
                  </FlexChild>
                  {!hideLabelList && (
                    <FlexChild>
                      <P color={"#8b8b8b"}>{`country_${language.flag}`}</P>
                    </FlexChild>
                  )}
                </HorizontalFlex>
              </Div>
            ))}
        </Div>
      }
    >
      <HorizontalFlex gap={5} width={"max-content"}>
        <FlexChild width={"max-content"}>
          {/* <Image
            src={`https://flagcdn.com/64x48/${
              selectedLanguage?.flag || lang
            }.png`}
            width={width}
            height={height}
          /> */}
          <Icon name={"languageIcon"} width={30} />
          <P className={style.languageName}>{selectedLanguage?.flag}</P>
        </FlexChild>
        {!hideLabelTop && (
          <FlexChild>
            <P>{`country_${selectedLanguage.flag}`}</P>
          </FlexChild>
        )}
      </HorizontalFlex>
    </Tooltip>
  );
}

export default LanguageSwitcher;
