import { BrowserProvider, Contract, parseEther } from "ethers";
import {
  CAMPAIGN_ABI,
  FACTORY_ABI,
  CONTRACT_CONFIG,
} from "../contracts/config";

export interface OnChainCampaign {
  address: string;
  founder: string;
  title: string;
  goal: bigint;
  deadline: bigint;
  createdAt: bigint;
}

export interface CampaignInfo {
  founder: string;
  title: string;
  description: string;
  milestoneDescription: string;
  goal: bigint;
  deadline: bigint;
  totalRaised: bigint;
  goalReached: boolean;
  fundsReleased: boolean;
  cancelled: boolean;
}

// Get all campaigns from factory
export async function fetchAllCampaigns(): Promise<OnChainCampaign[]> {
  const provider = new BrowserProvider((window as any).ethereum);
  const factory = new Contract(
    CONTRACT_CONFIG.factoryAddress,
    FACTORY_ABI,
    provider,
  );
  const campaigns = await factory.getCampaigns();
  return campaigns.map((c: any) => ({
    address: c.campaignAddress,
    founder: c.founder,
    title: c.title,
    goal: c.goal,
    deadline: c.deadline,
    createdAt: c.createdAt,
  }));
}

// Get single campaign details
export async function fetchCampaignInfo(
  address: string,
): Promise<CampaignInfo> {
  const provider = new BrowserProvider((window as any).ethereum);
  const campaign = new Contract(address, CAMPAIGN_ABI, provider);
  const info = await campaign.getCampaignInfo();
  return {
    founder: info[0],
    title: info[1],
    description: info[2],
    milestoneDescription: info[3],
    goal: info[4],
    deadline: info[5],
    totalRaised: info[6],
    goalReached: info[7],
    fundsReleased: info[8],
    cancelled: info[9],
  };
}

// Invest in a campaign
export async function investInCampaign(
  address: string,
  amountEth: string,
): Promise<string> {
  const provider = new BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const campaign = new Contract(address, CAMPAIGN_ABI, signer);
  const tx = await campaign.invest({ value: parseEther(amountEth) });
  await tx.wait();
  return tx.hash;
}

// Deploy new campaign via factory
export async function createCampaign(params: {
  title: string;
  description: string;
  milestoneDescription: string;
  goal: string;
  deadline: string;
  tokenSymbol: string;
}): Promise<string> {
  const provider = new BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const factory = new Contract(
    CONTRACT_CONFIG.factoryAddress,
    FACTORY_ABI,
    signer,
  );

  const goalWei = parseEther(params.goal);
  const deadlineTs = BigInt(
    Math.floor(new Date(params.deadline).getTime() / 1000),
  );
  const tokenName = params.title.split(" ")[0] + " Token";

  const tx = await factory.createCampaign(
    params.title,
    params.description,
    params.milestoneDescription,
    goalWei,
    deadlineTs,
    tokenName,
    params.tokenSymbol,
  );

  const receipt = await tx.wait();

  // Extract deployed campaign address from event
  const iface = factory.interface;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "CampaignCreated") {
        return parsed.args[0]; // campaignAddress
      }
    } catch {}
  }

  throw new Error("Could not find CampaignCreated event in receipt");
}
export async function voteOnCampaign(
  address: string,
  approve: boolean,
): Promise<string> {
  const provider = new BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const campaign = new Contract(address, CAMPAIGN_ABI, signer);
  const tx = await campaign.vote(approve);
  await tx.wait();
  return tx.hash;
}

export async function startVoting(address: string): Promise<string> {
  const provider = new BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  const campaign = new Contract(address, CAMPAIGN_ABI, signer);
  const tx = await campaign.startVoting();
  await tx.wait();
  return tx.hash;
}

export async function getVotingStatus(
  address: string,
): Promise<{
  active: boolean;
  endTime: bigint;
  yesVotes: bigint;
  noVotes: bigint;
}> {
  const provider = new BrowserProvider((window as any).ethereum);
  const contract = new Contract(address, CAMPAIGN_ABI, provider);
  const [active, endTime, yesVotes, noVotes] = await contract.getVotingStatus();
  return { active, endTime, yesVotes, noVotes };
}