// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title AchievementBadges
 * @dev Soulbound ERC-1155 Achievement NFTs for Block Puzzle Game
 * - Non-transferable (Soulbound)
 * - Skill-gated minting
 * - Fixed ETH mint fee: 0.00015 ETH
 */
contract AchievementBadges is ERC1155, Ownable, ReentrancyGuard {
    // Constants
    uint256 public constant MINT_FEE = 0.00015 ether;
    
    // Achievement tracking
    mapping(uint256 => string) public achievementNames;
    mapping(uint256 => string) public achievementDescriptions;
    mapping(address => mapping(uint256 => bool)) public hasMinted;
    
    // Treasury
    address public treasury;
    
    // Authorized verifier (backend)
    address public gameController;
    
    // Events
    event AchievementMinted(address indexed player, uint256 indexed achievementId);
    event TreasuryUpdated(address indexed newTreasury);
    event GameControllerUpdated(address indexed newController);
    
    constructor(
        string memory uri,
        address _treasury,
        address _gameController
    ) ERC1155(uri) Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury address");
        require(_gameController != address(0), "Invalid controller address");
        treasury = _treasury;
        gameController = _gameController;
    }
    
    /**
     * @dev Mint an achievement badge
     * @param achievementId The ID of the achievement to mint
     * @param signature Verification signature from backend
     */
    function mintAchievement(
        uint256 achievementId,
        bytes memory signature
    ) external payable nonReentrant {
        require(msg.value == MINT_FEE, "Incorrect mint fee");
        require(!hasMinted[msg.sender][achievementId], "Already minted");
        require(_verifyAchievement(msg.sender, achievementId, signature), "Not earned");
        
        hasMinted[msg.sender][achievementId] = true;
        _mint(msg.sender, achievementId, 1, "");
        
        // Send fee to treasury
        (bool success, ) = treasury.call{value: msg.value}("");
        require(success, "Treasury transfer failed");
        
        emit AchievementMinted(msg.sender, achievementId);
    }
    
    /**
     * @dev Add new achievement type (owner only)
     */
    function addAchievement(
        uint256 id,
        string memory name,
        string memory description
    ) external onlyOwner {
        achievementNames[id] = name;
        achievementDescriptions[id] = description;
    }
    
    /**
     * @dev Set game controller address
     */
    function setGameController(address _controller) external onlyOwner {
        require(_controller != address(0), "Invalid controller");
        gameController = _controller;
        emit GameControllerUpdated(_controller);
    }
    
    /**
     * @dev Update treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }
    
    /**
     * @dev Verify achievement earned (simplified - use proper signature verification in production)
     */
    function _verifyAchievement(
        address player,
        uint256 achievementId,
        bytes memory signature
    ) internal view returns (bool) {
        require(gameController != address(0), "Game controller not set");

        bytes32 messageHash = keccak256(abi.encode(player, achievementId));
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        address recoveredSigner = ECDSA.recover(ethSignedMessageHash, signature);

        return recoveredSigner == gameController;
    }
    
    /**
     * @dev Override transfer functions to make tokens non-transferable (Soulbound)
     */
    function safeTransferFrom(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public pure override {
        revert("Soulbound: Transfer not allowed");
    }
    
    function safeBatchTransferFrom(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public pure override {
        revert("Soulbound: Transfer not allowed");
    }
    
    function setApprovalForAll(address, bool) public pure override {
        revert("Soulbound: Approval not allowed");
    }
    
    /**
     * @dev Check if player has specific achievement
     */
    function hasAchievement(address player, uint256 achievementId) external view returns (bool) {
        return balanceOf(player, achievementId) > 0;
    }
    
    /**
     * @dev Get player's achievement count
     */
    function getAchievementCount(address player, uint256[] memory ids) external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (balanceOf(player, ids[i]) > 0) {
                count++;
            }
        }
        return count;
    }
}
