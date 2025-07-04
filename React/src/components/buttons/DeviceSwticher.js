import { BrowserDetectContext } from "providers/BrowserEventProvider";
import { useContext } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { Cookies, getCookieOption } from "shared/utils/Utils";
import Button from "./Button";

function DeviceSwitcher() {
  const { isInitMobile, isMobile } = useContext(BrowserDetectContext);
  const [, setCookie, removeCookie] = useCookies([Cookies.MODE]);
  const navigate =  useNavigate();
  return (
    <Button
      onClick={() => {
        if (isMobile) {
          if (isInitMobile) {
            setCookie(Cookies.MODE, `${!isMobile}`, getCookieOption());
          } else {
            if (window.location.pathname.startsWith("/m/")) {
              navigate(window.location.pathname.replace("/m/", "/"));
            }
            removeCookie(Cookies.MODE, getCookieOption());
          }
        } else {
          if (isInitMobile) {
            setCookie(Cookies.MODE, `${!isMobile}`, getCookieOption());
          } else {
            if (!window.location.pathname.startsWith("/m/")) {
              navigate("/m" + window.location.pathname);
            }
            removeCookie(Cookies.MODE, getCookieOption());
          }
        }
      }}
    >
      {isMobile ? "pc" : "mobile"}
    </Button>
  );
}

export default DeviceSwitcher;
