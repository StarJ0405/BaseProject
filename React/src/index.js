import InitialLoading from "components/loading/InitialLoading";
import "lang/i18n";
import React, { lazy, Suspense } from "react";
import ReactDOMClient from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { PersistGate } from "redux-persist/integration/react";
import persistStore from "redux-persist/lib/persistStore";
import "resources/css/font/font.css";
import "resources/css/font/static/pretendard.css";
import "resources/css/react-contextmenu.css";
import "resources/css/styles.css";
import "resources/css/styles.scss";
import "resources/css/swiperStyle.css";
import "resources/css/tree.css";
import { store } from "shared/redux/RootReducer";

// import App from "./App";
const App = lazy(() => import("./App"));
let persistor = persistStore(store); // 데이터가 유지되는 Store를 생성
// ModalHandler();
const root = document.getElementById("root");
ReactDOMClient.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Suspense fallback={<InitialLoading />}>
            <App />
          </Suspense>
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
