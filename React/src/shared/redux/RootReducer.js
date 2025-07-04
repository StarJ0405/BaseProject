import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import ReduxThunk from "redux-thunk";
import { AuthReducer } from "./auth/AuthReducer";
import { CheckboxReducer } from "./checkbox/CheckboxReducer";

const persistConfig = {
  key: "root",
  storage: storage, // 저장 공간
  whitelist: ["auth"], // 유지하고 싶은 값
  blacklist: [], // 유지하지 않을 내용 (새로고침했을 때 날려도 괜찮은 것)
};

const rootReducer = combineReducers({ 
  auth: AuthReducer.reducer,
  checkbox: CheckboxReducer.reducer  
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: [ReduxThunk],
  devTools: true,
});

// export default store;
