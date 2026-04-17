import CampaignV2ABI from "./CampaignV2.json";
import CampaignFactoryV2ABI from "./CampaignFactoryV2.json";
import CampaignTokenV2ABI from "./CampaignTokenV2.json";

// ── Network ──────────────────────────────────────────────────────────────────
export const CHAIN_ID   = Number(import.meta.env.VITE_CHAIN_ID ?? 9991);
export const RPC_URL    = (import.meta.env.VITE_RPC_URL as string) ??
  "https://virtual.mainnet.eu.rpc.tenderly.co/c416a257-7f66-496d-a5fe-44177d251811";
export const NETWORK_NAME = "LaunchVault Testnet";
export const EXPLORER_URL = "https://dashboard.tenderly.co";

// ── Contract Addresses ───────────────────────────────────────────────────────
export const FACTORY_ADDRESS: string =
  (import.meta.env.VITE_FACTORY_ADDRESS as string) ??
  "0x5bCC3154698bBC205ABF09351A52DD2d1A39F608";

// ── ABIs ─────────────────────────────────────────────────────────────────────
export const CAMPAIGN_V2_ABI = CampaignV2ABI.abi;
export const FACTORY_V2_ABI = CampaignFactoryV2ABI.abi;
export const TOKEN_V2_ABI = CampaignTokenV2ABI.abi;

// ── Legacy aliases (some pages still import these names) ─────────────────────
export const CONTRACT_CONFIG = {
  factoryAddress: FACTORY_ADDRESS,
  chainId: CHAIN_ID,
  networkName: NETWORK_NAME,
  explorerUrl: EXPLORER_URL,
};
export const CAMPAIGN_ABI = CAMPAIGN_V2_ABI;
export const CAMPAIGN_TOKEN_ABI = TOKEN_V2_ABI;
export const FACTORY_ABI = FACTORY_V2_ABI;
