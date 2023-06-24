import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { FC, ReactNode, useMemo } from "react";
import { getUrls, NETWORK } from "../utils";
require("@solana/wallet-adapter-react-ui/styles.css");

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const network = useMemo(() => getUrls(NETWORK)?.rpc, []);
  const wallets = useMemo(() => [], [network]);

  return (
    <ConnectionProvider endpoint={network as string}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
