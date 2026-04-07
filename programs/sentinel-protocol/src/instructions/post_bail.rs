use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::constants::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct PostBail<'info> {
    #[account(
        mut,
        constraint = owner.key() == agent_record.owner @ WardenError::NotAgentOwner
    )]
    pub owner: Signer<'info>,

    #[account(
        seeds = [AGENT_SEED, agent_record.agent_identity.as_ref()],
        bump = agent_record.bump,
        constraint = agent_record.status == AgentStatus::Arrested @ WardenError::AgentNotArrested
    )]
    pub agent_record: Account<'info, AgentRecord>,

    #[account(
        mut,
        seeds = [CELL_SEED, agent_record.key().as_ref()],
        bump = cell.bump,
        constraint = !cell.bail_posted @ WardenError::BailAlreadyPosted
    )]
    pub cell: Account<'info, Cell>,

    #[account(
        init,
        payer = owner,
        space = 8 + BailRequest::INIT_SPACE,
        seeds = [BAIL_SEED, cell.key().as_ref()],
        bump
    )]
    pub bail_request: Account<'info, BailRequest>,

    /// CHECK: Vault PDA to hold bail funds
    #[account(
        mut,
        seeds = [BAIL_VAULT_SEED, bail_request.key().as_ref()],
        bump
    )]
    pub bail_vault: SystemAccount<'info>,

    #[account(
        seeds = [DAO_SEED],
        bump = sentinel_dao.bump
    )]
    pub sentinel_dao: Account<'info, SentinelDao>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<PostBail>, bail_amount: u64) -> Result<()> {
    let dao = &ctx.accounts.sentinel_dao;
    require!(bail_amount >= dao.min_bail_lamports, WardenError::BailBelowMinimum);

    // Transfer bail to vault
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: ctx.accounts.bail_vault.to_account_info(),
            },
        ),
        bail_amount,
    )?;

    let clock = Clock::get()?;

    // Mark bail as posted
    ctx.accounts.cell.bail_posted = true;

    // Create bail request
    let bail = &mut ctx.accounts.bail_request;
    bail.cell = ctx.accounts.cell.key();
    bail.agent = ctx.accounts.agent_record.agent_identity;
    bail.owner = ctx.accounts.owner.key();
    bail.bail_amount = bail_amount;
    bail.posted_at = clock.unix_timestamp;
    bail.review_deadline = clock.unix_timestamp + dao.review_window_seconds;
    bail.votes = Vec::new();
    bail.outcome = BailOutcome::Pending;
    bail.bump = ctx.bumps.bail_request;

    msg!(
        "Bail of {} lamports posted for agent {}. Review deadline: {}",
        bail_amount,
        bail.agent,
        bail.review_deadline
    );
    Ok(())
}
