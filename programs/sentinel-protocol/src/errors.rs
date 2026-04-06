use anchor_lang::prelude::*;

#[error_code]
pub enum WardenError {
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
}
