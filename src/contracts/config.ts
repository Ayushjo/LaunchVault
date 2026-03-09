import CampaignABI from "./Campaign.json";
import CampaignTokenABI from "./CampaignToken.json";
import CampaignFactoryABI from "./CampaignFactory.json";

export const CONTRACT_CONFIG = {
  factoryAddress: "0x40d95667d7Fb3af5cDba41E3EDf4414D1a26148a",
  chainId: 9991,
  networkName: "LaunchVault Testnet",
  explorerUrl: "https://dashboard.tenderly.co",
};

export const CAMPAIGN_ABI = CampaignABI.abi;
export const CAMPAIGN_TOKEN_ABI = CampaignTokenABI.abi;
export const FACTORY_ABI = CampaignFactoryABI.abi;
