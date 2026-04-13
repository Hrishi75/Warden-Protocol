use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::system_program;

#[derive(Accounts)]
pub struct PostBail<'info> {
    #[account(
        mut,
        constraint = owner.key() == agent_record.owner @ SentinelError::NotAgentOwner
    )]
    pub owner: Signer<'info>,

    #[account(
        seeds = [AGENT_SEED, agent_record.agent_identity.as_ref()],
        bump = agent_record.bump,
        constraint = agent_record.status == AgentStatus::Arrested @ SentinelError::AgentNotArrested
    )]
    pub agent_record: Account<'info, AgentRecord>,

    #[account(
        mut,
        seeds = [CELL_SEED, agent_record.key().as_ref()],
        bump = cell.bump,
        constraint = !cell.bail_posted @ SentinelError::BailAlreadyPosted
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

    #[account(
        init,
        payer = owner,
        space = 0,
        seeds = [BAIL_VAULT_SEED, bail_request.key().as_ref()],
        bump,
        owner = system_program::ID
    )]
    pub bail_vault: UncheckedAccount<'info>,

    #[account(
        seeds = [DAO_SEED],
        bump = sentinel_dao.bump
    )]
    pub sentinel_dao: Account<'info, SentinelDao>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<PostBail>, bail_amount: u64) -> Result<()> {
    let dao = &ctx.accounts.sentinel_dao;
    require!(
        bail_amount >= dao.min_bail_lamports,
        SentinelError::BailBelowMinimum
    );

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
    bail.review_deadline = clock
        .unix_timestamp
        .checked_add(dao.review_window_seconds)
        .ok_or(SentinelError::MathOverflow)?;
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
