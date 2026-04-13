use crate::constants::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::system_program;

#[derive(Accounts)]
pub struct InitInsurancePool<'info> {
    #[account(
        mut,
        constraint = authority.key() == sentinel_dao.authority
    )]
    pub authority: Signer<'info>,

    #[account(
        seeds = [DAO_SEED],
        bump = sentinel_dao.bump
    )]
    pub sentinel_dao: Account<'info, SentinelDao>,

    #[account(
        init,
        payer = authority,
        space = 8 + InsurancePool::INIT_SPACE,
        seeds = [INSURANCE_POOL_SEED],
        bump
    )]
    pub insurance_pool: Account<'info, InsurancePool>,

    #[account(
        init,
        payer = authority,
        space = 0,
        seeds = [INSURANCE_VAULT_SEED, insurance_pool.key().as_ref()],
        bump,
        owner = system_program::ID
    )]
    pub insurance_vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitInsurancePool>) -> Result<()> {
    let pool = &mut ctx.accounts.insurance_pool;
    pool.total_deposits = 0;
    pool.total_claims_paid = 0;
    pool.active_policies = 0;
    pool.authority = ctx.accounts.authority.key();
    pool.bump = ctx.bumps.insurance_pool;

    msg!("Insurance pool initialized");
    Ok(())
}
