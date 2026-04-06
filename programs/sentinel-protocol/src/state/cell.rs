use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Cell {
    pub agent: Pubkey,
    pub arrester: Pubkey,
    #[max_len(256)]
    pub reason: String,
    pub evidence_hash: [u8; 32],
    pub arrested_at: i64,
    #[max_len(5)]
    pub frozen_token_accounts: Vec<Pubkey>,
    pub bail_posted: bool,
    pub bump: u8,
}
