import { NETWORK, getUrls } from "@/utils";
import { SoapDispenserProgram } from "@/utils/programs";
import { Metaplex } from "@metaplex-foundation/js";
import {
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { NextResponse } from "next/server";

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

export const POST = async (req: Request, context: { params: any }) => {
  try {
    const body = await req.json();
    const { account } = body;
    if (!account) throw new Error("Missing account");
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
    // const soapDispenser = new SoapDispenserProgram();
    // const collection = new PublicKey("");
    // const authority = new PublicKey("");
    // soapDispenser.mint({
    //   authority,
    //   metaplex,
    //   collectionMint: new PublicKey(""),
    //   buyer: receiver,
    //   metadataArgs: {
    //     name: "First cNFT",
    //     symbol: "cNFT",
    //     uri: "https://arweave.net/mo4NBHmhuCt9ZjJ6jykMgKw-te0uTdgDBkBjVAJ-v20",
    //     sellerFeeBasisPoints: 500,
    //     primarySaleHappened: false,
    //     isMutable: true,
    //     creators: [
    //       {
    //         address: authority,
    //         share: 100,
    //         verified: false,
    //       },
    //     ],
    //     collection: {
    //       key: collection,
    //       verified: false,
    //     },
    //     editionNonce: null,
    //     tokenProgramVersion: TokenProgramVersion.Original,
    //     tokenStandard: TokenStandard.NonFungible,
    //     uses: null,
    //   },
    // });

    const tx = new Transaction();
    const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.add(
      SystemProgram.transfer({
        fromPubkey: receiver,
        toPubkey: new PublicKey("9AVW984UWLEZzvJQ9jYy8jLQ9eU9vyrtk8xcNUQSE5Mr"),
        lamports: 0.05 * LAMPORTS_PER_SOL,
      })
    );
    tx.feePayer = receiver;
    tx.recentBlockhash = recentBlockhash;
    const serializedTx = tx.serialize({
      verifySignatures: false,
      requireAllSignatures: false,
    });
    const base64Tx = serializedTx.toString("base64");
    const message = "Thank you for your Transfer";
    return NextResponse.json(
      { transaction: base64Tx, message },
      {
        status: 200,
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
