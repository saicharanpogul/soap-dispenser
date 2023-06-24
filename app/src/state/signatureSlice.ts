import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "./store";
import { HYDRATE } from "next-redux-wrapper";

export interface SignatureState {
  signature: string;
}

const initialState: SignatureState = {
  signature: "",
};

export const signatureSlice = createSlice({
  name: "signature",
  initialState,
  reducers: {
    setSignature: (state, action) => {
      state.signature = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(HYDRATE, (state, action: any) => {
      return {
        ...state,
        ...action.payload.auth,
      };
    });
  },
});

export const { setSignature } = signatureSlice.actions;

export const selectSignatureState = (state: AppState) => state.signature;

export default signatureSlice;
