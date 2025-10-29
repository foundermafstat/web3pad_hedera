import { Client, AccountId, PrivateKey, ContractId } from '@hashgraph/sdk';
import dotenv from 'dotenv';

dotenv.config();

// Hedera Testnet Configuration
const HEDERA_CONFIG = {
    network: 'testnet',
    nodeId: 0,
    accountId: process.env.HEDERA_ACCOUNT_ID || '0.0.123456',
    privateKey: process.env.HEDERA_PRIVATE_KEY || '',
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
    explorerUrl: 'https://hashscan.io/testnet'
};

// Contract Addresses from deployment (Hedera format) - UPDATED WITH REAL ADDRESSES
const CONTRACT_ADDRESSES = {
    GameRegistry: process.env.GAME_REGISTRY_HEDERA_ID || '0.0.7153883',      // 0xda0cbeae027b044648386e4c27e20c18257c885a
    TokenEconomy: process.env.TOKEN_ECONOMY_HEDERA_ID || '0.0.7153884',      // 0x0c8f77d99ff0a20c4b5308abe24163c70c781963
    LotteryPool: process.env.LOTTERY_POOL_HEDERA_ID || '0.0.7153886',       // 0x9bb862643a73725e636dd7d7e30306844aa099f3
    PlayerSBT: process.env.PLAYER_SBT_HEDERA_ID || '0.0.7153887',         // 0xfe9CF4dde9fBc14d61D26703354AA10414B35Ea6
    NFTManager: process.env.NFT_MANAGER_HEDERA_ID || '0.0.7153888',        // 0x01Af1C62098d0217dEE7bC8A72dd93fa6D02b860
    FaucetManager: process.env.FAUCET_MANAGER_HEDERA_ID || '0.0.7153889',     // 0xe334AfEc78B410C953A9bEa0Ff1E55F74bdeC212
    ResultVerifier: process.env.RESULT_VERIFIER_HEDERA_ID || '0.0.7153890',    // 0xb1583369fe74fbf2d9b87b870fe67d6d0dc13b84
    HederaGameLaunchpad: process.env.HEDERA_GAME_LAUNCHPAD_HEDERA_ID || '0.0.7153891' // 0x54d13a05c632738674558f18de4394b7ee9a0399
};

// Contract ABIs (simplified for read operations)
const CONTRACT_ABIS = {
    GameRegistry: [
        'function getGameModule(string memory gameId) view returns (tuple(address authorizedServer, bytes32 serverPublicKey, string gameId, string metadataURI, uint256 registrationTimestamp, bool isActive, uint256 nonce))',
        'function isValidServer(string memory gameId, address server) view returns (bool)',
        'function getDifficultyMultiplier(string memory gameId) view returns (uint256)',
        'function getCurrentNonce(string memory gameId) view returns (uint256)',
        'function totalGamesRegistered() view returns (uint256)'
    ],
    TokenEconomy: [
        'function balanceOf(address account) view returns (uint256)',
        'function totalSupply() view returns (uint256)',
        'function maxSupply() view returns (uint256)',
        'function getStakedBalance(address account) view returns (uint256)',
        'function calculateRewards(address account, uint256 amount) view returns (uint256)',
        'function params() view returns (tuple(uint256 transferFeePercent, uint256 burnFeePercent, uint256 stakingRewardPercent, bool mintingEnabled))'
    ],
    PlayerSBT: [
        'function hasSBT(address player) view returns (bool)',
        'function getPlayerStats(address player) view returns (tuple(uint256 totalGamesPlayed, uint256 totalWins, uint256 totalPoints, uint256 totalLosses, uint256 averageScore, uint256 lastGameTimestamp))',
        'function getGameSpecificStats(address player, string memory gameId) view returns (tuple(uint256 gamesPlayed, uint256 totalScore, uint256 highestScore, uint256 wins, uint256 lastPlayed))',
        'function calculateReward(uint256 score, string memory gameId) view returns (uint256)',
        'function getPlayerTokenId(address player) view returns (uint256)',
        'function getTotalSBTs() view returns (uint256)'
    ],
    NFTManager: [
        'function getNFT(uint256 tokenId) view returns (tuple(uint256 tokenId, address owner, string achievementType, string metadataURI, uint256 mintedTimestamp, uint256 rarityScore))',
        'function getPlayerNFTs(address player) view returns (uint256[])',
        'function getPlayerNFTCount(address player) view returns (uint256)',
        'function getRarityBurnFee(string memory rarity) view returns (uint256)',
        'function getTotalNFTs() view returns (uint256)'
    ],
    LotteryPool: [
        'function getPoolBalance() view returns (uint256)',
        'function getTotalParticipants() view returns (uint256)',
        'function getLastDrawTimestamp() view returns (uint256)',
        'function getDrawInterval() view returns (uint256)',
        'function isParticipant(address user) view returns (bool)',
        'function getParticipantTransactionCount(address user) view returns (uint256)',
        'function getParticipantVolume(address user) view returns (uint256)',
        'function getTimeUntilNextDraw() view returns (uint256)'
    ],
    FaucetManager: [
        'function getUserSwapInfo(address user) view returns (tuple(uint256 totalSwappedToday, uint256 lastSwapTimestamp, uint256 swapsCount))',
        'function getSwapRate() view returns (tuple(uint256 hbarToHplayRate, uint256 bonusMultiplierMin, uint256 bonusMultiplierMax, uint256 dailyLimitHbar, bool faucetEnabled))',
        'function calculateBonusFactor(address user) view returns (uint256)',
        'function getRemainingDailyLimit(address user) view returns (uint256)',
        'function getFaucetStats() view returns (uint256, uint256, uint256, uint256)'
    ],
    HederaGameLaunchpad: [
        'function getSystemStats() view returns (uint256, uint256, uint256, uint256, uint256, bool)',
        'function getPlayerInfo(address player) view returns (bool, tuple(uint256 totalGamesPlayed, uint256 totalWins, uint256 totalPoints, uint256 totalLosses, uint256 averageScore, uint256 lastGameTimestamp), uint256, uint256)',
        'function getContractAddresses() view returns (address[7])',
        'function isSystemOperational() view returns (bool)'
    ]
};

/**
 * Initialize Hedera client
 * @returns {Client} Configured Hedera client
 */
export function initializeHederaClient() {
    try {
        const client = Client.forTestnet();
        
        // Configure operator for real contract calls
        if (HEDERA_CONFIG.accountId && HEDERA_CONFIG.privateKey) {
            const accountId = AccountId.fromString(HEDERA_CONFIG.accountId);
            const privateKey = PrivateKey.fromString(HEDERA_CONFIG.privateKey);
            client.setOperator(accountId, privateKey);
        }
        
        return client;
    } catch (error) {
        console.error('Failed to initialize Hedera client:', error);
        throw new Error('Hedera client initialization failed');
    }
}

/**
 * Get contract ID from address
 * @param {string} address Contract address
 * @returns {ContractId} Contract ID
 */
export function getContractId(address) {
    try {
        return ContractId.fromString(address);
    } catch (error) {
        console.error(`Invalid contract address: ${address}`, error);
        throw new Error(`Invalid contract address: ${address}`);
    }
}

/**
 * Get contract configuration
 * @param {string} contractName Contract name
 * @returns {Object} Contract configuration
 */
export function getContractConfig(contractName) {
    const address = CONTRACT_ADDRESSES[contractName];
    const abi = CONTRACT_ABIS[contractName];
    
    if (!address || !abi) {
        throw new Error(`Contract ${contractName} not found in configuration`);
    }
    
    return {
        address,
        abi,
        contractId: getContractId(address)
    };
}

export { HEDERA_CONFIG, CONTRACT_ADDRESSES, CONTRACT_ABIS };