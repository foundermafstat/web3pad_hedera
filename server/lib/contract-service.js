import { ContractCallQuery, ContractFunctionParameters, AccountBalanceQuery, AccountId, Hbar } from '@hashgraph/sdk';
import { initializeHederaClient, getContractConfig, getContractEvmAddress, HEDERA_USE_MOCKS, HEDERA_CONFIG } from './hedera-config.js';
import { ethers } from 'ethers';
import { transactionService } from './transaction-service.js';

/**
 * Contract interaction service for reading data from Hedera smart contracts
 */
export class ContractService {
    constructor() {
        this.client = initializeHederaClient();
        // Cache for token balances to avoid rate limiting
        this.balanceCache = new Map();
        this.CACHE_TTL = 30000; // 30 seconds cache (increased to reduce spam)
    }

    getEthersContract(contractName) {
        const rpcUrl = HEDERA_CONFIG.jsonRpcUrl;
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const evmAddress = getContractEvmAddress(contractName);
        const abi = getContractConfig(contractName).abi;
        return new ethers.Contract(evmAddress, abi, provider);
    }

    /**
     * Execute a read-only contract call
     * @param {string} contractName Contract name
     * @param {string} functionName Function name
     * @param {Array} parameters Function parameters
     * @returns {Promise<any>} Function result
     */
    async callContractFunction(contractName, functionName, parameters = []) {
        try {
            if (!this.client) {
                throw new Error('Hedera client not initialized');
            }

            // Check if client has operator set
            if (!this.client.operatorAccountId) {
                if (HEDERA_USE_MOCKS) {
                    return this.getMockContractResult(contractName, functionName);
                }
                throw new Error('Hedera operator not configured (set HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY)');
            }

            const contractConfig = getContractConfig(contractName);
            const contractId = contractConfig.contractId;

            // Create contract call query
            const query = new ContractCallQuery()
                .setContractId(contractId)
                .setFunction(functionName)
                .setGas(500000) // sufficient gas for view calls
                .setMaxQueryPayment(Hbar.fromTinybars(200000000)); // 2 HBAR max payment

            // Add parameters if provided
            if (parameters.length > 0) {
                query.setFunctionParameters(parameters[0]);
            }

            // Execute the query
            const result = await query.execute(this.client);
            
            return result;
        } catch (error) {
            if (HEDERA_USE_MOCKS) {
                return this.getMockContractResult(contractName, functionName);
            }
            throw error;
        }
    }

    /**
     * Get mock contract result for testing/fallback
     * @param {string} contractName Contract name
     * @param {string} functionName Function name
     * @returns {Object} Mock result
     */
    getMockContractResult(contractName, functionName) {
        const mockResults = {
            'FaucetManager.getSwapRate': {
                getUint256: (index) => ({
                    toNumber: () => {
                        const values = [500, 100, 150, 1000 * 10**8]; // 1 HBAR = 500 HPLAY (without extra decimals)
                        return values[index] || 0;
                    }
                }),
                getBool: (index) => index === 4 ? true : false
            },
            'FaucetManager.getUserSwapInfo': {
                getUint256: (index) => ({
                    toNumber: () => {
                        const values = [0, 0, 0]; // dailyUsedHbar, lastSwapTimestamp, totalSwaps
                        return values[index] || 0;
                    }
                })
            },
            'HederaGameLaunchpad.getSystemStats': {
                getUint256: (index) => ({
                    toNumber: () => {
                        const values = [150, 45, 1000000, 500000, 30]; // gamesPlayed, players, rewardsDistributed, poolBalance, totalParticipants
                        return values[index] || 0;
                    }
                }),
                getBool: (index) => index === 5 ? true : false
            }
        };

        const key = `${contractName}.${functionName}`;
        return mockResults[key] || {
            getUint256: () => ({ toNumber: () => 0 }),
            getBool: () => false,
            getString: () => '',
            getAddress: () => '0x0000000000000000000000000000000000000000'
        };
    }


    /**
     * Get game module information
     * @param {string} gameId Game identifier
     * @returns {Promise<Object>} Game module data
     */
    async getGameModule(gameId) {
        const result = await this.callContractFunction('GameRegistry', 'getGameModule', [
            new ContractFunctionParameters().addString(gameId)
        ]);
        
        return {
            authorizedServer: result.getAddress(0),
            serverPublicKey: result.getBytes32(1),
            gameId: result.getString(2),
            metadataURI: result.getString(3),
            registrationTimestamp: result.getUint256(4).toNumber(),
            isActive: result.getBool(5),
            nonce: result.getUint256(6).toNumber()
        };
    }

    /**
     * Check if server is valid for a game
     * @param {string} gameId Game identifier
     * @param {string} serverAddress Server address
     * @returns {Promise<boolean>} Is server valid
     */
    async isValidServer(gameId, serverAddress) {
        const result = await this.callContractFunction('GameRegistry', 'isValidServer', [
            new ContractFunctionParameters().addString(gameId).addAddress(serverAddress)
        ]);
        
        return result.getBool(0);
    }

    /**
     * Get difficulty multiplier for a game
     * @param {string} gameId Game identifier
     * @returns {Promise<number>} Difficulty multiplier
     */
    async getDifficultyMultiplier(gameId) {
        const result = await this.callContractFunction('GameRegistry', 'getDifficultyMultiplier', [
            new ContractFunctionParameters().addString(gameId)
        ]);
        
        return result.getUint256(0).toNumber();
    }

    /**
     * Get total games registered
     * @returns {Promise<number>} Total games count
     */
    async getTotalGamesRegistered() {
        const result = await this.callContractFunction('GameRegistry', 'totalGamesRegistered');
        return result.getUint256(0).toNumber();
    }

    /**
     * Get token balance for an account
     * @param {string} accountAddress Account address
     * @returns {Promise<number>} Token balance (in HPLAY, not smallest units)
     */
    async getTokenBalance(accountAddress) {
        try {
            // Use RPC method (more reliable for token balance queries)
            return await this.getTokenBalanceRpc(accountAddress);
        } catch (error) {
            console.error('Error getting token balance:', error);
            // Return 0 if call fails
            return 0;
        }
    }

    /**
     * Get total token supply
     * @returns {Promise<number>} Total supply
     */
    async getTotalSupply() {
        const result = await this.callContractFunction('TokenEconomy', 'totalSupply');
        return result.getUint256(0).toNumber();
    }

    /**
     * Get staked balance for an account
     * @param {string} accountAddress Account address
     * @returns {Promise<number>} Staked balance
     */
    async getStakedBalance(accountAddress) {
        const result = await this.callContractFunction('TokenEconomy', 'getStakedBalance', [
            new ContractFunctionParameters().addAddress(accountAddress)
        ]);
        
        return result.getUint256(0).toNumber();
    }

    /**
     * Calculate staking rewards
     * @param {string} accountAddress Account address
     * @param {number} amount Amount to calculate for
     * @returns {Promise<number>} Calculated rewards
     */
    async calculateRewards(accountAddress, amount) {
        const result = await this.callContractFunction('TokenEconomy', 'calculateRewards', [
            new ContractFunctionParameters().addAddress(accountAddress).addUint256(amount)
        ]);
        
        return result.getUint256(0).toNumber();
    }

    /**
     * Check if player has SBT
     * @param {string} playerAddress Player address
     * @returns {Promise<boolean>} Has SBT
     */
    async hasSBT(playerAddress) {
        const result = await this.callContractFunction('PlayerSBT', 'hasSBT', [
            new ContractFunctionParameters().addAddress(playerAddress)
        ]);
        
        return result.getBool(0);
    }

    /**
     * Get player statistics
     * @param {string} playerAddress Player address
     * @returns {Promise<Object>} Player stats
     */
    async getPlayerStats(playerAddress) {
        const result = await this.callContractFunction('PlayerSBT', 'getPlayerStats', [
            new ContractFunctionParameters().addAddress(playerAddress)
        ]);
        
        return {
            totalGamesPlayed: result.getUint256(0).toNumber(),
            totalWins: result.getUint256(1).toNumber(),
            totalPoints: result.getUint256(2).toNumber(),
            totalLosses: result.getUint256(3).toNumber(),
            averageScore: result.getUint256(4).toNumber(),
            lastGameTimestamp: result.getUint256(5).toNumber()
        };
    }

    /**
     * Get game-specific statistics for a player
     * @param {string} playerAddress Player address
     * @param {string} gameId Game identifier
     * @returns {Promise<Object>} Game-specific stats
     */
    async getGameSpecificStats(playerAddress, gameId) {
        const result = await this.callContractFunction('PlayerSBT', 'getGameSpecificStats', [
            new ContractFunctionParameters().addAddress(playerAddress).addString(gameId)
        ]);
        
        return {
            gamesPlayed: result.getUint256(0).toNumber(),
            totalScore: result.getUint256(1).toNumber(),
            highestScore: result.getUint256(2).toNumber(),
            wins: result.getUint256(3).toNumber(),
            lastPlayed: result.getUint256(4).toNumber()
        };
    }

    /**
     * Calculate reward amount
     * @param {number} score Game score
     * @param {string} gameId Game identifier
     * @returns {Promise<number>} Reward amount
     */
    async calculateReward(score, gameId) {
        const result = await this.callContractFunction('PlayerSBT', 'calculateReward', [
            new ContractFunctionParameters().addUint256(score).addString(gameId)
        ]);
        
        return result.getUint256(0).toNumber();
    }

    /**
     * Mint Player SBT for a user (server must have GAME_SERVER_ROLE)
     * @param {string} playerAddress Hedera (0.0.x) or EVM (0x...) address of the player
     * @param {string} tokenUri Metadata URI for the SBT
     * @returns {Promise<Object>} Mint result
     */
    async mintPlayerSBT(playerAddress, tokenUri) {
        try {
            if (!transactionService.isAvailable()) {
                throw new Error('Transaction service not available. Check Hedera configuration.');
            }

            const systemAccountId = process.env.HEDERA_ACCOUNT_ID;
            const systemPrivateKey = process.env.HEDERA_PRIVATE_KEY;

            if (!systemAccountId || !systemPrivateKey) {
                throw new Error('System Hedera credentials are not configured (HEDERA_ACCOUNT_ID/HEDERA_PRIVATE_KEY).');
            }

            // Pre-check: prevent revert if player already has SBT
            try {
                const already = await this.hasSBT(playerAddress);
                if (already) {
                    throw new Error('Player already has SBT');
                }
            } catch (_) {}

            // Convert player address to solidity 20-byte address for contract call
            let solidityAddress = playerAddress;
            try {
                if (playerAddress && playerAddress.match(/^\d+\.\d+\.\d+$/)) {
                    const acc = AccountId.fromString(playerAddress);
                    solidityAddress = `0x${acc.toSolidityAddress()}`;
                }
            } catch {}

            const params = new ContractFunctionParameters()
                .addAddress(solidityAddress)
                .addString(tokenUri || 'ipfs://player-sbt-default');

            const result = await transactionService.executeContractTransaction(
                'PlayerSBT',
                'mintSBT',
                [params],
                0,
                systemAccountId,
                systemPrivateKey,
                { gas: 2000000, maxFeeTinybars: 1000000000 }
            );

            return {
                success: true,
                transactionId: result.transactionId,
                receipt: result.receipt,
                contractFunctionResult: result.contractFunctionResult ? {
                    // Some networks may return tokenId in logs/return; guard access
                    raw: true
                } : null
            };
        } catch (error) {
            console.error('Error minting Player SBT:', error);
            // Hint likely cause for revert: missing GAME_SERVER_ROLE or duplicate SBT
            if (String(error?.message || '').includes('CONTRACT_REVERT_EXECUTED')) {
                throw new Error('Mint reverted. Ensure the server operator has GAME_SERVER_ROLE on PlayerSBT and the player does not already have an SBT.');
            }
            if (String(error?.message || '').includes('already has SBT')) {
                throw new Error('Mint blocked: player already has an SBT.');
            }
            throw error;
        }
    }

    /**
     * Get player NFT count
     * @param {string} playerAddress Player address
     * @returns {Promise<number>} NFT count
     */
    async getPlayerNFTCount(playerAddress) {
        const result = await this.callContractFunction('NFTManager', 'getPlayerNFTCount', [
            new ContractFunctionParameters().addAddress(playerAddress)
        ]);
        
        return result.getUint256(0).toNumber();
    }

    /**
     * Get lottery pool balance
     * @returns {Promise<number>} Pool balance
     */
    async getLotteryPoolBalance() {
        const result = await this.callContractFunction('LotteryPool', 'getPoolBalance');
        return result.getUint256(0).toNumber();
    }

    /**
     * Get total lottery participants
     * @returns {Promise<number>} Total participants
     */
    async getTotalParticipants() {
        const result = await this.callContractFunction('LotteryPool', 'getTotalParticipants');
        return result.getUint256(0).toNumber();
    }

    /**
     * Get last draw timestamp
     * @returns {Promise<number>} Unix timestamp (seconds)
     */
    async getLastDrawTimestamp() {
        const result = await this.callContractFunction('LotteryPool', 'getLastDrawTimestamp');
        return result.getUint256(0).toNumber();
    }

    /**
     * Get draw interval in seconds
     * @returns {Promise<number>} Interval seconds
     */
    async getDrawInterval() {
        const result = await this.callContractFunction('LotteryPool', 'getDrawInterval');
        return result.getUint256(0).toNumber();
    }

    /**
     * Check if address is a participant
     * @param {string} userAddress Address
     * @returns {Promise<boolean>} is participant
     */
    async isLotteryParticipant(userAddress) {
        const result = await this.callContractFunction('LotteryPool', 'isParticipant', [
            new ContractFunctionParameters().addAddress(this.validateAddress(userAddress))
        ]);
        return result.getBool(0);
    }

    /**
     * Get participant transaction count
     * @param {string} userAddress Address
     * @returns {Promise<number>} count
     */
    async getParticipantTransactionCount(userAddress) {
        const result = await this.callContractFunction('LotteryPool', 'getParticipantTransactionCount', [
            new ContractFunctionParameters().addAddress(this.validateAddress(userAddress))
        ]);
        return result.getUint256(0).toNumber();
    }

    /**
     * Get participant volume
     * @param {string} userAddress Address
     * @returns {Promise<number>} volume
     */
    async getParticipantVolume(userAddress) {
        const result = await this.callContractFunction('LotteryPool', 'getParticipantVolume', [
            new ContractFunctionParameters().addAddress(this.validateAddress(userAddress))
        ]);
        return result.getUint256(0).toNumber();
    }

    /**
     * Get all participants (array of addresses)
     * @returns {Promise<string[]>} addresses
     */
    async getAllParticipants() {
        try {
            const contract = this.getEthersContract('LotteryPool');
            const participants = await contract.getAllParticipants();
            // Normalize to checksum addresses as strings
            return (participants || []).map((a) => {
                try { return ethers.getAddress(String(a)); } catch { return String(a); }
            });
        } catch (error) {
            console.error('Error fetching all participants via JSON-RPC:', error);
            if (HEDERA_USE_MOCKS) {
                return [];
            }
            throw error;
        }
    }

    /** FaucetManager via JSON-RPC **/
    async getSwapRateRpc() {
        const contract = this.getEthersContract('FaucetManager');
        const r = await contract.getSwapRate();
        // tuple(uint256,uint256,uint256,uint256,bool)
        return {
            hbarToHplayRate: Number(r[0]),
            bonusMultiplierMin: Number(r[1]),
            bonusMultiplierMax: Number(r[2]),
            dailyLimitHbar: Number(r[3]),
            faucetEnabled: Boolean(r[4])
        };
    }

    async getUserSwapInfoRpc(userAddress) {
        const contract = this.getEthersContract('FaucetManager');
        const addr = this.validateAddress(userAddress);
        const r = await contract.getUserSwapInfo(addr);
        // tuple(uint256 totalSwappedToday, uint256 lastSwapTimestamp, uint256 swapsCount)
        return {
            dailyUsedHbar: Number(r[0]),
            lastSwapTimestamp: Number(r[1]),
            totalSwaps: Number(r[2])
        };
    }

    async calculateBonusFactorRpc(userAddress) {
        const contract = this.getEthersContract('FaucetManager');
        const addr = this.validateAddress(userAddress);
        const v = await contract.calculateBonusFactor(addr);
        return Number(v);
    }

    async isNewDayRpc(lastSwapTimestamp) {
        // Compute via fallback: consider new day if 24h passed since lastSwapTimestamp
        const nowSec = Math.floor(Date.now() / 1000);
        const last = Number(lastSwapTimestamp) || 0;
        return nowSec - last >= 24 * 60 * 60;
    }

    /** TokenEconomy via JSON-RPC (ERC20 contract, not HTS token) **/
    async getTokenBalanceRpc(userAddress) {
        try {
            // Check cache first
            const cacheKey = `balance_${userAddress}`;
            const cached = this.balanceCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                return cached.balance;
            }
            
            console.log(`[TokenBalance] Querying ERC20 balance for ${userAddress}`);
            
            // If address is Hedera Account ID (0.0.X), get EVM address from Mirror Node
            let evmAddress;
            if (userAddress.startsWith('0.0.')) {
                console.log(`[TokenBalance] Converting Hedera ID ${userAddress} to EVM address`);
                const mirrorNodeUrl = HEDERA_CONFIG.mirrorNodeUrl;
                const response = await fetch(`${mirrorNodeUrl}/api/v1/accounts/${userAddress}`);
                
                if (!response.ok) {
                    console.error(`[TokenBalance] Failed to get account info: ${response.status}`);
                    throw new Error(`Account ${userAddress} not found`);
                }
                
                const data = await response.json();
                evmAddress = data.evm_address;
                
                if (!evmAddress) {
                    throw new Error(`No EVM address found for ${userAddress}`);
                }
                
                console.log(`[TokenBalance] ${userAddress} -> ${evmAddress}`);
            } else {
                evmAddress = this.validateAddress(userAddress);
            }
            
            // TokenEconomyV2 is an ERC20 contract, not HTS token
            // Query balanceOf via JSON-RPC
            const contract = this.getEthersContract('TokenEconomy');
            const balance = await contract.balanceOf(evmAddress);
            
            // TokenEconomyV2 uses 8 decimals, convert to HPLAY
            const balanceInSmallestUnits = Number(balance);
            const balanceInHPLAY = balanceInSmallestUnits / 100000000; // Divide by 10^8
            
            console.log(`[TokenBalance] ${evmAddress}: ${balanceInHPLAY} HPLAY (raw: ${balanceInSmallestUnits})`);
            
            // Cache the result
            this.balanceCache.set(cacheKey, {
                balance: balanceInHPLAY,
                timestamp: Date.now()
            });
            
            return balanceInHPLAY;
        } catch (error) {
            console.error('Error getting token balance:', error.message);
            // Cache zero balance on error to prevent spam
            const cacheKey = `balance_${userAddress}`;
            this.balanceCache.set(cacheKey, {
                balance: 0,
                timestamp: Date.now()
            });
            return 0;
        }
    }

    async getRemainingDailyLimitRpc(userAddress) {
        const contract = this.getEthersContract('FaucetManager');
        const addr = this.validateAddress(userAddress);
        const v = await contract.getRemainingDailyLimit(addr);
        return Number(v);
    }

    async getFaucetStatsRpc() {
        const contract = this.getEthersContract('FaucetManager');
        const r = await contract.getFaucetStats();
        // assume (uint256 totalDistributed, uint256 totalUsers, uint256 totalSwaps, uint256 totalHbar)
        return {
            totalDistributed: Number(r[0] || 0),
            totalUsers: Number(r[1] || 0),
            totalSwaps: Number(r[2] || 0),
            totalHbar: Number(r[3] || 0)
        };
    }

    /**
     * PlayerSBT RPC methods using ethers
     */
    async hasSBTRpc(playerAddress) {
        const contract = this.getEthersContract('PlayerSBT');
        const addr = this.validateAddress(playerAddress);
        const result = await contract.hasSBT(addr);
        return Boolean(result);
    }

    async getPlayerStatsRpc(playerAddress) {
        const contract = this.getEthersContract('PlayerSBT');
        const addr = this.validateAddress(playerAddress);
        const r = await contract.getPlayerStats(addr);
        // tuple(uint256 totalGamesPlayed, uint256 totalWins, uint256 totalPoints, uint256 totalLosses, uint256 averageScore, uint256 lastGameTimestamp)
        return {
            totalGamesPlayed: Number(r[0] || 0),
            totalWins: Number(r[1] || 0),
            totalPoints: Number(r[2] || 0),
            totalLosses: Number(r[3] || 0),
            averageScore: Number(r[4] || 0),
            lastGameTimestamp: Number(r[5] || 0)
        };
    }

    async getGameSpecificStatsRpc(playerAddress, gameId) {
        const contract = this.getEthersContract('PlayerSBT');
        const addr = this.validateAddress(playerAddress);
        const r = await contract.getGameSpecificStats(addr, gameId);
        // tuple(uint256 gamesPlayed, uint256 totalScore, uint256 highestScore, uint256 wins, uint256 lastPlayed)
        return {
            gamesPlayed: Number(r[0] || 0),
            totalScore: Number(r[1] || 0),
            highestScore: Number(r[2] || 0),
            wins: Number(r[3] || 0),
            lastPlayed: Number(r[4] || 0)
        };
    }

    async calculateRewardRpc(score, gameId) {
        const contract = this.getEthersContract('PlayerSBT');
        const result = await contract.calculateReward(score, gameId);
        return Number(result || 0);
    }

    async getPlayerTokenIdRpc(playerAddress) {
        try {
            const contract = this.getEthersContract('PlayerSBT');
            const addr = this.validateAddress(playerAddress);
            const result = await contract.getPlayerTokenId(addr);
            return Number(result || 0);
        } catch (error) {
            // Player doesn't have SBT token yet - this is normal
            if (error.message?.includes('execution reverted') || error.code === 'CALL_EXCEPTION') {
                console.log(`Player ${playerAddress} does not have an SBT token yet`);
                return 0;
            }
            throw error;
        }
    }

    async getTotalSBTsRpc() {
        const contract = this.getEthersContract('PlayerSBT');
        const result = await contract.getTotalSBTs();
        return Number(result || 0);
    }

    /**
     * GameRegistry RPC methods using ethers
     */
    async getGameModuleRpc(gameId) {
        const contract = this.getEthersContract('GameRegistry');
        const r = await contract.getGameModule(gameId);
        // struct GameModule { address authorizedServer; bytes32 serverPublicKey; string gameId; string metadataURI; uint256 registrationTimestamp; bool isActive; uint256 nonce; }
        return {
            authorizedServer: r[0] || '0x0000000000000000000000000000000000000000',
            serverPublicKey: r[1] || '0x0000000000000000000000000000000000000000000000000000000000000000',
            gameId: r[2] || '',
            metadataURI: r[3] || '',
            registrationTimestamp: Number(r[4] || 0),
            isActive: Boolean(r[5] || false),
            nonce: Number(r[6] || 0)
        };
    }

    async isValidServerRpc(gameId, serverAddress) {
        const contract = this.getEthersContract('GameRegistry');
        const addr = this.validateAddress(serverAddress);
        const result = await contract.isValidServer(gameId, addr);
        return Boolean(result);
    }

    async getDifficultyMultiplierRpc(gameId) {
        const contract = this.getEthersContract('GameRegistry');
        const result = await contract.getDifficultyMultiplier(gameId);
        return Number(result || 0);
    }

    async getCurrentNonceRpc(gameId) {
        const contract = this.getEthersContract('GameRegistry');
        const result = await contract.getCurrentNonce(gameId);
        return Number(result || 0);
    }

    /**
     * NFTManager RPC methods using ethers
     */
    async getNFTRpc(tokenId) {
        const contract = this.getEthersContract('NFTManager');
        const r = await contract.getNFT(tokenId);
        // struct AchievementNFT { uint256 tokenId; address owner; string achievementType; string metadataURI; uint256 mintedTimestamp; uint256 rarityScore; }
        return {
            tokenId: Number(r[0] || 0),
            owner: r[1] || '0x0000000000000000000000000000000000000000',
            achievementType: r[2] || '',
            metadataURI: r[3] || '',
            mintedTimestamp: Number(r[4] || 0),
            rarityScore: Number(r[5] || 0)
        };
    }

    async getPlayerNFTsRpc(playerAddress) {
        const contract = this.getEthersContract('NFTManager');
        const addr = this.validateAddress(playerAddress);
        const result = await contract.getPlayerNFTs(addr);
        // Returns uint256[] array
        return Array.isArray(result) ? result.map(r => Number(r || 0)) : [];
    }

    async getPlayerNFTCountRpc(playerAddress) {
        const contract = this.getEthersContract('NFTManager');
        const addr = this.validateAddress(playerAddress);
        const result = await contract.getPlayerNFTCount(addr);
        return Number(result || 0);
    }

    async getRarityBurnFeeRpc(rarity) {
        const contract = this.getEthersContract('NFTManager');
        const result = await contract.getRarityBurnFee(rarity);
        return Number(result || 0);
    }

    async getTotalNFTsRpc() {
        const contract = this.getEthersContract('NFTManager');
        const result = await contract.getTotalNFTs();
        return Number(result || 0);
    }

    /**
     * Get time until next lottery draw
     * @returns {Promise<number>} Time in seconds
     */
    async getTimeUntilNextDraw() {
        const result = await this.callContractFunction('LotteryPool', 'getTimeUntilNextDraw');
        return result.getUint256(0).toNumber();
    }

    /**
     * Get faucet swap rate information
     * @returns {Promise<Object>} Swap rate data
     */
    async getSwapRate() {
        try {
            const result = await this.callContractFunction('FaucetManager', 'getSwapRate');
            
            return {
                hbarToHplayRate: result.getUint256(0).toNumber(),
                bonusMultiplierMin: result.getUint256(1).toNumber(),
                bonusMultiplierMax: result.getUint256(2).toNumber(),
                dailyLimitHbar: result.getUint256(3).toNumber(),
                faucetEnabled: result.getBool(4)
            };
        } catch (error) {
            // Return default values if contract call fails
            return {
                hbarToHplayRate: 500,          // 1 HBAR = 500 HPLAY (without extra decimals)
                bonusMultiplierMin: 100,       // 1.0x
                bonusMultiplierMax: 150,       // 1.5x
                dailyLimitHbar: 1000 * 10**8,  // 1000 HBAR per user per day
                faucetEnabled: true
            };
        }
    }

    /**
     * Validate and convert Hedera address to Ethereum format
     * @param {string} address Hedera address
     * @returns {string} Ethereum format address
     */
    validateAddress(address) {
        if (!address) {
            throw new Error('Address is required');
        }

        // If it's already in Ethereum format (0x...), return as is
        if (address.startsWith('0x') && address.length === 42) {
            return address;
        }

        // If it's a Hedera address (0.0.xxxxxx), we need to convert it
        // For now, we'll use a mock Ethereum address for testing
        // In production, you would need to implement proper address conversion
        if (address.match(/^\d+\.\d+\.\d+$/)) {
            // Convert Hedera address to a mock Ethereum address for testing
            // This is a temporary solution - in production you'd need proper conversion
            const parts = address.split('.');
            const accountNum = parts[2];
            // Create a mock Ethereum address based on Hedera account number
            const mockAddress = `0x${accountNum.padStart(40, '0')}`;
            return mockAddress;
        }

        throw new Error(`Invalid address format: ${address}. Expected Hedera format (0.0.xxxxxx) or Ethereum format (0x...)`);
    }

    /**
     * Get user swap information
     * @param {string} userAddress User address
     * @returns {Promise<Object>} User swap data
     */
    async getUserSwapInfo(userAddress) {
        try {
            const ethereumAddress = this.validateAddress(userAddress);
            const result = await this.callContractFunction('FaucetManager', 'getUserSwapInfo', [
                new ContractFunctionParameters().addAddress(ethereumAddress)
            ]);
            
            return {
                dailyUsedHbar: result.getUint256(0).toNumber(),
                lastSwapTimestamp: result.getUint256(1).toNumber(),
                totalSwaps: result.getUint256(2).toNumber()
            };
        } catch (error) {
            // Return default values if contract call fails
            return {
                dailyUsedHbar: 0,
                lastSwapTimestamp: 0,
                totalSwaps: 0
            };
        }
    }

    /**
     * Get system statistics from main launchpad contract
     * @returns {Promise<Object>} System stats
     */
    async getSystemStats() {
        const result = await this.callContractFunction('HederaGameLaunchpad', 'getSystemStats');
        
        return {
            gamesPlayed: result.getUint256(0).toNumber(),
            players: result.getUint256(1).toNumber(),
            rewardsDistributed: result.getUint256(2).toNumber(),
            poolBalance: result.getUint256(3).toNumber(),
            totalParticipants: result.getUint256(4).toNumber(),
            initialized: result.getBool(5)
        };
    }

    /**
     * Get comprehensive player information
     * @param {string} playerAddress Player address
     * @returns {Promise<Object>} Player info
     */
    async getPlayerInfo(playerAddress) {
        const result = await this.callContractFunction('HederaGameLaunchpad', 'getPlayerInfo', [
            new ContractFunctionParameters().addAddress(playerAddress)
        ]);
        
        return {
            hasSBT: result.getBool(0),
            stats: {
                totalGamesPlayed: result.getUint256(1).toNumber(),
                totalWins: result.getUint256(2).toNumber(),
                totalPoints: result.getUint256(3).toNumber(),
                totalLosses: result.getUint256(4).toNumber(),
                averageScore: result.getUint256(5).toNumber(),
                lastGameTimestamp: result.getUint256(6).toNumber()
            },
            nftCount: result.getUint256(7).toNumber(),
            hplayBalance: result.getUint256(8).toNumber()
        };
    }

    /**
     * Check if system is operational
     * @returns {Promise<boolean>} Is system operational
     */
    async isSystemOperational() {
        const result = await this.callContractFunction('HederaGameLaunchpad', 'isSystemOperational');
        return result.getBool(0);
    }

    /**
     * Create swap transaction for user to sign
     * @param {string} userAddress User's Hedera address
     * @param {number} hbarAmount Amount of HBAR to swap (in tinybars)
     * @returns {Promise<Object>} Transaction data for user to sign
     */
    async createSwapTransaction(userAddress, hbarAmount) {
        try {
            if (!transactionService.isAvailable()) {
                throw new Error('Transaction service not available. Please check Hedera configuration.');
            }

            return await transactionService.createSwapTransaction(userAddress, hbarAmount);
        } catch (error) {
            console.error(`Error creating swap transaction: ${error.message}`);
            throw error;
        }
    }

    /**
     * Swap HBAR for HPLAY tokens through FaucetManager
     * @param {string} userAddress User's Hedera address
     * @param {number} hbarAmount Amount of HBAR to swap (in tinybars)
     * @param {string} signature User's signature for authentication (optional for authenticated users)
     * @param {string} message Message that was signed (optional for authenticated users)
     * @returns {Promise<Object>} Swap result
     */
    async swapHbarForHplay(userAddress, hbarAmount, signature, message) {
        try {
            // For authenticated users, we don't need to verify signature again
            // The authentication was already done during login
            if (signature && message) {
                if (!this.verifySignature(userAddress, message, signature)) {
                    throw new Error('Invalid signature');
                }
            }

            // Check if user has exceeded daily limit
            const userSwapInfo = await this.getUserSwapInfo(userAddress);
            const swapRate = await this.getSwapRate();
            
            if (userSwapInfo.dailyUsedHbar + hbarAmount > swapRate.dailyLimitHbar) {
                throw new Error('Daily swap limit exceeded');
            }

            // Check if faucet is enabled
            if (!swapRate.faucetEnabled) {
                throw new Error('Faucet is currently disabled');
            }

            // Check if transaction service is available
            if (!transactionService.isAvailable()) {
                throw new Error('Transaction service not available. Please check Hedera configuration.');
            }

            // Check user's HBAR balance
            const userBalance = await this.getHbarBalance(userAddress);
            const requiredBalance = hbarAmount + 500000000; // Swap amount + 5 HBAR for fees
            
            if (userBalance < requiredBalance) {
                throw new Error(`Insufficient HBAR balance. Required: ${requiredBalance / 100000000} HBAR, Available: ${userBalance / 100000000} HBAR`);
            }

            // Execute the swap transaction through FaucetManager
            const transactionResult = await transactionService.executeSwapTransaction(
                userAddress,
                hbarAmount
            );

            return {
                success: true,
                transactionId: transactionResult.transactionId,
                hbarAmount: hbarAmount,
                hplayAmount: transactionResult.hplayAmount,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error(`Error swapping HBAR for HPLAY: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify user signature (placeholder implementation)
     * @param {string} address User address
     * @param {string} message Signed message
     * @param {string} signature Signature
     * @returns {boolean} Is signature valid
     */
    verifySignature(address, message, signature) {
        // This is a placeholder implementation
        // In a real implementation, you would verify the signature using Hedera SDK
        // For now, we'll just check if signature exists
        return signature && signature.length > 0;
    }

    /**
     * Get HBAR balance for an account
     * @param {string} accountAddress Account address
     * @returns {Promise<number>} HBAR balance
     */
    async getHbarBalance(accountAddress) {
        try {
            if (!this.client) {
                throw new Error('Hedera client not initialized');
            }

            // Check if client has operator set
            if (!this.client.operatorAccountId) {
                // Return a mock balance for testing
                return 100000000000; // 1000 HBAR in tinybars
            }

            // For HBAR balance, we need the original Hedera address format
            // So we don't convert it here, just validate the format
            if (!accountAddress.match(/^\d+\.\d+\.\d+$/)) {
                throw new Error(`Invalid Hedera address format: ${accountAddress}. Expected format: 0.0.xxxxxx`);
            }

            const accountId = AccountId.fromString(accountAddress);
            const accountInfo = await new AccountBalanceQuery()
                .setAccountId(accountId)
                .execute(this.client);
            
            return accountInfo.hbars.toTinybars().toNumber();
        } catch (error) {
            // Return mock balance on error
            return 100000000000; // 1000 HBAR in tinybars
        }
    }
}

// Export singleton instance
export const contractService = new ContractService();
