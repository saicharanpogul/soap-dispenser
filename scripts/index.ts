import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";
import idl from "../target/idl/soap_dispenser.json";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { Network, getUrls } from "./networks";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { SoapDispenser, IDL } from "../target/types/soap_dispenser";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ADDRESS } from "@metaplex-foundation/mpl-token-metadata";

// export const network = process.env.ANCHOR_PROVIDER_URL;
export const network = AnchorProvider.env().connection.rpcEndpoint;

// @ts-ignore
export const SOAP_DISPENSER_PROGRAM_ADDRESS = idl.metadata.address
  ? // @ts-ignore
    new PublicKey(idl?.metadata.address)
  : new PublicKey("SDGQRX2DBX3qDNjEnEyryXFsGj2Sq6NXJd2SmZ3kfJ6");

export const POT_PREFIX = "pot";

export const DISPENSER_PREFIX = "dispenser";

export const TREE_AUTHORITY_SIZE = 96;

export const findDispenserPda = (
  authority: PublicKey,
  collectionMint: PublicKey
) =>
  PublicKey.findProgramAddressSync(
    [
      Buffer.from(DISPENSER_PREFIX),
      authority.toBuffer(),
      collectionMint.toBuffer(),
    ],
    SOAP_DISPENSER_PROGRAM_ADDRESS
  )[0];

export const findMetadataPda = (mint: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ADDRESS
  )[0];

export const findMasterEditionPda = (mint: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), mint.toBuffer(), Buffer.from("edition")],
    TOKEN_METADATA_PROGRAM_ADDRESS
  )[0];

export const findTreeAuthorityPda = (tree: PublicKey) =>
  PublicKey.findProgramAddressSync([tree.toBuffer()], BUBBLEGUM_PROGRAM_ID)[0];

export class Wallet {
  publicKey: PublicKey;
  constructor(keypair: Keypair) {
    this.publicKey = keypair.publicKey;
  }
  signTransaction = <T extends Transaction | VersionedTransaction>(
    transaction: T
  ) => Promise.resolve(transaction);
  signAllTransactions = <T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ) => Promise.resolve(transactions);
}

export const bundlrConnection = new Connection(
  getUrls(Network[network]).bundlrProviderUrl
);

export const connection = new Connection(getUrls(Network[network]).rpc);

export class Workspace {
  provider: AnchorProvider;
  programId: PublicKey;
  program: Program<SoapDispenser>;
  connection: Connection;
  constructor(keypair: Keypair) {
    this.provider = new AnchorProvider(connection, new Wallet(keypair), {});
    // @ts-ignore
    this.programId = new PublicKey(idl.metadata.address);
    this.program = new Program<SoapDispenser>(
      IDL,
      this.programId,
      this.provider
    );
    this.connection = this.provider.connection;
  }
}

export const sleep = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));
