import { expect } from "chai";
import hre from "hardhat";
import type {
  Campaign,
  CampaignToken,
} from "../types/ethers-contracts/index.js";

let ethers: any;

before(async function () {
  const connection = await hre.network.connect();
  ethers = connection.ethers;
});

describe("Campaign", function () {
  // ─── Test Setup ──────────────────────────────────────────────

  let campaign: Campaign;
  let token: CampaignToken;
  let founder: any;
  let investor1: any;
  let investor2: any;
  let investor3: any;
  let stranger: any;

  const GOAL = 1000000000000000000n; // 1 ETH in wei
  const SEVEN_DAYS = 7 * 24 * 60 * 60;
  const VOTING_PERIOD = 7 * 24 * 60 * 60;

  async function getDeadline(secondsFromNow: number) {
    const block = await ethers.provider.getBlock("latest");
    return block!.timestamp + secondsFromNow;
  }

  async function deployCampaign(
    goalOverride?: bigint,
    deadlineOffset = SEVEN_DAYS,
  ) {
    const deadline = await getDeadline(deadlineOffset);
    const CampaignFactory = await ethers.getContractFactory("Campaign");
    const c = await CampaignFactory.deploy(
      founder.address,
      "EcoTrace",
      "Carbon tracking platform",
      "Launch MVP with 500 users",
      goalOverride ?? GOAL,
      deadline,
      "EcoTrace Token",
      "ECOT",
    );
    await c.waitForDeployment();
    return c;
  }

  async function timeTravel(seconds: number) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
  }

  beforeEach(async function () {
    [founder, investor1, investor2, investor3, stranger] =
      await ethers.getSigners();
    campaign = await deployCampaign();
    token = await ethers.getContractAt("CampaignToken", await campaign.token());
  });

  // ─── Deployment Tests ─────────────────────────────────────────

  describe("Deployment", function () {
    it("sets the correct founder", async function () {
      expect(await campaign.founder()).to.equal(founder.address);
    });

    it("sets the correct goal", async function () {
      expect(await campaign.goal()).to.equal(GOAL);
    });

    it("sets title and description correctly", async function () {
      expect(await campaign.title()).to.equal("EcoTrace");
      expect(await campaign.description()).to.equal("Carbon tracking platform");
    });

    it("deploys a token contract", async function () {
      const tokenAddress = await campaign.token();
      expect(tokenAddress).to.not.equal(
        "0x0000000000000000000000000000000000000000",
      );
    });

    it("token has correct name and symbol", async function () {
      expect(await token.name()).to.equal("EcoTrace Token");
      expect(await token.symbol()).to.equal("ECOT");
    });

    it("starts with zero raised", async function () {
      expect(await campaign.totalRaised()).to.equal(0);
    });

    it("starts with goalReached false", async function () {
      expect(await campaign.goalReached()).to.equal(false);
    });

    it("reverts if goal is zero", async function () {
      await expect(deployCampaign(0n)).to.be.revertedWith(
        "Goal must be greater than 0",
      );
    });

    it("reverts if deadline is in the past", async function () {
      const CampaignFactory = await ethers.getContractFactory("Campaign");
      const pastDeadline = Math.floor(Date.now() / 1000) - 1000;
      await expect(
        CampaignFactory.deploy(
          founder.address,
          "Test",
          "Test",
          "Test milestone",
          GOAL,
          pastDeadline,
          "Test Token",
          "TST",
        ),
      ).to.be.revertedWith("Deadline must be in future");
    });
  });

  // ─── Invest Tests ─────────────────────────────────────────────

  describe("Investing", function () {
    it("accepts ETH investment", async function () {
      await campaign.connect(investor1).invest({
        value: 500000000000000000n,
      });
      expect(await campaign.totalRaised()).to.equal(500000000000000000n);
    });

    it("records contribution correctly", async function () {
      await campaign.connect(investor1).invest({
        value: 500000000000000000n,
      });
      expect(await campaign.getContribution(investor1.address)).to.equal(
        500000000000000000n,
      );
    });

    it("mints tokens to investor", async function () {
      await campaign.connect(investor1).invest({
        value: 500000000000000000n,
      });
      const balance = await token.balanceOf(investor1.address);
      expect(balance).to.be.gt(0);
    });

    it("mints proportional tokens", async function () {
      // investor1 invests 50% of goal → should get 50% of tokens
      await campaign.connect(investor1).invest({
        value: 500000000000000000n,
      });
      const balance = await token.balanceOf(investor1.address);
      const halfSupply = 10000000000000000000000n / 2n;
      expect(balance).to.equal(halfSupply);
    });

    it("tracks multiple investors", async function () {
      await campaign.connect(investor1).invest({
        value: 300000000000000000n,
      });
      await campaign.connect(investor2).invest({
        value: 300000000000000000n,
      });
      expect(await campaign.getInvestorCount()).to.equal(2);
    });

    it("accumulates multiple investments from same investor", async function () {
      await campaign.connect(investor1).invest({
        value: 300000000000000000n,
      });
      await campaign.connect(investor1).invest({
        value: 200000000000000000n,
      });
      expect(await campaign.getContribution(investor1.address)).to.equal(
        500000000000000000n,
      );
    });

    it("sets goalReached when goal is met", async function () {
      await campaign.connect(investor1).invest({ value: GOAL });
      expect(await campaign.goalReached()).to.equal(true);
    });

    it("emits Invested event", async function () {
      await expect(
        campaign.connect(investor1).invest({
          value: 500000000000000000n,
        }),
      ).to.emit(campaign, "Invested");
    });

    it("reverts if founder tries to invest", async function () {
      await expect(
        campaign.connect(founder).invest({ value: 100000000000000000n }),
      ).to.be.revertedWith("Founder cannot invest");
    });

    it("reverts if zero ETH sent", async function () {
      await expect(
        campaign.connect(investor1).invest({ value: 0 }),
      ).to.be.revertedWith("Must send ETH to invest");
    });

    it("reverts if deadline passed", async function () {
      await timeTravel(SEVEN_DAYS + 1);
      await expect(
        campaign.connect(investor1).invest({ value: 100000000000000000n }),
      ).to.be.revertedWith("Campaign deadline passed");
    });
  });

  // ─── Voting Tests ─────────────────────────────────────────────

  describe("Voting", function () {
    beforeEach(async function () {
      // Fund campaign fully before voting tests
      await campaign.connect(investor1).invest({
        value: 400000000000000000n,
      });
      await campaign.connect(investor2).invest({
        value: 300000000000000000n,
      });
      await campaign.connect(investor3).invest({
        value: 300000000000000000n,
      });
    });

    it("founder can start voting after goal reached", async function () {
      await campaign.connect(founder).startVoting();
      expect(await campaign.votingActive()).to.equal(true);
    });

    it("sets voting deadline 7 days from now", async function () {
      await campaign.connect(founder).startVoting();
      const block = await ethers.provider.getBlock("latest");
      const votingDeadline = await campaign.votingDeadline();
      expect(votingDeadline).to.be.approximately(
        BigInt(block!.timestamp) + BigInt(VOTING_PERIOD),
        5n,
      );
    });

    it("reverts if non-founder tries to start voting", async function () {
      await expect(
        campaign.connect(investor1).startVoting(),
      ).to.be.revertedWith("Only founder can call this");
    });

    it("reverts if goal not reached", async function () {
      const freshCampaign = await deployCampaign();
      await expect(
        freshCampaign.connect(founder).startVoting(),
      ).to.be.revertedWith("Goal not reached yet");
    });

    it("investor can vote yes", async function () {
      await campaign.connect(founder).startVoting();
      await campaign.connect(investor1).vote(true);
      expect(await campaign.voteYes()).to.be.gt(0);
    });

    it("investor can vote no", async function () {
      await campaign.connect(founder).startVoting();
      await campaign.connect(investor1).vote(false);
      expect(await campaign.voteNo()).to.be.gt(0);
    });

    it("voting is weighted by token balance", async function () {
      await campaign.connect(founder).startVoting();
      await campaign.connect(investor1).vote(true);
      await campaign.connect(investor2).vote(true);

      const investor1Tokens = await token.balanceOf(investor1.address);
      const investor2Tokens = await token.balanceOf(investor2.address);
      expect(await campaign.voteYes()).to.equal(
        investor1Tokens + investor2Tokens,
      );
    });

    it("investor cannot vote twice", async function () {
      await campaign.connect(founder).startVoting();
      await campaign.connect(investor1).vote(true);
      await expect(campaign.connect(investor1).vote(true)).to.be.revertedWith(
        "Already voted",
      );
    });

    it("stranger cannot vote", async function () {
      await campaign.connect(founder).startVoting();
      await expect(campaign.connect(stranger).vote(true)).to.be.revertedWith(
        "Must be an investor to vote",
      );
    });

    it("reverts vote after voting period ends", async function () {
      await campaign.connect(founder).startVoting();
      await timeTravel(VOTING_PERIOD + 1);
      await expect(campaign.connect(investor1).vote(true)).to.be.revertedWith(
        "Voting period ended",
      );
    });

    it("emits VoteCast event", async function () {
      await campaign.connect(founder).startVoting();
      await expect(campaign.connect(investor1).vote(true)).to.emit(
        campaign,
        "VoteCast",
      );
    });
  });

  // ─── Fund Release Tests ───────────────────────────────────────

  describe("Fund Release", function () {
    beforeEach(async function () {
      await campaign.connect(investor1).invest({
        value: 600000000000000000n,
      });
      await campaign.connect(investor2).invest({
        value: 400000000000000000n,
      });
      await campaign.connect(founder).startVoting();
      await campaign.connect(investor1).vote(true);
      await campaign.connect(investor2).vote(true);
      await timeTravel(VOTING_PERIOD + 1);
    });

    it("founder can release funds after vote passes", async function () {
      await expect(campaign.connect(founder).releaseFunds()).to.emit(
        campaign,
        "FundsReleased",
      );
    });

    it("transfers ETH to founder", async function () {
      const balanceBefore = await ethers.provider.getBalance(founder.address);
      await campaign.connect(founder).releaseFunds();
      const balanceAfter = await ethers.provider.getBalance(founder.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("sets fundsReleased to true", async function () {
      await campaign.connect(founder).releaseFunds();
      expect(await campaign.fundsReleased()).to.equal(true);
    });

    it("reverts if called twice", async function () {
      await campaign.connect(founder).releaseFunds();
      await expect(campaign.connect(founder).releaseFunds()).to.be.revertedWith(
        "Funds already released",
      );
    });

    it("reverts if quorum not reached", async function () {
      const freshCampaign = await deployCampaign();
      await freshCampaign.connect(investor1).invest({
        value: 100000000000000000n,
      });
      await freshCampaign.connect(investor2).invest({
        value: 450000000000000000n,
      });
      await freshCampaign.connect(investor3).invest({
        value: 450000000000000000n,
      });
      await freshCampaign.connect(founder).startVoting();
      // Only investor1 votes (10% of tokens — below 51% quorum)
      await freshCampaign.connect(investor1).vote(true);
      await timeTravel(VOTING_PERIOD + 1);
      await expect(
        freshCampaign.connect(founder).releaseFunds(),
      ).to.be.revertedWith("Quorum not reached");
    });

    it("reverts if vote did not pass", async function () {
      const freshCampaign = await deployCampaign();
      await freshCampaign.connect(investor1).invest({
        value: 600000000000000000n,
      });
      await freshCampaign.connect(investor2).invest({
        value: 400000000000000000n,
      });
      await freshCampaign.connect(founder).startVoting();
      await freshCampaign.connect(investor1).vote(false);
      await freshCampaign.connect(investor2).vote(false);
      await timeTravel(VOTING_PERIOD + 1);
      await expect(
        freshCampaign.connect(founder).releaseFunds(),
      ).to.be.revertedWith("Vote did not pass");
    });
  });

  // ─── Refund Tests ─────────────────────────────────────────────

  describe("Refunds", function () {
    it("investor can refund if goal not met after deadline", async function () {
      await campaign.connect(investor1).invest({
        value: 300000000000000000n,
      });
      await timeTravel(SEVEN_DAYS + 1);
      const balanceBefore = await ethers.provider.getBalance(investor1.address);
      await campaign.connect(investor1).claimRefund();
      const balanceAfter = await ethers.provider.getBalance(investor1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("reverts refund if goal was reached", async function () {
      await campaign.connect(investor1).invest({ value: GOAL });
      await timeTravel(SEVEN_DAYS + 1);
      await expect(
        campaign.connect(investor1).claimRefund(),
      ).to.be.revertedWith("Goal was reached, no refunds");
    });

    it("reverts refund if no contribution", async function () {
      await timeTravel(SEVEN_DAYS + 1);
      await expect(campaign.connect(stranger).claimRefund()).to.be.revertedWith(
        "No contribution found",
      );
    });

    it("reverts double refund", async function () {
      await campaign.connect(investor1).invest({
        value: 300000000000000000n,
      });
      await timeTravel(SEVEN_DAYS + 1);
      await campaign.connect(investor1).claimRefund();
      await expect(
        campaign.connect(investor1).claimRefund(),
      ).to.be.revertedWith("No contribution found");
    });

    it("emits Refunded event", async function () {
      await campaign.connect(investor1).invest({
        value: 300000000000000000n,
      });
      await timeTravel(SEVEN_DAYS + 1);
      await expect(campaign.connect(investor1).claimRefund()).to.emit(
        campaign,
        "Refunded",
      );
    });
  });

  // ─── Cancel Tests ─────────────────────────────────────────────

  describe("Cancel Campaign", function () {
    it("founder can cancel before goal reached", async function () {
      await campaign.connect(founder).cancelCampaign();
      expect(await campaign.cancelled()).to.equal(true);
    });

    it("emits CampaignCancelled event", async function () {
      await expect(campaign.connect(founder).cancelCampaign()).to.emit(
        campaign,
        "CampaignCancelled",
      );
    });

    it("reverts cancel after goal reached", async function () {
      await campaign.connect(investor1).invest({ value: GOAL });
      await expect(
        campaign.connect(founder).cancelCampaign(),
      ).to.be.revertedWith("Cannot cancel after goal reached");
    });

    it("reverts cancel by non-founder", async function () {
      await expect(
        campaign.connect(investor1).cancelCampaign(),
      ).to.be.revertedWith("Only founder can call this");
    });

    it("investors can refund after cancellation", async function () {
      await campaign.connect(investor1).invest({
        value: 300000000000000000n,
      });
      await campaign.connect(founder).cancelCampaign();
      const balanceBefore = await ethers.provider.getBalance(investor1.address);
      await campaign.connect(investor1).claimRefundCancelled();
      const balanceAfter = await ethers.provider.getBalance(investor1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("reverts invest after cancellation", async function () {
      await campaign.connect(founder).cancelCampaign();
      await expect(
        campaign.connect(investor1).invest({ value: 100000000000000000n }),
      ).to.be.revertedWith("Campaign is cancelled");
    });
  });

  // ─── View Functions ───────────────────────────────────────────

  describe("View Functions", function () {
    it("getCampaignInfo returns correct data", async function () {
      const info = await campaign.getCampaignInfo();
      expect(info._founder).to.equal(founder.address);
      expect(info._title).to.equal("EcoTrace");
      expect(info._goal).to.equal(GOAL);
      expect(info._goalReached).to.equal(false);
      expect(info._fundsReleased).to.equal(false);
      expect(info._cancelled).to.equal(false);
    });

    it("getVotingStatus returns correct data", async function () {
      await campaign.connect(investor1).invest({ value: GOAL });
      await campaign.connect(founder).startVoting();
      const status = await campaign.getVotingStatus();
      expect(status.active).to.equal(true);
      expect(status.timeLeft).to.be.gt(0);
    });

    it("getInvestorCount returns correct count", async function () {
      await campaign.connect(investor1).invest({
        value: 500000000000000000n,
      });
      await campaign.connect(investor2).invest({
        value: 500000000000000000n,
      });
      expect(await campaign.getInvestorCount()).to.equal(2);
    });
  });
});
