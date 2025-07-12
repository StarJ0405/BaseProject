"use client";

import { requester } from "@/shared/Requester";
import { Cookies } from "@/shared/utils/Data";
import { CustomerDataInterface } from "@/shared/utils/Interfaces";
import { getCookieOption, getTokenPayload } from "@/shared/utils/Functions";
import { createContext, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";

export const AuthContext = createContext({
  customerData: {} as CustomerDataInterface | null,
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customerData, setCustomerData] =
    useState<null | CustomerDataInterface>(null);
  const [cookies, setCookie, removeCookie] = useCookies([Cookies.JWT]);

  const fetchCustomerData = async () => {
    try {
      const { [Cookies.JWT]: token } = cookies;
      if (token) {
        const tokenPayload = getTokenPayload(token);
        if (tokenPayload) {
          const { exp, iat, keep } = tokenPayload;

          if (Date.now() >= exp * 1000) {
            removeCookie(Cookies.JWT, getCookieOption());
          } else {
            // 회원 조회
            const {
              customer,
              token,
            }: { customer?: CustomerDataInterface; token?: string } =
              await requester.getCurrentCustomer();
            if (customer) {
              const birthday = new Date(customer.birthday || "2999-12-31");
              const date = new Date();
              date.setFullYear(date.getFullYear() - 20);
              date.setMonth(1, 1);

              const adult = birthday.getTime() < date.getTime();
              customer.adult = adult;
              setCustomerData(customer);
              if (keep && Date.now() - iat > 1000 * 60 * 60 * 24 && token) {
                setCookie(
                  Cookies.JWT,
                  token,
                  getCookieOption({ maxAge: 60 * 60 * 24 * 30 })
                );
              }
            }
          }

          return;
        }
      }
      setCustomerData(null);
    } catch (error) {
      setCustomerData(null);
    }
  };
  useEffect(() => {
    fetchCustomerData();
  }, []);
  return (
    <AuthContext.Provider
      value={{
        customerData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
