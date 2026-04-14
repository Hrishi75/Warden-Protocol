import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  VersionedTransaction,
  Commitment,
} from "@solana/web3.js";
import IDL from "./idl";
import { DEFAULT_PROGRAM_ID } from "./constants";
import * as pda from "./pda";
import * as instructions from "./instructions";
import * as accounts from "./accounts";
import type { PermissionScopeInput, DaoMemberInput } from "./instructions/types";

export interface WalletAdapter {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(
    tx: T
  ): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: T[]
  ): Promise<T[]>;
}

export interface SentinelClientConfig {
  connection: Connection;
  wallet: WalletAdapter;
  programId?: PublicKey;
  commitment?: Commitment;
}

export class SentinelClient {
  readonly program: Program;
  readonly provider: AnchorProvider;
  readonly programId: PublicKey;

  constructor(config: SentinelClientConfig) {
    this.programId = config.programId ?? DEFAULT_PROGRAM_ID;
    this.provider = new AnchorProvider(config.connection, config.wallet, {
      commitment: config.commitment ?? "confirmed",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.program = new Program(IDL as any, this.provider);
  }

  static readOnly(
    connection: Connection,
    programId?: PublicKey
  ): SentinelClient {
    const dummyKeypair = Keypair.generate();
    const dummyWallet: WalletAdapter = {
      publicKey: dummyKeypair.publicKey,
      signTransaction: <T extends Transaction | VersionedTransaction>(
        tx: T
      ): Promise<T> => Promise.resolve(tx),
      signAllTransactions: <T extends Transaction | VersionedTransaction>(
        txs: T[]
      ): Promise<T[]> => Promise.resolve(txs),
    };
    return new SentinelClient({
      connection,
      wallet: dummyWallet,
      programId,
    });
  }

  // --- PDA Helpers ---

  findAgentRecordPda(agentPubkey: PublicKey): [PublicKey, number] {
    return pda.findAgentRecordPda(agentPubkey, this.programId);
  }

  findCellPda(agentRecordPda: PublicKey): [PublicKey, number] {
    return pda.findCellPda(agentRecordPda, this.programId);
  }

  findBailRequestPda(cellPda: PublicKey): [PublicKey, number] {
    return pda.findBailRequestPda(cellPda, this.programId);
  }

  findSentinelDaoPda(): [PublicKey, number] {
    return pda.findSentinelDaoPda(this.programId);
  }

  findVaultPda(agentRecordPda: PublicKey): [PublicKey, number] {
    return pda.findVaultPda(agentRecordPda, this.programId);
  }

  findBailVaultPda(bailRequestPda: PublicKey): [PublicKey, number] {
    return pda.findBailVaultPda(bailRequestPda, this.programId);
  }

  findInsurancePoolPda(): [PublicKey, number] {
    return pda.findInsurancePoolPda(this.programId);
  }

  findInsurancePolicyPda(agentRecordPda: PublicKey): [PublicKey, number] {
    return pda.findInsurancePolicyPda(agentRecordPda, this.programId);
  }

  findInsuranceVaultPda(insurancePoolPda: PublicKey): [PublicKey, number] {
    return pda.findInsuranceVaultPda(insurancePoolPda, this.programId);
  }

  findInsuranceClaimPda(insurancePolicyPda: PublicKey): [PublicKey, number] {
    return pda.findInsuranceClaimPda(insurancePolicyPda, this.programId);
  }

  // --- DAO Instructions ---

  async initDao(
    authority: PublicKey,
    treasury: PublicKey,
    voteThreshold: number,
    reviewWindowSeconds: BN,
    minBailLamports: BN,
    slashPercentage: number,
    initialMembers: DaoMemberInput[]
  ) {
    return instructions.initDao(
      this.program,
      authority,
      treasury,
      voteThreshold,
      reviewWindowSeconds,
      minBailLamports,
      slashPercentage,
      initialMembers
    );
  }

  async initInsurancePool(authority: PublicKey) {
    return instructions.initInsurancePool(this.program, authority);
  }

  // --- Agent Instructions ---

  async registerAgent(
    owner: PublicKey,
    agentKeypair: Keypair,
    permissions: PermissionScopeInput,
    stakeAmount: BN
  ) {
    return instructions.registerAgent(
      this.program,
      owner,
      agentKeypair,
      permissions,
      stakeAmount
    );
  }

  async arrestAgent(
    arrester: PublicKey,
    agentIdentity: PublicKey,
    reason: string,
    evidenceHash: number[],
    violationType: object
  ) {
    return instructions.arrestAgent(
      this.program,
      arrester,
      agentIdentity,
      reason,
      evidenceHash,
      violationType
    );
  }

  async freezeAgentToken(
    authority: PublicKey,
    agentIdentity: PublicKey,
    tokenAccount: PublicKey,
    mint: PublicKey
  ) {
    return instructions.freezeAgentToken(
      this.program,
      authority,
      agentIdentity,
      tokenAccount,
      mint
    );
  }

  async releaseAgent(
    authority: PublicKey,
    agentIdentity: PublicKey,
    ownerPubkey: PublicKey,
    treasuryPubkey: PublicKey
  ) {
    return instructions.releaseAgent(
      this.program,
      authority,
      agentIdentity,
      ownerPubkey,
      treasuryPubkey
    );
  }

  async reportViolation(
    reporter: PublicKey,
    agentIdentity: PublicKey,
    violationType: object,
    evidenceHash: number[],
    description: string
  ) {
    return instructions.reportViolation(
      this.program,
      reporter,
      agentIdentity,
      violationType,
      evidenceHash,
      description
    );
  }

  async checkProbation(caller: PublicKey, agentIdentity: PublicKey) {
    return instructions.checkProbation(this.program, caller, agentIdentity);
  }

  // --- Bail Instructions ---

  async postBail(owner: PublicKey, agentIdentity: PublicKey, bailAmount: BN) {
    return instructions.postBail(
      this.program,
      owner,
      agentIdentity,
      bailAmount
    );
  }

  async castVote(
    voter: PublicKey,
    agentIdentity: PublicKey,
    decision: object
  ) {
    return instructions.castVote(
      this.program,
      voter,
      agentIdentity,
      decision
    );
  }

  // --- Insurance Instructions ---

  async buyCoverage(
    owner: PublicKey,
    agentIdentity: PublicKey,
    tier: object
  ) {
    return instructions.buyCoverage(
      this.program,
      owner,
      agentIdentity,
      tier
    );
  }

  async fileClaim(owner: PublicKey, agentIdentity: PublicKey) {
    return instructions.fileClaim(this.program, owner, agentIdentity);
  }

  async cancelCoverage(owner: PublicKey, agentRecordPda: PublicKey) {
    return instructions.cancelCoverage(this.program, owner, agentRecordPda);
  }

  // --- Payment Instructions ---

  async processPayment(
    payer: PublicKey,
    agentIdentity: PublicKey,
    amount: BN
  ) {
    return instructions.processPayment(
      this.program,
      payer,
      agentIdentity,
      amount
    );
  }

  // --- Account Fetchers ---

  async fetchAllAgents() {
    return accounts.fetchAllAgents(this.program);
  }

  async fetchAgent(agentIdentity: PublicKey) {
    return accounts.fetchAgent(this.program, agentIdentity);
  }

  async fetchDao() {
    return accounts.fetchDao(this.program);
  }

  async fetchCell(agentIdentity: PublicKey) {
    return accounts.fetchCell(this.program, agentIdentity);
  }

  async fetchBailRequest(agentIdentity: PublicKey) {
    return accounts.fetchBailRequest(this.program, agentIdentity);
  }

  async fetchInsurancePool() {
    return accounts.fetchInsurancePool(this.program);
  }

  async fetchInsurancePolicy(agentIdentity: PublicKey) {
    return accounts.fetchInsurancePolicy(this.program, agentIdentity);
  }

  async fetchAllPolicies() {
    return accounts.fetchAllPolicies(this.program);
  }
}
