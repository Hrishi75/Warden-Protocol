use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct InsurancePolicy {
    pub agent_record: Pubkey,
    pub owner: Pubkey,
    pub tier: InsuranceTier,
    pub premium_paid: u64,
    pub coverage_amount: u64,
    pub activated_at: i64,
    pub expires_at: i64,
    pub is_active: bool,
    pub claimed: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq, InitSpace)]
pub enum InsuranceTier {
    Basic,
    Standard,
    Premium,
}

#[account]
#[derive(InitSpace)]
pub struct InsurancePool {
    pub total_deposits: u64,
    pub total_claims_paid: u64,
    pub active_policies: u32,
    pub authority: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct InsuranceClaim {
    pub policy: Pubkey,
    pub agent_record: Pubkey,
    pub claimant: Pubkey,
    pub claim_amount: u64,
    pub filed_at: i64,
    pub status: ClaimStatus,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum ClaimStatus {
    Pending,
    Approved,
    Rejected,
}
