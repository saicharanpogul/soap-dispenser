import {
  BUBBLEGUM_PROGRAM_ID,
  DISPENSER_PREFIX,
  POT_PREFIX,
  SOAP_DISPENSER_PROGRAM_ID,
} from "@/constants";
import {
  NETWORK,
  getTokenProgramVersion,
  getTokenStandard,
  getUrls,
} from "@/utils";
import { SoapDispenserProgram } from "@/utils/programs";
import { AnchorProvider, Idl, Program, Wallet } from "@coral-xyz/anchor";
import { Metaplex } from "@metaplex-foundation/js";
import {
  MetadataArgs,
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { useSearchParams } from "next/navigation";
import { NextResponse } from "next/server";
import idl from "@/constants/soap_dispenser.json";
import { SoapDispenser, IDL } from "@/types/soap_dispenser";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ADDRESS } from "@metaplex-foundation/mpl-token-metadata";

const MockWallet: Wallet = {
  payer: Keypair.generate(),
  publicKey: Keypair.generate().publicKey,
  signTransaction: <T extends Transaction | VersionedTransaction>(
    transaction: T
  ) => Promise.resolve(transaction),

  signAllTransactions: <T extends Transaction | VersionedTransaction>(
    transactions: T[]
  ) => Promise.resolve(transactions),
};

const mint = async ({
  connection,
  authority,
  metaplex,
  collectionMint,
  buyer,
}: {
  connection: Connection;
  authority: PublicKey;
  metaplex: Metaplex;
  collectionMint: PublicKey;
  buyer: PublicKey;
}) => {
  try {
    const programId = new PublicKey(SOAP_DISPENSER_PROGRAM_ID);
    const wallet = MockWallet;
    const program = new Program(
      idl as Idl,
      programId,
      new AnchorProvider(connection, wallet, { commitment: "confirmed" })
    ) as unknown as Program<SoapDispenser>;
    const dispenser = PublicKey.findProgramAddressSync(
      [
        Buffer.from(DISPENSER_PREFIX),
        authority.toBuffer(),
        collectionMint.toBuffer(),
      ],
      programId
    )[0];

    const fundWalletSeed = process.env.NEXT_PUBLIC_FUND_WALLET;
    const fundWallet = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(fundWalletSeed as string))
    );

    const dispenserAccount = await program.account.dispenser.fetch(dispenser);
    const merkleTree = dispenserAccount.tree.merkleTree;
    const treeAuthority = dispenserAccount.tree.authority;
    const metadata = metaplex.nfts().pdas().metadata({ mint: collectionMint });
    const masterEdition = metaplex
      .nfts()
      .pdas()
      .masterEdition({ mint: collectionMint });
    const collectionAuthorityRecord = metaplex
      .nfts()
      .pdas()
      .collectionAuthorityRecord({
        mint: collectionMint,
        collectionAuthority: dispenser,
      });

    const [bubblegumSigner] = PublicKey.findProgramAddressSync(
      [Buffer.from("collection_cpi", "utf8")],
      new PublicKey(BUBBLEGUM_PROGRAM_ID)
    );

    const mintTx = await program.methods
      .mint()
      .accounts({
        dispenser,
        payer: fundWallet.publicKey,
        treeAuthority,
        leafOwner: buyer,
        leafDelegate: buyer,
        merkleTree: merkleTree,
        authority: authority,
        treeDelegate: dispenser,
        collectionAuthorityRecordPda: collectionAuthorityRecord,
        collectionMint: collectionMint,
        collectionMetadata: metadata,
        editionAccount: masterEdition,
        bubblegumSigner,
        bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ADDRESS,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([fundWallet])
      .transaction();

    return mintTx;
  } catch (error) {
    throw error;
  }
};

export const GET = async (req: Request, context: { params: any }) => {
  try {
    const label = "cSOAP";
    const icon = "https://csoap.saicharanpogul.xyz/soap.png";
    return NextResponse.json({ label, icon }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};

export const POST = async (req: Request, context: any) => {
  try {
    const body = await req.json();

    const searchParams = new URLSearchParams(new URL(req.url).search);
    const authority = searchParams.get("authority");
    const collection = searchParams.get("collection");
    const { account } = body;
    console.log(account, collection, authority);
    if (!account || !collection || !authority)
      throw new Error("Missing account");
    const receiver = new PublicKey(account);
    let rpc = getUrls("devnet").rpc;
    if (NETWORK === "devnet") {
      rpc = getUrls("devnet").rpc;
    } else if (NETWORK === "localnet") {
      rpc = getUrls("localnet").rpc;
    } else {
      rpc = getUrls("mainnet-beta").rpc;
    }
    const connection = new Connection(rpc);
    const metaplex = Metaplex.make(connection);
    const collectionKey = new PublicKey(collection);
    const authorityKey = new PublicKey(authority);
    const mintTx = await mint({
      connection,
      authority: authorityKey,
      metaplex,
      collectionMint: collectionKey,
      buyer: receiver,
    });
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    mintTx.feePayer = receiver;
    mintTx.recentBlockhash = recentBlockhash;
    const serializedTx = mintTx.serialize({
      verifySignatures: false,
      requireAllSignatures: false,
    });
    const base64Tx = serializedTx.toString("base64");
    const message = "Thank You!";
    return NextResponse.json(
      { transaction: base64Tx, message },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
