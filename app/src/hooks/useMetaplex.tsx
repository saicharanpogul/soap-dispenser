import {
  bundlrStorage,
  Metaplex,
  toMetaplexFile,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useCallback, useMemo } from "react";
import { getUrls, NETWORK, readFile } from "../utils";

const useMetaplex = () => {
  const { connection } = useConnection();
  const walletAdapter = useWallet();
  const metaplex = useMemo(
    () =>
      Metaplex.make(connection)
        .use(walletAdapterIdentity(walletAdapter))
        .use(
          bundlrStorage({
            // @ts-ignore
            address: getUrls(NETWORK)?.bundlrAddress,
            // @ts-ignore
            providerUrl: getUrls(NETWORK)?.bundlrProviderUrl,
            timeout: 60000,
          })
        ),
    [connection, walletAdapter]
  );
  const uploadMetadata = useCallback(
    async (
      asset: any,
      name: string,
      description: string,
      symbol: string,
      externalUrl?: string,
      attributes?: any[],
      collection?: any,
      properties?: any,
      sellerFeeBasisPoints?: number
    ) => {
      const buffer = (await readFile(asset)) as Buffer;
      const file = toMetaplexFile(buffer, `${name}.png`);
      console.log(
        "Price",
        (
          await metaplex.storage().getUploadPriceForFile(file)
        ).basisPoints.toNumber() / LAMPORTS_PER_SOL
      );
      const imageUri = await metaplex.storage().upload(file);
      console.log("Image URI:", imageUri);
      const { uri } = await metaplex.nfts().uploadMetadata({
        name,
        description,
        symbol,
        image: imageUri,
        attributes,
        collection,
        external_url: externalUrl,
        properties,
        seller_fee_basis_points: sellerFeeBasisPoints,
      });
      console.log("Metadata URI:", uri);
      return [uri, imageUri];
    },
    [metaplex]
  );
  return { metaplex, uploadMetadata };
};

export default useMetaplex;
