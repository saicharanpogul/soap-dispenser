use anchor_lang::prelude::*;
use mpl_bubblegum::{
    program::Bubblegum,
    state::{
        metaplex_anchor::{MplTokenMetadata, TokenMetadata}, TreeConfig,
        COLLECTION_CPI_PREFIX, metaplex_adapter::{MetadataArgs, TokenStandard, Collection, Uses, TokenProgramVersion, Creator},
    }};
use spl_account_compression::{Noop, program::SplAccountCompression};
use crate::{states::{Dispenser, Pot}, constants::{DISPENSER_PREFIX, POT_PREFIX, MintArgs, SDTokenProgramVersion}, error::SoapCode};

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
    #[account(
        mut,
        seeds = [merkle_tree.key().as_ref()],
        bump,
        seeds::program = bubblegum_program.key()
    )]
    pub tree_authority: Account<'info, TreeConfig>,
    /// CHECK: This account is neither written to nor read from.
    pub leaf_owner: AccountInfo<'info>,
    /// CHECK: This account is neither written to nor read from.
    pub leaf_delegate: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: unsafe
    pub merkle_tree: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: SystemAccount<'info>,
    /// CHECK: This account is neither written to nor read from.
    pub tree_delegate: UncheckedAccount<'info>,
    // /// CHECK: This account is neither written to nor read from.
    // pub collection_authority: UncheckedAccount<'info>,
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
        seeds::program = bubblegum_program.key()
    )]
    pub bubblegum_signer: UncheckedAccount<'info>,
    pub bubblegum_program: Program<'info, Bubblegum>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub token_metadata_program: Program<'info, MplTokenMetadata>,
    pub system_program: Program<'info, System>,
}

pub fn mint_handler(ctx: Context<Mint>, mint_args: MintArgs) -> Result<()> {
    msg!("{:?}", mint_args);
    
    let rent: u64 = 5000;
    let pot_balance = **ctx.accounts.pot.to_account_info().lamports.borrow_mut();

    // check if pot has enough funds to transfer back the rent
    if pot_balance.le(&(rent + 946560)) {
        return Err(SoapCode::InsufficientFundsInPot)?;
    }

    let clock = Clock::get()?;

    let current_unix_timestamp = clock.unix_timestamp;

    // check if mint is invoked before start date

    match ctx.accounts.dispenser.start_date {
        Some(s_d) => if current_unix_timestamp.le(&s_d) {
            return Err(SoapCode::MintNotStarted)?;
        }
        None => {}
    }

    // check if mint is invoked after end date
    match  ctx.accounts.dispenser.end_date {
        Some(e_d) => if current_unix_timestamp.ge(&e_d) {
            return Err(SoapCode::MintEnded)?;
        }
        None => {}
    }

    let cpi_accounts = mpl_bubblegum::cpi::accounts::MintToCollectionV1 {
        tree_authority: ctx.accounts.tree_authority.to_account_info(),
        leaf_owner: ctx.accounts.leaf_owner.to_account_info(),
        leaf_delegate: ctx.accounts.leaf_delegate.to_account_info(),
        merkle_tree:  ctx.accounts.merkle_tree.to_account_info(),
        payer: ctx.accounts.pot.to_account_info(),
        tree_delegate: ctx.accounts.dispenser.to_account_info(),
        collection_authority: ctx.accounts.dispenser.to_account_info(),
        collection_authority_record_pda: ctx.accounts.collection_authority_record_pda.to_account_info(),
        collection_mint: ctx.accounts.collection_mint.to_account_info(),
        collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
        edition_account: ctx.accounts.edition_account.to_account_info(),
        bubblegum_signer: ctx.accounts.bubblegum_signer.to_account_info(),
        log_wrapper: ctx.accounts.log_wrapper.to_account_info(),
        compression_program: ctx.accounts.compression_program.to_account_info(),
        token_metadata_program: ctx.accounts.token_metadata_program.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
    };


    let dispenser = ctx.accounts.dispenser.key();

    let pot_seeds = &[
        &POT_PREFIX[..],
        ctx.accounts.authority.key.as_ref(),
        dispenser.as_ref(),
        ctx.accounts.collection_mint.key.as_ref(),
        &[*ctx.bumps.get("pot").unwrap()],
    ];

    let dispenser_seeds = &[
        &DISPENSER_PREFIX[..],
        ctx.accounts.authority.key.as_ref(),
        ctx.accounts.collection_mint.key.as_ref(),
        &[*ctx.bumps.get("dispenser").unwrap()],
    ];

    let uses: Option<Uses>;
    if mint_args.metadata.uses.is_some() {
        uses = Some(Uses::from(mint_args.metadata.uses.unwrap()));
    } else {
        uses = None;
    }
    
    let collection: Option<Collection>;
    if mint_args.metadata.collection.is_some() {
        collection = Some(Collection::from(mint_args.metadata.collection.unwrap()))
    } else {
        collection = None;
    }

    let token_standard: Option<TokenStandard>;
    match mint_args.metadata.token_standard {
        Some(tstd) =>
        token_standard = Some(TokenStandard::from(tstd)),
        None => token_standard = None
    }

    let token_program_version: TokenProgramVersion;
    match mint_args.metadata.token_program_version {
        SDTokenProgramVersion::Original =>
        token_program_version = TokenProgramVersion::Original,
        SDTokenProgramVersion::Token2022 => token_program_version = TokenProgramVersion::Token2022
    };

    let creators: Vec<Creator> = mint_args.metadata.creators.into_iter().map(|sd_creator| sd_creator.into()).collect();
    
    mpl_bubblegum::cpi::mint_to_collection_v1(CpiContext::new_with_signer(
        ctx.accounts.bubblegum_program.to_account_info(),
        cpi_accounts,
        &[&pot_seeds[..], &dispenser_seeds[..]]
    ), MetadataArgs { 
        name: mint_args.metadata.name,
        symbol: mint_args.metadata.symbol,
        uri: mint_args.metadata.uri,
        seller_fee_basis_points: mint_args.metadata.seller_fee_basis_points,
        primary_sale_happened: mint_args.metadata.primary_sale_happened,
        is_mutable: mint_args.metadata.is_mutable,
        edition_nonce: mint_args.metadata.edition_nonce,
        token_standard,
        collection,
        uses,
        token_program_version,
        creators,
    })?;

    **ctx.accounts.pot.to_account_info().try_borrow_mut_lamports()? -= rent;
    **ctx.accounts.leaf_owner.to_account_info().try_borrow_mut_lamports()? += rent;
    msg!("Transfered {:?}", rent);
    Ok(())
}