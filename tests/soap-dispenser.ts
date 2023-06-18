import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SoapDispenser } from "../target/types/soap_dispenser";

describe("soap-dispenser", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SoapDispenser as Program<SoapDispenser>;

  it("", async () => {
    console.log(anchor.AnchorProvider.env().connection.rpcEndpoint);
  });
});
