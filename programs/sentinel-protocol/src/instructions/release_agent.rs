use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct ReleaseAgent<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [AGENT_SEED, agent_record.agent_identity.as_ref()],
        bump = agent_record.bump,
        constraint = agent_record.status == AgentStatus::Arrested @ WardenError::AgentNotArrested
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
        constraint = bail_request.outcome != BailOutcome::Pending @ WardenError::VotingNotConcluded,
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
        constraint = owner.key() == agent_record.owner @ WardenError::NotAgentOwner
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
        constraint = treasury.key() == sentinel_dao.treasury
    )]
    pub treasury: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ReleaseAgent>) -> Result<()> {
    let outcome = ctx.accounts.bail_request.outcome;
    let agent = &mut ctx.accounts.agent_record;
    let clock = Clock::get()?;

    let bail_vault = &ctx.accounts.bail_vault;
    let bail_vault_lamports = bail_vault.lamports();
    let stake_vault = &ctx.accounts.stake_vault;
    let _stake_vault_lamports = stake_vault.lamports();

    match outcome {
        BailOutcome::Released => {
            agent.status = AgentStatus::Active;
            agent.parole_terms = None;

            // Return bail to owner
            transfer_from_pda(
                &ctx.accounts.bail_vault.to_account_info(),
                &ctx.accounts.owner.to_account_info(),
                bail_vault_lamports,
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
                probation_end: clock.unix_timestamp + DEFAULT_PROBATION_PERIOD,
                strikes_remaining: DEFAULT_PAROLE_STRIKES,
            });

            // Return bail to owner
            transfer_from_pda(
                &ctx.accounts.bail_vault.to_account_info(),
                &ctx.accounts.owner.to_account_info(),
                bail_vault_lamports,
            )?;

            msg!("Agent {} released on parole", agent.agent_identity);
        }
        BailOutcome::Terminated => {
            agent.status = AgentStatus::Terminated;

            // Slash bail — send to treasury
            transfer_from_pda(
                &ctx.accounts.bail_vault.to_account_info(),
                &ctx.accounts.treasury.to_account_info(),
                bail_vault_lamports,
            )?;

            // Slash stake — send to treasury
            let slash_amount = (_stake_vault_lamports as u128
                * ctx.accounts.sentinel_dao.slash_percentage as u128
                / 100) as u64;
            if slash_amount > 0 {
                transfer_from_pda(
                    &ctx.accounts.stake_vault.to_account_info(),
                    &ctx.accounts.treasury.to_account_info(),
                    slash_amount,
                )?;
            }

            // Return remaining stake to owner
            let remaining = ctx.accounts.stake_vault.lamports();
            if remaining > 0 {
                transfer_from_pda(
                    &ctx.accounts.stake_vault.to_account_info(),
                    &ctx.accounts.owner.to_account_info(),
                    remaining,
                )?;
            }

            msg!("Agent {} terminated. Stake slashed.", agent.agent_identity);
        }
        BailOutcome::Pending => {
            return Err(WardenError::VotingNotConcluded.into());
        }
    }

    Ok(())
}

/// Transfer lamports from a PDA by directly modifying lamport balances.
/// This works for system-owned PDAs.
fn transfer_from_pda(
    from: &AccountInfo,
    to: &AccountInfo,
    amount: u64,
) -> Result<()> {
    **from.try_borrow_mut_lamports()? -= amount;
    **to.try_borrow_mut_lamports()? += amount;
    Ok(())
}
