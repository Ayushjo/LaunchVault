import CampaignABI from "./Campaign.json";
import CampaignTokenABI from "./CampaignToken.json";

export const CONTRACT_CONFIG = {
  campaignAddress: "0x4991DB216e4A866F0b96269C490Ab4215aceB2C5",
  tokenAddress: "0x389cF9a5F0B716F4455CF8d58E41a43321635344",
  chainId: 9991,
  networkName: "LaunchVault Testnet",
  explorerUrl: "https://dashboard.tenderly.co",
};

export const CAMPAIGN_ABI = CampaignABI.abi;
export const CAMPAIGN_TOKEN_ABI = CampaignTokenABI.abi;
