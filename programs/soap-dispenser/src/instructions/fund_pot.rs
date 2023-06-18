
use crate::states::Dispenser;

use {
    anchor_lang::{
        prelude::*,
        system_program::{Transfer, transfer},
    },
    crate::constants::POT_PREFIX,
    
};


#[derive(Accounts)]
pub struct FundPot<'info> {
    #[account(
        mut,
        seeds = [
            POT_PREFIX,
            dispenser.key().as_ref(),
            authority.key().as_ref(),
        ],
        bump,
    )]
    pub pot: SystemAccount<'info>,
    pub dispenser: Account<'info, Dispenser>,
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