import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { clusterApiUrl } from "@solana/web3.js";
import crypto from "crypto";
import * as jose from "jose";
import { decodeUTF8 } from "tweetnacl-util";
import { getSignatureMessage } from "../lib/auth";
import {
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";

export const truncateAddress = (address: string) => {
  return address.slice(0, 4) + ".." + address.slice(-4);
};

export const getUrls = (
  network: "devnet" | "mainnet-beta" | "localnet",
  sig?: string,
  type?: "tx" | "address"
) => {
  if (network === "devnet") {
    return {
      rpc: clusterApiUrl("devnet"),
      bundlrAddress: "https://devnet.bundlr.network",
      bundlrProviderUrl: clusterApiUrl("devnet"),
      explorer: `https://explorer.solana.com/${type}/${sig}?cluster=devnet`,
    };
  } else if (network === "mainnet-beta") {
    return {
      rpc: clusterApiUrl("mainnet-beta"),
      bundlrAddress: "https://node1.bundlr.network",
      bundlrProviderUrl: clusterApiUrl("mainnet-beta"),
      explorer: `https://explorer.solana.com/${type}/${sig}`,
    };
  } else {
    return {
      rpc: "http://127.0.0.1:8899",
      bundlrAddress: "https://devnet.bundlr.network",
      bundlrProviderUrl: clusterApiUrl("devnet"),
      explorer: `https://explorer.solana.com/${type}/${sig}?cluster=custom`,
    };
  }
};

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK as
  | "devnet"
  | "mainnet-beta"
  | "localnet";

export const readFile = async (file: any) => {
  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onload = () => {
      const arrayBuffer = fileReader.result;
      const buffer = Buffer.from(arrayBuffer as ArrayBuffer);
      resolve(buffer);
    };
    fileReader.onerror = function (error) {
      reject(error);
    };
    fileReader.readAsArrayBuffer(file);
  });
};

export const DEV = process.env.NEXT_PUBLIC_ENV !== "production";
export const SERVER = typeof window !== "undefined" && window.origin;

export const messageToBytes = (message: string) => {
  return decodeUTF8(message);
};

export const signAndGetSignature = async (
  publicKey: string | undefined,
  callback: ((message: Uint8Array) => Promise<Uint8Array>) | undefined
) => {
  try {
    const message = getSignatureMessage(publicKey as string);
    const messageBytes = decodeUTF8(message);
    const signatureBytes = callback && (await callback(messageBytes));
    return {
      signatureString: bs58.encode(signatureBytes as Uint8Array),
      signatureBytes,
    };
  } catch (error) {
    throw error;
  }
};

export const signUp = async (payload: Payload) => {
  try {
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .sign(new TextEncoder().encode(process.env.NEXT_PUBLIC_SECRET as string));
    return token;
  } catch (error) {
    throw error;
  }
};

export const sleep = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const strToHash = (name: string) => {
  const hexString = crypto
    .createHash("sha256")
    .update(name, "utf-8")
    .digest("hex");
  return {
    uint8Array: Uint8Array.from(Buffer.from(hexString, "hex")),
    string: hexString,
  };
};

export const acceptedFileTypesToTypeString = (str: string): string => {
  const types = str
    .split(",")
    .map((type) => type.substring(type.indexOf("/") + 1).toUpperCase());
  if (types.length > 1) {
    const lastType = types.pop();
    return types.join(", ") + " or " + lastType;
  } else {
    return types[0];
  }
};

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
};
