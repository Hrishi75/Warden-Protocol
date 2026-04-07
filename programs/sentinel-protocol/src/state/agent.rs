use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct AgentRecord {
    pub agent_identity: Pubkey,
    pub owner: Pubkey,
    pub stake_amount: u64,
    pub status: AgentStatus,
    pub permissions: PermissionScope,
    #[max_len(10)]
    pub violations: Vec<Violation>,
    pub registered_at: i64,
    pub parole_terms: Option<ParoleTerms>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum AgentStatus {
    Active,
    Arrested,
    Paroled,
    Terminated,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct PermissionScope {
    pub max_transfer_lamports: u64,
    #[max_len(5)]
    pub allowed_programs: Vec<Pubkey>,
    pub max_daily_transactions: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Violation {
    pub timestamp: i64,
    pub violation_type: ViolationType,
    pub evidence_hash: [u8; 32],
    #[max_len(128)]
    pub description: String,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum ViolationType {
    ExceededTransferLimit,
    UnauthorizedProgram,
    RateLimitBreached,
    ParoleViolation,
    Other,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct ParoleTerms {
    pub reduced_max_transfer: u64,
    pub reduced_daily_txns: u16,
    pub must_report: bool,
    pub parole_start: i64,
    pub probation_end: i64,
    pub strikes_remaining: u8,
}
