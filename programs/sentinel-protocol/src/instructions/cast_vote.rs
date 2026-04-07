use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct CastVote<'info> {
    pub voter: Signer<'info>,

    #[account(
        mut,
        seeds = [BAIL_SEED, cell.key().as_ref()],
        bump = bail_request.bump,
        constraint = bail_request.outcome == BailOutcome::Pending @ WardenError::VotingClosed
    )]
    pub bail_request: Account<'info, BailRequest>,

    #[account(
        seeds = [CELL_SEED, agent_record.key().as_ref()],
        bump = cell.bump
    )]
    pub cell: Account<'info, Cell>,

    #[account(
        seeds = [AGENT_SEED, agent_record.agent_identity.as_ref()],
        bump = agent_record.bump
    )]
    pub agent_record: Account<'info, AgentRecord>,

    #[account(
        seeds = [DAO_SEED],
        bump = sentinel_dao.bump
    )]
    pub sentinel_dao: Account<'info, SentinelDao>,
}

pub fn handler(ctx: Context<CastVote>, decision: BailOutcome) -> Result<()> {
    let dao = &ctx.accounts.sentinel_dao;
    let voter_key = ctx.accounts.voter.key();

    // Validate voter is an active DAO member
    let member = dao.members.iter()
        .find(|m| m.wallet == voter_key && m.is_active)
        .ok_or(WardenError::NotDaoMember)?;
    let weight = member.stake;

    let bail = &mut ctx.accounts.bail_request;

    // Check voting deadline
    let clock = Clock::get()?;
    require!(clock.unix_timestamp <= bail.review_deadline, WardenError::VotingPeriodEnded);

    // Check for duplicate votes
    require!(
        !bail.votes.iter().any(|v| v.voter == voter_key),
        WardenError::AlreadyVoted
    );

    // Record vote
    bail.votes.push(Vote {
        voter: voter_key,
        decision: decision,
        weight,
        timestamp: clock.unix_timestamp,
    });

    msg!("Vote cast by {} with weight {}: {:?}", voter_key, weight, decision);

    // Tally votes and check threshold
    let total_stake: u64 = dao.members.iter()
        .filter(|m| m.is_active)
        .map(|m| m.stake)
        .sum();

    let threshold = (total_stake as u128 * dao.vote_threshold as u128) / 100;

    // Count votes for each outcome
    let released_weight: u64 = bail.votes.iter()
        .filter(|v| v.decision == BailOutcome::Released)
        .map(|v| v.weight)
        .sum();
    let paroled_weight: u64 = bail.votes.iter()
        .filter(|v| v.decision == BailOutcome::Paroled)
        .map(|v| v.weight)
        .sum();
    let terminated_weight: u64 = bail.votes.iter()
        .filter(|v| v.decision == BailOutcome::Terminated)
        .map(|v| v.weight)
        .sum();

    if released_weight as u128 >= threshold {
        bail.outcome = BailOutcome::Released;
        msg!("Voting resolved: RELEASED");
    } else if paroled_weight as u128 >= threshold {
        bail.outcome = BailOutcome::Paroled;
        msg!("Voting resolved: PAROLED");
    } else if terminated_weight as u128 >= threshold {
        bail.outcome = BailOutcome::Terminated;
        msg!("Voting resolved: TERMINATED");
    }

    Ok(())
}
