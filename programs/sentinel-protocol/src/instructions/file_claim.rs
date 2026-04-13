use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::system_program;

#[derive(Accounts)]
pub struct FileClaim<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        seeds = [AGENT_SEED, agent_record.agent_identity.as_ref()],
        bump = agent_record.bump,
        constraint = agent_record.owner == owner.key() @ SentinelError::NotAgentOwner,
        constraint = agent_record.status == AgentStatus::Terminated @ SentinelError::AgentNotTerminated,
    )]
    pub agent_record: Account<'info, AgentRecord>,

    #[account(
        mut,
        seeds = [INSURANCE_POLICY_SEED, agent_record.key().as_ref()],
        bump = insurance_policy.bump,
        constraint = insurance_policy.is_active @ SentinelError::PolicyNotActive,
        constraint = !insurance_policy.claimed @ SentinelError::ClaimAlreadyFiled,
    )]
    pub insurance_policy: Account<'info, InsurancePolicy>,

    #[account(
        init,
        payer = owner,
        space = 8 + InsuranceClaim::INIT_SPACE,
        seeds = [INSURANCE_CLAIM_SEED, insurance_policy.key().as_ref()],
        bump
    )]
    pub insurance_claim: Account<'info, InsuranceClaim>,

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

pub fn handler(ctx: Context<FileClaim>) -> Result<()> {
    let clock = Clock::get()?;
    let policy = &ctx.accounts.insurance_policy;

    // Check policy hasn't expired
    require!(
        clock.unix_timestamp <= policy.expires_at,
        SentinelError::PolicyExpired
    );

    let claim_amount = policy.coverage_amount;
    let vault_balance = ctx.accounts.insurance_vault.lamports();

    // Check pool has enough funds
    require!(
        vault_balance >= claim_amount,
        SentinelError::InsufficientPoolFunds
    );

    let insurance_pool_key = ctx.accounts.insurance_pool.key();
    let insurance_vault_bump = ctx.bumps.insurance_vault;
    let insurance_vault_signer_seeds: &[&[&[u8]]] = &[&[
        INSURANCE_VAULT_SEED,
        insurance_pool_key.as_ref(),
        &[insurance_vault_bump],
    ]];

    // Auto-approve: transfer from insurance vault to owner
    system_program::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.insurance_vault.to_account_info(),
                to: ctx.accounts.owner.to_account_info(),
            },
            insurance_vault_signer_seeds,
        ),
        claim_amount,
    )?;

    // Initialize claim record
    let claim = &mut ctx.accounts.insurance_claim;
    claim.policy = ctx.accounts.insurance_policy.key();
    claim.agent_record = ctx.accounts.agent_record.key();
    claim.claimant = ctx.accounts.owner.key();
    claim.claim_amount = claim_amount;
    claim.filed_at = clock.unix_timestamp;
    claim.status = ClaimStatus::Approved;
    claim.bump = ctx.bumps.insurance_claim;

    // Update policy
    let policy = &mut ctx.accounts.insurance_policy;
    policy.claimed = true;
    policy.is_active = false;

    // Update pool stats
    let pool = &mut ctx.accounts.insurance_pool;
    pool.total_claims_paid = pool
        .total_claims_paid
        .checked_add(claim_amount)
        .ok_or(SentinelError::MathOverflow)?;
    pool.active_policies = pool.active_policies.saturating_sub(1);

    msg!(
        "Insurance claim approved and paid: {} lamports",
        claim_amount
    );
    Ok(())
}
