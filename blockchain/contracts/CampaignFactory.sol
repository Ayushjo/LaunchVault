// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Campaign.sol";

contract CampaignFactory {

    struct CampaignInfo {
        address campaignAddress;
        address founder;
        string title;
        uint256 goal;
        uint256 deadline;
        uint256 createdAt;
    }

    CampaignInfo[] public campaigns;

    event CampaignCreated(
        address indexed campaignAddress,
        address indexed founder,
        string title,
        uint256 goal,
        uint256 deadline
    );

    function createCampaign(
        string memory _title,
        string memory _description,
        string memory _milestoneDescription,
        uint256 _goal,
        uint256 _deadline,
        string memory _tokenName,
        string memory _tokenSymbol
    ) external returns (address) {
        Campaign campaign = new Campaign(
            msg.sender,
            _title,
            _description,
            _milestoneDescription,
            _goal,
            _deadline,
            _tokenName,
            _tokenSymbol
        );

        campaigns.push(CampaignInfo({
            campaignAddress: address(campaign),
            founder: msg.sender,
            title: _title,
            goal: _goal,
            deadline: _deadline,
            createdAt: block.timestamp
        }));

        emit CampaignCreated(address(campaign), msg.sender, _title, _goal, _deadline);
        return address(campaign);
    }

    function getCampaigns() external view returns (CampaignInfo[] memory) {
        return campaigns;
    }

    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }
}