use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::constants::*;
use crate::errors::*;
use crate::state::*;

#[derive(Accounts)]
pub struct ReleaseAgent<'info> {
    #[account(
        mut,
        constraint = sentinel_dao.members.iter().any(|m| m.wallet == authority.key() && m.is_active)
            @ SentinelError::NotDaoMember
    )]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [AGENT_SEED, agent_record.agent_identity.as_ref()],
        bump = agent_record.bump,
        constraint = agent_record.status == AgentStatus::Arrested @ SentinelError::AgentNotArrested
    )]
    pub agent_record: Account<'info, AgentRecord>,

    #[account(
        mut,
        seeds = [CELL_SEED, agent_record.key().as_ref()],
        bump = cell.bump,
        close = authority
    )]
    pub cell: Account<'info, Cell>,

    #[account(
        mut,
        seeds = [BAIL_SEED, cell.key().as_ref()],
        bump = bail_request.bump,
        constraint = bail_request.outcome != BailOutcome::Pending @ SentinelError::VotingNotConcluded,
        close = authority
    )]
    pub bail_request: Account<'info, BailRequest>,

    /// CHECK: Bail vault PDA holding bail funds
    #[account(
        mut,
        seeds = [BAIL_VAULT_SEED, bail_request.key().as_ref()],
        bump
    )]
    pub bail_vault: SystemAccount<'info>,

    /// CHECK: Stake vault PDA holding agent stake
    #[account(
        mut,
        seeds = [VAULT_SEED, agent_record.key().as_ref()],
        bump
    )]
    pub stake_vault: SystemAccount<'info>,

    /// CHECK: Owner receives returned bail
    #[account(
        mut,
        constraint = owner.key() == agent_record.owner @ SentinelError::NotAgentOwner
    )]
    pub owner: SystemAccount<'info>,

    #[account(
        seeds = [DAO_SEED],
        bump = sentinel_dao.bump
    )]
    pub sentinel_dao: Account<'info, SentinelDao>,

    /// CHECK: Treasury for slashed funds
    #[account(
        mut,
        constraint = treasury.key() == sentinel_dao.treasury @ SentinelError::InvalidTreasury
    )]
    pub treasury: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ReleaseAgent>) -> Result<()> {
    let outcome = ctx.accounts.bail_request.outcome;
    let clock = Clock::get()?;

    let bail_request_key = ctx.accounts.bail_request.key();
    let bail_vault_bump = ctx.bumps.bail_vault;
    let bail_vault_signer_seeds: &[&[&[u8]]] = &[&[
        BAIL_VAULT_SEED,
        bail_request_key.as_ref(),
        &[bail_vault_bump],
    ]];

    let agent_record_key = ctx.accounts.agent_record.key();
    let stake_vault_bump = ctx.bumps.stake_vault;
    let stake_vault_signer_seeds: &[&[&[u8]]] =
        &[&[VAULT_SEED, agent_record_key.as_ref(), &[stake_vault_bump]]];

    let bail_vault_lamports = ctx.accounts.bail_vault.lamports();
    let stake_vault_lamports = ctx.accounts.stake_vault.lamports();

    let agent = &mut ctx.accounts.agent_record;
    match outcome {
        BailOutcome::Released => {
            agent.status = AgentStatus::Active;
            agent.parole_terms = None;

            transfer_from_pda(
                &ctx.accounts.system_program.to_account_info(),
                &ctx.accounts.bail_vault.to_account_info(),
                &ctx.accounts.owner.to_account_info(),
                bail_vault_lamports,
                bail_vault_signer_seeds,
            )?;

            msg!("Agent {} fully released", agent.agent_identity);
        }
        BailOutcome::Paroled => {
            agent.status = AgentStatus::Paroled;
            agent.parole_terms = Some(ParoleTerms {
                reduced_max_transfer: agent.permissions.max_transfer_lamports / 2,
                reduced_daily_txns: agent.permissions.max_daily_transactions / 2,
                must_report: true,
                parole_start: clock.unix_timestamp,
                probation_end: clock
                    .unix_timestamp
                    .checked_add(DEFAULT_PROBATION_PERIOD)
                    .ok_or(SentinelError::MathOverflow)?,
                strikes_remaining: DEFAULT_PAROLE_STRIKES,
            });

            transfer_from_pda(
                &ctx.accounts.system_program.to_account_info(),
                &ctx.accounts.bail_vault.to_account_info(),
                &ctx.accounts.owner.to_account_info(),
                bail_vault_lamports,
                bail_vault_signer_seeds,
            )?;

            msg!("Agent {} released on parole", agent.agent_identity);
        }
        BailOutcome::Terminated => {
            agent.status = AgentStatus::Terminated;
            agent.parole_terms = None;

            transfer_from_pda(
                &ctx.accounts.system_program.to_account_info(),
                &ctx.accounts.bail_vault.to_account_info(),
                &ctx.accounts.treasury.to_account_info(),
                bail_vault_lamports,
                bail_vault_signer_seeds,
            )?;

            let slash_amount = ((stake_vault_lamports as u128)
                .checked_mul(ctx.accounts.sentinel_dao.slash_percentage as u128)
                .ok_or(SentinelError::MathOverflow)?
                / 100) as u64;

            transfer_from_pda(
                &ctx.accounts.system_program.to_account_info(),
                &ctx.accounts.stake_vault.to_account_info(),
                &ctx.accounts.treasury.to_account_info(),
                slash_amount,
                stake_vault_signer_seeds,
            )?;

            let remaining = stake_vault_lamports.saturating_sub(slash_amount);
            transfer_from_pda(
                &ctx.accounts.system_program.to_account_info(),
                &ctx.accounts.stake_vault.to_account_info(),
                &ctx.accounts.owner.to_account_info(),
                remaining,
                stake_vault_signer_seeds,
            )?;

            msg!("Agent {} terminated. Stake slashed.", agent.agent_identity);
        }
        BailOutcome::Pending => {
            return Err(SentinelError::VotingNotConcluded.into());
        }
    }

    Ok(())
}

fn transfer_from_pda<'info>(
    system_program_info: &AccountInfo<'info>,
    from: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    amount: u64,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }

    system_program::transfer(
        CpiContext::new_with_signer(
            system_program_info.clone(),
            system_program::Transfer {
                from: from.clone(),
                to: to.clone(),
            },
            signer_seeds,
        ),
        amount,
    )
}
