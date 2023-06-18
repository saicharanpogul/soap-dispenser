import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  Workspace,
  connection,
  findDispenserPda,
  findMasterEditionPda,
  findMetadataPda,
  findTreeAuthorityPda,
  network,
} from ".";
import { initializeKeypair } from "./initializeKeypair";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ADDRESS } from "@metaplex-foundation/mpl-token-metadata";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Network, getUrls } from "./networks";

export const init = async ({
  authority,
  metaplex,
}: {
  authority: Keypair;
  metaplex: Metaplex;
}) => {
  try {
    const { program, programId, provider, connection } = new Workspace(
      authority
    );
    const collectionMint = Keypair.generate();
    const tree = Keypair.generate();
    const dispenser = findDispenserPda(authority.publicKey);
    const treeAuthority = findTreeAuthorityPda(tree.publicKey);

    const latestBlockhash = await connection.getLatestBlockhash();

    const createCollection = await metaplex.nfts().builders().create({
      name: "First cNFT",
      symbol: "SOAP",
      uri: "https://arweave.net/mo4NBHmhuCt9ZjJ6jykMgKw-te0uTdgDBkBjVAJ-v20",
      sellerFeeBasisPoints: 0,
      useNewMint: collectionMint,
    });

    const createCollectionTx = createCollection.toTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    createCollectionTx.feePayer = authority.publicKey;

    const initTx = await program.methods
      .init(
        3, // maxDepth
        8, // maxBufferSize
        true,
        null,
        null
      )
      .accounts({
        dispenser,
        authority: authority.publicKey,
        collectionMint: collectionMint.publicKey,
        treeAuthority,
        merkleTree: tree.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ADDRESS,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        logWrapper: SPL_NOOP_PROGRAM_ID,
      })
      .signers([authority])
      .transaction();

    initTx.feePayer = authority.publicKey;
    initTx.recentBlockhash = latestBlockhash.blockhash;

    const createCollectionSig = await sendAndConfirmTransaction(
      connection,
      createCollectionTx,
      [collectionMint, authority],
      { commitment: "confirmed" }
    );

    console.log(
      "Collection:",
      getUrls(Network[network], createCollectionSig, "tx").explorer
    );

    const initSig = await sendAndConfirmTransaction(
      connection,
      initTx,
      [authority],
      { commitment: "confirmed" }
    );

    console.log("Init:", getUrls(Network[network], initSig, "tx").explorer);
  } catch (error) {
    throw error;
  }
};

const main = async () => {
  try {
    const authority = await initializeKeypair(connection, "soap_creator_1");
    const metaplex = Metaplex.make(connection).use(keypairIdentity(authority));
    await init({ authority, metaplex });
  } catch (error) {
    console.log(error);
  }
};

main();
