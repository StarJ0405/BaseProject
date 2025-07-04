import { createSlice } from "@reduxjs/toolkit";

export const AuthReducer = createSlice({
  name: "Auth",
  initialState: {
    token: null,
  },
  reducers: {
    setToken: (state, action) => {
      let token = action.payload;
      if (token) {
      }
      return {
        ...state,
        token: token,
      };
    },
    reset(state) {
      return { ...state, token: null, data: null };
    },
  },
});
