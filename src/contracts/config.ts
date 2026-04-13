import CampaignV2ABI from "./CampaignV2.json";
import CampaignFactoryV2ABI from "./CampaignFactoryV2.json";
import CampaignTokenV2ABI from "./CampaignTokenV2.json";

// ── Network ──────────────────────────────────────────────────────────────────
export const CHAIN_ID = 9991;
export const NETWORK_NAME = "LaunchVault Testnet";
export const EXPLORER_URL = "https://dashboard.tenderly.co";

// ── Contract Addresses ───────────────────────────────────────────────────────
// Override via VITE_FACTORY_ADDRESS in .env for local development
export const FACTORY_ADDRESS: string =
  (import.meta.env.VITE_FACTORY_ADDRESS as string) ??
  "0x40d95667d7Fb3af5cDba41E3EDf4414D1a26148a";

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
