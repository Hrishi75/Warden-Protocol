use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CancelCoverage<'info> {
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [INSURANCE_POLICY_SEED, insurance_policy.agent_record.as_ref()],
        bump = insurance_policy.bump,
        constraint = insurance_policy.owner == owner.key() @ SentinelError::NotAgentOwner,
        constraint = insurance_policy.is_active @ SentinelError::PolicyNotActive,
    )]
    pub insurance_policy: Account<'info, InsurancePolicy>,

    #[account(
        mut,
        seeds = [INSURANCE_POOL_SEED],
        bump = insurance_pool.bump
    )]
    pub insurance_pool: Account<'info, InsurancePool>,
}

pub fn handler(ctx: Context<CancelCoverage>) -> Result<()> {
    let policy = &mut ctx.accounts.insurance_policy;
    policy.is_active = false;

    let pool = &mut ctx.accounts.insurance_pool;
    pool.active_policies = pool.active_policies.saturating_sub(1);

    msg!(
        "Insurance policy cancelled for agent {}",
        policy.agent_record
    );
    Ok(())
}
