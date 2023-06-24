import {
  BUBBLEGUM_PROGRAM_ID,
  DISPENSER_PREFIX,
  POT_PREFIX,
  SOAP_DISPENSER_PROGRAM_ID,
} from "@/constants";
import { IDL, SoapDispenser } from "@/types/soap_dispenser";
import { Idl, Program } from "@coral-xyz/anchor";
import { Metaplex } from "@metaplex-foundation/js";
import {
  MetadataArgs,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getTokenProgramVersion, getTokenStandard } from ".";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ADDRESS } from "@metaplex-foundation/mpl-token-metadata";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";

export class SoapDispenserProgram {
  programId = new PublicKey(SOAP_DISPENSER_PROGRAM_ID);
  program = new Program(
    IDL as Idl,
    this.programId
  ) as unknown as Program<SoapDispenser>;

  findDispenserPda = (authority: PublicKey, collectionMint: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [
        Buffer.from(DISPENSER_PREFIX),
        authority.toBuffer(),
        collectionMint.toBuffer(),
      ],
      this.programId
    )[0];

  findPotPda = (
    authority: PublicKey,
    dispenser: PublicKey,
    collectionMint: PublicKey
  ) =>
    PublicKey.findProgramAddressSync(
      [
        Buffer.from(POT_PREFIX),
        authority.toBuffer(),
        dispenser.toBuffer(),
        collectionMint.toBuffer(),
      ],
      this.programId
    )[0];

  findTreeAuthorityPda = (tree: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [tree.toBuffer()],
      new PublicKey(BUBBLEGUM_PROGRAM_ID)
    )[0];

  mint = async ({
    authority,
    metaplex,
    collectionMint,
    buyer,
    metadataArgs,
  }: {
    authority: PublicKey;
    metaplex: Metaplex;
    collectionMint: PublicKey;
    buyer: PublicKey;
    metadataArgs: MetadataArgs;
  }) => {
    try {
      const dispenser = this.findDispenserPda(authority, collectionMint);
      const pot = this.findPotPda(authority, dispenser, collectionMint);

      const dispenserAccount = await this.program.account.dispenser.fetch(
        dispenser
      );
      console.log(dispenserAccount);
      const merkleTree = dispenserAccount.tree.merkleTree;
      const treeAuthority = dispenserAccount.tree.authority;
      const metadata = metaplex
        .nfts()
        .pdas()
        .metadata({ mint: collectionMint });
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

      const creators = [
        metadataArgs.creators,
        {
          address: dispenser,
          share: 100,
          verified: true,
        },
      ];

      const mintTx = await this.program.methods
        // @ts-ignore
        .mint({
          metadata: {
            name: metadataArgs.name,
            symbol: metadataArgs.symbol,
            uri: metadataArgs.uri,
            sellerFeeBasisPoints: metadataArgs.sellerFeeBasisPoints,
            primarySaleHappened: metadataArgs.primarySaleHappened,
            isMutable: metadataArgs.isMutable,
            editionNonce: metadataArgs.editionNonce,
            tokenStandard: getTokenStandard(
              metadataArgs.tokenStandard as TokenStandard
            ),
            collection: {
              key: metadataArgs.collection?.key,
              verified: metadataArgs.collection?.verified,
            },
            uses: metadataArgs.uses,
            tokenProgramVersion: getTokenProgramVersion(
              metadataArgs.tokenProgramVersion
            ),
            creators: metadataArgs.creators,
          },
        })
        .accounts({
          dispenser,
          pot,
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
        .signers([])
        .transaction();

      return mintTx;
    } catch (error) {
      throw error;
    }
  };
}
