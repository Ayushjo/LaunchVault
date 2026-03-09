import hre from "hardhat";

async function main() {
  const connection = await hre.network.connect();
  const ethers = connection.ethers;

  console.log("Deploying CampaignFactory...");

  const Factory = await ethers.getContractFactory("CampaignFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const address = await factory.getAddress();
  console.log("CampaignFactory deployed to:", address);
}

main().catch(console.error);
