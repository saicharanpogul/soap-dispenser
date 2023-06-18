pub mod constants;
pub mod error;
pub mod instructions;
pub mod states;
pub mod utils;

use {anchor_lang::prelude::*, instructions::*};

declare_id!("SDGQRX2DBX3qDNjEnEyryXFsGj2Sq6NXJd2SmZ3kfJ6");

#[program]
pub mod soap_dispenser {
    use super::*;

    pub fn init(
        ctx: Context<InitDispenser>,
        _number_of_trees: u8,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        init::init_handler(ctx, name, symbol, uri)
    }

    pub fn fund_pot(ctx: Context<FundPot>, lamports: u64) -> Result<()> {
        fund_pot::fund_pot_handler(ctx, lamports)
    }

    pub fn withdraw_pot(ctx: Context<WithdrawPot>, lamports: u64) -> Result<()> {
        withdraw_pot::withdraw_pot_handler(ctx, lamports)
    }
}