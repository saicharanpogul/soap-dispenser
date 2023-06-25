import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  MetadataArgs,
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ADDRESS } from "@metaplex-foundation/mpl-token-metadata";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  Workspace,
  connection,
  findDispenserPda,
  findPotPda,
  findTreeAuthorityPda,
  getAssetId,
  getTokenProgramVersion,
  getTokenStandard,
  network,
  sleep,
} from ".";
import { initializeKeypair } from "./initializeKeypair";
import { Network, getUrls } from "./networks";
import { WrapperConnection } from "./WrapperConnection";

export const mint = async ({
  authority,
  metaplex,
  collectionMint,
  buyer,
  payer,
}: {
  authority: Keypair;
  metaplex: Metaplex;
  collectionMint: PublicKey;
  buyer: PublicKey;
  payer: Keypair;
}) => {
  try {
    const { program, programId, provider, connection } = new Workspace(
      authority
    );

    const dispenser = findDispenserPda(authority.publicKey, collectionMint);
    const pot = findPotPda(authority.publicKey, dispenser, collectionMint);

    const dispenserAccount = await program.account.dispenser.fetch(dispenser);
    console.log(dispenserAccount);
    const merkleTree = dispenserAccount.tree.merkleTree;
    const treeAuthority = dispenserAccount.tree.authority;
    // const treeAuthority = findTreeAuthorityPda(merkleTree);
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
      BUBBLEGUM_PROGRAM_ID
    );
    const mintTx = await program.methods
      .mint()
      .accounts({
        dispenser,
        payer: payer.publicKey,
        treeAuthority,
        leafOwner: buyer,
        leafDelegate: buyer,
        merkleTree: merkleTree,
        authority: authority.publicKey,
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
      .signers([payer])
      .transaction();

    const sig = await sendAndConfirmTransaction(connection, mintTx, [payer], {
      commitment: "confirmed",
    });

    console.log("Mint:", getUrls(Network[network], sig, "tx").explorer);
  } catch (error) {
    throw error;
  }
};

const main = async () => {
  try {
    const authority = await initializeKeypair(connection, "soap_creator_1");
    const buyer = await initializeKeypair(connection, "buyer_1");
    const payer = await initializeKeypair(connection, "fund_wallet");
    const metaplex = Metaplex.make(connection).use(keypairIdentity(authority));
    const metadataArgs: MetadataArgs = {
      name: "First cNFT",
      symbol: "cNFT",
      uri: "https://arweave.net/mo4NBHmhuCt9ZjJ6jykMgKw-te0uTdgDBkBjVAJ-v20",
      sellerFeeBasisPoints: 500,
      primarySaleHappened: false,
      isMutable: true,
      creators: [
        {
          address: authority.publicKey,
          share: 100,
          verified: false,
        },
      ],
      collection: {
        key: new PublicKey(process.argv[2]),
        verified: false,
      },
      editionNonce: null,
      tokenProgramVersion: TokenProgramVersion.Original,
      tokenStandard: TokenStandard.NonFungible,
      uses: null,
    };
    await mint({
      authority,
      metaplex,
      buyer: buyer.publicKey,
      collectionMint: new PublicKey(process.argv[2]),
      payer,
    });
  } catch (error) {
    console.log(error);
  }
};

main();
