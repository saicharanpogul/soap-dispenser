import { SoapDispenserProgram } from "@/utils/programs";
import { AnchorProvider, Wallet, setProvider } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { createContext, useContext } from "react";

interface Workspace {
  connection?: Connection;
  provider?: AnchorProvider;
  soapDispenser?: SoapDispenserProgram;
}

const WorkspaceContext = createContext<Workspace>({});

const MockWallet: Wallet = {
  payer: Keypair.generate(),
  publicKey: Keypair.generate().publicKey,
  signTransaction: <T extends Transaction | VersionedTransaction>(
    transaction: T
  ) => Promise.resolve(transaction),

  signAllTransactions: <T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ) => Promise.resolve(transactions),
};

const WorkspaceProvider = ({ children }: any) => {
  const wallet = useAnchorWallet() || MockWallet;
  const { connection } = useConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "finalized",
  });
  setProvider(provider);

  const workspace: Workspace = {
    connection,
    provider,
    soapDispenser: new SoapDispenserProgram(),
  };

  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
};

const useWorkspace = (): Workspace => {
  return useContext(WorkspaceContext);
};

export { WorkspaceProvider, useWorkspace };
