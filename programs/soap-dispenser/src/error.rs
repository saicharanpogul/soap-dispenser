use anchor_lang::prelude::*;

#[error_code]
pub enum SoapCode {
    #[msg("Insufficient funds for transaction.")]
    InsufficientFundsForTransaction,
}
