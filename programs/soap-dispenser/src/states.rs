use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct Tree {
    // merkle tree address
    pub merkle_tree: Pubkey,
    // merkle tree authroity
    pub authority: Pubkey,
}

#[account]
pub struct Dispenser {
    // creator of the dispenser
    pub creator: Pubkey,
    // collection mint address
    pub collection_mint: Pubkey,
    // start date
    pub start_date: Option<i64>,
    // end data
    pub end_date: Option<i64>,
    // TODO: Support multiple merkle trees
    // pub tree: Vec<Tree>,
    pub tree: Tree,
}

impl Dispenser {
    pub fn space(size: &u8) -> usize {
        8 + // discriminator
        32 + // creator
        32 + // collection mint
        1 + 8 + // OPTION: start date
        1 + 8 + // OPTION: end date
        4 + (*size as usize) * std::mem::size_of::<Tree>() // VEC: merkle tree
    }
}

#[account]
pub struct Pot {}