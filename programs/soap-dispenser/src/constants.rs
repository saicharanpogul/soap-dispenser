use anchor_lang::prelude::*;
use mpl_bubblegum::state::metaplex_adapter::{MetadataArgs, TokenStandard, Creator, TokenProgramVersion, UseMethod, Uses, Collection};

#[constant]
pub const POT_PREFIX: &[u8] = b"pot";

#[constant]
pub const DISPENSER_PREFIX: &[u8] = b"dispenser";

#[constant]
pub const CREATE_TREE_DISCRIMINATOR: [u8; 8] = [165, 83, 136, 142, 89, 202, 47, 220];

#[constant]
pub const MINT_TO_COLLECTION_V1_DISCRIMINATOR: [u8; 8] = [153, 18, 178, 47, 197, 158, 86, 15];

#[constant]
pub const MAX_NAME_LENGTH: usize = 32;

#[constant]
pub const MAX_SYMBOL_LENGTH: usize = 10;

#[constant]
pub const MAX_URI_LENGTH: usize = 200;

#[constant]
pub const MAX_SOAP_DETAILS_SIZE: usize = 4 
    + MAX_NAME_LENGTH
    + 4
    + MAX_SYMBOL_LENGTH
    + 4
    + MAX_URI_LENGTH
    + 2;

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct SDCreator {
    pub address: Pubkey,
    pub verified: bool,
    // In percentages, NOT basis points ;) Watch out!
    pub share: u8,
}

impl From<SDCreator> for Creator {
    fn from(sd_creator: SDCreator) -> Self {
        Creator { 
            address: sd_creator.address,
            verified: sd_creator.verified,
            share: sd_creator.share
        }
    }
}

impl SDCreator {
    pub fn adapt(&self) -> mpl_token_metadata::state::Creator {
        mpl_token_metadata::state::Creator {
            address: self.address,
            verified: self.verified,
            share: self.share,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub enum SDTokenProgramVersion {
    Original,
    Token2022,
}

impl From<SDTokenProgramVersion> for TokenProgramVersion {
    fn from(sd_token_program_version: SDTokenProgramVersion) -> Self {
        match sd_token_program_version {
            SDTokenProgramVersion::Original => TokenProgramVersion::Original,
            SDTokenProgramVersion::Token2022 => TokenProgramVersion::Token2022
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub enum SDUseMethod {
    Burn,
    Multiple,
    Single,
}

impl From<SDUseMethod> for UseMethod {
    fn from(sd_use_method: SDUseMethod) -> Self {
        match sd_use_method {
            SDUseMethod::Burn => UseMethod::Burn,
            SDUseMethod::Multiple => UseMethod::Multiple,
            SDUseMethod::Single => UseMethod::Single
        }
    } 
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct SDUses {
    // 17 bytes + Option byte
    pub use_method: SDUseMethod, //1
    pub remaining: u64,        //8
    pub total: u64,            //8
}

impl From<SDUses> for Uses {
    fn from(sd_uses: SDUses) -> Self {
        Uses {
            use_method: sd_uses.use_method.into(),
            remaining: sd_uses.remaining,
            total: sd_uses.total
        }
    }
}

impl SDUses {
    pub fn adapt(&self) -> mpl_token_metadata::state::Uses {
        mpl_token_metadata::state::Uses {
            use_method: match self.use_method {
                SDUseMethod::Burn => mpl_token_metadata::state::UseMethod::Burn,
                SDUseMethod::Multiple => mpl_token_metadata::state::UseMethod::Multiple,
                SDUseMethod::Single => mpl_token_metadata::state::UseMethod::Single,
            },
            remaining: self.remaining,
            total: self.total,
        }
    }
}

#[repr(C)]
#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct SDCollection {
    pub verified: bool,
    pub key: Pubkey,
}

impl From<SDCollection> for Collection {
    fn from(sd_collection: SDCollection) -> Self {
        Collection { 
            verified: sd_collection.verified,
            key: sd_collection.key
        }
    }
}

impl SDCollection {
    pub fn adapt(&self) -> SDCollection {
        SDCollection {
            verified: self.verified,
            key: self.key,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub enum SDTokenStandard {
    NonFungible,        // This is a master edition
    FungibleAsset,      // A token with metadata that can also have attributes
    Fungible,           // A token with simple metadata
    NonFungibleEdition, // This is a limited edition
}

impl From<SDTokenStandard> for TokenStandard {
    fn from(sd_token_standard: SDTokenStandard) -> Self {
        match sd_token_standard {
            SDTokenStandard::NonFungible => TokenStandard::NonFungible,
            SDTokenStandard::FungibleAsset => TokenStandard::FungibleAsset,
            SDTokenStandard::Fungible => TokenStandard::Fungible,
            SDTokenStandard::NonFungibleEdition => TokenStandard::NonFungibleEdition,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct SDMetadataArgs {
     /// The name of the asset
     pub name: String,
     /// The symbol for the asset
     pub symbol: String,
     /// URI pointing to JSON representing the asset
     pub uri: String,
     /// Royalty basis points that goes to creators in secondary sales (0-10000)
     pub seller_fee_basis_points: u16,
     // Immutable, once flipped, all sales of this metadata are considered secondary.
     pub primary_sale_happened: bool,
     // Whether or not the data struct is mutable, default is not
     pub is_mutable: bool,
     /// nonce for easy calculation of editions, if present
     pub edition_nonce: Option<u8>,
     /// Since we cannot easily change Metadata, we add the new DataV2 fields here at the end.
     pub token_standard: Option<SDTokenStandard>,
     /// Collection
     pub collection: Option<SDCollection>,
     /// Uses
     pub uses: Option<SDUses>,
     pub token_program_version: SDTokenProgramVersion,
     pub creators: Vec<SDCreator>,
}

impl From<SDMetadataArgs> for MetadataArgs {
    fn from(sd_metadata_args: SDMetadataArgs) -> Self {
        let creators: Vec<Creator> = sd_metadata_args.creators.into_iter().map(|sd_creator| sd_creator.into()).collect();
        MetadataArgs {
            name: sd_metadata_args.name,
            symbol: sd_metadata_args.symbol,
            uri: sd_metadata_args.uri,
            seller_fee_basis_points: sd_metadata_args.seller_fee_basis_points,
            is_mutable: sd_metadata_args.is_mutable,
            primary_sale_happened: sd_metadata_args
                .primary_sale_happened,
            edition_nonce: sd_metadata_args.edition_nonce,
            collection: Some(Collection::from(sd_metadata_args.collection.unwrap())),
            uses: Some(Uses::from(sd_metadata_args.uses.unwrap())),
            token_standard: Some(TokenStandard::from(sd_metadata_args.token_standard.unwrap())),
            token_program_version: TokenProgramVersion::from(sd_metadata_args.token_program_version),
            creators,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct MintArgs {
    pub metadata: SDMetadataArgs
}