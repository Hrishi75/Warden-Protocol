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
