import { requester } from "App";
import { BrowserDetectContext } from "providers/BrowserEventProvider";
import { useContext } from "react";
import { useCookies } from "react-cookie";
import { Cookies, getCookieOption } from "shared/utils/Utils";

export const useAuth = () => {
  const [cookies, setCookie, removeCookie] = useCookies([Cookies.JWT]);
  const { isDev } = useContext(BrowserDetectContext);
  const login = async (loginData) => {
    try {
      const response = await requester.Login(loginData);
      if (response?.access_token) {
        // getCookieOption 사용
        setCookie(
          Cookies.JWT,
          response.access_token,
          getCookieOption(
            loginData?.keep
              ? { maxAge: 60 * 60 * 24 * 30, secure: !isDev }
              : { secure: !isDev }
          )
        );

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const verifyPassword = async (loginData) => {
    try {
      const response = await requester.Login(loginData);
      return Boolean(response?.access_token);
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    removeCookie(Cookies.JWT, getCookieOption());
  };

  const signup = async (signupData) => {
    try {
      const response = await requester.createCustomer(signupData);
      if (response.customer) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return {
    login,
    logout,
    signup,
    verifyPassword,
    isLoggedIn: Boolean(cookies[Cookies.JWT]),
  };
};
