import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  DISPENSER_PREFIX,
  SOAP_DISPENSER_PROGRAM_ADDRESS,
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
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import {
  BigNumber,
  Metaplex,
  keypairIdentity,
  toBigNumber,
} from "@metaplex-foundation/js";
import { Network, getUrls } from "./networks";
import BN from "bn.js";

export const init = async ({
  authority,
  metaplex,
  maxDepth,
  maxBufferSize,
  isPublic,
  startDate,
  endDate,
}: {
  authority: Keypair;
  metaplex: Metaplex;
  maxDepth: number;
  maxBufferSize: number;
  isPublic: boolean;
  startDate: BN | null;
  endDate: BN | null;
}) => {
  try {
    console.log(endDate.toNumber());
    const { program, programId, provider, connection } = new Workspace(
      authority
    );
    const collectionMint = Keypair.generate();
    const merkleTree = Keypair.generate();
    const dispenser = findDispenserPda(
      authority.publicKey,
      collectionMint.publicKey
    );
    const treeAuthority = findTreeAuthorityPda(merkleTree.publicKey);

    const latestBlockhash = await connection.getLatestBlockhash();

    const createCollection = await metaplex.nfts().builders().create({
      name: "First cNFT Collection",
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

    const space = getConcurrentMerkleTreeAccountSize(maxDepth, maxBufferSize);

    const initTx = new Transaction();

    const createTreeIx = SystemProgram.createAccount({
      newAccountPubkey: merkleTree.publicKey,
      fromPubkey: authority.publicKey,
      space: space,
      lamports: await connection.getMinimumBalanceForRentExemption(space),
      programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    });
    initTx.add(createTreeIx);

    const initIx = await program.methods
      .init(maxDepth, maxBufferSize, isPublic, startDate, endDate)
      .accounts({
        dispenser,
        authority: authority.publicKey,
        collectionMint: collectionMint.publicKey,
        treeAuthority,
        merkleTree: merkleTree.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ADDRESS,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        logWrapper: SPL_NOOP_PROGRAM_ID,
      })
      .signers([authority])
      .instruction();
    initTx.add(initIx);

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
      [merkleTree, authority],
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
    await init({
      authority,
      metaplex,
      maxDepth: 3,
      maxBufferSize: 8,
      isPublic: false,
      endDate: toBigNumber(new Date().getTime()).add(
        toBigNumber(1 * 24 * 60 * 60 * 1000)
      ),
      startDate: null,
    });
  } catch (error) {
    console.log(error);
  }
};

main();
