use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::system_program;

#[derive(Accounts)]
pub struct BuyCoverage<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        seeds = [AGENT_SEED, agent_record.agent_identity.as_ref()],
        bump = agent_record.bump,
        constraint = agent_record.owner == owner.key() @ SentinelError::NotAgentOwner,
        constraint = agent_record.status == AgentStatus::Active @ SentinelError::AgentNotActive,
    )]
    pub agent_record: Account<'info, AgentRecord>,

    #[account(
        init,
        payer = owner,
        space = 8 + InsurancePolicy::INIT_SPACE,
        seeds = [INSURANCE_POLICY_SEED, agent_record.key().as_ref()],
        bump
    )]
    pub insurance_policy: Account<'info, InsurancePolicy>,

    #[account(
        mut,
        seeds = [INSURANCE_POOL_SEED],
        bump = insurance_pool.bump
    )]
    pub insurance_pool: Account<'info, InsurancePool>,

    /// CHECK: Insurance vault PDA
    #[account(
        mut,
        seeds = [INSURANCE_VAULT_SEED, insurance_pool.key().as_ref()],
        bump
    )]
    pub insurance_vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<BuyCoverage>, tier: InsuranceTier) -> Result<()> {
    let stake = ctx.accounts.agent_record.stake_amount;
    let clock = Clock::get()?;

    let (premium_bps, coverage_bps) = match tier {
        InsuranceTier::Basic => (BASIC_PREMIUM_BPS, BASIC_COVERAGE_BPS),
        InsuranceTier::Standard => (STANDARD_PREMIUM_BPS, STANDARD_COVERAGE_BPS),
        InsuranceTier::Premium => (PREMIUM_PREMIUM_BPS, PREMIUM_COVERAGE_BPS),
    };

    let premium = ((stake as u128)
        .checked_mul(premium_bps as u128)
        .ok_or(SentinelError::MathOverflow)?
        / 10000) as u64;
    let coverage = ((stake as u128)
        .checked_mul(coverage_bps as u128)
        .ok_or(SentinelError::MathOverflow)?
        / 10000) as u64;

    // Transfer premium from owner to insurance vault
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.insurance_vault.to_account_info(),
            },
        ),
        premium,
    )?;

    // Initialize policy
    let policy = &mut ctx.accounts.insurance_policy;
    policy.agent_record = ctx.accounts.agent_record.key();
    policy.owner = ctx.accounts.owner.key();
    policy.tier = tier;
    policy.premium_paid = premium;
    policy.coverage_amount = coverage;
    policy.activated_at = clock.unix_timestamp;
    policy.expires_at = clock.unix_timestamp + INSURANCE_PERIOD_SECONDS;
    policy.is_active = true;
    policy.claimed = false;
    policy.bump = ctx.bumps.insurance_policy;

    // Update pool stats
    let pool = &mut ctx.accounts.insurance_pool;
    require!(
        pool.active_policies < MAX_ACTIVE_POLICIES,
        SentinelError::TooManyActivePolicies
    );
    pool.total_deposits = pool
        .total_deposits
        .checked_add(premium)
        .ok_or(SentinelError::MathOverflow)?;
    pool.active_policies = pool
        .active_policies
        .checked_add(1)
        .ok_or(SentinelError::MathOverflow)?;

    msg!(
        "Insurance policy created: tier={:?}, premium={}, coverage={}",
        tier,
        premium,
        coverage
    );
    Ok(())
}
