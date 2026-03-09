import { useState, useEffect } from "react";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { CAMPAIGN_ABI, CONTRACT_CONFIG } from "../contracts/config";

export function useCampaign() {
  const [contract, setContract] = useState<Contract | null>(null);
  const [campaignInfo, setCampaignInfo] = useState<any>(null);
  const [votingStatus, setVotingStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract
  async function initContract() {
    if (!window.ethereum) return null;
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const c = new Contract(
      CONTRACT_CONFIG.campaignAddress,
      CAMPAIGN_ABI,
      signer,
    );
    setContract(c);
    return c;
  }

  // Read campaign info from chain
  async function fetchCampaignInfo() {
    try {
      const c = contract ?? (await initContract());
      if (!c) return;
      const info = await c.getCampaignInfo();
      setCampaignInfo({
        founder: info._founder,
        title: info._title,
        description: info._description,
        milestoneDescription: info._milestoneDescription,
        goal: formatEther(info._goal),
        deadline: Number(info._deadline),
        totalRaised: formatEther(info._totalRaised),
        goalReached: info._goalReached,
        fundsReleased: info._fundsReleased,
        cancelled: info._cancelled,
      });

      const vs = await c.getVotingStatus();
      setVotingStatus({
        active: vs.active,
        voteYes: vs.yes.toString(),
        voteNo: vs.no.toString(),
        timeLeft: Number(vs.timeLeft),
      });
    } catch (err: any) {
      setError(err.message);
    }
  }

  // Invest function
  async function invest(amountEth: string) {
    try {
      setLoading(true);
      setError(null);
      const c = contract ?? (await initContract());
      if (!c) throw new Error("Contract not initialized");
      const tx = await c.invest({ value: parseEther(amountEth) });
      await tx.wait();
      await fetchCampaignInfo();
      return tx.hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Vote function
  async function vote(approve: boolean) {
    try {
      setLoading(true);
      setError(null);
      const c = contract ?? (await initContract());
      if (!c) throw new Error("Contract not initialized");
      const tx = await c.vote(approve);
      await tx.wait();
      await fetchCampaignInfo();
      return tx.hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Start voting (founder only)
  async function startVoting() {
    try {
      setLoading(true);
      setError(null);
      const c = contract ?? (await initContract());
      if (!c) throw new Error("Contract not initialized");
      const tx = await c.startVoting();
      await tx.wait();
      await fetchCampaignInfo();
      return tx.hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Release funds (founder only)
  async function releaseFunds() {
    try {
      setLoading(true);
      setError(null);
      const c = contract ?? (await initContract());
      if (!c) throw new Error("Contract not initialized");
      const tx = await c.releaseFunds();
      await tx.wait();
      await fetchCampaignInfo();
      return tx.hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Claim refund
  async function claimRefund() {
    try {
      setLoading(true);
      setError(null);
      const c = contract ?? (await initContract());
      if (!c) throw new Error("Contract not initialized");
      const tx = await c.claimRefund();
      await tx.wait();
      await fetchCampaignInfo();
      return tx.hash;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCampaignInfo();
  }, []);

  return {
    campaignInfo,
    votingStatus,
    loading,
    error,
    invest,
    vote,
    startVoting,
    releaseFunds,
    claimRefund,
    fetchCampaignInfo,
  };
}
