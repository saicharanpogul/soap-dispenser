import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  TokenProgramVersion,
  TokenStandard,
  getLeafAssetId,
} from "@metaplex-foundation/mpl-bubblegum";
import idl from "../target/idl/soap_dispenser.json";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { Network, getUrls } from "./networks";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { SoapDispenser, IDL } from "../target/types/soap_dispenser";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ADDRESS } from "@metaplex-foundation/mpl-token-metadata";
import { deserializeChangeLogEventV1 } from "@solana/spl-account-compression";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { Metaplex } from "@metaplex-foundation/js";
import { WrapperConnection } from "./WrapperConnection";
import * as dotenv from "dotenv";

dotenv.config();

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

export const findPotPda = (
  authority: PublicKey,
  dispenser: PublicKey,
  collectionMint: PublicKey
) =>
  PublicKey.findProgramAddressSync(
    [
      Buffer.from(POT_PREFIX),
      authority.toBuffer(),
      dispenser.toBuffer(),
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

export const wrapperConnection = new WrapperConnection(
  `https://rpc-devnet.helius.xyz/?api-key=${process.env.HELIUS_API_KEY}`
);

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

export const getTokenStandard = (tokenStandard: TokenStandard) => {
  if (tokenStandard === TokenStandard.Fungible) {
    return { fungible: {} };
  } else if (tokenStandard === TokenStandard.FungibleAsset) {
    return { fungibleAsset: {} };
  } else if (tokenStandard === TokenStandard.NonFungible) {
    return { nonFungible: {} };
  } else if (tokenStandard === TokenStandard.NonFungibleEdition) {
    return { nonFungibleEdition: {} };
  }
};

export const getTokenProgramVersion = (
  tokenProgramVersion: TokenProgramVersion
) => {
  if (tokenProgramVersion == TokenProgramVersion.Original) {
    return { original: {} };
  } else if (tokenProgramVersion === TokenProgramVersion.Token2022) {
    return { token2022: {} };
  }
  // else {
  //   throw new Error("Invalid variant");
  // }
};

export const getAssetId = async (
  signature: string,
  tree: PublicKey,
  metaplex: Metaplex
) => {
  try {
    const txInfo = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
    // find the index of the bubblegum instruction
    const relevantIndex =
      txInfo!.transaction.message.compiledInstructions.findIndex(
        (instruction) => {
          return (
            txInfo?.transaction.message.staticAccountKeys[
              instruction.programIdIndex
            ].toBase58() === "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY"
          );
        }
      );
    console.log("relevantIndex", relevantIndex);

    // locate the no-op inner instructions called via cpi from bubblegum
    const relevantInnerIxs =
      txInfo!.meta?.innerInstructions?.[0].instructions?.filter(
        (instruction) => {
          return (
            txInfo?.transaction.message.staticAccountKeys[
              instruction.programIdIndex
            ].toBase58() === "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"
          );
        }
      );

    // when no valid noop instructions are found, throw an error
    if (!relevantInnerIxs || relevantInnerIxs.length == 0)
      throw Error("Unable to locate valid noop instructions");

    // locate the asset index by attempting to locate and parse the correct `relevantInnerIx`
    let assetIndex: number | undefined = undefined;
    // note: the `assetIndex` is expected to be at position `1`, and normally expect only 2 `relevantInnerIx`
    for (let i = relevantInnerIxs.length - 1; i > 0; i--) {
      try {
        const changeLogEvent = deserializeChangeLogEventV1(
          Buffer.from(bs58.decode(relevantInnerIxs[i]?.data!))
        );

        // extract a successful changelog index
        assetIndex = changeLogEvent?.index;
      } catch (__) {
        // do nothing, invalid data is handled just after the for loop
      }
    }
    // when no `assetIndex` was found, throw an error
    if (typeof assetIndex == "undefined")
      throw Error("Unable to locate the newly minted assetId ");

    const assetId = await getLeafAssetId(tree, new BN(assetIndex));
    console.log("assetId", assetId.toBase58());
    return assetId;
  } catch (error) {
    throw error;
  }
};

export const sleep = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));
