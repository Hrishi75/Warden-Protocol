use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct SentinelDao {
    pub authority: Pubkey,
    #[max_len(10)]
    pub members: Vec<DaoMember>,
    pub vote_threshold: u8,
    pub review_window_seconds: i64,
    pub min_bail_lamports: u64,
    pub slash_percentage: u8,
    pub treasury: Pubkey,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct DaoMember {
    pub wallet: Pubkey,
    pub stake: u64,
    pub is_active: bool,
}
