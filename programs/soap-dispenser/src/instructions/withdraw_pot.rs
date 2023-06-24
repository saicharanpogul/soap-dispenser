use crate::{states::{Dispenser, Pot}, error::SoapCode};

use {
    anchor_lang::{
        prelude::*,
    },
    crate::constants::POT_PREFIX,
    anchor_spl::token::ID as TOKEN_PROGRAM,
};


#[derive(Accounts)]
pub struct WithdrawPot<'info> {
    #[account(
        mut,
        seeds = [
            POT_PREFIX,
            authority.key().as_ref(),
            dispenser.key().as_ref(),
            collection_mint.key().as_ref()
        ],
        bump,
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

pub fn withdraw_pot_handler(ctx: Context<WithdrawPot>, lamports: u64) -> Result<()> {
    // More checks are needed and should be clearly written by check does account has to be closed or not if tired to remove rent exampt funds too!
    let pot_balance = **ctx.accounts.pot.to_account_info().lamports.borrow_mut();
    if pot_balance.le(&lamports) {
        return Err(SoapCode::InsufficientFundsInPot)?;
    }
    **ctx.accounts.pot.to_account_info().try_borrow_mut_lamports()? -= lamports;
    **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += lamports;
    msg!("Transfered {:?}", lamports);
    Ok(())
}