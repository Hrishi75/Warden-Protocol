use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::constants::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct RegisterAgent<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    pub agent_identity: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + AgentRecord::INIT_SPACE,
        seeds = [AGENT_SEED, agent_identity.key().as_ref()],
        bump
    )]
    pub agent_record: Account<'info, AgentRecord>,

    /// CHECK: Vault PDA to hold staked SOL
    #[account(
        mut,
        seeds = [VAULT_SEED, agent_record.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RegisterAgent>,
    permissions: PermissionScope,
    stake_amount: u64,
) -> Result<()> {
    require!(stake_amount > 0, WardenError::InvalidStakeAmount);

    // Transfer stake to vault
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        ),
        stake_amount,
    )?;

    let clock = Clock::get()?;
    let agent = &mut ctx.accounts.agent_record;
    agent.agent_identity = ctx.accounts.agent_identity.key();
    agent.owner = ctx.accounts.owner.key();
    agent.stake_amount = stake_amount;
    agent.status = AgentStatus::Active;
    agent.permissions = permissions;
    agent.violations = Vec::new();
    agent.registered_at = clock.unix_timestamp;
    agent.parole_terms = None;
    agent.bump = ctx.bumps.agent_record;

    msg!("Agent {} registered with {} lamports staked", agent.agent_identity, stake_amount);
    Ok(())
}
