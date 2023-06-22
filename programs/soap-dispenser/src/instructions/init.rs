use anchor_lang::prelude::*;
use anchor_spl::{token::Token, associated_token::AssociatedToken};
use mpl_bubblegum::{
    program::Bubblegum,
    state::{
        metaplex_anchor::MplTokenMetadata
    }};
use solana_program::program::{invoke_signed, invoke};
use spl_account_compression::{Noop, program::SplAccountCompression};
use crate::{states::{Dispenser, Tree}, constants::{
    DISPENSER_PREFIX,
    CREATE_TREE_DISCRIMINATOR
}};

#[derive(Accounts)]
pub struct InitDispenser<'info> {
    #[account(
        seeds=[
            DISPENSER_PREFIX,
            authority.key().as_ref(),
            collection_mint.key().as_ref(),
        ],
        bump,
        init,
        payer=authority,
        space=Dispenser::space(&1), // TODO: Support multiple merkle trees
    )]
    pub dispenser: Box<Account<'info, Dispenser>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Metaplex will check this
    #[account(mut)]
    pub collection_mint: UncheckedAccount<'info>,
    /// CHECK: Metaplex will check this
    #[account(mut)]
    pub collection_authority_record: UncheckedAccount<'info>,
    /// CHECK: Metaplex will check this
    #[account(mut)]
    pub collection_metadata: UncheckedAccount<'info>,
    /// CHECK: This account must be all zeros
    #[account(mut)]
    pub tree_authority: UncheckedAccount<'info>,
    /// CHECK: This account must be all zeros
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub bubblegum_program: Program<'info, Bubblegum>,
    pub token_metadata_program: Program<'info, MplTokenMetadata>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
}

pub fn init_handler(
    ctx: Context<InitDispenser>,
    max_depth: u32,
    max_buffer_size: u32,
    public: Option<bool>,
    start_date: Option<u64>,
    end_date: Option<u64>,
) -> Result<()> {

    invoke(&mpl_token_metadata::instruction::approve_collection_authority(
        ctx.accounts.token_metadata_program.key(),
        ctx.accounts.collection_authority_record.key(),
        ctx.accounts.dispenser.key(),
        ctx.accounts.authority.key(),
        ctx.accounts.authority.key(),
        ctx.accounts.collection_metadata.key(),
        ctx.accounts.collection_mint.key(),
    ), &[
        ctx.accounts.token_metadata_program.to_account_info(),
        ctx.accounts.collection_authority_record.to_account_info(),
        ctx.accounts.dispenser.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.collection_metadata.to_account_info(),
        ctx.accounts.collection_mint.to_account_info()
    ])?;

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

    match public {
        Option::Some(ref is_public) => {
            data.push(1);
            data.push(is_public.to_owned() as u8);
        }
        Option::None => data.push(0),
    }
    
    let account_infos: Vec<AccountInfo> = vec![
        ctx.accounts.tree_authority.to_account_info(),
        ctx.accounts.merkle_tree.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.dispenser.to_account_info(),
        ctx.accounts.log_wrapper.to_account_info(),
        ctx.accounts.compression_program.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
    ];

    let seeds = &[
            &DISPENSER_PREFIX[..],
            ctx.accounts.authority.key.as_ref(),
            ctx.accounts.collection_mint.key.as_ref(),
            &[*ctx.bumps.get("dispenser").unwrap()],
        ];
    invoke_signed(
        & solana_program::instruction::Instruction {
            program_id: cpi_program,
            accounts: cpi_accounts,
            data,
        },
        &account_infos[..],
        &[&seeds[..]]
    )?;

    let dispenser = &mut ctx.accounts.dispenser;

    dispenser.creator = ctx.accounts.authority.key();
    dispenser.collection_mint = ctx.accounts.collection_mint.key();

    match start_date {
        Option::Some(ref _start_date) => {
            dispenser.start_date = Some(*_start_date as i64);
        }
        Option::None => {}
    }
    match end_date {
        Option::Some(ref _end_date) => {
            dispenser.end_date = Some(*_end_date as i64);
        }
        Option::None => {}
    }

    // TODO: Support multiple merkle trees
    dispenser.tree = Tree {
        merkle_tree: ctx.accounts.merkle_tree.key(),
        authority: ctx.accounts.tree_authority.key(),
    };

    Ok(())
}