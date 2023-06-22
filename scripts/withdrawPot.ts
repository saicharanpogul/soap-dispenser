import {
  Metaplex,
  keypairIdentity,
  toBigNumber,
} from "@metaplex-foundation/js";
import { POT_PREFIX, Workspace, connection, findPotPda, network } from ".";
import { initializeKeypair } from "./initializeKeypair";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Network, getUrls } from "./networks";

export const withdrawPot = async ({
  authority,
  metaplex,
  dispenser,
  collectionMint,
}: {
  authority: Keypair;
  metaplex: Metaplex;
  dispenser: PublicKey;
  collectionMint: PublicKey;
}) => {
  try {
    const { program, programId, provider, connection } = new Workspace(
      authority
    );

    const pot = findPotPda(authority.publicKey, dispenser, collectionMint);

    const sig = await program.methods
      .withdrawPot(toBigNumber(0.499 * LAMPORTS_PER_SOL))
      .accounts({
        pot,
        dispenser,
        authority: authority.publicKey,
        collectionMint,
      })
      .signers([authority])
      .rpc({ commitment: "confirmed" });
    console.log("Withdraw Pot:", getUrls(Network[network], sig, "tx").explorer);
  } catch (error) {
    throw error;
  }
};

const main = async () => {
  try {
    const authority = await initializeKeypair(connection, "soap_creator_1");
    const metaplex = Metaplex.make(connection).use(keypairIdentity(authority));
    await withdrawPot({
      authority,
      metaplex,
      dispenser: new PublicKey(process.argv[2]),
      collectionMint: new PublicKey(process.argv[3]),
    });
  } catch (error) {
    console.log(error);
  }
};

main();
