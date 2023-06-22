
use crate::states::{Dispenser, Pot};

use {
    anchor_lang::{
        prelude::*,
        system_program::{Transfer, transfer},
    },
    crate::constants::POT_PREFIX,
    anchor_spl::token::ID as TOKEN_PROGRAM,
};


#[derive(Accounts)]
pub struct FundPot<'info> {
    #[account(
        init_if_needed,
        seeds = [
            POT_PREFIX,
            authority.key().as_ref(),
            dispenser.key().as_ref(),
            collection_mint.key().as_ref()
        ],
        bump,
        payer = authority,
        space = 8,
    )]
    pub pot: Account<'info, Pot>,
    pub dispenser: Account<'info, Dispenser>,
    /// CHECK: Metaplex will check this
    #[account(
        mut,
        owner = TOKEN_PROGRAM,
        constraint = dispenser.collection_mint.key() == collection_mint.key()
    )]
    pub collection_mint: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn fund_pot_handler(ctx: Context<FundPot>, lamports: u64) -> Result<()> {
    let cpi_program = ctx.accounts.system_program.to_account_info();
    let cpi_accounts = Transfer {
        from: ctx.accounts.authority.to_account_info(),
        to: ctx.accounts.pot.to_account_info(),
    };

    // fund the pot by authority
    transfer(CpiContext::new(cpi_program, cpi_accounts), lamports)?;
    Ok(())
}