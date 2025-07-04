import NiceModal from "@ebay/nice-modal-react";

import ModalHandler from "modals/ModalHandler";
import AuthProvider from "providers/AuthProvider";
import BrowserEventProvider from "providers/BrowserEventProvider";
import CSSProvider from "providers/CSSProvider";
import LanguageProvider from "providers/LanguageProvider";
import ModalProvider from "providers/ModalProvider";
import { CookiesProvider } from "react-cookie";
import { ToastContainer } from "react-toastify";
import RootRouter from "router/RootRouter";
import AdminRequester from "shared/AdminRequester";
import Requester from "shared/Requester";
import SocketRequester from "shared/SocketRequest";
import style from "./App.module.css";
export const socketRequester = new SocketRequester();
export const requester = new Requester();
export const adminRequester = new AdminRequester();


function App() {
  return (
    <CookiesProvider>
      <BrowserEventProvider>
        <LanguageProvider>
          <AuthProvider>
            <CSSProvider>
              <div className={style.toast}>
                <ToastContainer />
              </div>
              <ModalProvider>
                <NiceModal.Provider>
                  <RootRouter />
                  <ModalHandler />
                </NiceModal.Provider>
              </ModalProvider>
            </CSSProvider>
          </AuthProvider>
        </LanguageProvider>
      </BrowserEventProvider>
    </CookiesProvider>
  );
}

export default App;
