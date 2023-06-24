import {
  BUBBLEGUM_PROGRAM_ID,
  DISPENSER_PREFIX,
  POT_PREFIX,
  SOAP_DISPENSER_PROGRAM_ID,
} from "@/constants";
import { IDL, SoapDispenser } from "@/types/soap_dispenser";
import { Idl, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

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
}
