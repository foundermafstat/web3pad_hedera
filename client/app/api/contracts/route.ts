import { NextResponse } from 'next/server';

// Prefer env values; fallback to static config if present
import { CONTRACT_ADDRESSES, CONTRACT_NAMES } from '@/lib/contract-config';

type ContractKey = keyof typeof CONTRACT_NAMES;

function envOrFallback(key: string, fallback?: string) {
  const v = process.env[key];
  return (v && v.trim().length > 0) ? v : (fallback || '');
}

// Static functions and descriptions (English content per request)
const CONTRACT_METADATA: Record<string, { title: string; description: string; functions: string[] }> = {
  HederaGameLaunchpad: {
    title: 'HederaGameLaunchpad',
    description:
      'Main orchestrator that wires all modules together: initialization, routing calls to registry, verifier, SBT, NFT, faucet and lottery.',
    functions: [
      'initializeSystem(address gameRegistry, address resultVerifier, address playerSBT, address nftManager, address tokenEconomy, address faucetManager, address lotteryPool)',
      'registerGameModule(address server, bytes32 publicKey, string gameId, string metadataURI)',
      'submitGameResult(address player, string gameId, uint256 score, bytes signature, uint256 nonce, uint256 timestamp)',
      'mintPlayerSBT(address player, string tokenURI)',
      'mintAchievementNFT(address player, string achievementType, string metadataURI)',
      'swapHBARforHPLAY() payable',
      'executeLotteryDraw()',
      'getSystemStats() view',
      'getPlayerInfo(address player) view',
      'updateContractDependency(uint8 contractType, address newAddress)'
    ]
  },
  GameRegistry: {
    title: 'GameRegistry',
    description:
      'Registers off-chain games, stores authorized servers and difficulty multipliers, manages per-game nonce.',
    functions: [
      'registerGameModule(address server, bytes32 publicKey, string gameId, string metadataURI)',
      'revokeGameModule(string gameId)',
      'updateServerPublicKey(string gameId, bytes32 newPublicKey)',
      'setDifficultyMultiplier(string gameId, uint256 multiplier)',
      'getGameModule(string gameId) view',
      'isValidServer(string gameId, address server) view',
      'getDifficultyMultiplier(string gameId) view',
      'incrementNonce(string gameId)',
      'getCurrentNonce(string gameId) view'
    ]
  },
  ResultVerifier: {
    title: 'ResultVerifier',
    description:
      'Verifies off-chain signed game results, guards against replay, updates SBT stats, and mints rewards.',
    functions: [
      'submitGameResult(address player, string gameId, uint256 score, bytes signature, uint256 nonce, uint256 timestamp)',
      'getPlayerNonce(address player) view',
      'isResultVerified(bytes32 messageHash) view',
      'setMinimumScore(string gameId, uint256 minimumScore)',
      'getMinimumScore(string gameId) view',
      'updateDependencies(address gameRegistry, address playerSBT, address tokenEconomy)'
    ]
  },
  PlayerSBT: {
    title: 'PlayerSBT',
    description:
      'Soulbound token representing player identity and statistics; non-transferable ERC721 with per-game stats.',
    functions: [
      'mintSBT(address player, string uri)',
      'updateStats(address player, string gameId, uint256 score, bool isWin)',
      'getPlayerStats(address player) view',
      'getGameSpecificStats(address player, string gameId) view',
      'hasSBT(address player) view',
      'calculateReward(uint256 score, string gameId) view',
      'getPlayerTokenId(address player) view',
      'getTotalSBTs() view'
    ]
  },
  NFTManager: {
    title: 'NFTManager',
    description:
      'Achievement NFT minting/burning with rarity-based fees; ERC721 with URI storage and burnable extension.',
    functions: [
      'mintAchievementNFT(address player, string achievementType, string metadataURI)',
      'burnNFTForUpgrade(address player, uint256 tokenId, uint256 hplayAmount)',
      'getNFT(uint256 tokenId) view',
      'getPlayerNFTs(address player) view',
      'getPlayerNFTCount(address player) view',
      'setRarityBurnFee(string rarity, uint256 fee)',
      'getRarityBurnFee(string rarity) view',
      'getTotalNFTs() view'
    ]
  },
  TokenEconomy: {
    title: 'TokenEconomy',
    description:
      'HPLAY fungible token with capped supply; fees funding lottery, staking rewards, and reward minting.',
    functions: [
      'mintRewards(address recipient, uint256 amount)',
      'burn(uint256 amount)',
      'maxSupply() view',
      'stake(uint256 amount)',
      'unstake(uint256 amount)',
      'getStakedBalance(address account) view',
      'calculateRewards(address account, uint256 amount) view',
      'updateParams(TokenParams newParams)',
      'associateToken(address tokenId) payable',
      'distributeInitialSupply(Distribution distribution)',
      'transfer(address to, uint256 amount)',
      'transferFrom(address from, address to, uint256 amount)'
    ]
  },
  FaucetManager: {
    title: 'FaucetManager',
    description:
      'Internal faucet converting HBAR to HPLAY with daily limits and activity-based bonus multiplier.',
    functions: [
      'swapHBARforHPLAY() payable',
      'updateSwapRate(uint256 newRate)',
      'setDailyLimit(uint256 newLimit)',
      'depositHPLAY(uint256 amount)',
      'getUserSwapInfo(address user) view',
      'getSwapRate() view',
      'calculateBonusFactor(address user) view',
      'isNewDay(uint256 lastSwapTimestamp) view',
      'getRemainingDailyLimit(address user) view',
      'getFaucetStats() view',
      'setFaucetEnabled(bool enabled)'
    ]
  },
  LotteryPool: {
    title: 'LotteryPool',
    description:
      'Automatic lottery funded by transfer fees with weighted random selection and periodic draws.',
    functions: [
      'accumulateFee(uint256 feeAmount)',
      'executeDraw()',
      'setDrawInterval(uint256 newInterval)',
      'emergencyWithdraw()',
      'getPoolBalance() view',
      'getTotalParticipants() view',
      'getLastDrawTimestamp() view',
      'getDrawInterval() view',
      'isParticipant(address user) view',
      'getParticipantTransactionCount(address user) view',
      'getParticipantVolume(address user) view',
      'getAllParticipants() view',
      'getTimeUntilNextDraw() view'
    ]
  }
};

export async function GET() {
  // Compose addresses
  const addresses = {
    HederaGameLaunchpad: envOrFallback('HEDERA_GAME_LAUNCHPAD_ADDRESS', CONTRACT_ADDRESSES.HederaGameLaunchpad),
    GameRegistry: envOrFallback('GAME_REGISTRY_ADDRESS', CONTRACT_ADDRESSES.GameRegistry),
    ResultVerifier: envOrFallback('RESULT_VERIFIER_ADDRESS', CONTRACT_ADDRESSES.ResultVerifier),
    PlayerSBT: envOrFallback('PLAYER_SBT_ADDRESS', CONTRACT_ADDRESSES.PlayerSBT),
    NFTManager: envOrFallback('NFT_MANAGER_ADDRESS', CONTRACT_ADDRESSES.NFTManager),
    TokenEconomy: envOrFallback('TOKEN_ECONOMY_ADDRESS', CONTRACT_ADDRESSES.TokenEconomy),
    FaucetManager: envOrFallback('FAUCET_MANAGER_ADDRESS', CONTRACT_ADDRESSES.FaucetManager),
    LotteryPool: envOrFallback('LOTTERY_POOL_ADDRESS', CONTRACT_ADDRESSES.LotteryPool)
  };

  const data = Object.entries(addresses).map(([key, address]) => ({
    key,
    name: key,
    address,
    ...CONTRACT_METADATA[key]
  }));

  return NextResponse.json({ success: true, data });
}


