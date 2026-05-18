/**
 * useCampaign — V2 contract interaction layer
 *
 * Covers the full CampaignV2 / CampaignFactoryV2 / CampaignTokenV2 API.
 * Commit-reveal voting helpers and localStorage persistence for in-flight votes.
 */

import {
  BrowserProvider,
  Contract,
  parseEther,
  formatEther,
  getAddress,
  solidityPackedKeccak256,
  randomBytes,
  hexlify,
  type ContractTransactionResponse,
  type Eip1193Provider,
} from "ethers";
import {
  CHAIN_ID,
  FACTORY_ADDRESS,
  CAMPAIGN_V2_ABI,
  FACTORY_V2_ABI,
  TOKEN_V2_ABI,
} from "../contracts/config";

const LAUNCHVAULT_NETWORK = {
  chainId: CHAIN_ID,
  name: "launchvault-testnet",
};

// ── State constants (const objects instead of enum — erasableSyntaxOnly) ──────

export type CampaignState = 0 | 1 | 2 | 3;
export const CampaignState = {
  Active: 0 as CampaignState,
  Funded: 1 as CampaignState,
  Completed: 2 as CampaignState,
  Cancelled: 3 as CampaignState,
};

export type MilestoneState = 0 | 1 | 2 | 3 | 4 | 5;
export const MilestoneState = {
  Pending: 0 as MilestoneState,
  VotingOpen: 1 as MilestoneState,
  RevealOpen: 2 as MilestoneState,
  Passed: 3 as MilestoneState,
  Failed: 4 as MilestoneState,
  Inconclusive: 5 as MilestoneState,
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CampaignListItem {
  address: string;
  founder: string;
  title: string;
  goal: bigint;
  createdAt: bigint;
}

export interface CampaignDetails {
  address: string;
  founder: string;
  oracle: string;
  title: string;
  description: string;
  goal: bigint;
  deadline: bigint;
  totalRaised: bigint;
  founderStake: bigint;
  campaignState: CampaignState;
  currentMilestoneIndex: bigint;
  milestoneCount: bigint;
  investorCount: bigint;
  tokenAddress: string;
  tokenBalance?: bigint;
  tokenName?: string;
  tokenSymbol?: string;
  investedAmount?: bigint;
  reputationScore?: bigint;
}

export interface MilestoneDetails {
  index: number;
  description: string;
  fundingBps: bigint;
  state: MilestoneState;
  agentScore: bigint;
  agentScoreSubmitted: boolean;
  commitDeadline: bigint;
  revealDeadline: bigint;
  ethAllocation: bigint;
  fundsReleased: boolean;
  participantCount: bigint;
  hasCommitted?: boolean;
  hasRevealed?: boolean;
}

export interface CommitRecord {
  probability: number; // 0-10000
  salt: string; // 0x-prefixed bytes32
  milestoneIndex: number;
  campaignAddress: string;
  committedAt: number;
}

export interface CreateCampaignParams {
  title: string;
  description: string;
  goal: string;
  deadline: string;
  tokenName: string;
  tokenSymbol: string;
  milestones: { description: string; bps: number }[];
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function getProvider() {
  if (!window.ethereum) throw new Error("No wallet detected");
  return new BrowserProvider(window.ethereum as unknown as Eip1193Provider, LAUNCHVAULT_NETWORK);
}

async function getSigner() {
  return getProvider().getSigner();
}

function factoryRO() {
  return new Contract(getAddress(FACTORY_ADDRESS), FACTORY_V2_ABI, getProvider());
}
async function factoryRW() {
  return new Contract(getAddress(FACTORY_ADDRESS), FACTORY_V2_ABI, await getSigner());
}
function campaignRO(addr: string) {
  return new Contract(getAddress(addr), CAMPAIGN_V2_ABI, getProvider());
}
async function campaignRW(addr: string) {
  return new Contract(getAddress(addr), CAMPAIGN_V2_ABI, await getSigner());
}
function tokenRO(addr: string) {
  return new Contract(getAddress(addr), TOKEN_V2_ABI, getProvider());
}

// ── Block timestamp (use instead of Date.now() for testnet time travel) ───────

/** Returns the current block.timestamp from the chain (not wall clock). */
export async function getBlockTimestamp(): Promise<bigint> {
  const block = await getProvider().getBlock("latest");
  return BigInt(block?.timestamp ?? Math.floor(Date.now() / 1000));
}

// ── Error extraction ──────────────────────────────────────────────────────────

export function extractError(err: unknown): string {
  if (err instanceof Error) {
    const m = err.message;
    const r = m.match(/reason="([^"]+)"/) ?? m.match(/reverted with reason string '([^']+)'/);
    if (r) return r[1];
    if (m.includes("user rejected")) return "Transaction rejected by user";
    if (m.includes("insufficient funds")) return "Insufficient ETH balance";
    return m.slice(0, 140);
  }
  return "Unknown error";
}

// ── Commit-reveal localStorage ────────────────────────────────────────────────

function commitKey(addr: string, idx: number) {
  return `lv_commit_${addr.toLowerCase()}_${idx}`;
}

export function saveCommitRecord(r: CommitRecord) {
  localStorage.setItem(commitKey(r.campaignAddress, r.milestoneIndex), JSON.stringify(r));
}
export function loadCommitRecord(addr: string, idx: number): CommitRecord | null {
  try {
    const raw = localStorage.getItem(commitKey(addr, idx));
    return raw ? (JSON.parse(raw) as CommitRecord) : null;
  } catch { return null; }
}
export function clearCommitRecord(addr: string, idx: number) {
  localStorage.removeItem(commitKey(addr, idx));
}

/** keccak256(abi.encodePacked(probability, salt)) — must match Solidity exactly */
export function buildCommitHash(probability: number, salt: string): string {
  return solidityPackedKeccak256(["uint256", "bytes32"], [BigInt(probability), salt]);
}
export function generateSalt(): string {
  return hexlify(randomBytes(32));
}

// ── Read functions ────────────────────────────────────────────────────────────

export async function fetchAllCampaigns(): Promise<CampaignListItem[]> {
  const factory = factoryRO();
  const raw = await factory.getCampaigns();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return raw.map((c: any) => ({
    address: c.campaignAddress as string,
    founder: c.founder as string,
    title: c.title as string,
    goal: c.goal as bigint,
    createdAt: c.createdAt as bigint,
  }));
}

export async function fetchCampaignDetails(
  campaignAddress: string,
  walletAddress?: string
): Promise<CampaignDetails> {
  const c = campaignRO(campaignAddress);
  const [
    founder, oracle, title, description, goal, deadline,
    totalRaised, founderStake, campaignStateRaw,
    currentMilestoneIndex, milestoneCount, investorCount, tokenAddress,
  ] = await Promise.all([
    c.founder(), c.oracle(), c.title(), c.description(),
    c.goal(), c.deadline(), c.totalRaised(), c.founderStake(),
    c.campaignState(), c.currentMilestoneIndex(),
    c.milestoneCount(), c.investorCount(), c.token(),
  ]);

  const details: CampaignDetails = {
    address: campaignAddress, founder, oracle, title, description,
    goal, deadline, totalRaised, founderStake,
    campaignState: Number(campaignStateRaw) as CampaignState,
    currentMilestoneIndex, milestoneCount, investorCount, tokenAddress,
  };

  if (walletAddress) {
    const t = tokenRO(tokenAddress);
    const [tokenBalance, tokenName, tokenSymbol, investedAmount, reputationScore] =
      await Promise.all([
        t.balanceOf(walletAddress),
        t.name(),
        t.symbol(),
        c.investedAmount(walletAddress),
        t.getReputationScore(walletAddress),
      ]);
    Object.assign(details, { tokenBalance, tokenName, tokenSymbol, investedAmount, reputationScore });
  }

  return details;
}

export async function fetchMilestones(
  campaignAddress: string,
  walletAddress?: string
): Promise<MilestoneDetails[]> {
  const c = campaignRO(campaignAddress);
  const count = Number(await c.milestoneCount());
  const milestones: MilestoneDetails[] = [];

  for (let i = 0; i < count; i++) {
    const [desc, fundingBps, state, agentScore, agentScoreSubmitted,
           commitDeadline, revealDeadline, ethAllocation, fundsReleased, participantCount] =
      await c.getMilestone(i);

    const m: MilestoneDetails = {
      index: i, description: desc, fundingBps,
      state: Number(state) as MilestoneState,
      agentScore, agentScoreSubmitted,
      commitDeadline, revealDeadline, ethAllocation, fundsReleased, participantCount,
    };
    if (walletAddress) {
      const [committed, revealed] = await c.getCommitStatus(i, walletAddress);
      m.hasCommitted = committed;
      m.hasRevealed = revealed;
    }
    milestones.push(m);
  }
  return milestones;
}

// ── Write functions ───────────────────────────────────────────────────────────

export async function investInCampaign(campaignAddress: string, amountEth: string): Promise<string> {
  const c = await campaignRW(campaignAddress);
  const tx: ContractTransactionResponse = await c.invest({ value: parseEther(amountEth) });
  await tx.wait();
  return tx.hash;
}

export async function createCampaign(params: CreateCampaignParams): Promise<string> {
  const factory = await factoryRW();
  const goalWei = parseEther(params.goal);
  const requiredStake = (goalWei * BigInt(1000)) / BigInt(10000); // 10%
  const deadlineTs = BigInt(Math.floor(new Date(params.deadline).getTime() / 1000));

  const tx: ContractTransactionResponse = await factory.createCampaign(
    params.title, params.description, goalWei, deadlineTs,
    params.tokenName, params.tokenSymbol,
    params.milestones.map((m) => m.description),
    params.milestones.map((m) => m.bps),
    { value: requiredStake }
  );
  const receipt = await tx.wait();

  const iface = factory.interface;
  for (const log of receipt?.logs ?? []) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "CampaignCreated") return parsed.args.campaignAddress as string;
    } catch { /* skip */ }
  }
  throw new Error("CampaignCreated event not found in receipt");
}

export async function startMilestoneVote(campaignAddress: string): Promise<string> {
  const c = await campaignRW(campaignAddress);
  const tx: ContractTransactionResponse = await c.startMilestoneVote();
  await tx.wait();
  return tx.hash;
}

export async function commitVote(
  campaignAddress: string,
  milestoneIndex: number,
  probability: number // 0–10000
): Promise<CommitRecord> {
  const salt = generateSalt();
  const hash = buildCommitHash(probability, salt);
  const c = await campaignRW(campaignAddress);
  const tx: ContractTransactionResponse = await c.commitVote(milestoneIndex, hash);
  await tx.wait();
  const record: CommitRecord = { probability, salt, milestoneIndex, campaignAddress, committedAt: Date.now() };
  saveCommitRecord(record);
  return record;
}

export async function revealVote(campaignAddress: string, milestoneIndex: number): Promise<string> {
  const record = loadCommitRecord(campaignAddress, milestoneIndex);
  if (!record) throw new Error("No saved commit found — was this vote committed in this browser?");
  const c = await campaignRW(campaignAddress);
  const tx: ContractTransactionResponse = await c.revealVote(milestoneIndex, BigInt(record.probability), record.salt);
  await tx.wait();
  clearCommitRecord(campaignAddress, milestoneIndex);
  return tx.hash;
}

export async function resolveVote(campaignAddress: string, milestoneIndex: number): Promise<string> {
  const c = await campaignRW(campaignAddress);
  const tx: ContractTransactionResponse = await c.resolveVote(milestoneIndex);
  await tx.wait();
  return tx.hash;
}

export async function releaseMilestone(campaignAddress: string, milestoneIndex: number): Promise<string> {
  const c = await campaignRW(campaignAddress);
  const tx: ContractTransactionResponse = await c.releaseMilestone(milestoneIndex);
  await tx.wait();
  return tx.hash;
}

export async function claimRefund(campaignAddress: string, milestoneIndex: number): Promise<string> {
  const c = await campaignRW(campaignAddress);
  const tx: ContractTransactionResponse = await c.claimRefund(milestoneIndex);
  await tx.wait();
  return tx.hash;
}

export async function cancelCampaign(campaignAddress: string): Promise<string> {
  const c = await campaignRW(campaignAddress);
  const tx: ContractTransactionResponse = await c.cancelCampaign();
  await tx.wait();
  return tx.hash;
}

/** Oracle-only: write AI verification score on-chain (0–10000) */
export async function submitAgentScore(
  campaignAddress: string,
  milestoneIndex: number,
  score: number // 0–10000
): Promise<string> {
  const c = await campaignRW(campaignAddress);
  const tx: ContractTransactionResponse = await c.submitAgentScore(milestoneIndex, BigInt(score));
  await tx.wait();
  return tx.hash;
}

// ── Formatting helpers ────────────────────────────────────────────────────────

export { formatEther, parseEther };

export function fmtEth(wei: bigint, decimals = 4): string {
  return Number(formatEther(wei)).toFixed(decimals);
}

export function fmtScore(score: bigint): string {
  return (Number(score) / 100).toFixed(0) + "%";
}

export function fmtBps(bps: bigint): string {
  return (Number(bps) / 100).toFixed(0) + "%";
}

export function milestoneStateLabel(state: MilestoneState): string {
  const labels: Record<number, string> = {
    0: "Pending", 1: "Commit Phase", 2: "Reveal Phase",
    3: "Passed", 4: "Failed", 5: "Inconclusive",
  };
  return labels[state] ?? "Unknown";
}

export function campaignStateLabel(state: CampaignState): string {
  const labels: Record<number, string> = {
    0: "Active", 1: "Funded", 2: "Completed", 3: "Cancelled",
  };
  return labels[state] ?? "Unknown";
}

// ── Legacy type aliases ───────────────────────────────────────────────────────
export type OnChainCampaign = CampaignListItem;
export type CampaignInfo = CampaignDetails;
