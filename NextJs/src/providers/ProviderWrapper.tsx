"use client";

import ModalHandler from "@/modals/ModalHandler";
import NiceModal from "@ebay/nice-modal-react";
import { CookiesProvider } from "react-cookie";
import AuthProvider from "./AuthPorivder";
import BrowserEventProvider from "./BrowserEventProvider";
import ModalProvider from "./ModalProvider";

export default function ProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CookiesProvider>
      <BrowserEventProvider>
        <AuthProvider>
          <ModalProvider>
            <NiceModal.Provider>
              {/*  */}
              {children}
              <ModalHandler />
            </NiceModal.Provider>
          </ModalProvider>
        </AuthProvider>
      </BrowserEventProvider>
    </CookiesProvider>
  );
}
