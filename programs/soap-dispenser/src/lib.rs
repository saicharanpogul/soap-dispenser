pub mod constants;
pub mod error;
pub mod instructions;
pub mod states;
pub mod utils;

use {anchor_lang::prelude::*, instructions::*};
use crate::constants::MintArgs;

declare_id!("SDGQRX2DBX3qDNjEnEyryXFsGj2Sq6NXJd2SmZ3kfJ6");

#[program]
pub mod soap_dispenser {

    use super::*;

    pub fn init(
        ctx: Context<InitDispenser>,
        max_depth: u32,
        max_buffer_size: u32,
        public: Option<bool>,
        start_date: Option<u64>,
        end_date: Option<u64>,
    ) -> Result<()> {
        init::init_handler(
            ctx,
            max_depth,
            max_buffer_size,
            public,
            start_date,
            end_date
        )
    }

    pub fn fund_pot(ctx: Context<FundPot>, lamports: u64) -> Result<()> {
        fund_pot::fund_pot_handler(ctx, lamports)
    }

    pub fn mint(ctx: Context<Mint>, mint_args: MintArgs) -> Result<()> {
        mint::mint_handler(ctx, mint_args)
    }

    pub fn withdraw_pot(ctx: Context<WithdrawPot>, lamports: u64) -> Result<()> {
        withdraw_pot::withdraw_pot_handler(ctx, lamports)
    }
}