"use client";
import WalletContextProvider from "@/components/WalletContextProvider";
import { WorkspaceProvider } from "@/components/WorkspaceProvider";
import { store, wrapper } from "@/state/store";
import { theme } from "@/styles/theme";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "react-redux";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <CacheProvider>
        <ChakraProvider theme={theme}>
          <WalletContextProvider>
            <WorkspaceProvider>{children}</WorkspaceProvider>
          </WalletContextProvider>
        </ChakraProvider>
      </CacheProvider>
    </Provider>
  );
}
