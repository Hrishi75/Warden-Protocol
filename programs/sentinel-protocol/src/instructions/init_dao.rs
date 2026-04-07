use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct InitDao<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + SentinelDao::INIT_SPACE,
        seeds = [DAO_SEED],
        bump
    )]
    pub sentinel_dao: Account<'info, SentinelDao>,

    /// CHECK: Treasury account to receive slashed funds
    pub treasury: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitDao>,
    vote_threshold: u8,
    review_window_seconds: i64,
    min_bail_lamports: u64,
    slash_percentage: u8,
    initial_members: Vec<DaoMember>,
) -> Result<()> {
    let dao = &mut ctx.accounts.sentinel_dao;
    dao.authority = ctx.accounts.authority.key();
    dao.members = initial_members;
    dao.vote_threshold = vote_threshold;
    dao.review_window_seconds = review_window_seconds;
    dao.min_bail_lamports = min_bail_lamports;
    dao.slash_percentage = slash_percentage;
    dao.treasury = ctx.accounts.treasury.key();
    dao.bump = ctx.bumps.sentinel_dao;

    msg!("Sentinel DAO initialized with {} members", dao.members.len());
    Ok(())
}
