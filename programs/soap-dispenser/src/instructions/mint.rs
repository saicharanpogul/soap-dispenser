use anchor_lang::prelude::*;
use anchor_spl::{token::Token, associated_token::AssociatedToken};
use mpl_bubblegum::{
    program::Bubblegum,
    state::{
        metaplex_anchor::{MplTokenMetadata, TokenMetadata}, TreeConfig,
        COLLECTION_CPI_PREFIX
    }};
use spl_account_compression::{Noop, program::SplAccountCompression};
use crate::{states::{Dispenser, Tree}, constants::{
    DISPENSER_PREFIX,
}};

#[derive(Accounts)]
pub struct Mint<'info> {
    #[account(
        seeds=[
            DISPENSER_PREFIX,
            authority.key().as_ref(),
            collection_mint.key().as_ref(),
        ],
        bump,
    )]
    pub dispenser: Box<Account<'info, Dispenser>>,
    #[account(mut)]
    authority: Signer<'info>,
    #[account(
        mut,
        seeds = [merkle_tree.key().as_ref()],
        bump,
    )]
    pub tree_authority: Account<'info, TreeConfig>,
    /// CHECK: This account is neither written to nor read from.
    pub leaf_owner: AccountInfo<'info>,
    /// CHECK: This account is neither written to nor read from.
    pub leaf_delegate: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: unsafe
    pub merkle_tree: UncheckedAccount<'info>,
    pub payer: Signer<'info>,
    pub tree_delegate: Signer<'info>,
    pub collection_authority: Signer<'info>,
    /// CHECK: Optional collection authority record PDA.
    /// If there is no collecton authority record PDA then
    /// this must be the Bubblegum program address.
    pub collection_authority_record_pda: UncheckedAccount<'info>,
    /// CHECK: This account is checked in the instruction
    pub collection_mint: UncheckedAccount<'info>,
    #[account(mut)]
    pub collection_metadata: Box<Account<'info, TokenMetadata>>,
    /// CHECK: This account is checked in the instruction
    pub edition_account: UncheckedAccount<'info>,
    /// CHECK: This is just used as a signing PDA.
    #[account(
        seeds = [COLLECTION_CPI_PREFIX.as_ref()],
        bump,
    )]
    pub bubblegum_signer: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub token_metadata_program: Program<'info, MplTokenMetadata>,
    pub system_program: Program<'info, System>,
}

pub fn mint_handler(ctx: Context<Mint>) -> Result<()> {
    Ok(())
}