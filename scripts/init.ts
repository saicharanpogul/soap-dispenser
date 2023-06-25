import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  createMintToCollectionV1Instruction,
} from "@metaplex-foundation/mpl-bubblegum";
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
  fundWallet,
  metaplex,
  maxDepth,
  maxBufferSize,
  soapDetails,
  isPublic,
  startDate,
  endDate,
}: {
  authority: Keypair;
  fundWallet: PublicKey;
  metaplex: Metaplex;
  maxDepth: number;
  maxBufferSize: number;
  soapDetails: {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
  };
  isPublic: boolean;
  startDate: BN | null;
  endDate: BN | null;
}) => {
  try {
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
    const collectionAuthorityRecord = metaplex
      .nfts()
      .pdas()
      .collectionAuthorityRecord({
        mint: collectionMint.publicKey,
        collectionAuthority: dispenser,
      });
    const collectionMetadata = metaplex
      .nfts()
      .pdas()
      .metadata({ mint: collectionMint.publicKey });

    const latestBlockhash = await connection.getLatestBlockhash();

    const createCollection = await metaplex.nfts().builders().create({
      name: "First cNFT Collection",
      symbol: "SOAP",
      uri: "https://arweave.net/mo4NBHmhuCt9ZjJ6jykMgKw-te0uTdgDBkBjVAJ-v20",
      sellerFeeBasisPoints: 0,
      useNewMint: collectionMint,
      collectionIsSized: true,
      isCollection: true,
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
      .init(maxDepth, maxBufferSize, soapDetails, isPublic, startDate, endDate)
      .accounts({
        dispenser,
        authority: authority.publicKey,
        collectionMint: collectionMint.publicKey,
        collectionAuthorityRecord,
        collectionMetadata,
        treeAuthority,
        merkleTree: merkleTree.publicKey,
        fundWallet: fundWallet,
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
    console.log("Dispenser:", dispenser.toBase58());
    console.log("Collection Mint:", collectionMint.publicKey.toBase58());
  } catch (error) {
    throw error;
  }
};

const main = async () => {
  try {
    const authority = await initializeKeypair(connection, "soap_creator_1");
    const fundWallet = await initializeKeypair(connection, "fund_wallet");
    const metaplex = Metaplex.make(connection).use(keypairIdentity(authority));
    await init({
      authority,
      fundWallet: fundWallet.publicKey,
      metaplex,
      maxDepth: 3,
      maxBufferSize: 8,
      soapDetails: {
        name: "First cNFT",
        symbol: "cNFT",
        uri: "https://arweave.net/mo4NBHmhuCt9ZjJ6jykMgKw-te0uTdgDBkBjVAJ-v20",
        sellerFeeBasisPoints: 500,
      },
      isPublic: false,
      endDate: toBigNumber(new Date().getTime()).add(
        toBigNumber(1 * 24 * 60 * 60 * 1000)
      ),
      startDate: null,
    });
  } catch (error) {
    console.log(error);
  }
  // createMintToCollectionV1Instruction
};

main();
