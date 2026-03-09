import { expect } from "chai";
import hre from "hardhat";

describe("CampaignFactory", function () {
  let ethers: any;
  let factory: any;
  let founder: any;
  let investor: any;

  // Test campaign params
  const TITLE = "EcoTrace — Carbon Footprint Tracker";
  const DESCRIPTION = "A decentralized carbon tracking platform";
  const MILESTONE = "Launch MVP with 500 active users";
  const GOAL = 1000000000000000n; // 0.001 ETH
  const TOKEN_NAME = "EcoTrace Token";
  const TOKEN_SYMBOL = "ECOT";

  function getDeadline(daysFromNow = 7) {
    return BigInt(Math.floor(Date.now() / 1000) + daysFromNow * 24 * 60 * 60);
  }

  before(async function () {
    const connection = await hre.network.connect();
    ethers = connection.ethers;
  });

  beforeEach(async function () {
    [founder, investor] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CampaignFactory");
    factory = await Factory.deploy();
    await factory.waitForDeployment();
  });

  // ─── Deployment ────────────────────────────────────────────

  describe("Deployment", function () {
    it("deploys successfully", async function () {
      const address = await factory.getAddress();
      expect(address).to.be.a("string");
      expect(address).to.match(/^0x[0-9a-fA-F]{40}$/);
    });

    it("starts with zero campaigns", async function () {
      const count = await factory.getCampaignCount();
      expect(count).to.equal(0n);
    });

    it("returns empty campaigns array", async function () {
      const campaigns = await factory.getCampaigns();
      expect(campaigns.length).to.equal(0);
    });
  });

  // ─── Create Campaign ───────────────────────────────────────

  describe("createCampaign", function () {
    it("deploys a new Campaign contract", async function () {
      const tx = await factory
        .connect(founder)
        .createCampaign(
          TITLE,
          DESCRIPTION,
          MILESTONE,
          GOAL,
          getDeadline(),
          TOKEN_NAME,
          TOKEN_SYMBOL,
        );
      await tx.wait();

      const count = await factory.getCampaignCount();
      expect(count).to.equal(1n);
    });

    it("returns the new campaign address", async function () {
      const address = await factory
        .connect(founder)
        .createCampaign.staticCall(
          TITLE,
          DESCRIPTION,
          MILESTONE,
          GOAL,
          getDeadline(),
          TOKEN_NAME,
          TOKEN_SYMBOL,
        );
      expect(address).to.match(/^0x[0-9a-fA-F]{40}$/);
    });

    it("stores correct campaign info", async function () {
      const deadline = getDeadline();
      await factory
        .connect(founder)
        .createCampaign(
          TITLE,
          DESCRIPTION,
          MILESTONE,
          GOAL,
          deadline,
          TOKEN_NAME,
          TOKEN_SYMBOL,
        );

      const campaigns = await factory.getCampaigns();
      expect(campaigns[0].founder).to.equal(founder.address);
      expect(campaigns[0].title).to.equal(TITLE);
      expect(campaigns[0].goal).to.equal(GOAL);
      expect(campaigns[0].deadline).to.equal(deadline);
    });

    it("emits CampaignCreated event", async function () {
      const deadline = getDeadline();
      const tx = await factory
        .connect(founder)
        .createCampaign(
          TITLE,
          DESCRIPTION,
          MILESTONE,
          GOAL,
          deadline,
          TOKEN_NAME,
          TOKEN_SYMBOL,
        );

      const receipt = await tx.wait();
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = factory.interface.parseLog(log);
          return parsed?.name === "CampaignCreated";
        } catch {
          return false;
        }
      });
      expect(event).to.not.be.undefined;
    });

    it("sets msg.sender as founder of deployed campaign", async function () {
      const campaignAddress = await factory
        .connect(founder)
        .createCampaign.staticCall(
          TITLE,
          DESCRIPTION,
          MILESTONE,
          GOAL,
          getDeadline(),
          TOKEN_NAME,
          TOKEN_SYMBOL,
        );

      await factory
        .connect(founder)
        .createCampaign(
          TITLE,
          DESCRIPTION,
          MILESTONE,
          GOAL,
          getDeadline(),
          TOKEN_NAME,
          TOKEN_SYMBOL,
        );

      const Campaign = await ethers.getContractFactory("Campaign");
      const campaign = Campaign.attach(campaignAddress);
      expect(await campaign.founder()).to.equal(founder.address);
    });

    it("deployed campaign accepts investments", async function () {
      const campaignAddress = await factory
        .connect(founder)
        .createCampaign.staticCall(
          TITLE,
          DESCRIPTION,
          MILESTONE,
          GOAL,
          getDeadline(),
          TOKEN_NAME,
          TOKEN_SYMBOL,
        );

      await factory
        .connect(founder)
        .createCampaign(
          TITLE,
          DESCRIPTION,
          MILESTONE,
          GOAL,
          getDeadline(),
          TOKEN_NAME,
          TOKEN_SYMBOL,
        );

      const Campaign = await ethers.getContractFactory("Campaign");
      const campaign = Campaign.attach(campaignAddress);

      await campaign.connect(investor).invest({ value: 500000000000000n });
      expect(await campaign.totalRaised()).to.equal(500000000000000n);
    });

    it("rejects campaign with zero goal", async function () {
      await expect(
        factory
          .connect(founder)
          .createCampaign(
            TITLE,
            DESCRIPTION,
            MILESTONE,
            0n,
            getDeadline(),
            TOKEN_NAME,
            TOKEN_SYMBOL,
          ),
      ).to.be.revertedWith("Goal must be greater than 0");
    });

    it("rejects campaign with past deadline", async function () {
      const pastDeadline = BigInt(Math.floor(Date.now() / 1000) - 1000);
      await expect(
        factory
          .connect(founder)
          .createCampaign(
            TITLE,
            DESCRIPTION,
            MILESTONE,
            GOAL,
            pastDeadline,
            TOKEN_NAME,
            TOKEN_SYMBOL,
          ),
      ).to.be.revertedWith("Deadline must be in future");
    });

    it("multiple founders can create campaigns", async function () {
      const deadline = getDeadline();

      await factory
        .connect(founder)
        .createCampaign(
          TITLE,
          DESCRIPTION,
          MILESTONE,
          GOAL,
          deadline,
          TOKEN_NAME,
          TOKEN_SYMBOL,
        );
      await factory
        .connect(investor)
        .createCampaign(
          "Second Campaign",
          DESCRIPTION,
          MILESTONE,
          GOAL,
          deadline,
          "Second Token",
          "SCND",
        );

      const count = await factory.getCampaignCount();
      expect(count).to.equal(2n);
    });

    it("each campaign gets its own token contract", async function () {
      const addr1 = await factory
        .connect(founder)
        .createCampaign.staticCall(
          TITLE,
          DESCRIPTION,
          MILESTONE,
          GOAL,
          getDeadline(),
          TOKEN_NAME,
          TOKEN_SYMBOL,
        );
      await factory
        .connect(founder)
        .createCampaign(
          TITLE,
          DESCRIPTION,
          MILESTONE,
          GOAL,
          getDeadline(),
          TOKEN_NAME,
          TOKEN_SYMBOL,
        );

      const addr2 = await factory
        .connect(investor)
        .createCampaign.staticCall(
          "Second",
          DESCRIPTION,
          MILESTONE,
          GOAL,
          getDeadline(),
          "Second",
          "SCND",
        );
      await factory
        .connect(investor)
        .createCampaign(
          "Second",
          DESCRIPTION,
          MILESTONE,
          GOAL,
          getDeadline(),
          "Second",
          "SCND",
        );

      const Campaign = await ethers.getContractFactory("Campaign");
      const c1 = Campaign.attach(addr1);
      const c2 = Campaign.attach(addr2);

      const token1 = await c1.token();
      const token2 = await c2.token();
      expect(token1).to.not.equal(token2);
    });
  });

  // ─── Get Campaigns ─────────────────────────────────────────

  describe("getCampaigns", function () {
    it("returns all campaigns in order", async function () {
      const deadline = getDeadline();

      await factory
        .connect(founder)
        .createCampaign(
          "Campaign 1",
          DESCRIPTION,
          MILESTONE,
          GOAL,
          deadline,
          "TK1",
          "TK1",
        );
      await factory
        .connect(founder)
        .createCampaign(
          "Campaign 2",
          DESCRIPTION,
          MILESTONE,
          GOAL,
          deadline,
          "TK2",
          "TK2",
        );

      const campaigns = await factory.getCampaigns();
      expect(campaigns.length).to.equal(2);
      expect(campaigns[0].title).to.equal("Campaign 1");
      expect(campaigns[1].title).to.equal("Campaign 2");
    });

    it("stores correct createdAt timestamp", async function () {
      const before = BigInt(Math.floor(Date.now() / 1000) - 5);
      await factory
        .connect(founder)
        .createCampaign(
          TITLE,
          DESCRIPTION,
          MILESTONE,
          GOAL,
          getDeadline(),
          TOKEN_NAME,
          TOKEN_SYMBOL,
        );
      const after = BigInt(Math.floor(Date.now() / 1000) + 30);

      const campaigns = await factory.getCampaigns();
      expect(campaigns[0].createdAt).to.be.gte(before);
      expect(campaigns[0].createdAt).to.be.lte(after);
    });
  });
});
