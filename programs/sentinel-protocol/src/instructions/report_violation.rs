use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ReportViolation<'info> {
    #[account(mut)]
    pub reporter: Signer<'info>,

    #[account(
        mut,
        seeds = [AGENT_SEED, agent_record.agent_identity.as_ref()],
        bump = agent_record.bump,
        constraint = agent_record.status == AgentStatus::Paroled @ SentinelError::AgentNotOnParole
    )]
    pub agent_record: Account<'info, AgentRecord>,

    #[account(
        seeds = [DAO_SEED],
        bump = sentinel_dao.bump
    )]
    pub sentinel_dao: Account<'info, SentinelDao>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CheckProbation<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,

    #[account(
        mut,
        seeds = [AGENT_SEED, agent_record.agent_identity.as_ref()],
        bump = agent_record.bump,
        constraint = agent_record.status == AgentStatus::Paroled @ SentinelError::AgentNotOnParole
    )]
    pub agent_record: Account<'info, AgentRecord>,
}

pub fn report_handler(
    ctx: Context<ReportViolation>,
    violation_type: ViolationType,
    evidence_hash: [u8; 32],
    description: String,
) -> Result<()> {
    require!(
        description.len() <= MAX_DESCRIPTION_LEN,
        SentinelError::DescriptionTooLong
    );

    // Validate reporter is a DAO member
    let dao = &ctx.accounts.sentinel_dao;
    let reporter_key = ctx.accounts.reporter.key();
    let is_dao_member = dao
        .members
        .iter()
        .any(|m| m.wallet == reporter_key && m.is_active);
    let is_owner = reporter_key == ctx.accounts.agent_record.owner;
    require!(is_dao_member || is_owner, SentinelError::NotDaoMember);

    let clock = Clock::get()?;
    let agent = &mut ctx.accounts.agent_record;

    // Add violation to rap sheet
    require!(
        agent.violations.len() < MAX_VIOLATIONS,
        SentinelError::MaxViolationsReached
    );
    agent.violations.push(Violation {
        timestamp: clock.unix_timestamp,
        violation_type,
        evidence_hash,
        description,
    });

    // Decrement parole strikes
    let agent_id = agent.agent_identity;
    if let Some(ref mut terms) = agent.parole_terms {
        terms.strikes_remaining = terms.strikes_remaining.saturating_sub(1);
        let strikes = terms.strikes_remaining;

        if strikes == 0 {
            // Auto re-arrest — drop the mutable borrow first
            let _ = terms;
            agent.status = AgentStatus::Arrested;
            agent.parole_terms = None;
            msg!(
                "Agent {} auto re-arrested: parole strikes exhausted",
                agent_id
            );
        } else {
            msg!(
                "Violation reported for agent {}. Strikes remaining: {}",
                agent_id,
                strikes
            );
        }
    }

    Ok(())
}

pub fn check_probation_handler(ctx: Context<CheckProbation>) -> Result<()> {
    let clock = Clock::get()?;
    let agent = &mut ctx.accounts.agent_record;

    if let Some(ref terms) = agent.parole_terms {
        require!(
            clock.unix_timestamp >= terms.probation_end,
            SentinelError::ProbationNotEnded
        );

        // Probation ended — full reinstatement
        agent.status = AgentStatus::Active;
        agent.parole_terms = None;
        msg!(
            "Agent {} probation ended — fully reinstated",
            agent.agent_identity
        );
    }

    Ok(())
}
