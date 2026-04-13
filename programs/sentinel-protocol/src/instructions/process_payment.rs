use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::system_program;

#[derive(Accounts)]
pub struct ProcessPayment<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [AGENT_SEED, agent_record.agent_identity.as_ref()],
        bump = agent_record.bump,
    )]
    pub agent_record: Account<'info, AgentRecord>,

    #[account(
        seeds = [DAO_SEED],
        bump = sentinel_dao.bump,
    )]
    pub sentinel_dao: Account<'info, SentinelDao>,

    /// CHECK: Treasury account that receives fees, validated against DAO config
    #[account(
        mut,
        constraint = treasury.key() == sentinel_dao.treasury @ SentinelError::InvalidTreasury,
    )]
    pub treasury: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ProcessPayment>, amount: u64) -> Result<()> {
    require!(amount > 0, SentinelError::PaymentAmountZero);

    let agent = &ctx.accounts.agent_record;
    require!(
        agent.status == AgentStatus::Active || agent.status == AgentStatus::Paroled,
        SentinelError::AgentNotActive
    );

    // Calculate fee: amount * PAYMENT_FEE_BPS / 10000
    let fee = amount
        .checked_mul(PAYMENT_FEE_BPS)
        .and_then(|v| v.checked_div(10000))
        .unwrap_or(0);

    if fee > 0 {
        // Transfer fee from payer to treasury
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            fee,
        )?;
    }

    msg!(
        "Payment processed for agent {}: amount={}, fee={} ({}bps) -> treasury",
        agent.agent_identity,
        amount,
        fee,
        PAYMENT_FEE_BPS
    );

    Ok(())
}
