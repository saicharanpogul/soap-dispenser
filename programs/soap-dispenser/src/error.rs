use anchor_lang::prelude::*;

#[error_code]
pub enum SoapCode {
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Mint has not yet started")]
    MintNotStarted,
    #[msg("Mint has ended")]
    MintEnded,
}
