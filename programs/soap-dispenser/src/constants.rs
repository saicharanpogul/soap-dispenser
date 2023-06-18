use anchor_lang::constant;

#[constant]
pub const POT_PREFIX: &[u8] = b"pot";

#[constant]
pub const DISPENSER_PREFIX: &[u8] = b"dispenser";

#[constant]
pub const CREATE_TREE_DISCRIMINATOR: [u8; 8] = [165, 83, 136, 142, 89, 202, 47, 220];