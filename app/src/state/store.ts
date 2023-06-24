"use client";
import { DEV } from "@/utils";
import {
  configureStore,
  ThunkAction,
  Action,
  combineReducers,
} from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import signatureSlice from "./signatureSlice";

const makeStore = () =>
  configureStore({
    reducer: combineReducers({
      signature: signatureSlice.reducer,
    }),
    devTools: DEV ? true : false,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action
>;

export const wrapper = createWrapper<AppStore>(makeStore);

export const store = configureStore({
  reducer: combineReducers({
    signature: signatureSlice.reducer,
  }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
