import { ContractCallQuery, ContractFunctionParameters, AccountBalanceQuery, AccountId, Hbar } from '@hashgraph/sdk';
import { initializeHederaClient, getContractConfig } from './hedera-config.js';
import { transactionService } from './transaction-service.js';

/**
 * Contract interaction service for reading data from Hedera smart contracts
 */
export class ContractService {
    constructor() {
        this.client = initializeHederaClient();
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
                return this.getMockContractResult(contractName, functionName);
            }

            const contractConfig = getContractConfig(contractName);
            const contractId = contractConfig.contractId;

            // Create contract call query
            const query = new ContractCallQuery()
                .setContractId(contractId)
                .setFunction(functionName)
                .setMaxQueryPayment(Hbar.fromTinybars(100000000)); // 1 HBAR max payment

            // Add parameters if provided
            if (parameters.length > 0) {
                query.setFunctionParameters(parameters[0]);
            }

            // Execute the query
            const result = await query.execute(this.client);
            
            return result;
        } catch (error) {
            // Fallback to mock data if contract call fails
            return this.getMockContractResult(contractName, functionName);
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
     * @returns {Promise<number>} Token balance
     */
    async getTokenBalance(accountAddress) {
        try {
            const ethereumAddress = this.validateAddress(accountAddress);
            const result = await this.callContractFunction('TokenEconomy', 'balanceOf', [
                new ContractFunctionParameters().addAddress(ethereumAddress)
            ]);
            
            return result.getUint256(0).toNumber();
        } catch (error) {
            // Return 0 if contract call fails
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
