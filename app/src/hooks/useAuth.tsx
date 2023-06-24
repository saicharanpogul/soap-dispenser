import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import useSignature from "./useSignature";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const { getSignature, signature } = useSignature();
  const { connected, disconnect } = useWallet();
  const auth = useCallback(async () => {
    try {
      if (!signature && connected) {
        await getSignature();
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log(error);
    }
  }, [connected, getSignature, signature]);
  const disconnectWallet = useCallback(async () => {
    if (connected) {
      await disconnect();
      localStorage.removeItem("signature");
      localStorage.removeItem("access-key");
    }
  }, [connected, disconnect]);
  useEffect(() => {
    const _signature = localStorage.getItem("signature");
    const accessKey = localStorage.getItem("access-key");
    if (!_signature || !accessKey) {
      disconnectWallet();
      setIsAuthenticated(false);
    }
  }, [auth, disconnectWallet]);
  return { isAuthenticated };
};

export default useAuth;
