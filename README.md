# Soap Dispenser

Soap Dispenser Program: [sdp7bhcJ2TmGuHVqYNYFXLdSCNtqBu8heVoyYavkpyb](https://explorer.solana.com/address/sdp7bhcJ2TmGuHVqYNYFXLdSCNtqBu8heVoyYavkpyb?cluster=devnet)

Demo: [cSoap](https://csoap.saicharanpogul.xyz)

## Create Dispenser

- Add Collection Details

![createCollection](/app/public/createCollection.png)

Add Collection NFT Details which will be used as a Collection NFT for all the SOAPs being mint using created dispenser.

> ### Potential Improvements

1. Support Attributes.
2. Support existing Collection NFT.
3. Support Assets URL Upload/Use NFT Storage (Current use of Bundlr causes multiple wallet popups for approvals).

- Add Config

![config](/app/public/config.png)

Add Tree and SOAP NFT Config details. Choose the `Max Depth` & `Max Buffer Size` based on number of mints required and price. And also be sure to consider the composability level of the selected option ([check here](https://compressed.app/)).

> ### Potential Improvements

1. Support Start & End Date on UI (Included in program & tests).
2. Support Multiple Trees in case of large collection.
3. Support SOAP NFT Attributes.
4. Support Assets URL Upload/Use NFT Storage (Current use of Bundlr causes multiple wallet popups for approvals).
5. Support optional free mint. Currently free mint is enforced on the program by transferring required fund from dispenser creator for mint txs. Solana Pay doesn't support message signing ([issue#152](https://github.com/solana-labs/solana-pay/issues/152)) so to add wallet account as signer an dummy instruction is added ([check here](https://github.com/saicharanpogul/soap-dispenser/blob/48735538c0e3c3532c9a63b79d2795fe966d2314/app/src/app/api/mint/route.ts#L184))

- Review

![review](/app/public/review.png)

Review all the added details and send the transaction.

> ### Potential Improvements

1. As mentioned in create collection and config steps due to Bundlr assets upload in total of 7 wallet popups are required to be approved by the creator. It can be improved by implementing above mentioned improvements.
2. Support exact total cost info.

## Mint SOAP

- Dashboard

![dashboard](/app/public/dashboard.png)

Lists all the dispensers created by the connected wallet.

- Shareable QR

![scan](/app/public/scan.png)

This page can be shared or presented any any event. Anyone can scan thr QR and mint he compressed SOAP for free!

## Resources:

- Solana Compressed NFTs - [Docs](https://docs.solana.com/de/developing/guides/compressed-nfts)
- Solana Pay - [Docs](https://docs.solanapay.com/)
- Solana Pay Demo by SolAndy - [GitHub](https://github.com/loopcreativeandy/solana-pay-demo)
- Other Solana Metaplex Docs.
