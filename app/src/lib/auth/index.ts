import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import * as jwt from "jsonwebtoken";
import { decodeUTF8 } from "tweetnacl-util";

export const getSignatureMessage = (publicKey: string) => {
  return (
    "csoap.saicharanpogul.xyz wants you to sign in with your solana wallet account: " +
    publicKey
  );
};

export const isSignatureAuthenticated = (
  signature: string,
  publicKey: string
) => {
  try {
    const message = getSignatureMessage(publicKey);
    const messageBytes = decodeUTF8(message);
    const isVerified = nacl.sign.detached.verify(
      messageBytes,
      bs58.decode(signature),
      new PublicKey(publicKey).toBytes()
    );
    return isVerified;
  } catch (error) {
    console.info(error);
    throw error;
  }
};

export const isAuthenticated = (token: string, publicKey: string) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXT_PUBLIC_SECRET as string,
      {
        algorithms: ["HS256"],
      }
    );
    // @ts-ignore
    if (decoded.publicKey !== publicKey) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};
