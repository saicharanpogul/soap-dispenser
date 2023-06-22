import { Metaplex, PublicKey } from "@metaplex-foundation/js";
import { connection, getAssetId, wrapperConnection } from ".";

export const getAsset = async () => {
  try {
    const metaplex = Metaplex.make(connection);

    const type = process.argv[2];

    if (type === "by-collection") {
      await wrapperConnection
        .getAssetsByGroup({
          groupKey: "collection",
          groupValue: process.argv[3],
          sortBy: {
            sortBy: "recent_action",
            sortDirection: "asc",
          },
        })
        .then((res) => {
          console.log("Total assets returned:", res.total);
          res.items?.map((asset) => {
            console.log(asset);
          });
        });
    }

    if (type === "by-signature-and-tree") {
      const assetId = await getAssetId(
        process.argv[3], // sig
        new PublicKey(process.argv[4]), // merkle tree
        metaplex
      );
      const nft = await wrapperConnection.getAsset(assetId);
      console.log(nft);
    }
  } catch (error) {
    console.log(error);
  }
};

getAsset();
