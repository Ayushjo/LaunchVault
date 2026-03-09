// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./CampaignToken.sol";

contract Campaign {

    // ─── State Variables ───────────────────────────────────────

    address public founder;
    string public title;
    string public description;
    string public milestoneDescription;
    uint256 public goal;
    uint256 public deadline;
    uint256 public totalRaised;
    bool public goalReached;
    bool public fundsReleased;
    bool public cancelled;

    // ─── Token ─────────────────────────────────────────────────

    CampaignToken public token;
    uint256 public constant TOTAL_SUPPLY = 10_000 * 10 ** 18;

    // ─── Investors ─────────────────────────────────────────────

    mapping(address => uint256) public contributions;
    address[] public investors;

    // ─── Voting ────────────────────────────────────────────────

    bool public votingActive;
    uint256 public votingDeadline;
    uint256 public voteYes;
    uint256 public voteNo;
    mapping(address => bool) public hasVoted;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant QUORUM_PERCENT = 51;

    // ─── Events ────────────────────────────────────────────────

    event Invested(address indexed investor, uint256 amount, uint256 tokens);
    event VoteCast(address indexed investor, bool vote, uint256 weight);
    event FundsReleased(address indexed founder, uint256 amount);
    event Refunded(address indexed investor, uint256 amount);
    event VotingStarted(uint256 deadline);
    event CampaignCancelled();

    // ─── Modifiers ─────────────────────────────────────────────

    modifier onlyFounder() {
        require(msg.sender == founder, "Only founder can call this");
        _;
    }

    modifier campaignActive() {
        require(!cancelled, "Campaign is cancelled");
        require(block.timestamp < deadline, "Campaign deadline passed");
        require(!fundsReleased, "Funds already released");
        _;
    }

    modifier campaignEnded() {
        require(
            block.timestamp >= deadline || goalReached,
            "Campaign still active"
        );
        _;
    }

    // ─── Constructor ───────────────────────────────────────────

    constructor(
        address _founder,
        string memory _title,
        string memory _description,
        string memory _milestoneDescription,
        uint256 _goal,
        uint256 _deadline,
        string memory _tokenName,
        string memory _tokenSymbol
    ) {
        require(_goal > 0, "Goal must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in future");

        founder = _founder;
        title = _title;
        description = _description;
        milestoneDescription = _milestoneDescription;
        goal = _goal;
        deadline = _deadline;

        // Deploy the token contract
        // Campaign contract is the owner so only it can mint
        token = new CampaignToken(_tokenName, _tokenSymbol, address(this));
    }

    // ─── Invest ────────────────────────────────────────────────

    function invest() external payable campaignActive {
        require(msg.value > 0, "Must send ETH to invest");
        require(msg.sender != founder, "Founder cannot invest");

        // First time investing — add to investors list
        if (contributions[msg.sender] == 0) {
            investors.push(msg.sender);
        }

        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;

        // Calculate tokens proportional to contribution
        // tokens = (amount / goal) * TOTAL_SUPPLY
        uint256 tokensToMint = (msg.value * TOTAL_SUPPLY) / goal;
        token.mint(msg.sender, tokensToMint);

        // Check if goal reached
        if (totalRaised >= goal) {
            goalReached = true;
        }

        emit Invested(msg.sender, msg.value, tokensToMint);
    }

    // ─── Start Voting ──────────────────────────────────────────

    function startVoting() external onlyFounder {
        require(goalReached, "Goal not reached yet");
        require(!votingActive, "Voting already active");
        require(!fundsReleased, "Funds already released");

        votingActive = true;
        votingDeadline = block.timestamp + VOTING_PERIOD;

        emit VotingStarted(votingDeadline);
    }

    // ─── Vote ──────────────────────────────────────────────────

    function vote(bool approve) external {
        require(votingActive, "Voting is not active");
        require(block.timestamp < votingDeadline, "Voting period ended");
        require(!hasVoted[msg.sender], "Already voted");

        // Check voter has tokens (invested)
        uint256 voterTokens = token.balanceOf(msg.sender);
        require(voterTokens > 0, "Must be an investor to vote");

        hasVoted[msg.sender] = true;

        // Weighted voting — more tokens = more voting power
        if (approve) {
            voteYes += voterTokens;
        } else {
            voteNo += voterTokens;
        }

        emit VoteCast(msg.sender, approve, voterTokens);
    }

    // ─── Release Funds ─────────────────────────────────────────

    function releaseFunds() external onlyFounder {
        require(!fundsReleased, "Funds already released");
        require(votingActive, "Voting not started");
        require(
            block.timestamp >= votingDeadline,
            "Voting period not ended yet"
        );

        uint256 totalVotes = voteYes + voteNo;
        uint256 totalTokenSupply = token.totalSupply();

        // Quorum check — at least 51% of token holders must vote
        require(
            totalVotes * 100 >= totalTokenSupply * QUORUM_PERCENT,
            "Quorum not reached"
        );

        // Majority check — more yes than no
        require(voteYes > voteNo, "Vote did not pass");

        fundsReleased = true;
        votingActive = false;

        uint256 amount = address(this).balance;
        payable(founder).transfer(amount);

        emit FundsReleased(founder, amount);
    }

    // ─── Refund ────────────────────────────────────────────────

    function claimRefund() external campaignEnded {
        require(!goalReached, "Goal was reached, no refunds");
        require(!cancelled, "Use claimRefundCancelled");
        require(contributions[msg.sender] > 0, "No contribution found");

        uint256 amount = contributions[msg.sender];
        contributions[msg.sender] = 0;

        payable(msg.sender).transfer(amount);

        emit Refunded(msg.sender, amount);
    }

    // ─── Cancel Campaign ───────────────────────────────────────

    function cancelCampaign() external onlyFounder {
        require(!goalReached, "Cannot cancel after goal reached");
        require(!fundsReleased, "Funds already released");

        cancelled = true;
        emit CampaignCancelled();
    }

    function claimRefundCancelled() external {
        require(cancelled, "Campaign not cancelled");
        require(contributions[msg.sender] > 0, "No contribution found");

        uint256 amount = contributions[msg.sender];
        contributions[msg.sender] = 0;

        payable(msg.sender).transfer(amount);

        emit Refunded(msg.sender, amount);
    }

    // ─── View Functions ────────────────────────────────────────

    function getInvestorCount() external view returns (uint256) {
        return investors.length;
    }

    function getContribution(address investor) external view returns (uint256) {
        return contributions[investor];
    }

    function getVotingStatus() external view returns (
        bool active,
        uint256 yes,
        uint256 no,
        uint256 timeLeft
    ) {
        uint256 tl = votingDeadline > block.timestamp
            ? votingDeadline - block.timestamp
            : 0;
        return (votingActive, voteYes, voteNo, tl);
    }

    function getCampaignInfo() external view returns (
        address _founder,
        string memory _title,
        string memory _description,
        string memory _milestoneDescription,
        uint256 _goal,
        uint256 _deadline,
        uint256 _totalRaised,
        bool _goalReached,
        bool _fundsReleased,
        bool _cancelled
    ) {
        return (
            founder,
            title,
            description,
            milestoneDescription,
            goal,
            deadline,
            totalRaised,
            goalReached,
            fundsReleased,
            cancelled
        );
    }
}