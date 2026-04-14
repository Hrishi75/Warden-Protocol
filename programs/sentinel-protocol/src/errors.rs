use anchor_lang::prelude::*;

#[error_code]
pub enum SentinelError {
    #[msg("DAO configuration is invalid")]
    InvalidDaoConfig,
    #[msg("Vote threshold must be between 1 and 100")]
    InvalidVoteThreshold,
    #[msg("Review window must be greater than zero")]
    InvalidReviewWindow,
    #[msg("Slash percentage must be between 0 and 100")]
    InvalidSlashPercentage,
    #[msg("Too many DAO members configured")]
    TooManyDaoMembers,
    #[msg("Too many allowed programs configured")]
    TooManyAllowedPrograms,
    #[msg("Too many votes recorded for this bail request")]
    TooManyVotes,
    #[msg("Too many frozen token accounts tracked for this cell")]
    TooManyFrozenAccounts,
    #[msg("Vote decision cannot remain pending")]
    InvalidVoteDecision,
    #[msg("Insurance pool has reached the maximum number of active policies")]
    TooManyActivePolicies,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Agent is not in a state that allows arrest")]
    AgentNotArrestable,
    #[msg("Agent is not currently arrested")]
    AgentNotArrested,
    #[msg("Agent is not on parole")]
    AgentNotOnParole,
    #[msg("Agent is already terminated")]
    AgentTerminated,
    #[msg("Only the agent owner can perform this action")]
    NotAgentOwner,
    #[msg("Caller is not a DAO member")]
    NotDaoMember,
    #[msg("Bail has already been posted for this arrest")]
    BailAlreadyPosted,
    #[msg("Bail amount is below the minimum required")]
    BailBelowMinimum,
    #[msg("Voting period has ended")]
    VotingPeriodEnded,
    #[msg("Voting is still in progress")]
    VotingNotConcluded,
    #[msg("Member has already voted on this bail request")]
    AlreadyVoted,
    #[msg("Voting has already been resolved")]
    VotingClosed,
    #[msg("Maximum violations reached")]
    MaxViolationsReached,
    #[msg("Probation period has not ended yet")]
    ProbationNotEnded,
    #[msg("Stake amount must be greater than zero")]
    InvalidStakeAmount,
    #[msg("Reason string too long")]
    ReasonTooLong,
    #[msg("Description string too long")]
    DescriptionTooLong,
    #[msg("Agent is not in an active or paroled state")]
    AgentNotActive,
    #[msg("Treasury account does not match DAO configuration")]
    InvalidTreasury,
    #[msg("Payment amount must be greater than zero")]
    PaymentAmountZero,
    #[msg("Agent already has an active insurance policy")]
    PolicyAlreadyExists,
    #[msg("Insurance policy is not active")]
    PolicyNotActive,
    #[msg("Insurance policy has expired")]
    PolicyExpired,
    #[msg("Claim has already been filed for this policy")]
    ClaimAlreadyFiled,
    #[msg("Agent must be terminated to file a claim")]
    AgentNotTerminated,
    #[msg("Insurance pool has insufficient funds")]
    InsufficientPoolFunds,
    #[msg("Claim is not in pending status")]
    ClaimNotPending,
}
