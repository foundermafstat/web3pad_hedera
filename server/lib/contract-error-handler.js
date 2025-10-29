import { ContractCallQuery } from '@hashgraph/sdk';

/**
 * Enhanced error handling and logging for contract interactions
 */
export class ContractErrorHandler {
    static logContractCall(contractName, functionName, parameters = [], success = true, error = null) {
        const timestamp = new Date().toISOString();
        const logData = {
            timestamp,
            contract: contractName,
            function: functionName,
            parameters: parameters.length,
            success,
            error: error?.message || null
        };

        if (success) {
            console.log(`[CONTRACT] ${contractName}.${functionName} - SUCCESS`, logData);
        } else {
            console.error(`[CONTRACT] ${contractName}.${functionName} - ERROR`, logData);
        }

        return logData;
    }

    static handleContractError(error, contractName, functionName) {
        let errorType = 'UNKNOWN_ERROR';
        let userMessage = 'An unexpected error occurred';

        if (error.message.includes('Contract call failed')) {
            errorType = 'CONTRACT_CALL_FAILED';
            userMessage = 'Contract function call failed';
        } else if (error.message.includes('Invalid contract address')) {
            errorType = 'INVALID_CONTRACT_ADDRESS';
            userMessage = 'Invalid contract address';
        } else if (error.message.includes('insufficient balance')) {
            errorType = 'INSUFFICIENT_BALANCE';
            userMessage = 'Insufficient balance for operation';
        } else if (error.message.includes('unauthorized')) {
            errorType = 'UNAUTHORIZED';
            userMessage = 'Unauthorized access';
        } else if (error.message.includes('not found')) {
            errorType = 'NOT_FOUND';
            userMessage = 'Resource not found';
        }

        const errorData = {
            type: errorType,
            message: error.message,
            userMessage,
            contract: contractName,
            function: functionName,
            timestamp: new Date().toISOString()
        };

        console.error(`[CONTRACT_ERROR] ${contractName}.${functionName}:`, errorData);
        
        return errorData;
    }

    static validateAddress(address) {
        if (!address || typeof address !== 'string') {
            throw new Error('Invalid address: address must be a non-empty string');
        }
        
        if (!address.startsWith('0x') || address.length !== 42) {
            throw new Error('Invalid address: address must be a valid Ethereum address');
        }
        
        return true;
    }

    static validateGameId(gameId) {
        if (!gameId || typeof gameId !== 'string') {
            throw new Error('Invalid gameId: gameId must be a non-empty string');
        }
        
        if (gameId.length === 0) {
            throw new Error('Invalid gameId: gameId cannot be empty');
        }
        
        return true;
    }

    static validateScore(score) {
        if (typeof score !== 'number' || isNaN(score)) {
            throw new Error('Invalid score: score must be a valid number');
        }
        
        if (score < 0) {
            throw new Error('Invalid score: score cannot be negative');
        }
        
        if (score > 1000000) {
            throw new Error('Invalid score: score exceeds maximum allowed value');
        }
        
        return true;
    }
}

/**
 * Enhanced contract service with better error handling
 */
export class EnhancedContractService {
    constructor() {
        this.client = null;
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    async initialize() {
        try {
            const { initializeHederaClient } = await import('./hedera-config.js');
            this.client = initializeHederaClient();
            console.log('[CONTRACT_SERVICE] Initialized successfully');
        } catch (error) {
            console.error('[CONTRACT_SERVICE] Initialization failed:', error);
            throw error;
        }
    }

    async callContractFunctionWithRetry(contractName, functionName, parameters = []) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const result = await this.callContractFunction(contractName, functionName, parameters);
                ContractErrorHandler.logContractCall(contractName, functionName, parameters, true);
                return result;
            } catch (error) {
                lastError = error;
                ContractErrorHandler.logContractCall(contractName, functionName, parameters, false, error);
                
                if (attempt < this.retryAttempts) {
                    console.log(`[CONTRACT_SERVICE] Retry attempt ${attempt + 1}/${this.retryAttempts} for ${contractName}.${functionName}`);
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }
        
        throw ContractErrorHandler.handleContractError(lastError, contractName, functionName);
    }

    async callContractFunction(contractName, functionName, parameters = []) {
        if (!this.client) {
            await this.initialize();
        }

        try {
            const { getContractConfig } = await import('./hedera-config.js');
            const config = getContractConfig(contractName);
            
            const query = new ContractCallQuery()
                .setContractId(config.contractId)
                .setFunction(functionName, ...parameters)
                .setMaxQueryPayment(1000000000); // 1 HBAR max payment

            const response = await query.execute(this.client);
            
            if (response.errorMessage) {
                throw new Error(`Contract call failed: ${response.errorMessage}`);
            }

            return response.getResult();
        } catch (error) {
            throw error;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Enhanced methods with validation and error handling
    async getPlayerInfo(address) {
        ContractErrorHandler.validateAddress(address);
        return this.callContractFunctionWithRetry('HederaGameLaunchpad', 'getPlayerInfo', [
            new (await import('@hashgraph/sdk')).ContractFunctionParameters().addAddress(address)
        ]);
    }

    async getTokenBalance(address) {
        ContractErrorHandler.validateAddress(address);
        return this.callContractFunctionWithRetry('TokenEconomy', 'balanceOf', [
            new (await import('@hashgraph/sdk')).ContractFunctionParameters().addAddress(address)
        ]);
    }

    async getGameModule(gameId) {
        ContractErrorHandler.validateGameId(gameId);
        return this.callContractFunctionWithRetry('GameRegistry', 'getGameModule', [
            new (await import('@hashgraph/sdk')).ContractFunctionParameters().addString(gameId)
        ]);
    }

    async calculateReward(score, gameId) {
        ContractErrorHandler.validateScore(score);
        ContractErrorHandler.validateGameId(gameId);
        return this.callContractFunctionWithRetry('PlayerSBT', 'calculateReward', [
            new (await import('@hashgraph/sdk')).ContractFunctionParameters().addUint256(score).addString(gameId)
        ]);
    }

    async getSystemStats() {
        return this.callContractFunctionWithRetry('HederaGameLaunchpad', 'getSystemStats');
    }

    async isSystemOperational() {
        return this.callContractFunctionWithRetry('HederaGameLaunchpad', 'isSystemOperational');
    }
}

// Export singleton instance
export const enhancedContractService = new EnhancedContractService();
