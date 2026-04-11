pub const AGENT_SEED: &[u8] = b"agent";
pub const CELL_SEED: &[u8] = b"cell";
pub const BAIL_SEED: &[u8] = b"bail";
pub const DAO_SEED: &[u8] = b"sentinel_dao";
pub const VAULT_SEED: &[u8] = b"vault";
pub const BAIL_VAULT_SEED: &[u8] = b"bail_vault";

pub const MAX_VIOLATIONS: usize = 10;
pub const MAX_DAO_MEMBERS: usize = 10;
pub const MAX_VOTES: usize = 10;
pub const MAX_ALLOWED_PROGRAMS: usize = 5;
pub const MAX_FROZEN_ACCOUNTS: usize = 5;
pub const MAX_REASON_LEN: usize = 256;
pub const MAX_DESCRIPTION_LEN: usize = 128;

pub const DEFAULT_REVIEW_WINDOW: i64 = 60; // 60 seconds for demo, 86400 for prod
pub const DEFAULT_PROBATION_PERIOD: i64 = 120; // 120 seconds for demo
pub const DEFAULT_PAROLE_STRIKES: u8 = 3;

pub const PAYMENT_FEE_BPS: u64 = 30; // 0.3% fee on agent payments

// Insurance
pub const INSURANCE_POOL_SEED: &[u8] = b"insurance_pool";
pub const INSURANCE_POLICY_SEED: &[u8] = b"insurance_policy";
pub const INSURANCE_VAULT_SEED: &[u8] = b"insurance_vault";
pub const INSURANCE_CLAIM_SEED: &[u8] = b"insurance_claim";

pub const INSURANCE_PERIOD_SECONDS: i64 = 2_592_000; // 30 days (demo: 300)
pub const MAX_ACTIVE_POLICIES: u32 = 1000;

// Tier config: (premium_bps, coverage_bps) relative to agent stake
pub const BASIC_PREMIUM_BPS: u64 = 500;      // 5%
pub const BASIC_COVERAGE_BPS: u64 = 5000;    // 50%
pub const STANDARD_PREMIUM_BPS: u64 = 1000;  // 10%
pub const STANDARD_COVERAGE_BPS: u64 = 10000; // 100%
pub const PREMIUM_PREMIUM_BPS: u64 = 1800;   // 18%
pub const PREMIUM_COVERAGE_BPS: u64 = 15000; // 150%
