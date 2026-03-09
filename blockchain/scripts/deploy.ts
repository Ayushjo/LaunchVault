import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();
  const ethers = connection.ethers;

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");

  // Deploy Campaign contract
  const CampaignFactory = await ethers.getContractFactory("Campaign");

  const campaign = await CampaignFactory.deploy(
    deployer.address, // founder
    "EcoTrace — Carbon Footprint Tracker", // title
    "A decentralized carbon tracking platform", // description
    "Launch MVP with 500 active users", // milestone
    ethers.parseEther("0.001"), // goal (0.01 MATIC for testing)
    Math.floor(Date.now() / 1000) + 86400 * 7, // deadline (7 days from now)
    "EcoTrace Token", // token name
    "ECOT", // token symbol
  );

  await campaign.waitForDeployment();

  const campaignAddress = await campaign.getAddress();
  const tokenAddress = await campaign.token();

  console.log("✅ Campaign deployed to:", campaignAddress);
  console.log("✅ Token deployed to:", tokenAddress);
  console.log("\nSave these addresses — you'll need them for the frontend!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
