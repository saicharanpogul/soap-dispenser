import { PublicKey } from "@solana/web3.js";
import { Workspace, connection } from ".";
import { initializeKeypair } from "./initializeKeypair";

const getDispensers = async () => {
  try {
    const authority = await initializeKeypair(connection, "soap_creator_1");
    const { program, programId, provider } = new Workspace(authority);
    const dispensers = await program.account.dispenser.all([
      {
        memcmp: {
          offset: 8,
          bytes: new PublicKey(
            "9qY5qdJ4TNeEcGHTa2FzewjhE9cFj1mAEz9LG9c8sQKy"
          ).toBase58(),
          //   bytes: authority.publicKey.toBase58(),
        },
      },
    ]);
    console.log(JSON.stringify(dispensers, null, 2));
  } catch (error) {
    console.log(error);
  }
};
getDispensers();
