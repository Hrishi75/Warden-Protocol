use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct BailRequest {
    pub cell: Pubkey,
    pub agent: Pubkey,
    pub owner: Pubkey,
    pub bail_amount: u64,
    pub posted_at: i64,
    pub review_deadline: i64,
    #[max_len(10)]
    pub votes: Vec<Vote>,
    pub outcome: BailOutcome,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq, InitSpace)]
pub enum BailOutcome {
    Pending,
    Released,
    Paroled,
    Terminated,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Vote {
    pub voter: Pubkey,
    pub decision: BailOutcome,
    pub weight: u64,
    pub timestamp: i64,
}
