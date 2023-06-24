import { BUBBLEGUM_PROGRAM_ID } from "@/constants";
import {
  NETWORK,
  getTokenProgramVersion,
  getTokenStandard,
  getUrls,
  sleep,
} from "@/utils";
import { SoapDispenserProgram } from "@/utils/programs";
import { Metaplex, toBigNumber } from "@metaplex-foundation/js";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import BN from "bn.js";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ADDRESS } from "@metaplex-foundation/mpl-token-metadata";
import useMetaplex from "./useMetaplex";
import {
  MetadataArgs,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";
import { useCallback } from "react";

const useDispenser = () => {
  const { publicKey, connected, sendTransaction, signAllTransactions } =
    useWallet();
  const { connection } = useConnection();
  const { metaplex } = useMetaplex();

  const init = useCallback(
    async ({
      maxDepth,
      maxBufferSize,
      isPublic,
      startDate,
      endDate,
    }: {
      maxDepth: number;
      maxBufferSize: number;
      isPublic: boolean;
      startDate: BN | null;
      endDate: BN | null;
    }) => {
      try {
        if (
          !publicKey ||
          !connected ||
          !connection ||
          !metaplex ||
          !signAllTransactions
        )
          return;
        const authority = publicKey;
        const collectionMint = Keypair.generate();
        const merkleTree = Keypair.generate();
        const soapDispenser = new SoapDispenserProgram();
        const dispenser = soapDispenser.findDispenserPda(
          authority,
          collectionMint.publicKey
        );
        const treeAuthority = soapDispenser.findTreeAuthorityPda(
          merkleTree.publicKey
        );
        const pot = soapDispenser.findPotPda(
          authority,
          dispenser,
          collectionMint.publicKey
        );
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

        createCollectionTx.feePayer = authority;
        createCollectionTx.recentBlockhash = latestBlockhash.blockhash;
        createCollectionTx.partialSign(collectionMint);
        createCollectionTx.verifySignatures(false);

        const space = getConcurrentMerkleTreeAccountSize(
          maxDepth,
          maxBufferSize
        );

        const initTx = new Transaction();

        const minimumRent = await connection.getMinimumBalanceForRentExemption(
          space
        );

        initTx.add(
          SystemProgram.createAccount({
            newAccountPubkey: merkleTree.publicKey,
            fromPubkey: authority,
            space: space,
            lamports: minimumRent,
            programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          })
        );
        initTx.add(
          await soapDispenser.program.methods
            .init(maxDepth, maxBufferSize, isPublic, startDate, endDate)
            .accounts({
              dispenser,
              authority,
              collectionMint: collectionMint.publicKey,
              collectionAuthorityRecord,
              collectionMetadata,
              treeAuthority,
              merkleTree: merkleTree.publicKey,
              systemProgram: SystemProgram.programId,
              tokenProgram: TOKEN_PROGRAM_ID,
              associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
              bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
              tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ADDRESS,
              compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
              logWrapper: SPL_NOOP_PROGRAM_ID,
            })
            .signers([])
            .transaction()
        );
        initTx.feePayer = authority;
        initTx.recentBlockhash = latestBlockhash.blockhash;
        initTx.partialSign(merkleTree);
        initTx.verifySignatures(false);

        // TODO:
        const fundPotTx = await soapDispenser.program.methods
          .fundPot(toBigNumber(0.5 * LAMPORTS_PER_SOL))
          .accounts({
            pot,
            dispenser,
            authority,
            collectionMint: collectionMint.publicKey,
          })
          .transaction();
        fundPotTx.feePayer = authority;
        fundPotTx.recentBlockhash = latestBlockhash.blockhash;
        fundPotTx.verifySignatures(false);

        const signedTxs = (await signAllTransactions([
          createCollectionTx,
          initTx,
          fundPotTx,
        ])) as Transaction[];
        createCollectionTx.verifySignatures(true);
        initTx.verifySignatures(true);

        const createCollectionSig = await connection.sendRawTransaction(
          signedTxs[0].serialize({
            requireAllSignatures: true,
            verifySignatures: true,
          })
        );

        console.log(
          "Collection:",
          getUrls(NETWORK, createCollectionSig, "tx").explorer
        );

        await sleep(2);

        const initSig = await connection.sendRawTransaction(
          signedTxs[1].serialize({
            requireAllSignatures: true,
            verifySignatures: true,
          })
        );
        console.log("Init:", getUrls(NETWORK, initSig, "tx").explorer);

        await sleep(2);

        const fundPotSig = await connection.sendRawTransaction(
          signedTxs[2].serialize({
            requireAllSignatures: true,
            verifySignatures: true,
          })
        );

        console.log("Fund Pot:", getUrls(NETWORK, fundPotSig, "tx").explorer);
        console.log("Dispenser:", dispenser.toBase58());
        console.log("Collection Mint:", collectionMint.publicKey.toBase58());
        return { dispenser, collectionMint: collectionMint.publicKey };
      } catch (error) {
        throw error;
      }
    },
    [connected, connection, metaplex, publicKey, signAllTransactions]
  );

  const fetctDispenser = useCallback(async (dispenser: PublicKey) => {
    try {
      const soapDispenser = new SoapDispenserProgram();
      const dispenserAccount =
        await soapDispenser.program.account.dispenser.fetch(dispenser);
      return dispenserAccount;
    } catch (error) {
      console.log(error);
    }
  }, []);

  return { init, fetctDispenser };
};

export default useDispenser;
