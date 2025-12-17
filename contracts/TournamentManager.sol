// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title TournamentManager
 * @dev Manages daily tournaments with ETH entry fees and prize pool distribution
 * 
 * Entry Fee Structure:
 * - $0.35 USD worth of Base ETH per entry
 * - 5% platform fee
 * - 95% goes to prize pool
 * 
 * Prize Pool Distribution:
 * - 10% to treasury
 * - 90% distributed to top 3 players:
 *   - 1st: 50%
 *   - 2nd: 30%
 *   - 3rd: 20%
 */
contract TournamentManager is Ownable, ReentrancyGuard {
    // Tournament configuration
    uint256 public constant ENTRY_FEE_USD = 35; // $0.35 in cents
    uint256 public constant PLATFORM_FEE_PERCENT = 5; // 5%
    uint256 public constant TREASURY_CUT_PERCENT = 10; // 10%
    uint256 public constant FIRST_PLACE_PERCENT = 50; // 50%
    uint256 public constant SECOND_PLACE_PERCENT = 30; // 30%
    uint256 public constant THIRD_PLACE_PERCENT = 20; // 20%
    
    // ETH price feed (simplified - use Chainlink in production)
    uint256 public ethPriceUSD = 3000; // $3000 per ETH (update mechanism needed)
    
    // Treasury and authorized addresses
    address public treasury;
    address public gameController;
    
    // Tournament state
    uint256 public currentTournamentId;
    uint256 public tournamentDuration = 1 days;
    
    struct Tournament {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 totalPrizePool;
        uint256 participantCount;
        bool finalized;
        address[] winners; // [1st, 2nd, 3rd]
        uint256[] prizes;  // Prize amounts for winners
    }
    
    mapping(uint256 => Tournament) public tournaments;
    mapping(uint256 => mapping(address => bool)) public hasEntered;
    
    struct PlayerScore {
        uint256 score;
        bool submitted;
    }
    
    mapping(uint256 => mapping(address => PlayerScore)) public playerScores;
    
    // Events
    event TournamentStarted(uint256 indexed tournamentId, uint256 startTime, uint256 endTime);
    event PlayerEntered(uint256 indexed tournamentId, address indexed player, uint256 entryFee);
    event ScoreSubmitted(uint256 indexed tournamentId, address indexed player, uint256 score);
    event TournamentFinalized(uint256 indexed tournamentId, address[] winners, uint256[] prizes);
    event PrizeDistributed(uint256 indexed tournamentId, address indexed winner, uint256 amount);
    
    constructor(address _treasury) Ownable(msg.sender) {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
        _startNewTournament();
    }
    
    /**
     * @dev Calculate entry fee in ETH based on USD price
     */
    function getEntryFeeETH() public view returns (uint256) {
        // Entry fee = $0.35 in ETH
        // Formula: (USD_CENTS * 1e18) / (ETH_PRICE_USD * 100)
        return (ENTRY_FEE_USD * 1e18) / (ethPriceUSD * 100);
    }
    
    /**
     * @dev Enter the current tournament
     */
    function enterTournament() external payable nonReentrant {
        uint256 tournamentId = currentTournamentId;
        Tournament storage tournament = tournaments[tournamentId];
        
        require(block.timestamp < tournament.endTime, "Tournament ended");
        require(!hasEntered[tournamentId][msg.sender], "Already entered");
        
        uint256 entryFee = getEntryFeeETH();
        require(msg.value >= entryFee, "Insufficient entry fee");
        
        // Calculate fee split
        uint256 platformFee = (msg.value * PLATFORM_FEE_PERCENT) / 100;
        uint256 poolContribution = msg.value - platformFee;
        
        // Update tournament state
        hasEntered[tournamentId][msg.sender] = true;
        tournament.participantCount++;
        tournament.totalPrizePool += poolContribution;
        
        // Send platform fee to treasury immediately
        Address.sendValue(payable(treasury), platformFee);
        
        // Refund excess
        if (msg.value > entryFee) {
            Address.sendValue(payable(msg.sender), msg.value - entryFee);
        }
        
        emit PlayerEntered(tournamentId, msg.sender, entryFee);
    }
    
    /**
     * @dev Submit player score (only gameController)
     */
    function submitScore(
        uint256 tournamentId,
        address player,
        uint256 score
    ) external {
        require(msg.sender == gameController, "Unauthorized");
        require(hasEntered[tournamentId][player], "Player not entered");
        require(block.timestamp < tournaments[tournamentId].endTime, "Tournament ended");
        
        PlayerScore storage ps = playerScores[tournamentId][player];
        ps.score = score;
        ps.submitted = true;
        
        emit ScoreSubmitted(tournamentId, player, score);
    }
    
    /**
     * @dev Finalize tournament and distribute prizes (only gameController)
     */
    function finalizeTournament(
        uint256 tournamentId,
        address[] calldata winners
    ) external nonReentrant {
        require(msg.sender == gameController, "Unauthorized");
        Tournament storage tournament = tournaments[tournamentId];
        require(block.timestamp >= tournament.endTime, "Tournament not ended");
        require(!tournament.finalized, "Already finalized");
        require(winners.length == 3, "Must have 3 winners");
        
        for (uint256 i = 0; i < winners.length; i++) {
            require(playerScores[tournamentId][winners[i]].submitted, "Score not submitted");
        }
        
        tournament.finalized = true;
        tournament.winners = winners;
        
        // Calculate treasury cut (10% of total pool)
        uint256 treasuryCut = (tournament.totalPrizePool * TREASURY_CUT_PERCENT) / 100;
        uint256 distributablePool = tournament.totalPrizePool - treasuryCut;
        
        // Calculate prize distribution (90% of pool to players)
        uint256[] memory prizes = new uint256[](3);
        prizes[0] = (distributablePool * FIRST_PLACE_PERCENT) / 100;  // 50%
        prizes[1] = (distributablePool * SECOND_PLACE_PERCENT) / 100; // 30%
        prizes[2] = (distributablePool * THIRD_PLACE_PERCENT) / 100;  // 20%
        
        tournament.prizes = prizes;
        
        // Send treasury cut
        Address.sendValue(payable(treasury), treasuryCut);
        
        // Distribute prizes to winners
        for (uint256 i = 0; i < 3; i++) {
            if (winners[i] != address(0) && prizes[i] > 0) {
                Address.sendValue(payable(winners[i]), prizes[i]);
                emit PrizeDistributed(tournamentId, winners[i], prizes[i]);
            }
        }
        
        emit TournamentFinalized(tournamentId, winners, prizes);
        
        // Start new tournament
        _startNewTournament();
    }
    
    /**
     * @dev Start a new tournament
     */
    function _startNewTournament() internal {
        currentTournamentId++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + tournamentDuration;
        
        tournaments[currentTournamentId] = Tournament({
            id: currentTournamentId,
            startTime: startTime,
            endTime: endTime,
            totalPrizePool: 0,
            participantCount: 0,
            finalized: false,
            winners: new address[](0),
            prizes: new uint256[](0)
        });
        
        emit TournamentStarted(currentTournamentId, startTime, endTime);
    }
    
    /**
     * @dev Update ETH price (owner only - use Chainlink in production)
     */
    function updateETHPrice(uint256 _priceUSD) external onlyOwner {
        require(_priceUSD > 0, "Invalid price");
        ethPriceUSD = _priceUSD;
    }
    
    /**
     * @dev Set game controller
     */
    function setGameController(address _controller) external onlyOwner {
        require(_controller != address(0), "Invalid controller");
        gameController = _controller;
    }
    
    /**
     * @dev Update treasury
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }
    
    /**
     * @dev Get current tournament info
     */
    function getCurrentTournament() external view returns (Tournament memory) {
        return tournaments[currentTournamentId];
    }
    
    /**
     * @dev Check if player has entered current tournament
     */
    function hasEnteredCurrent(address player) external view returns (bool) {
        return hasEntered[currentTournamentId][player];
    }
    
    /**
     * @dev Get player's score in current tournament
     */
    function getPlayerScore(address player) external view returns (uint256) {
        return playerScores[currentTournamentId][player].score;
    }
}
