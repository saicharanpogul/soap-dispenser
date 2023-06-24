type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

interface CreatorsEntity {
  address: string;
  verified: boolean;
  share: number;
}

interface AttributesEntity {
  trait_type: string;
  value: string;
}

interface Properties {
  files?: FilesEntity[] | null;
  creators?: CreatorsEntity[] | null;
  category?: null;
}

interface FilesEntity {
  uri: string;
  type: string;
}

interface NFT {
  model: string;
  address: string;
  mintAddress: string;
  updateAuthorityAddress: string;
  json?: null;
  jsonLoaded: boolean;
  name: string;
  symbol: string;
  uri: string;
  isMutable: boolean;
  primarySaleHappened: boolean;
  sellerFeeBasisPoints: number;
  editionNonce: number;
  creators?: CreatorsEntity[] | null;
  tokenStandard: number;
  collection?: null;
  collectionDetails?: null;
  uses?: null;
}

interface Metadata {
  name: string;
  symbol: string;
  description: string;
  seller_fee_basis_points: number;
  image: string;
  attributes?: AttributesEntity[] | null;
  properties: Properties;
}

interface CustomAttribute {
  trait_type?: string;
  value?: string;
}

interface CustomCreator {
  address?: string;
  share?: number;
}

type Payload = { signature: string; publicKey: string };

type Signer = {
  publicKey: PublicKey;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
};

interface ExternalMetadata {
  metadata: {
    description: string;
    totalStreams: number;
    name: string;
    symbol: string;
    imageUri: string;
    metadataUri: string;
    contentUri: string;
    mint: string;
  };
}
