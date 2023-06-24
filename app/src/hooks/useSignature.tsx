import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { useCallback, useEffect, useState } from "react";
import { decodeUTF8 } from "tweetnacl-util";
import { sleep } from "../utils";
import { useDispatch } from "react-redux";
import { setSignature as setReduxSignature } from "@/state/signatureSlice";

const useSignature = () => {
  const [signature, setSignature] = useState("");
  const { connected, publicKey, signMessage } = useWallet();
  const dispatch = useDispatch();
  useEffect(() => {
    const _signature = localStorage.getItem("signature");
    if (_signature) {
      setSignature(_signature);
      dispatch(setReduxSignature(_signature));
    } else {
      setSignature("");
    }
  }, [connected]);
  const getSignature = useCallback(async () => {
    try {
      if (!connected && !signMessage && !publicKey) return;
      const message =
        "csoap.saicharanpogul.xyz wants you to sign in with your solana wallet account: " +
        publicKey?.toBase58();
      const messageBytes = decodeUTF8(message);
      await sleep(0.5);
      const rawSig = signMessage && (await signMessage(messageBytes));
      const _sig = bs58.encode(rawSig as Uint8Array);
      localStorage.setItem("signature", _sig);
      setSignature(_sig);
      dispatch(setReduxSignature(_sig));
      return _sig;
    } catch (error: any) {
      throw error;
    }
  }, [connected, publicKey, signMessage]);
  return { getSignature, signature };
};

export default useSignature;
