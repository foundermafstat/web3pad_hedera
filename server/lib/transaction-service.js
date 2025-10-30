import { 
    ContractExecuteTransaction, 
    ContractFunctionParameters, 
    Hbar,
    AccountId,
    PrivateKey,
    TransactionResponse,
    TransactionReceipt,
    AccountBalanceQuery,
    Transaction,
    AccountInfoQuery
} from '@hashgraph/sdk';
import { initializeHederaClient, getContractConfig } from './hedera-config.js';

/**
 * Service for executing transactions on Hedera smart contracts
 */
export class TransactionService {
    constructor() {
        try {
            this.client = initializeHederaClient();
        } catch (error) {
            console.warn('Failed to initialize Hedera client for transactions:', error.message);
            this.client = null;
        }
    }

    /**
     * Execute a contract transaction
     * @param {string} contractName Contract name
     * @param {string} functionName Function name
     * @param {Array} parameters Function parameters
     * @param {number} hbarAmount HBAR amount to send (optional)
     * @param {string} payerAccountId Account ID to pay for the transaction
     * @param {string} payerPrivateKey Private key for the payer account
     * @returns {Promise<Object>} Transaction result
     */
    async executeContractTransaction(contractName, functionName, parameters = [], hbarAmount = 0, payerAccountId, payerPrivateKey, options = {}) {
        try {
            if (!this.client) {
                throw new Error('Hedera client not initialized');
            }

            const config = getContractConfig(contractName);
            
            // Create a new client instance for this payer to avoid conflicts
            const payerClient = initializeHederaClient();
            const payerId = AccountId.fromString(payerAccountId);
            const payerKey = PrivateKey.fromString(payerPrivateKey);
            payerClient.setOperator(payerId, payerKey);

            const gasLimit = options.gas || 1000000;
            const maxFeeTinybars = options.maxFeeTinybars || 500000000; // 5 HBAR

            const transaction = new ContractExecuteTransaction()
                .setContractId(config.contractId)
                .setFunction(functionName, ...parameters)
                .setGas(gasLimit); // Customizable gas limit

            // Add HBAR if specified
            if (hbarAmount > 0) {
                transaction.setPayableAmount(Hbar.fromTinybars(hbarAmount));
            }

            // Set max transaction fee
            transaction.setMaxTransactionFee(Hbar.fromTinybars(maxFeeTinybars)); // Customizable max fee

            // Execute the transaction
            const response = await transaction.execute(payerClient);
            
            if (response.errorMessage) {
                throw new Error(`Transaction failed: ${response.errorMessage}`);
            }

            // Get the receipt
            const receipt = await response.getReceipt(payerClient);
            
            if (receipt.status.toString() !== 'SUCCESS') {
                throw new Error(`Transaction failed with status: ${receipt.status}`);
            }

            // Get the record for return values
            const record = await response.getRecord(payerClient);
            
            return {
                success: true,
                transactionId: response.transactionId.toString(),
                receipt: {
                    status: receipt.status.toString(),
                    gasUsed: receipt.gasUsed?.toNumber() || 0,
                    contractId: receipt.contractId?.toString(),
                    accountId: receipt.accountId?.toString()
                },
                record: record,
                contractFunctionResult: record.contractFunctionResult
            };

        } catch (error) {
            console.error(`Transaction error for ${contractName}.${functionName}:`, error);
            throw error;
        }
    }

    /**
     * Swap HBAR for HPLAY tokens
     * @param {string} userAccountId User's Hedera account ID
     * @param {string} userPrivateKey User's private key
     * @param {number} hbarAmount Amount of HBAR to swap (in tinybars)
     * @returns {Promise<Object>} Swap result
     */
    async swapHbarForHplay(userAccountId, userPrivateKey, hbarAmount) {
        try {
            const result = await this.executeContractTransaction(
                'FaucetManager',
                'swapHBARforHPLAY',
                [],
                hbarAmount,
                userAccountId,
                userPrivateKey
            );

            // Extract HPLAY amount from the result
            let hplayAmount = 0;
            if (result.contractFunctionResult) {
                hplayAmount = result.contractFunctionResult.getUint256(0).toNumber();
            }

            return {
                success: true,
                transactionId: result.transactionId,
                hbarAmount: hbarAmount,
                hplayAmount: hplayAmount,
                timestamp: Date.now(),
                userAddress: userAccountId,
                receipt: result.receipt
            };

        } catch (error) {
            console.error('Error swapping HBAR for HPLAY:', error);
            throw error;
        }
    }

    /**
     * Create a swap transaction for user to sign
     * @param {string} userAddress User's Hedera address
     * @param {number} hbarAmountTinybars Amount of HBAR to swap (in tinybars)
     * @returns {Promise<Object>} Transaction data for user to sign
     */
    async createSwapTransaction(userAddress, hbarAmountTinybars) {
        try {
            if (!this.client) {
                throw new Error('Hedera client not initialized');
            }

            const config = getContractConfig('FaucetManager');
            
            // Convert user address to AccountId
            const userAccountId = AccountId.fromString(userAddress);
            
            // Create transaction for user to sign
            const transaction = new ContractExecuteTransaction()
                .setContractId(config.contractId)
                .setFunction('swapHBARforHPLAY')
                .setPayableAmount(Hbar.fromTinybars(hbarAmountTinybars))
                .setGas(1000000)
                .setMaxTransactionFee(Hbar.fromTinybars(500000000));

            // Create a temporary client with user as operator
            // This ensures the frozen transaction has user as payer
            const tempClient = initializeHederaClient();
            // Generate a temporary key - user will sign with their own key
            const tempKey = PrivateKey.generateECDSA();
            tempClient.setOperator(userAccountId, tempKey);
            
            // Freeze the transaction with user as payer
            // This ensures the transaction has all necessary information for wallet display
            const frozenTransaction = await transaction.freezeWith(tempClient);
            
            // Convert Uint8Array to regular array for JSON serialization
            const transactionBytes = frozenTransaction.toBytes();
            const transactionBytesArray = Array.from(transactionBytes);
            
            // Get transaction details for raw transaction display
            const transactionId = frozenTransaction.transactionId;
            const nodeAccountIds = frozenTransaction.nodeAccountIds.map(id => id.toString());
            const contractId = config.contractId.toString();
            
            return {
                success: true,
                transactionData: transactionBytesArray, // Send as array for JSON compatibility
                transactionId: transactionId.toString(),
                contractId: contractId,
                functionName: 'swapHBARforHPLAY',
                hbarAmount: hbarAmountTinybars,
                gasLimit: 1000000,
                maxFee: 500000000,
                payerAccountId: userAddress,
                nodeAccountIds: nodeAccountIds,
                // Add transaction details for wallet integration and Raw Transaction display
                transactionDetails: {
                    contractAddress: contractId,
                    functionName: 'swapHBARforHPLAY',
                    hbarAmount: hbarAmountTinybars,
                    hbarAmountDisplay: (hbarAmountTinybars / 100000000).toFixed(8),
                    gasLimit: 1000000,
                    maxFee: 500000000,
                    maxFeeDisplay: (500000000 / 100000000).toFixed(8),
                    userAccount: userAddress,
                    transactionId: transactionId.toString(),
                    nodeAccountIds: nodeAccountIds,
                    // Additional fields for Raw Transaction parsing
                    transactionType: 'ContractExecute',
                    functionParams: [],
                    isPayable: true,
                    payableAmount: hbarAmountTinybars
                },
                // Raw transaction data in hex format for display
                rawTransaction: {
                    hex: Array.from(transactionBytes).map(b => b.toString(16).padStart(2, '0')).join(''),
                    bytes: transactionBytesArray,
                    base64: Buffer.from(transactionBytes).toString('base64')
                }
            };

        } catch (error) {
            console.error('Error creating swap transaction:', error);
            throw error;
        }
    }

    /**
     * Execute swap transaction for authenticated users (legacy method)
     * @param {string} userAddress User's Hedera address
     * @param {number} hbarAmountTinybars Amount of HBAR to swap (in tinybars)
     * @returns {Promise<Object>} Swap result
     */
    async executeSwapTransaction(userAddress, hbarAmountTinybars) {
        try {
            if (!this.client) {
                throw new Error('Hedera client not initialized');
            }

            // For the FaucetManager contract, we need to simulate the user's transaction
            // In a real implementation, the user would sign the transaction with their wallet
            // For now, we'll use the system account to execute the transaction
            
            const systemAccountId = process.env.HEDERA_ACCOUNT_ID;
            const systemPrivateKey = process.env.HEDERA_PRIVATE_KEY;

            if (!systemAccountId || !systemPrivateKey) {
                throw new Error('System account credentials not configured');
            }

            // Check system account balance before executing transaction
            const accountId = AccountId.fromString(systemAccountId);
            const accountInfo = await new AccountBalanceQuery()
                .setAccountId(accountId)
                .execute(this.client);
            
            const balance = accountInfo.hbars.toTinybars().toNumber();
            const requiredBalance = hbarAmountTinybars + 500000000; // Swap amount + 5 HBAR for fees
            
            if (balance < requiredBalance) {
                throw new Error(`Insufficient balance. Required: ${requiredBalance / 100000000} HBAR, Available: ${balance / 100000000} HBAR`);
            }

            // Create a transaction that simulates the user calling swapHBARforHPLAY
            // The contract expects msg.sender to be the user, but we'll use system account
            // This is a temporary solution - in production, users should sign their own transactions
            
            const result = await this.executeContractTransaction(
                'FaucetManager',
                'swapHBARforHPLAY',
                [],
                hbarAmountTinybars,
                systemAccountId,
                systemPrivateKey
            );

            // Extract HPLAY amount from the result
            let hplayAmount = 0;
            if (result.contractFunctionResult) {
                hplayAmount = result.contractFunctionResult.getUint256(0).toNumber();
            }

            return {
                success: true,
                transactionId: result.transactionId,
                hbarAmount: hbarAmountTinybars,
                hplayAmount: hplayAmount,
                timestamp: Date.now(),
                userAddress: userAddress,
                receipt: result.receipt
            };

        } catch (error) {
            console.error('Error executing swap transaction:', error);
            throw error;
        }
    }

    /**
     * Execute signed swap transaction
     * @param {Object} signedTransaction Signed transaction data
     * @param {string} userAddress User's Hedera address
     * @param {number} hbarAmountTinybars Amount of HBAR to swap (in tinybars)
     * @param {Array} originalTransactionBytes Original transaction bytes (optional)
     * @returns {Promise<Object>} Swap result
     */
    async executeSignedSwapTransaction(signedTransaction, userAddress, hbarAmountTinybars, originalTransactionBytes = null) {
        try {
            if (!this.client) {
                throw new Error('Hedera client not initialized');
            }

            console.log('📝 Executing REAL signed transaction:', {
                userAddress,
                hbarAmount: hbarAmountTinybars / 100000000,
                signature: signedTransaction.signature?.substring(0, 50) + '...',
                walletType: signedTransaction.walletType || 'unknown',
                hasOriginalBytes: !!originalTransactionBytes,
                hasSignedTransactionBytes: !!signedTransaction.signedTransactionBytes
            });
            
            // Try to use fully signed transaction from WalletConnect if available
            if (signedTransaction.signedTransactionBytes) {
                try {
                    console.log('✅ Using fully signed transaction from WalletConnect');
                    let signedBytes;
                    if (typeof signedTransaction.signedTransactionBytes === 'string') {
                        // Base64 string - decode it
                        signedBytes = Buffer.from(signedTransaction.signedTransactionBytes, 'base64');
                    } else if (Array.isArray(signedTransaction.signedTransactionBytes)) {
                        signedBytes = new Uint8Array(signedTransaction.signedTransactionBytes);
                    } else {
                        signedBytes = signedTransaction.signedTransactionBytes;
                    }
                    
                    // Restore the fully signed transaction
                    const signedTransactionObj = Transaction.fromBytes(signedBytes);
                    
                    // Execute the fully signed transaction
                    const executorClient = initializeHederaClient();
                    console.log('🚀 Executing fully signed transaction from wallet...');
                    const response = await signedTransactionObj.execute(executorClient);
                    
                    if (response.errorMessage) {
                        throw new Error(`Transaction failed: ${response.errorMessage}`);
                    }

                    const receipt = await response.getReceipt(executorClient);
                    if (receipt.status.toString() !== 'SUCCESS') {
                        throw new Error(`Transaction failed with status: ${receipt.status}`);
                    }

                    const record = await response.getRecord(executorClient);
                    let hplayAmount = 0;
                    if (record.contractFunctionResult) {
                        hplayAmount = record.contractFunctionResult.getUint256(0).toNumber();
                    }

                    console.log('✅ REAL transaction executed successfully with signed transaction:', {
                        transactionId: response.transactionId.toString(),
                        hplayAmount: hplayAmount,
                        gasUsed: receipt.gasUsed?.toNumber() || 0,
                        walletType: signedTransaction.walletType,
                        userAccountId: signedTransaction.accountId || userAddress
                    });
                    
                    return {
                        success: true,
                        transactionId: response.transactionId.toString(),
                        hbarAmount: hbarAmountTinybars,
                        hplayAmount: hplayAmount,
                        timestamp: Date.now(),
                        userAddress: userAddress,
                        receipt: {
                            status: receipt.status.toString(),
                            gasUsed: receipt.gasUsed?.toNumber() || 0,
                            contractId: receipt.contractId?.toString(),
                            accountId: receipt.accountId?.toString()
                        },
                        walletType: signedTransaction.walletType,
                        isRealTransaction: true,
                        userAccountId: signedTransaction.accountId || userAddress
                    };
                } catch (signedTxError) {
                    console.warn('⚠️ Failed to use signed transaction bytes, falling back to manual transaction:', signedTxError.message);
                    // Fall through to manual transaction creation
                }
            }

            // Only execute REAL transactions - no test mode
            console.log('🚀 Executing REAL transaction with wallet signature:', {
                walletType: signedTransaction.walletType,
                accountId: signedTransaction.accountId,
                hasSignature: !!signedTransaction.signature,
                isRealTransaction: signedTransaction.isRealTransaction
            });
            
            // Verify this is a real transaction
            if (!signedTransaction.isRealTransaction) {
                throw new Error('Only real wallet transactions are allowed. Please connect a Hedera wallet.');
            }

            // CRITICAL: We MUST use the original transaction that the user signed
            // Creating a new transaction will result in INVALID_SIGNATURE error
            // because the new transaction is not signed by the user's wallet
            
            if (!originalTransactionBytes || !Array.isArray(originalTransactionBytes)) {
                throw new Error('Original transaction bytes are required to execute signed transaction. The transaction must match what the user signed.');
            }
            
            console.log('📦 Restoring original transaction that user signed...');
            
            // Restore the exact transaction that user signed with their wallet
            const transactionBytes = new Uint8Array(originalTransactionBytes);
            let transaction = Transaction.fromBytes(transactionBytes);
            
            console.log('✅ Original transaction restored');
            console.log('📝 Transaction payer account:', transaction.transactionId?.accountId?.toString());
            
            // CRITICAL: Add user's signature to the transaction
            // The transaction is frozen but not signed - WalletConnect signed it and returned the signature
            // We need to add that signature back to the transaction
            
            if (!signedTransaction.signature) {
                throw new Error('User signature is required. Transaction was not signed by wallet.');
            }
            
            console.log('✍️ Adding user signature to transaction...');
            
            // Get user's account info to get their public key
            const userAccountId = AccountId.fromString(signedTransaction.accountId || userAddress);
            const executorClient = initializeHederaClient();
            
            try {
                // Query account info to get public key
                const accountInfo = await new AccountInfoQuery()
                    .setAccountId(userAccountId)
                    .execute(executorClient);
                
                const publicKey = accountInfo.key;
                console.log('✅ Got user public key for signature verification');
                
                // Decode signature from WalletConnect: support string and signatureMap objects
                let signatureBytes;
                if (typeof signedTransaction.signature === 'string') {
                    try {
                        // Try base64 first
                        signatureBytes = Buffer.from(signedTransaction.signature, 'base64');
                        console.log('📦 Decoded signature from base64, length:', signatureBytes.length);
                    } catch (e) {
                        try {
                            // Fallback to hex
                            signatureBytes = Buffer.from(signedTransaction.signature, 'hex');
                            console.log('📦 Decoded signature from hex, length:', signatureBytes.length);
                        } catch (e2) {
                            throw new Error('Unsupported signature string encoding');
                        }
                    }
                } else if (signedTransaction.signature && typeof signedTransaction.signature === 'object') {
                    // signatureMap handling: pick the first sigPair and decode ed25519 or ECDSA bytes
                    const sigMap = signedTransaction.signature;
                    const pairs = sigMap.sigPair || sigMap.sigPairs || sigMap.pairs || [];
                    const sigPair = Array.isArray(pairs) ? pairs[0] : pairs;
                    const raw = sigPair?.ed25519 || sigPair?.ECDSA_secp256k1 || sigPair?.ecdsaSecp256k1;
                    if (!raw) {
                        throw new Error('Unsupported signatureMap format: no ed25519/ECDSA bytes');
                    }
                    // raw may already be base64; if it's a Uint8Array/array use directly
                    if (typeof raw === 'string') {
                        signatureBytes = Buffer.from(raw, 'base64');
                    } else if (raw instanceof Uint8Array) {
                        signatureBytes = Buffer.from(raw);
                    } else if (Array.isArray(raw)) {
                        signatureBytes = Buffer.from(Uint8Array.from(raw));
                    } else {
                        throw new Error('Unsupported signatureMap byte format');
                    }
                    console.log('📦 Decoded signature from signatureMap, length:', signatureBytes.length);
                } else {
                    signatureBytes = Buffer.from(signedTransaction.signature);
                }
                
                // Add signature to transaction
                // Transaction.addSignature requires PublicKey and signature bytes
                transaction.addSignature(publicKey, signatureBytes);
                console.log('✅ User signature added to transaction');
                
            } catch (accountError) {
                console.warn('⚠️ Could not get account info, trying alternative method:', accountError.message);
                // Alternative: Try to add signature without public key lookup
                // This might work if signature format is correct
                try {
                    let signatureBytes;
                    if (typeof signedTransaction.signature === 'string') {
                        signatureBytes = Buffer.from(signedTransaction.signature, 'base64');
                    } else {
                        signatureBytes = Buffer.from(signedTransaction.signature);
                    }
                    
                    // Try to get public key from account ID directly (may not work)
                    // For now, we'll try executing with signature in transaction body
                    console.log('⚠️ Attempting to execute without explicit signature addition');
                } catch (e) {
                    console.error('❌ Failed to process signature:', e);
                    throw new Error(`Could not add signature to transaction: ${e.message}`);
                }
            }
            
            console.log('🚀 Executing transaction with user signature...');
            console.log('💰 Transaction will execute from user account:', signedTransaction.accountId || userAddress);
            
            // Execute the signed transaction
            const response = await transaction.execute(executorClient);
            
            if (response.errorMessage) {
                throw new Error(`Transaction failed: ${response.errorMessage}`);
            }

            // Get the receipt
            const receipt = await response.getReceipt(executorClient);
            
            if (receipt.status.toString() !== 'SUCCESS') {
                throw new Error(`Transaction failed with status: ${receipt.status}`);
            }

            // Get the record for return values
            const record = await response.getRecord(executorClient);
            
            // Extract HPLAY amount from the result
            let hplayAmount = 0;
            if (record.contractFunctionResult) {
                hplayAmount = record.contractFunctionResult.getUint256(0).toNumber();
            }

            console.log('✅ REAL transaction executed successfully:', {
                transactionId: response.transactionId.toString(),
                hplayAmount: hplayAmount,
                gasUsed: receipt.gasUsed?.toNumber() || 0,
                walletType: signedTransaction.walletType,
                userAccountId: signedTransaction.accountId || userAddress,
                isRealWalletSignature: true
            });
            
            return {
                success: true,
                transactionId: response.transactionId.toString(),
                hbarAmount: hbarAmountTinybars,
                hplayAmount: hplayAmount,
                timestamp: Date.now(),
                userAddress: userAddress,
                receipt: {
                    status: receipt.status.toString(),
                    gasUsed: receipt.gasUsed?.toNumber() || 0,
                    contractId: receipt.contractId?.toString(),
                    accountId: receipt.accountId?.toString()
                },
                walletType: signedTransaction.walletType,
                isRealTransaction: true,
                userAccountId: signedTransaction.accountId || userAddress
            };

        } catch (error) {
            console.error('❌ Error executing REAL signed swap transaction:', error);
            throw error;
        }
    }

    /**
     * Check if the service is available
     * @returns {boolean} Is service available
     */
    isAvailable() {
        return this.client !== null;
    }
}

// Export singleton instance
export const transactionService = new TransactionService();
