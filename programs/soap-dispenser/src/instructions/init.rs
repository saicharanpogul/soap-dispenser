use anchor_lang::prelude::*;
use anchor_spl::{token::Token, associated_token::AssociatedToken};

use crate::{states::Dispenser, constants::DISPENSER, utils::create_collection};

#[derive(Accounts)]
#[instruction(number_of_trees: u8)]
pub struct InitDispenser<'info> {
    #[account(
        seeds=[
            DISPENSER,
            authority.key().as_ref(),
        ],
        bump,
        init,
        payer=authority,
        space=Dispenser::space(&number_of_trees),
    )]
    pub dispenser: Box<Account<'info, Dispenser>>,
    #[account(mut)]
    authority: Signer<'info>,
    #[account(mut)]
    collection_mint: Signer<'info>,
    /// CHECK: Metaplex will check this
    #[account(mut)]
    collection_metadata: UncheckedAccount<'info>,
    /// CHECK: Metaplex will check this
    #[account(mut)]
    collection_master_edition: UncheckedAccount<'info>,
    /// CHECK: Metaplex will check this
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    associated_token_program: Program<'info, AssociatedToken>,
    /// CHECK: Metaplex will check this
    token_metadata_program: UncheckedAccount<'info>,
}

pub fn init_handler(
    ctx: Context<InitDispenser>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {

    create_collection(
        name,
        symbol,
        uri,
        ctx.accounts.collection_mint.clone(),
        ctx.accounts.collection_metadata.clone(),
        ctx.accounts.collection_master_edition.clone(),
        ctx.accounts.token_account.clone(),
        ctx.accounts.authority.clone(),
        ctx.accounts.authority.clone(),
        ctx.accounts.system_program.clone(),
        ctx.accounts.token_program.clone(),
        ctx.accounts.associated_token_program.clone(),
        ctx.accounts.token_metadata_program.clone(),
    )?;
    Ok(())
}