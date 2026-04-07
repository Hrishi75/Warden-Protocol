use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, FreezeAccount, Mint};
use crate::state::*;
use crate::constants::*;
use crate::errors::*;

#[derive(Accounts)]
#[instruction(reason: String)]
pub struct ArrestAgent<'info> {
    #[account(mut)]
    pub arrester: Signer<'info>,

    #[account(
        mut,
        seeds = [AGENT_SEED, agent_record.agent_identity.as_ref()],
        bump = agent_record.bump,
        constraint = agent_record.status == AgentStatus::Active
            || agent_record.status == AgentStatus::Paroled
            @ WardenError::AgentNotArrestable
    )]
    pub agent_record: Account<'info, AgentRecord>,

    #[account(
        init,
        payer = arrester,
        space = 8 + Cell::INIT_SPACE,
        seeds = [CELL_SEED, agent_record.key().as_ref()],
        bump
    )]
    pub cell: Account<'info, Cell>,

    #[account(
        seeds = [DAO_SEED],
        bump = sentinel_dao.bump
    )]
    pub sentinel_dao: Account<'info, SentinelDao>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<ArrestAgent>,
    reason: String,
    evidence_hash: [u8; 32],
    violation_type: ViolationType,
) -> Result<()> {
    require!(reason.len() <= MAX_REASON_LEN, WardenError::ReasonTooLong);

    // Validate arrester is a DAO member or the agent owner
    let dao = &ctx.accounts.sentinel_dao;
    let arrester_key = ctx.accounts.arrester.key();
    let is_dao_member = dao.members.iter().any(|m| m.wallet == arrester_key && m.is_active);
    let is_owner = arrester_key == ctx.accounts.agent_record.owner;
    require!(is_dao_member || is_owner, WardenError::NotDaoMember);

    let clock = Clock::get()?;
    let agent = &mut ctx.accounts.agent_record;

    // Add violation to rap sheet
    require!(agent.violations.len() < MAX_VIOLATIONS, WardenError::MaxViolationsReached);
    agent.violations.push(Violation {
        timestamp: clock.unix_timestamp,
        violation_type,
        evidence_hash,
        description: reason.clone(),
    });

    // Set status to arrested
    agent.status = AgentStatus::Arrested;
    agent.parole_terms = None;

    // Create cell
    let cell = &mut ctx.accounts.cell;
    cell.agent = agent.agent_identity;
    cell.arrester = arrester_key;
    cell.reason = reason;
    cell.evidence_hash = evidence_hash;
    cell.arrested_at = clock.unix_timestamp;
    cell.frozen_token_accounts = Vec::new();
    cell.bail_posted = false;
    cell.bump = ctx.bumps.cell;

    msg!("Agent {} arrested by {}", agent.agent_identity, arrester_key);
    Ok(())
}

// Separate instruction to freeze token accounts after arrest
#[derive(Accounts)]
pub struct FreezeAgentToken<'info> {
    pub authority: Signer<'info>,

    #[account(
        seeds = [AGENT_SEED, agent_record.agent_identity.as_ref()],
        bump = agent_record.bump,
        constraint = agent_record.status == AgentStatus::Arrested @ WardenError::AgentNotArrested
    )]
    pub agent_record: Account<'info, AgentRecord>,

    #[account(
        mut,
        seeds = [CELL_SEED, agent_record.key().as_ref()],
        bump = cell.bump
    )]
    pub cell: Account<'info, Cell>,

    #[account(
        seeds = [DAO_SEED],
        bump = sentinel_dao.bump
    )]
    pub sentinel_dao: Account<'info, SentinelDao>,

    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

pub fn freeze_token_handler(ctx: Context<FreezeAgentToken>) -> Result<()> {
    let dao_bump = ctx.accounts.sentinel_dao.bump;
    let signer_seeds: &[&[&[u8]]] = &[&[DAO_SEED, &[dao_bump]]];

    token::freeze_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        FreezeAccount {
            account: ctx.accounts.token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.sentinel_dao.to_account_info(),
        },
        signer_seeds,
    ))?;

    let cell = &mut ctx.accounts.cell;
    cell.frozen_token_accounts.push(ctx.accounts.token_account.key());

    msg!("Token account {} frozen", ctx.accounts.token_account.key());
    Ok(())
}
