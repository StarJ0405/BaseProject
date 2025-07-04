import { requester } from "App";
import _ from "lodash";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Cookies, getCookieOption, getTokenPayload } from "shared/utils/Utils";
import { useBrowserEvent } from "./BrowserEventProvider";

export const AuthContext = createContext({
  customerData:
    {
      // point: Number,
      businessMutual: String,
      businessNumber: String,
      businessAddress: String,
      businessName: String,
      businessPhone: String,
      businessEmail: String,
      businessType: String,
      businessDetail: String,
      businessCertificate: String,
      businessRetail: String,
      recommender: String | null,
      resetPassword: Boolean,
      last_login: String,
      id: String,
      created_at: String,
      updated_at: String,
      deleted_at: String | null,
      email: String,
      first_name: String,
      last_name: String | null,
      billing_address_id: String | null,
      phone: String,
      birthday: Date,
      adult: Boolean,
      has_account: Boolean,
      metadata: {
        bank: String,
        owner: String,
        amount: String,
        account: String,
        configs: Array,
      },
      link: {
        regist: String,
        totalPoint: Number,
        point: Array,
        type: Array,
        createdAt: new Date(),
      },
    } | null,
  question: String,
  isAuthenticated: Boolean,
  authCheckDone: Boolean,
  token: String,
});

function AuthProvider(props) {
  const { app, appStatus, deviceType, Agent } = useBrowserEvent();
  const [mounted, setMounted] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies([Cookies.JWT]);
  const { [Cookies.JWT]: token } = cookies;
  const fetchCustomerData = async () => {
    try {
      if (token) {
        const tokenPayload = getTokenPayload(token);
        if (tokenPayload) {
          const exp = tokenPayload.exp;
          if (Date.now() >= exp * 1000) {
            removeCookie(Cookies.JWT, getCookieOption());
          } else {
            const response = await requester.getCurrentCustomer();
            if (response?.customer) {
              const birthday = new Date(
                response.customer.birthday || "2999-12-31"
              );
              const date = new Date();
              date.setFullYear(date.getFullYear() - 20);
              date.setMonth(1, 1);

              const adult = birthday.getTime() < date.getTime();
              const merge = _.merge(response.customer, {
                adult,
              });
              delete merge.point;
              setCustomerData(merge);

              if (app) {
                await requester.postApp({
                  code: app,
                  customer_id: response?.customer?.id,
                  user_id: null,
                  metadata: {
                    status: appStatus,
                    deviceType,
                    Agent,
                  },
                  merge: true,
                });
              }
              setAuthenticated(true);
            }
          }
        }
      } else {
        setCustomerData(null);
        setAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth update error:", error);
      setCustomerData(null);
      setAuthenticated(false);
    }
  };
  useLayoutEffect(() => {
    setMounted(true);
  }, []);
  useLayoutEffect(() => {
    if (!mounted) return;
    const updateUserInfo = async () => {
      try {
        if (token) {
          const tokenPayload = getTokenPayload(token);
          if (tokenPayload) {
            const { exp, iat, keep } = tokenPayload;
            if (Date.now() >= exp) {
              removeCookie(Cookies.JWT, getCookieOption());
              window.location.reload();
            } else {
              const response = await requester.getCurrentCustomer();
              if (response?.customer) {
                const birthday = new Date(
                  response.customer.birthday || "2999-12-31"
                );
                const date = new Date();
                date.setMonth(1, 1);
                date.setFullYear(date.getFullYear() - 20);

                const adult = birthday.getTime() < date.getTime();
                const merge = _.merge(response.customer, {
                  adult,
                });
                delete merge.point;
                setCustomerData(merge);
                if (app) {
                  await requester.postApp({
                    code: app,
                    customer_id: response?.customer?.id,
                    user_id: null,
                    metadata: {
                      status: appStatus,
                      deviceType,
                      Agent,
                    },
                    merge: true,
                  });
                }
                setAuthenticated(true);
              }
              if (
                keep &&
                Date.now() - iat > 1000 * 60 * 60 * 24 &&
                response?.token
              ) {
                setCookie(
                  Cookies.JWT,
                  response.token,
                  getCookieOption({ maxAge: 60 * 60 * 24 * 30 })
                );
              }
            }
          }
        } else {
          setCustomerData(null);
          setAuthenticated(false);
          if (app) {
            await requester.postApp({
              code: app,
              customer_id: null,
              user_id: null,
              metadata: {
                status: appStatus,
                deviceType,
                Agent,
              },
              merge: true,
            });
          }
        }
      } catch (error) {
        setCustomerData(null);
        setAuthenticated(false);
        if (app) {
          await requester.postApp({
            code: app,
            customer_id: null,
            user_id: null,
            metadata: {
              status: appStatus,
              deviceType,
              Agent,
            },
            merge: true,
          });
        }
      }
    };
    updateUserInfo();
  }, [token, mounted, app, appStatus]);

  const authContextValue = {
    customerData,
    isAuthenticated,
    authCheckDone: true,
    token,
    refreshCustomerData: fetchCustomerData,
  };

  return (
    <AuthContext.Provider key={token} value={authContextValue}>
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
export const useAuth = () => useContext(AuthContext);
