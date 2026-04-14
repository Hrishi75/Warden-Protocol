use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use state::*;

declare_id!("5DCbrjFHUdzLHLayUUdFJBnBPC8UV7eUc3wJA1rVRQTa");

#[program]
pub mod sentinel_protocol {
    use super::*;

    pub fn init_dao(
        ctx: Context<InitDao>,
        vote_threshold: u8,
        review_window_seconds: i64,
        min_bail_lamports: u64,
        slash_percentage: u8,
        initial_members: Vec<DaoMember>,
    ) -> Result<()> {
        instructions::init_dao::handler(
            ctx,
            vote_threshold,
            review_window_seconds,
            min_bail_lamports,
            slash_percentage,
            initial_members,
        )
    }

    pub fn register_agent(
        ctx: Context<RegisterAgent>,
        permissions: PermissionScope,
        stake_amount: u64,
    ) -> Result<()> {
        instructions::register_agent::handler(ctx, permissions, stake_amount)
    }

    pub fn arrest_agent(
        ctx: Context<ArrestAgent>,
        reason: String,
        evidence_hash: [u8; 32],
        violation_type: ViolationType,
    ) -> Result<()> {
        instructions::arrest_agent::handler(ctx, reason, evidence_hash, violation_type)
    }

    pub fn freeze_agent_token(ctx: Context<FreezeAgentToken>) -> Result<()> {
        instructions::arrest_agent::freeze_token_handler(ctx)
    }

    pub fn post_bail(ctx: Context<PostBail>, bail_amount: u64) -> Result<()> {
        instructions::post_bail::handler(ctx, bail_amount)
    }

    pub fn cast_vote(ctx: Context<CastVote>, decision: BailOutcome) -> Result<()> {
        instructions::cast_vote::handler(ctx, decision)
    }

    pub fn release_agent(ctx: Context<ReleaseAgent>) -> Result<()> {
        instructions::release_agent::handler(ctx)
    }

    pub fn report_violation(
        ctx: Context<ReportViolation>,
        violation_type: ViolationType,
        evidence_hash: [u8; 32],
        description: String,
    ) -> Result<()> {
        instructions::report_violation::report_handler(
            ctx,
            violation_type,
            evidence_hash,
            description,
        )
    }

    pub fn check_probation(ctx: Context<CheckProbation>) -> Result<()> {
        instructions::report_violation::check_probation_handler(ctx)
    }

    pub fn process_payment(ctx: Context<ProcessPayment>, amount: u64) -> Result<()> {
        instructions::process_payment::handler(ctx, amount)
    }

    pub fn init_insurance_pool(ctx: Context<InitInsurancePool>) -> Result<()> {
        instructions::init_insurance_pool::handler(ctx)
    }

    pub fn buy_coverage(ctx: Context<BuyCoverage>, tier: InsuranceTier) -> Result<()> {
        instructions::buy_coverage::handler(ctx, tier)
    }

    pub fn file_claim(ctx: Context<FileClaim>) -> Result<()> {
        instructions::file_claim::handler(ctx)
    }

    pub fn cancel_coverage(ctx: Context<CancelCoverage>) -> Result<()> {
        instructions::cancel_coverage::handler(ctx)
    }
}
