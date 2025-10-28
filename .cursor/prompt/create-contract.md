You are a senior blockchain engineer specialized in **Hedera Smart Contracts (Solidity + Hedera Token Service)**.  
Write a **complete modular contract system** for **Hedera Testnet** named **HederaGameLaunchpad**, implementing:

---

## 🧩 1. Core System Overview

A decentralized **Game Launchpad** that enables:
- Off-chain game execution with **on-chain result verification**.
- Player identity and stats tracking via **SoulBound Token (SBT)**.
- NFT-based progression and reward items.
- HPLAY as a **primary utility token** (fungible).
- A **lottery pool** fed by small transaction fees.
- A **faucet (testnet HBAR bridge)** to allow players to swap test HBAR → HPLAY.
- Expandable architecture for adding new off-chain game modules over time.

### **Technical Architecture**

#### **System Components:**
```
┌─────────────────────────────────────────────────────────────┐
│                    HederaGameLaunchpad                      │
│                      (Main Contract)                        │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼─────────┐  ┌─────▼───────┐  ┌───────▼─────────┐
│ GameRegistry    │  │ ResultVeri- │  │  PlayerSBT      │
│  - game modules │  │   fier      │  │  - stats       │
│  - server auth  │  │  - sig check│  │  - SBT mint    │
└─────────────────┘  └─────────────┘  └─────────────────┘
        │                  │                  │
┌───────▼─────────┐  ┌─────▼───────┐  ┌───────▼─────────┐
│ NFTManager      │  │ TokenEconomy│  │ FaucetManager  │
│  - mint/burn    │  │  - HTS token│  │  - HBAR→HPLAY  │
│  - metadata     │  │  - supply   │  │  - rate calc   │
└─────────────────┘  └─────────────┘  └─────────────────┘
                           │
                    ┌──────▼──────────┐
                    │  LotteryPool    │
                    │  - fee accum   │
                    │  - random draw │
                    └─────────────────┘
```

#### **Data Flow for Game Result Submission:**
```
1. Player completes game off-chain
2. Server generates result signature:
   signature = sign(privateKey, keccak256(gameId, player, score, timestamp, nonce))
3. Contract verifies signature:
   - Recover server address from signature
   - Validate against GameRegistry
   - Check nonce/replay protection
4. On verification success:
   - Update PlayerSBT stats
   - Mint HPLAY rewards to player
   - Emit GameResultVerified event
5. Optional: Trigger achievement NFT mint
```

---

## ⚙️ 2. Contract Modules

Implement the following Solidity contracts:

### **a) GameRegistry.sol**

**Purpose:** Manages registration of off-chain games and their authorized servers.

**Technical Specifications:**
- **Storage Structure:**
```solidity
struct GameModule {
    address authorizedServer;
    bytes32 serverPublicKey;
    string gameId;
    string metadataURI;
    uint256 registrationTimestamp;
    bool isActive;
    uint256 nonce;
}

mapping(string => GameModule) public registeredGames;
mapping(address => bool) public authorizedServers;
```

**Functions:**
```solidity
function registerGameModule(
    address serverAddress,
    bytes32 publicKey,
    string memory gameId,
    string memory metadataURI
) external onlyOwner returns (bool);

function revokeGameModule(string memory gameId) external onlyOwner;

function updateServerPublicKey(
    string memory gameId,
    bytes32 newPublicKey
) external onlyOwner;

function getGameModule(string memory gameId) 
    external view returns (GameModule memory);

function isValidServer(string memory gameId, address server) 
    external view returns (bool);
```

**Security:**
- Uses `AccessControl` for role-based access
- Only owner can register/revoke games
- Public key stored as `bytes32` for gas efficiency
- Nonce tracking for replay protection
- Events: `GameModuleRegistered(address server, string gameId, string metadataURI)`

---

### **b) ResultVerifier.sol**

**Purpose:** Handles off-chain result submission and cryptographic signature verification.

**Technical Specifications:**

**Signature Verification Mechanism:**
```solidity
struct GameResult {
    address player;
    string gameId;
    uint256 score;
    uint256 timestamp;
    uint256 nonce;
    bytes32 resultHash;
}

mapping(address => uint256) private playerNonces;
mapping(bytes32 => bool) private verifiedResults;

function submitGameResult(
    address player,
    string memory gameId,
    uint256 score,
    bytes memory signature,
    uint256 nonce,
    uint256 timestamp
) external returns (bool);
```

**Cryptographic Verification:**
1. **Hash Generation:**
```solidity
bytes32 messageHash = keccak256(abi.encodePacked(
    player,
    gameId,
    score,
    timestamp,
    nonce
));

bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(
    "\x19Ethereum Signed Message:\n32",
    messageHash
));
```

2. **Signature Recovery:**
```solidity
address signer = ECDSA.recover(ethSignedMessageHash, signature);
require(
    GameRegistry.isValidServer(gameId, signer),
    "Invalid server signature"
);
```

3. **Replay Protection:**
```solidity
require(playerNonces[player] < nonce, "Nonce must increase");
require(!verifiedResults[messageHash], "Result already verified");
require(block.timestamp - timestamp < 300, "Timestamp expired");

verifiedResults[messageHash] = true;
playerNonces[player] = nonce;
```

4. **Result Processing:**
```solidity
if (score >= minimumScore) {
    playerSBT.updateStats(player, gameId, score);
    tokenEconomy.mintRewards(player, calculateReward(score));
    emit GameResultVerified(player, gameId, score);
}
```

**Events:**
```solidity
event GameResultVerified(
    address indexed player,
    string indexed gameId,
    uint256 score,
    uint256 timestamp
);

event InvalidSignature(
    address player,
    string gameId,
    bytes32 messageHash
);
```

---

### **c) PlayerSBT.sol**

**Purpose:** Implements **SoulBound Token (SBT)** representing a player's unified gaming identity using Hedera HTS (Hedera Token Service).

**Technical Specifications:**

**Storage Structure:**
```solidity
struct PlayerStats {
    uint256 totalGamesPlayed;
    uint256 totalWins;
    uint256 totalPoints;
    uint256 totalLosses;
    uint256 averageScore;
    uint256 lastGameTimestamp;
    mapping(string => GameStat) perGameStats;
}

struct GameStat {
    uint256 gamesPlayed;
    uint256 wins;
    uint256 totalScore;
    uint256 highestScore;
    uint256 lastPlayed;
}

mapping(address => PlayerStats) private playerStats;
mapping(address => bool) private hasSBT;
```

**Core Functions:**
```solidity
// Mint SBT to player (one-time operation)
function mintSBT(address player, string memory tokenURI) 
    external onlyGameServer returns (uint256 tokenId);

// Update player statistics after game completion
function updateStats(
    address player,
    string memory gameId,
    uint256 score,
    bool isWin
) external onlyGameServer;

// Get comprehensive player statistics
function getPlayerStats(address player) 
    external view returns (PlayerStats memory);

function getGameSpecificStats(address player, string memory gameId)
    external view returns (GameStat memory);
```

**Reward Calculation:**
```solidity
function calculateReward(uint256 score, string memory gameId) 
    private view returns (uint256 hplayAmount) {
    // Base reward
    uint256 baseReward = 100 ether;
    
    // Score multiplier (1-10x)
    uint256 scoreMultiplier = score / 1000 + 1;
    
    // Difficulty multiplier from game registry
    uint256 difficultyMultiplier = gameRegistry.getDifficultyMultiplier(gameId);
    
    hplayAmount = (baseReward * scoreMultiplier * difficultyMultiplier) / 1000;
}
```

**Hedera HTS Integration:**
- Uses `IHederaTokenService` for token operations
- Custom `_beforeTokenTransfer` hook prevents transfers (SoulBound behavior)
- Event indexing on token ID for efficient queries

**Events:**
```solidity
event PlayerSBTMinted(address indexed player, uint256 tokenId);
event StatsUpdated(
    address indexed player,
    string indexed gameId,
    uint256 score,
    uint256 totalGames
);
```

---

### **d) NFTManager.sol**

**Purpose:** Manages NFT (Non-Fungible Token) minting and burning using Hedera HTS NFT standard.

**Technical Specifications:**

**Storage Structure:**
```solidity
struct AchievementNFT {
    uint256 tokenId;
    address owner;
    string achievementType; // "rare", "legendary", "epic", "common"
    string metadataURI;
    uint256 mintedTimestamp;
    uint256 rarityScore;
}

mapping(uint256 => AchievementNFT) public nfts;
mapping(address => uint256[]) public playerNFTs;
mapping(string => uint256) public rarityBurnFees; // HPLAY amount to burn
```

**Core Functions:**
```solidity
// Mint achievement NFT after game milestone
function mintAchievementNFT(
    address player,
    string memory achievementType,
    string memory metadataURI
) external onlyGameServer returns (uint256 tokenId);

// Burn NFT and upgrade player's abilities
function burnNFTForUpgrade(
    address player,
    uint256 tokenId,
    uint256 hplayAmount
) external {
    require(ownerOf(tokenId) == player, "Not token owner");
    require(
        tokenEconomy.balanceOf(player) >= hplayAmount,
        "Insufficient HPLAY"
    );
    
    // Calculate burn fee based on rarity
    string memory rarity = nfts[tokenId].achievementType;
    uint256 burnFee = rarityBurnFees[rarity];
    require(hplayAmount >= burnFee, "Burn fee not met");
    
    // Burn tokens
    tokenEconomy.burnFrom(player, burnFee);
    
    // Transfer remaining HPLAY for upgrade
    tokenEconomy.transferFrom(player, upgradeContract, hplayAmount - burnFee);
    
    // Burn NFT
    _burn(tokenId);
    
    emit NFTBurned(tokenId, player, burnFee);
}
```

**Rarity Configuration:**
```solidity
// Set burn fees per rarity (governance function)
function setRarityBurnFee(string memory rarity, uint256 fee)
    external onlyDAO {
    rarityBurnFees[rarity] = fee;
}

// Default burn fees (per 1000 HPLAY):
// Common: 10 HPLAY
// Rare: 50 HPLAY  
// Epic: 200 HPLAY
// Legendary: 1000 HPLAY
```

**Hedera HTS NFT Integration:**
- Implements Hedera Token Service NFT standard
- Custom `associateToken` for new NFTs
- Royalty settings configurable per NFT collection
- Support for fractionalized ownership (future upgrade)

**Events:**
```solidity
event NFTMinted(
    address indexed player,
    uint256 tokenId,
    string indexed achievementType,
    string metadataURI
);

event NFTBurned(
    uint256 indexed tokenId,
    address indexed player,
    uint256 burnFee
);
```

---

### **e) TokenEconomy.sol**

**Purpose:** Implements and governs the **HPLAY Token (HTS Fungible Token)** using Hedera Token Service.

#### 📊 Token Parameters:
```solidity
string public constant SYMBOL = "HPLAY";
string public constant NAME = "Hedera Play Token";
uint8 public constant DECIMALS = 8;
uint256 public constant TOTAL_SUPPLY = 10_000_000_000 * 10**DECIMALS;

struct Distribution {
    address gameRewardsPool;      // 40% (4,000,000,000 HPLAY)
    address developerIncentives;   // 20% (2,000,000,000 HPLAY)
    address daoTreasury;          // 20% (2,000,000,000 HPLAY)
    address marketingEvents;      // 10% (1,000,000,000 HPLAY)
    address liquidityReserve;     // 10% (1,000,000,000 HPLAY)
}

Distribution public initialDistribution;
```

#### 🧮 Token Mechanics:

**1. Rewards Distribution:**
```solidity
function mintRewards(address recipient, uint256 amount) 
    external onlyGameServer returns (bool) {
    require(
        totalSupply() + amount <= maxSupply(),
        "Exceeds maximum supply"
    );
    _mint(recipient, amount);
    emit RewardMinted(recipient, amount);
}

function maxSupply() public view returns (uint256) {
    return TOTAL_SUPPLY;
}
```

**2. Deflationary Mechanisms:**
```solidity
// Burn tokens permanently
function burn(uint256 amount) external {
    require(balanceOf(msg.sender) >= amount, "Insufficient balance");
    _burn(msg.sender, amount);
    emit TokenBurned(msg.sender, amount);
}

// Transfer with built-in lottery fee
function transfer(address to, uint256 amount) 
    public override returns (bool) {
    uint256 fee = (amount * transferFeePercent) / 10000;
    uint256 transferAmount = amount - fee;
    
    // Send fee to lottery pool
    _transfer(msg.sender, lotteryPool, fee);
    
    // Transfer to recipient
    _transfer(msg.sender, to, transferAmount);
    
    return true;
}
```

**3. Dynamic Parameters (DAO Governance):**
```solidity
struct TokenParams {
    uint256 transferFeePercent;    // Default: 50 (0.5%)
    uint256 burnFeePercent;         // Default: 10 (0.1%)
    uint256 stakingRewardPercent;   // Default: 100 (1%)
    bool mintingEnabled;
}

TokenParams public params;

function updateParams(TokenParams memory newParams) 
    external onlyDAO {
    params = newParams;
    emit ParamsUpdated(newParams);
}
```

**4. Staking Integration:**
```solidity
mapping(address => uint256) public stakedBalance;
mapping(address => uint256) public lastStakeTimestamp;

function stake(uint256 amount) external returns (bool) {
    require(amount > 0, "Amount must be positive");
    require(balanceOf(msg.sender) >= amount, "Insufficient balance");
    
    _transfer(msg.sender, address(this), amount);
    stakedBalance[msg.sender] += amount;
    lastStakeTimestamp[msg.sender] = block.timestamp;
    
    emit TokensStaked(msg.sender, amount);
    return true;
}

function unstake(uint256 amount) external returns (bool) {
    require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
    
    stakedBalance[msg.sender] -= amount;
    _transfer(address(this), msg.sender, amount);
    
    // Calculate and distribute rewards
    uint256 rewards = calculateRewards(msg.sender, amount);
    if (rewards > 0) {
        _mint(msg.sender, rewards);
    }
    
    emit TokensUnstaked(msg.sender, amount, rewards);
    return true;
}
```

**5. Hedera HTS Specific Functions:**
```solidity
// Token association (required on Hedera)
function associateToken(address tokenId) external payable {
    // Hedera-specific association logic
    IHederaTokenService(address(HEDERA_TOKEN_SERVICE))
        .associateToken(address(this), tokenId);
}

// Custom token metadata
string public tokenMetadataURI = "ipfs://QmYOURMETADATAHASH";
```

---

### **f) FaucetManager.sol**

**Purpose:** Internal faucet allowing testnet users to acquire HPLAY using test HBAR (Hedera native token).

#### **Technical Implementation:**

**Storage Structure:**
```solidity
struct SwapRate {
    uint256 hbarToHplayRate;      // e.g., 1 HBAR = 500 HPLAY
    uint256 bonusMultiplierMin;    // e.g., 100 (1.0x)
    uint256 bonusMultiplierMax;    // e.g., 150 (1.5x)
    uint256 dailyLimitHbar;        // 1000 HBAR per user
    bool faucetEnabled;
}

SwapRate public rate;
mapping(address => UserSwapInfo) public userSwaps;

struct UserSwapInfo {
    uint256 totalSwappedToday;
    uint256 lastSwapTimestamp;
    uint256 swapsCount;
}

uint256 public totalHbarDeposited;
```

#### **Core Functions:**
```solidity
// Main swap function
function swapHBARforHPLAY() external payable returns (uint256 hplayAmount) {
    require(rate.faucetEnabled, "Faucet disabled");
    require(msg.value > 0, "Must send HBAR");
    
    // Check daily limit
    UserSwapInfo memory userInfo = userSwaps[msg.sender];
    if (isNewDay(userInfo.lastSwapTimestamp)) {
        userInfo.totalSwappedToday = 0;
    }
    
    require(
        userInfo.totalSwappedToday + msg.value <= rate.dailyLimitHbar,
        "Daily limit exceeded"
    );
    
    // Calculate HPLAY output
    uint256 baseAmount = (msg.value * rate.hbarToHplayRate) / 1e18;
    uint256 bonusFactor = calculateBonusFactor(msg.sender);
    hplayAmount = (baseAmount * bonusFactor) / 100;
    
    require(
        tokenEconomy.balanceOf(address(this)) >= hplayAmount,
        "Insufficient HPLAY reserves"
    );
    
    // Update user info
    userInfo.totalSwappedToday += msg.value;
    userInfo.lastSwapTimestamp = block.timestamp;
    userInfo.swapsCount++;
    userSwaps[msg.sender] = userInfo;
    
    // Transfer HPLAY to user
    totalHbarDeposited += msg.value;
    tokenEconomy.transfer(msg.sender, hplayAmount);
    
    emit FaucetSwapExecuted(msg.sender, msg.value, hplayAmount);
}

// Calculate dynamic bonus factor based on user activity
function calculateBonusFactor(address user) 
    private view returns (uint256) {
    uint256 baseMultiplier = 100; // 1.0x
    
    // Higher activity = higher multiplier
    uint256 activityScore = userSwaps[user].swapsCount;
    if (activityScore >= 100) {
        return rate.bonusMultiplierMax; // 1.5x
    } else if (activityScore >= 50) {
        return 125; // 1.25x
    }
    
    return baseMultiplier;
}
```

**Governance Functions:**
```solidity
function updateSwapRate(uint256 newRate) external onlyDAO {
    require(newRate > 0, "Invalid rate");
    rate.hbarToHplayRate = newRate;
    emit SwapRateUpdated(newRate);
}

function setDailyLimit(uint256 newLimit) external onlyDAO {
    rate.dailyLimitHbar = newLimit;
    emit DailyLimitUpdated(newLimit);
}

function depositHPLAY(uint256 amount) external {
    tokenEconomy.transferFrom(msg.sender, address(this), amount);
    emit HPLAYDeposited(msg.sender, amount);
}
```

**Events:**
```solidity
event FaucetSwapExecuted(
    address indexed user,
    uint256 hbarAmount,
    uint256 hplayAmount
);

event SwapRateUpdated(uint256 newRate);
event DailyLimitUpdated(uint256 newLimit);
```

### **g) LotteryPool.sol**

**Purpose:** Implements automatic lottery pool funded by transaction fees with weighted random selection.

#### **Technical Implementation:**

**Storage Structure:**
```solidity
struct LotteryPool {
    uint256 poolBalance;
    uint256 drawInterval;        // e.g., 24 hours (86400 seconds)
    uint256 lastDrawTimestamp;
    uint256 totalParticipants;
    mapping(address => uint256) transactionCount;
    mapping(address => uint256) totalVolume;
    address[] participants;
}

LotteryPool public pool;

struct DrawResult {
    address winner;
    uint256 prizeAmount;
    uint256 drawTimestamp;
    uint256 totalParticipants;
}
```

#### **Core Functions:**
```solidity
// Accumulate fees from token transfers
function accumulateFee(uint256 feeAmount) external {
    require(msg.sender == address(tokenEconomy), "Unauthorized");
    pool.poolBalance += feeAmount;
    
    if (!isParticipant(msg.sender)) {
        pool.participants.push(msg.sender);
        pool.totalParticipants++;
    }
    pool.transactionCount[msg.sender]++;
    pool.totalVolume[msg.sender] += feeAmount;
}

// Execute lottery draw
function executeDraw() external {
    require(
        block.timestamp >= pool.lastDrawTimestamp + pool.drawInterval,
        "Draw interval not met"
    );
    require(pool.totalParticipants > 0, "No participants");
    require(pool.poolBalance > 0, "No prize");
    
    // Select winner using pseudo-randomness
    address winner = selectWinner();
    uint256 prize = pool.poolBalance;
    
    // Reset pool
    pool.poolBalance = 0;
    pool.lastDrawTimestamp = block.timestamp;
    
    // Distribute prize
    tokenEconomy.transfer(winner, prize);
    
    emit LotteryWinner(winner, prize, pool.totalParticipants);
    
    // Reset for next round
    _resetParticipants();
}
```

#### **Weighted Random Selection:**
```solidity
function selectWinner() private view returns (address) {
    require(pool.totalParticipants > 0, "No participants");
    
    // Generate pseudo-random seed
    uint256 seed = uint256(keccak256(abi.encodePacked(
        block.timestamp,
        block.prevrandao,
        block.coinbase,
        pool.totalParticipants
    )));
    
    // Calculate total weight (sum of transaction counts)
    uint256 totalWeight = 0;
    for (uint256 i = 0; i < pool.totalParticipants; i++) {
        totalWeight += pool.transactionCount[pool.participants[i]];
    }
    
    // Select random position
    uint256 randomIndex = seed % totalWeight;
    
    // Find winner by cumulative weight
    uint256 cumulativeWeight = 0;
    for (uint256 i = 0; i < pool.totalParticipants; i++) {
        cumulativeWeight += pool.transactionCount[pool.participants[i]];
        if (randomIndex < cumulativeWeight) {
            return pool.participants[i];
        }
    }
    
    // Fallback (should never reach here)
    return pool.participants[0];
}
```

#### **Governance Functions:**
```solidity
function setDrawInterval(uint256 newInterval) external onlyDAO {
    require(newInterval >= 1 hours, "Interval too short");
    pool.drawInterval = newInterval;
}

function emergencyWithdraw() external onlyOwner {
    uint256 amount = pool.poolBalance;
    pool.poolBalance = 0;
    tokenEconomy.transfer(owner(), amount);
    emit EmergencyWithdraw(amount);
}
```

**Events:**
```solidity
event LotteryWinner(
    address indexed winner,
    uint256 prizeAmount,
    uint256 totalParticipants
);

event FeeAccumulated(address indexed payer, uint256 amount);
event EmergencyWithdraw(uint256 amount);
```

---

---

## 🧠 3. Mathematical Model & Economics

### **Token Faucet Conversion:**
```
Variables:
- a = amount of HBAR swapped
- r = base exchange rate (500 HPLAY / HBAR)
- b = dynamic bonus factor (1.0 - 1.5 depending on DAO policy)
- t = transaction count weight

Formula:
HPLAY_out = a × r × b × (1 + t/1000)

Example:
a = 2 HBAR, r = 500, b = 1.2, t = 250
HPLAY_out = 2 × 500 × 1.2 × 1.25 = 1500 HPLAY
```

### **Lottery Reward Probability:**
```
Each player's chance to win is proportional to transaction weight:

Weight Calculation:
w_i = sqrt(tx_count_i) × (volume_i / avg_volume)

Probability:
P_i = w_i / Σ(w_all)

Expected Value:
E_i = P_i × Pool_total

Example:
Player A: tx_count = 100, volume = 10,000 HPLAY
Player B: tx_count = 50, volume = 20,000 HPLAY
avg_volume = 15,000 HPLAY

w_A = sqrt(100) × (10,000/15,000) = 6.67
w_B = sqrt(50) × (20,000/15,000) = 6.32

If Pool_total = 100,000 HPLAY:
E_A = 0.513 × 100,000 = 51,300 HPLAY
E_B = 0.487 × 100,000 = 48,700 HPLAY
```

### **Token Deflation Mechanism:**
```
Supply Dynamics:
NewSupply = TotalSupply - BurnedAmount

Burn Rate Calculation:
burn_rate_t = base_burn_rate × (1 + activity_multiplier)

Where:
activity_multiplier = log10(total_transactions) / 10

Total Supply Over Time:
S(t) = S_0 × e^(-burn_rate × t)

Example:
Initial supply S_0 = 10,000,000,000 HPLAY
Monthly burn rate = 0.5%
S(12 months) = 10,000,000,000 × e^(-0.005 × 12) = 9,407,000,000 HPLAY
```

### **Reward Distribution Model:**
```
Player Reward = base_reward × score_multiplier × difficulty_multiplier × streak_bonus

Where:
- base_reward = 100 HPLAY
- score_multiplier = min(score / 1000, 10)
- difficulty_multiplier ∈ [1, 5]
- streak_bonus = 1 + (streak_count / 100)

Example:
score = 5000, difficulty = 3, streak = 20
Reward = 100 × 5 × 3 × 1.2 = 1,800 HPLAY
```

---

## 🔒 4. Security Considerations

### **Signature Verification Security:**
```solidity
// Prevent signature replay attacks
mapping(bytes32 => bool) private verifiedHashes;

function preventReplay(bytes32 messageHash) private {
    require(!verifiedHashes[messageHash], "Already processed");
    verifiedHashes[messageHash] = true;
}

// Check signature expiration
require(block.timestamp - timestamp <= 300, "Signature expired");

// Validate nonce monotonicity
require(nonce > playerNonces[player], "Invalid nonce");
```

### **Access Control:**
```solidity
// Role-based access control
bytes32 public constant OWNER_ROLE = keccak256("OWNER");
bytes32 public constant DAO_ROLE = keccak256("DAO");
bytes32 public constant SERVER_ROLE = keccak256("SERVER");

modifier onlyRole(bytes32 role) {
    require(hasRole(role, msg.sender), "Access denied");
    _;
}

// Emergency pause functionality
bool public paused;

modifier whenNotPaused() {
    require(!paused, "Contract paused");
    _;
}
```

### **Reentrancy Protection:**
```solidity
// Use checks-effects-interactions pattern
function withdraw(uint256 amount) external nonReentrant {
    uint256 balance = balances[msg.sender];
    require(balance >= amount, "Insufficient balance");
    
    // Update state before external call
    balances[msg.sender] -= amount;
    totalSupply -= amount;
    
    // Safe external call
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}
```

### **Integer Overflow Protection:**
```solidity
// Solidity 0.8.20 has built-in overflow checks
// Explicit checks for critical calculations
function safeAdd(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    require(c >= a, "Addition overflow");
    return c;
}
```

### **Gas Optimization:**
```solidity
// Pack structs to save storage slots
struct PackedStruct {
    uint128 amount;
    uint64 timestamp;
    uint32 id;
    bool flag;
    bool active;
}

// Cache storage variables
uint256 cachedValue = storageValue;
for (uint256 i = 0; i < iterations; i++) {
    cachedValue += i;
}
storageValue = cachedValue;

// Use events for off-chain indexing
event UserAction(address indexed user, uint256 indexed actionId, bytes data);
```

---

## 🏗️ 5. Deployment & Architecture

### **Technical Specifications:**

**Language:** Solidity >= 0.8.20  
**Network:** Hedera Testnet  
**Platform:** Hedera Hashgraph with Smart Contract Service (HSCS) + Hedera Token Service (HTS)

### **Project Structure:**
```bash
contracts/
├── core/
│   ├── HederaGameLaunchpad.sol      # Main orchestrator contract
│   ├── GameRegistry.sol              # Game module registration
│   ├── ResultVerifier.sol            # Cryptographic verification
│   ├── PlayerSBT.sol                 # SoulBound Token (HTS NFT)
│   ├── NFTManager.sol                 # Achievement NFTs (HTS NFT)
│   ├── TokenEconomy.sol               # HPLAY token (HTS FT)
│   ├── FaucetManager.sol              # HBAR → HPLAY swap
│   └── LotteryPool.sol                # Fee-based lottery system
├── interfaces/
│   ├── IGameRegistry.sol
│   ├── IResultVerifier.sol
│   ├── IPlayerSBT.sol
│   ├── INFTManager.sol
│   ├── ITokenEconomy.sol
│   ├── IFaucetManager.sol
│   ├── ILotteryPool.sol
│   ├── IHederaTokenService.sol
│   └── IERC165.sol
├── libraries/
│   ├── SignatureVerification.sol
│   ├── RewardCalculations.sol
│   └── AccessControl.sol
└── test/
    ├── HederaGameLaunchpad.test.ts
    ├── GameRegistry.test.ts
    ├── ResultVerifier.test.ts
    └── integration.test.ts

scripts/
├── deploy.ts                          # Deployment script
├── configure.ts                       # Configuration script
└── testInteractions.ts                # Manual testing

hardhat.config.ts
```

### **Dependencies:**
```json
{
  "dependencies": {
    "@hashgraph/sdk": "^2.39.0",
    "@hedera/sdk-javascript": "^2.0.0",
    "@openzeppelin/contracts": "^5.0.0",
    "hardhat": "^2.19.0",
    "ethers": "^6.8.0"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-chai-matchers": "^2.0.0",
    "chai": "^4.3.0",
    "@types/node": "^20.0.0"
  }
}
```

### **Deployment Process:**

**1. Pre-Deployment Setup:**
```typescript
// Deploy deployment script
async function deploy() {
  // 1. Deploy TokenEconomy (FT)
  const tokenContract = await deployContract("TokenEconomy", [
    "HPLAY", 
    "Hedera Play Token", 
    8, 
    10_000_000_000n * 10n**8n
  ]);
  
  // 2. Deploy PlayerSBT (NFT)
  const sbtContract = await deployContract("PlayerSBT", [
    "HederaGamePlayerSBT",
    "GAME_SBT"
  ]);
  
  // 3. Deploy NFTManager (NFT)
  const nftContract = await deployContract("NFTManager");
  
  // 4. Deploy supporting contracts
  const gameRegistry = await deployContract("GameRegistry");
  const resultVerifier = await deployContract("ResultVerifier");
  const faucetManager = await deployContract("FaucetManager", [
    tokenContract.address
  ]);
  const lotteryPool = await deployContract("LotteryPool", [
    tokenContract.address
  ]);
  
  // 5. Deploy main orchestrator
  const mainContract = await deployContract("HederaGameLaunchpad", [
    gameRegistry.address,
    resultVerifier.address,
    sbtContract.address,
    nftContract.address,
    tokenContract.address,
    faucetManager.address,
    lotteryPool.address
  ]);
  
  return mainContract;
}
```

**2. Configuration:**
```typescript
async function configure() {
  // Set up roles
  await mainContract.grantRole(OWNER_ROLE, owner.address);
  await mainContract.grantRole(DAO_ROLE, daoMultisig.address);
  await mainContract.grantRole(SERVER_ROLE, gameServer.address);
  
  // Distribute initial token supply
  await tokenContract.distributeInitialSupply([
    gameRewardsPool,
    developerIncentives,
    daoTreasury,
    marketingEvents,
    liquidityReserve
  ]);
}
```

### **Integration with Hedera SDK:**
```typescript
import { Client, PrivateKey, AccountId } from "@hashgraph/sdk";

const client = Client.forTestnet();
client.setOperator(
  AccountId.fromString(process.env.ACCOUNT_ID),
  PrivateKey.fromString(process.env.PRIVATE_KEY)
);

// Associate tokens
await hederaAssociateToken(client, contractAddress, tokenId);

// Execute contract calls
const result = await hederaContractCall(client, {
  contractId: contractId,
  function: "swapHBARforHPLAY",
  parameters: [],
  amount: 10_000_000_000 // 10 HBAR in tinybars
});
```

---

## 🧪 6. Testing Requirements

### **Unit Tests:**

**GameRegistry Tests:**
```typescript
describe("GameRegistry", () => {
  it("Should register new game module");
  it("Should prevent duplicate game registration");
  it("Should only allow owner to register");
  it("Should store server public key");
  it("Should revoke game module");
  it("Should update server public key");
});
```

**ResultVerifier Tests:**
```typescript
describe("ResultVerifier", () => {
  it("Should verify valid signature");
  it("Should reject invalid signature");
  it("Should prevent signature replay");
  it("Should enforce nonce monotonicity");
  it("Should reject expired signatures");
  it("Should update player SBT on verification");
  it("Should emit GameResultVerified event");
});
```

**TokenEconomy Tests:**
```typescript
describe("TokenEconomy", () => {
  it("Should mint initial supply correctly");
  it("Should distribute initial supply");
  it("Should burn tokens correctly");
  it("Should apply transfer fees");
  it("Should calculate rewards accurately");
  it("Should handle staking/unstaking");
  it("Should enforce maximum supply");
});
```

**FaucetManager Tests:**
```typescript
describe("FaucetManager", () => {
  it("Should swap HBAR for HPLAY");
  it("Should enforce daily limits");
  it("Should apply bonus multipliers");
  it("Should calculate correct exchange rate");
  it("Should update swap rate via DAO");
  it("Should reset daily limits after 24 hours");
});
```

**LotteryPool Tests:**
```typescript
describe("LotteryPool", () => {
  it("Should accumulate fees correctly");
  it("Should execute lottery draw");
  it("Should use weighted random selection");
  it("Should enforce draw interval");
  it("Should distribute prize to winner");
  it("Should reset pool after draw");
});
```

### **Integration Tests:**
```typescript
describe("Integration Tests", () => {
  it("Should complete full game flow");
  it("Should handle multiple games simultaneously");
  it("Should prevent double-spending");
  it("Should handle high concurrent transactions");
  it("Should recover from failed transactions");
  it("Should maintain token supply invariants");
});
```

### **Gas Optimization Tests:**
```typescript
describe("Gas Optimization", () => {
  it("Signature verification should cost < 50,000 gas");
  it("Reward distribution should cost < 100,000 gas");
  it("Lottery draw should cost < 200,000 gas");
  it("Should use packed structs efficiently");
});
```

### **Security Tests:**
```typescript
describe("Security", () => {
  it("Should prevent reentrancy attacks");
  it("Should prevent integer overflow");
  it("Should prevent unauthorized access");
  it("Should validate all inputs");
  it("Should handle edge cases");
});
```

---

## ✅ 7. Deliverables & Requirements

### **Code Deliverables:**
1. ✅ **Fully functional, modular Solidity codebase** (all 7 core contracts)
2. ✅ **Complete interface definitions** for all modules
3. ✅ **Hardhat configuration** with Hedera testnet support
4. ✅ **Deployment scripts** with proper initialization
5. ✅ **Comprehensive test suite** (>90% coverage)
6. ✅ **Documentation** (README, function comments, architecture diagrams)

### **Key Requirements:**

**Smart Contract Features:**
- [ ] Solidity 0.8.20+ with Hedera HTS integration
- [ ] Role-based access control (Owner, DAO, Server)
- [ ] Cryptographic signature verification (ECDSA)
- [ ] Replay attack protection (nonce + timestamp)
- [ ] Deflationary token mechanics
- [ ] Lottery system with weighted randomization
- [ ] Emergency pause functionality
- [ ] Gas-optimized storage patterns

**Security Features:**
- [ ] Reentrancy protection (OpenZeppelin ReentrancyGuard)
- [ ] Integer overflow protection (Solidity 0.8.20+ built-in)
- [ ] Access control (OpenZeppelin AccessControl)
- [ ] Input validation on all external functions
- [ ] Event emission for all state changes
- [ ] Comprehensive error messages

**Technical Specifications:**
- [ ] Hedera Testnet deployment ready
- [ ] Hedera Token Service integration (FT + NFT)
- [ ] Hedera Smart Contract Service integration
- [ ] IPFS metadata support
- [ ] Event-based off-chain indexing
- [ ] Upgradeable architecture (future-proof)

**Governance:**
- [ ] DAO-controlled parameters (rates, fees, limits)
- [ ] Owner-controlled emergency functions
- [ ] Multi-signature support for DAO
- [ ] Transparent proposal/execution flow

### **Expected Gas Costs:**
```
registerGameModule:      ~150,000 gas
submitGameResult:        ~80,000 gas
mintAchievementNFT:        ~50,000 gas
swapHBARforHPLAY:        ~100,000 gas
burnNFTForUpgrade:       ~120,000 gas
executeLotteryDraw:      ~250,000 gas
```

### **Performance Requirements:**
- Transaction finality: < 5 seconds (Hedera)
- Signature verification: < 100ms
- Reward calculation: < 50ms
- Contract deployment: < 5 minutes
- Full test suite execution: < 10 minutes

---

## 📝 8. Additional Notes

### **Future Enhancements:**
1. **Cross-game interoperability** via shared SBT standards
2. **Layer-2 scaling** solution integration
3. **Decentralized random number generation** (Chainlink VRF)
4. **Gamification mechanics** (leaderboards, tournaments)
5. **Fractionalized NFT ownership** for rare items
6. **Governance token** (separate from HPLAY)
7. **Bridge to other networks** (Ethereum, Polygon)

### **Development Timeline (Estimated):**
```
Week 1-2:  Core contracts implementation
Week 3:     Hedera HTS integration
Week 4:     Testing suite development
Week 5:     Security audit and fixes
Week 6:     Deployment and configuration
Week 7:     Documentation and refinement
```

### **Important Considerations:**
- Hedera operates on tinybars (1 HBAR = 10^8 tinybars)
- Hedera uses native tokens, not wrapped tokens
- Contract deployment requires HBAR for fees
- Token association is mandatory on Hedera
- Event filtering is more efficient than storage queries
- Use batch operations where possible to save gas

---

**End of Prompt**