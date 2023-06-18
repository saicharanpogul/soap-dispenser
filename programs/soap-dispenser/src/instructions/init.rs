use anchor_lang::prelude::*;
use anchor_spl::{token::Token, associated_token::AssociatedToken};
use mpl_bubblegum::{
    state::{
        TreeConfig, 
        TREE_AUTHORITY_SIZE
    }, program::Bubblegum};
use solana_program::program::invoke_signed;
use spl_account_compression::{Noop, program::SplAccountCompression};
use crate::{states::{Dispenser, Tree}, constants::{
    DISPENSER_PREFIX,
    CREATE_TREE_DISCRIMINATOR
}};

#[derive(Accounts)]
// #[instruction(number_of_trees: u8)]
pub struct InitDispenser<'info> {
    #[account(
        seeds=[
            DISPENSER_PREFIX,
            authority.key().as_ref(),
        ],
        bump,
        init,
        payer=authority,
        space=Dispenser::space(&1), // TODO: Support multiple merkle trees
    )]
    pub dispenser: Box<Account<'info, Dispenser>>,
    #[account(mut)]
    authority: Signer<'info>,
    #[account(mut)]
    collection_mint: Signer<'info>,
    #[account(
        init,
        seeds = [merkle_tree.key().as_ref()],
        payer = authority,
        space = TREE_AUTHORITY_SIZE,
        bump,
    )]
    pub tree_authority: Account<'info, TreeConfig>,
    #[account(zero)]
    /// CHECK: This account must be all zeros
    pub merkle_tree: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub bubblegum_program: Program<'info, Bubblegum>,
    /// CHECK: Metaplex will check this
    pub token_metadata_program: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
}

pub fn init_handler(
    ctx: Context<InitDispenser>,
    // number_of_trees: u8,
    max_depth: u32,
    max_buffer_size: u32,
    public: Option<bool>,
    start_date: Option<i64>,
    end_date: Option<i64>,
) -> Result<()> {

    let cpi_program = ctx.accounts.bubblegum_program.key();
    let cpi_accounts: Vec<AccountMeta> = vec![
        AccountMeta::new(ctx.accounts.tree_authority.key(), false),
        AccountMeta::new(ctx.accounts.merkle_tree.key(), false),
        AccountMeta::new(ctx.accounts.authority.key(), true),
        AccountMeta::new_readonly(ctx.accounts.dispenser.key(), true),
        AccountMeta::new_readonly(ctx.accounts.log_wrapper.key(), false),
        AccountMeta::new_readonly(ctx.accounts.compression_program.key(), false),
        AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
    ];

    let mut data: Vec<u8> = vec![];
    data.extend(CREATE_TREE_DISCRIMINATOR);
    data.extend(max_depth.to_le_bytes());
    data.extend(max_buffer_size.to_le_bytes());
    data.extend(std::iter::once(public.unwrap() as u8));

    let account_infos: Vec<AccountInfo> = vec![
        ctx.accounts.tree_authority.to_account_info(),
        ctx.accounts.merkle_tree.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.dispenser.to_account_info(),
        ctx.accounts.log_wrapper.to_account_info(),
        ctx.accounts.compression_program.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
    ];

    invoke_signed(
        & solana_program::instruction::Instruction {
            program_id: cpi_program,
            accounts: cpi_accounts,
            data,
        },
        &account_infos[..],
        &[&[
            DISPENSER_PREFIX, &[*ctx.bumps.get("dispenser").unwrap()]
            ]]
    )?;

    let dispenser = &mut ctx.accounts.dispenser;

    dispenser.creator = ctx.accounts.authority.key();
    dispenser.collection_mint = ctx.accounts.collection_mint.key();
    dispenser.start_date = Some(start_date.unwrap());
    dispenser.end_date = Some(end_date.unwrap());

    // TODO: Support multiple merkle trees
    dispenser.tree = Tree {
        merkle_tree: ctx.accounts.merkle_tree.key(),
        authority: ctx.accounts.tree_authority.key(),
    };

    // CpiContext::new_with_signer(
    //     ctx.accounts.bubblegum_program.to_account_info(), [
    //     ctx.accounts.tree_authority.to_account_info(),
    //     ctx.accounts.merkle_tree.to_account_info(),
    //     ctx.accounts.authority.to_account_info(),
    //     ctx.accounts.dispenser.to_account_info(),
    //     ctx.accounts.log_wrapper.to_account_info(),
    //     ctx.accounts.compression_program.to_account_info(),
    //     ctx.accounts.system_program.to_account_info(),
    // ], &[&[
    //     DISPENSER, 
    //     ctx.accounts.dispenser.key().as_ref(), 
    //     &[*ctx.bumps.get("dispenser").unwrap()]
    //     ]])?;

    // bubblegum::create_tree(ctx, max_depth, max_buffer_size, public)?;
    Ok(())
}