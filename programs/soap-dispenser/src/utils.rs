use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke},
    system_program,
};
use anchor_spl::token::Mint;
use mpl_token_metadata::{
    instruction::{
        create_master_edition_v3,
        create_metadata_accounts_v3,
        sign_metadata,
    },
    state::Creator,
};
use anchor_spl::{
    token,
    associated_token
};

pub fn create_collection<'info>(
    name: String,
    symbol: String,
    uri: String,
    mint: Signer<'info>,
    metadata: UncheckedAccount<'info>,
    master_edition: UncheckedAccount<'info>,
    token_account: UncheckedAccount<'info>,
    payer: Signer<'info>,
    update_authority: Signer<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, token::Token>,
    associated_token_program: Program<'info, associated_token::AssociatedToken>,
    token_metadata_program: UncheckedAccount<'info>,
) -> Result<()> {
        // create account
        system_program::create_account(
            CpiContext::new(
                token_program.to_account_info(),
                system_program::CreateAccount {
                    from: payer.to_account_info(),
                    to: mint.to_account_info(),
                }
            ), 1461600, Mint::LEN.try_into().unwrap(), &token_program.key())?;

            // initialize mint
            token::initialize_mint2(
                CpiContext::new(
                    token_program.to_account_info(), 
                    token::InitializeMint2 {
                        mint: mint.to_account_info(),
                    }
                ),
                0,
                &payer.key(),
                Some(&payer.key())
            )?;

            // create associated token account
            associated_token::create(
                CpiContext::new(
                    associated_token_program.to_account_info(),
                    associated_token::Create { 
                        payer: payer.to_account_info(),
                        associated_token: token_account.to_account_info(),
                        authority: payer.to_account_info(),
                        mint: mint.to_account_info(),
                        system_program: system_program.to_account_info(),
                        token_program: token_program.to_account_info(),
                    }
                ),
            )?;

            // mint to
            token::mint_to(
                CpiContext::new(
                    token_program.to_account_info(), 
                    token::MintTo { 
                        mint: mint.to_account_info(),
                        to: token_account.to_account_info(),
                        authority: payer.to_account_info(),
                    }
                ),
                 1
            )?;

            // freeze account
            token::freeze_account(
                CpiContext::new(
                    token_program.to_account_info(),
                    token::FreezeAccount { 
                        account: token_account.to_account_info(),
                        mint: mint.to_account_info(),
                        authority: payer.to_account_info(),
                    }
                )
            )?;

            // create metadata account
            invoke(
                &create_metadata_accounts_v3(
                    token_metadata_program.key(),
                    metadata.key(),
                    mint.key(),
                    payer.key(),
                    payer.key(),
                    update_authority.key(),
                    name,
                    symbol,
                    uri,
                    Some([Creator {
                        address: payer.key(),
                        verified: false,
                        share: 100,
                    }].to_vec()),
                    0,
                    false,
                    true,
                    None,
                    None,
                    None,
                ),
                &[
                    metadata.to_account_info(),
                    mint.to_account_info(),
                    payer.to_account_info(),
                    update_authority.to_account_info(),
                ],
            )?;

            // sign metadata
            invoke(&sign_metadata(
                token_metadata_program.key(),
                metadata.key(),
                payer.key(),
                ), &[
                    metadata.to_account_info(),
                    payer.to_account_info(),
                ]
            )?;

            // create master edition
            invoke(
                &create_master_edition_v3(
                    token_metadata_program.key(),
                    master_edition.key(),
                    mint.key(),
                    update_authority.key(),
                    payer.key(),
                    metadata.key(),
                    payer.key(),
                    Some(0),
                ),
                &[
                    master_edition.to_account_info(),
                    mint.to_account_info(),
                    update_authority.to_account_info(),
                    payer.to_account_info(),
                    metadata.to_account_info(),
                    payer.to_account_info(),
                ]
            )?;

    Ok(())
}
