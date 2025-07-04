import { createContext, useContext } from "react";

export const LanguageContext = createContext({
  languageCode: String,
  flagCode: String,
  region_id: String,
  currencyCode: String,
  money: String,
});
function LanguageProvider({ children }) {
  // const { isMobile } = useContext(BrowserDetectContext);
  // const { getConfig, isLoading } = useConfig();
  // const location = useLocation();
  // const [other, setOther] = useState();
  // const [mounted, setMounted] = useState(false);

  // const query = location.search.toString();
  // const [code, setCode] = useState();
  // const [flag, setFlag] = useState();
  // const [cookies, setCookie] = useCookies([Cookies.LANG]);
  // const [regions, setRegions] = useState([]);
  // const [currencyCode, setCurrencyCode] = useState();
  // const navigate = useNavigate();
  // useEffect(() => {
  //   requester.getRegions(({ regions }) => setRegions(regions));
  //   setMounted(true);
  // }, []);
  // useEffect(() => {
  //   if (isLoading) return;
  //   if (mounted) {
  //     let [, lang, ...others] = location.pathname.split("/");

  //     const isKrw = getConfig("default")?.currency_code?.toLowerCase() === "krw";
  //     const isCnPath = lang === "cn";
  //     const prefix = isMobile ? "/m" : "";

  //     if (isKrw && isCnPath) {
  //       const newPath = `${prefix}/kr${others.length ? "/" + others.join("/") : ""}${query}`;
  //       navigate(newPath, { replace: true });
  //       return;
  //     }
  //     if (lang === "admin") {
  //       navigate("/kr/admin");
  //       return;
  //     } else if (lang === "vendor") {
  //       navigate("/kr/vendor");
  //       return;
  //     }
  //     if (isMobile) {
  //       lang = others?.[0];
  //       others = others.slice(1);
  //     }

  //     setOther(other);
  //     const find = languages.find((language) => language.flag === lang);



  //     if (find) {
  //       setFlag(find.flag);
  //       setCode(find.code);
  //       setCookie(Cookies.LANG, find.code, getCookieOption());
  //       i18n.changeLanguage(code);
  //       setCurrencyCode(find.currency_code);
  //     } else {
  //       if (cookies) {
  //         const { [Cookies.LANG]: saved } = cookies;
  //         const find = languages.find((language) => language.code === saved);
  //         if (find) {
  //           navigate(
  //             `${isMobile ? "/m" : ""}/${find?.flag}${other && other?.length > 0 ? `/${other}` : ""
  //             }${query ? query : ""}`,
  //             { replace: true }
  //           );
  //           return;
  //         }
  //       }
  //       const default_find = languages.find(
  //         (language) =>
  //           language.currency_code ===
  //           (getConfig("default")?.currency_code || "cny")
  //       );
  //       navigate(
  //         `${isMobile ? "/m" : ""}/${default_find?.flag}${other && other?.length > 0 ? `/${other}` : ""
  //         }${query ? query : ""}`,
  //         { replace: true }
  //       );
  //       // fetch("https://api.ip.pe.kr/json")
  //       //   .then((response) => response.json())
  //       //   .then((data) => {
  //       //     navigator(
  //       //       `${isMobile ? "/m" : ""}/${data.country_code?.toLowerCase?.()}${
  //       //         other && other?.length > 0 ? `/${other}` : ""
  //       //       { replace: true }
  //       //       }${query ? query : ""}`,
  //       //     );
  //       //   });
  //     }
  //   }
  // }, [mounted, location, cookies, code, isLoading]);

  // return (
  //   !isLoading && (
  //     <LanguageContext.Provider
  //       value={{
  //         languageCode: code,
  //         flagCode: flag,
  //         // region_id: regions.find((f) => f.currency_code === currencyCode)?.id,
  //         region_id: regions?.find(
  //           (f) =>
  //             f.currency_code === (getConfig("default")?.currency_code || "cny")
  //         )?.id,
  //         currencyCode,
  //         money: languages.find(
  //           (f) =>
  //             f.currency_code === (getConfig("default")?.currency_code || "cny")
  //         ).money,
  //       }}
  //     >
  //       {children}
  //     </LanguageContext.Provider>
  //   )
  // );
  return <LanguageContext.Provider>
    {children}
  </LanguageContext.Provider>
}

export default LanguageProvider;
export const useLanguage = () => useContext(LanguageContext);
