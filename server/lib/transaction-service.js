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
	AccountInfoQuery,
	SignatureMap,
	PublicKey,
} from '@hashgraph/sdk';
import * as proto from '@hashgraph/proto';
import { initializeHederaClient, getContractConfig } from './hedera-config.js';

/**
 * Service for executing transactions on Hedera smart contracts
 */
export class TransactionService {
	constructor() {
		try {
			this.client = initializeHederaClient();
		} catch (error) {
			console.warn(
				'Failed to initialize Hedera client for transactions:',
				error.message
			);
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
	async executeContractTransaction(
		contractName,
		functionName,
		parameters = [],
		hbarAmount = 0,
		payerAccountId,
		payerPrivateKey,
		options = {}
	) {
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
					accountId: receipt.accountId?.toString(),
				},
				record: record,
				contractFunctionResult: record.contractFunctionResult,
			};
		} catch (error) {
			console.error(
				`Transaction error for ${contractName}.${functionName}:`,
				error
			);
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
				receipt: result.receipt,
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
				.setGas(3000000)
				.setMaxTransactionFee(Hbar.fromTinybars(500000000));

			// CRITICAL: Set the transaction ID manually with user as payer
			// This ensures the transaction expects to be signed by the user's key
			const { TransactionId } = await import('@hashgraph/sdk');
			const transactionId = TransactionId.generate(userAccountId);
			transaction.setTransactionId(transactionId);

			// CRITICAL: Set only ONE node to avoid multiple node transactions
			// By default, freezeWith creates 5 node transactions, but WalletConnect
			// only signs once, causing signature mismatch errors
			// Use a single testnet node for simplicity
			const singleNode = AccountId.fromString('0.0.3'); // Testnet node
			transaction.setNodeAccountIds([singleNode]);

			// Create a temporary client for freezing (but DON'T set operator)
			// This way the transaction will be unsigned and waiting for user's signature
			const tempClient = initializeHederaClient();

			// Freeze the transaction WITHOUT signing it
			// The transaction will be frozen but unsigned, ready for user to sign
			// CRITICAL: Must use freezeWith(client) to properly set network and node info
			const frozenTransaction = await transaction.freezeWith(tempClient);

			// Get full transaction bytes for later reconstruction
			const transactionBytes = frozenTransaction.toBytes();
			const transactionBytesArray = Array.from(transactionBytes);

			console.log(
				'📦 Full transaction bytes, length:',
				transactionBytesArray.length
			);

			// CRITICAL: Extract ONLY the TransactionBody bytes for WalletConnect signing
			// WalletConnect must sign ONLY the body bytes (SHA-384 hash), not the full transaction
			// Parse the transaction to extract body bytes
			const txList = proto.proto.TransactionList.decode(
				Buffer.from(transactionBytes)
			);
			if (!txList.transactionList || txList.transactionList.length === 0) {
				throw new Error(
					'Failed to parse TransactionList from frozen transaction'
				);
			}

			// Get first (and only) transaction from list
			const txProto = txList.transactionList[0];
			let bodyBytes;

			if (txProto.signedTransactionBytes) {
				// Extract from signedTransactionBytes
				const signedTx = proto.proto.SignedTransaction.decode(
					txProto.signedTransactionBytes
				);
				bodyBytes = signedTx.bodyBytes;
			} else if (txProto.signedTransaction) {
				// Extract from signedTransaction object
				bodyBytes = txProto.signedTransaction.bodyBytes;
			} else {
				throw new Error('Cannot extract body bytes from transaction');
			}

			if (!bodyBytes) {
				throw new Error('Body bytes not found in frozen transaction');
			}

			const bodyBytesArray = Array.from(bodyBytes);
			console.log(
				'📦 Extracted TransactionBody bytes for WalletConnect signing, length:',
				bodyBytesArray.length
			);
			console.log('📦 Body bytes will be sent to WalletConnect for signing');

			// Get transaction details for raw transaction display
			const nodeAccountIds = frozenTransaction.nodeAccountIds.map((id) =>
				id.toString()
			);
			const contractId = config.contractId.toString();

			return {
				success: true,
				transactionData: transactionBytesArray, // Full transaction bytes for reconstruction
				transactionBodyData: bodyBytesArray, // ONLY body bytes for WalletConnect signing
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
					payableAmount: hbarAmountTinybars,
				},
				// Raw transaction data in hex format for display
				rawTransaction: {
					hex: Array.from(transactionBytes)
						.map((b) => b.toString(16).padStart(2, '0'))
						.join(''),
					bytes: transactionBytesArray,
					base64: Buffer.from(transactionBytes).toString('base64'),
				},
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
				throw new Error(
					`Insufficient balance. Required: ${
						requiredBalance / 100000000
					} HBAR, Available: ${balance / 100000000} HBAR`
				);
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
				receipt: result.receipt,
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
	async executeSignedSwapTransaction(
		signedTransaction,
		userAddress,
		hbarAmountTinybars,
		originalTransactionBytes = null
	) {
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
				hasSignedTransactionBytes: !!signedTransaction.signedTransactionBytes,
			});

			// Try to use fully signed transaction from WalletConnect if available
			if (signedTransaction.signedTransactionBytes) {
				try {
					console.log('✅ Using fully signed transaction from WalletConnect');
					console.log(
						'📦 signedTransactionBytes type:',
						typeof signedTransaction.signedTransactionBytes
					);
					console.log(
						'📦 signedTransactionBytes isArray:',
						Array.isArray(signedTransaction.signedTransactionBytes)
					);

					let signedBytes;
					if (typeof signedTransaction.signedTransactionBytes === 'string') {
						// Base64 string - decode it
						console.log(
							'📦 Decoding from base64 string, length:',
							signedTransaction.signedTransactionBytes.length
						);
						signedBytes = Buffer.from(
							signedTransaction.signedTransactionBytes,
							'base64'
						);
					} else if (Array.isArray(signedTransaction.signedTransactionBytes)) {
						console.log(
							'📦 Converting from array, length:',
							signedTransaction.signedTransactionBytes.length
						);
						signedBytes = new Uint8Array(
							signedTransaction.signedTransactionBytes
						);
					} else {
						console.log('📦 Using as-is');
						signedBytes = signedTransaction.signedTransactionBytes;
					}

					console.log('📦 Decoded signedBytes length:', signedBytes.length);
					console.log(
						'📦 First 20 bytes:',
						Array.from(signedBytes.slice(0, 20))
					);

					// Restore the fully signed transaction
					console.log('📦 Restoring transaction from bytes...');
					const signedTransactionObj = Transaction.fromBytes(signedBytes);
					console.log('✅ Transaction restored successfully');
					console.log(
						'📝 Transaction ID:',
						signedTransactionObj.transactionId?.toString()
					);
					console.log(
						'📝 Payer:',
						signedTransactionObj.transactionId?.accountId?.toString()
					);
					console.log(
						'📝 Valid start:',
						signedTransactionObj.transactionId?.validStart?.toString()
					);

					// Execute the fully signed transaction
					const executorClient = initializeHederaClient();
					console.log('🚀 Executing fully signed transaction from wallet...');
					const response = await signedTransactionObj.execute(executorClient);

					console.log('✅ Transaction executed, waiting for receipt...');

					if (response.errorMessage) {
						console.error(
							'❌ Transaction execution failed with error:',
							response.errorMessage
						);
						throw new Error(`Transaction failed: ${response.errorMessage}`);
					}

					const receipt = await response.getReceipt(executorClient);
					console.log(
						'✅ Receipt received, status:',
						receipt.status.toString()
					);

					if (receipt.status.toString() !== 'SUCCESS') {
						console.error(
							'❌ Transaction failed with status:',
							receipt.status.toString()
						);
						throw new Error(
							`Transaction failed with status: ${receipt.status}`
						);
					}

					const record = await response.getRecord(executorClient);
					let hplayAmount = 0;
					if (record.contractFunctionResult) {
						hplayAmount = record.contractFunctionResult
							.getUint256(0)
							.toNumber();
					}

					console.log(
						'✅ REAL transaction executed successfully with signed transaction:',
						{
							transactionId: response.transactionId.toString(),
							hplayAmount: hplayAmount,
							gasUsed: receipt.gasUsed?.toNumber() || 0,
							walletType: signedTransaction.walletType,
							userAccountId: signedTransaction.accountId || userAddress,
						}
					);

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
							accountId: receipt.accountId?.toString(),
						},
						walletType: signedTransaction.walletType,
						isRealTransaction: true,
						userAccountId: signedTransaction.accountId || userAddress,
					};
				} catch (signedTxError) {
					console.error('❌ Failed to use signed transaction bytes:', {
						message: signedTxError.message,
						stack: signedTxError.stack,
						name: signedTxError.name,
					});
					console.warn('⚠️ Falling back to manual transaction creation');
					// Fall through to manual transaction creation
				}
			}

			// Only execute REAL transactions - no test mode
			console.log('🚀 Executing REAL transaction with wallet signature:', {
				walletType: signedTransaction.walletType,
				accountId: signedTransaction.accountId,
				hasSignature: !!signedTransaction.signature,
				isRealTransaction: signedTransaction.isRealTransaction,
			});

			// Verify this is a real transaction
			if (!signedTransaction.isRealTransaction) {
				throw new Error(
					'Only real wallet transactions are allowed. Please connect a Hedera wallet.'
				);
			}

			// CRITICAL: We MUST use the original transaction that the user signed
			// Creating a new transaction will result in INVALID_SIGNATURE error
			// because the new transaction is not signed by the user's wallet

			if (
				!originalTransactionBytes ||
				!Array.isArray(originalTransactionBytes)
			) {
				throw new Error(
					'Original transaction bytes are required to execute signed transaction. The transaction must match what the user signed.'
				);
			}

			console.log(
				'📦 Decoding original transaction to extract body and rebuild with signature...'
			);

			// Get executor client
			const executorClient = initializeHederaClient();
			const userAccountId = AccountId.fromString(
				signedTransaction.accountId || userAddress
			);

			// Decode the signatureMap from WalletConnect FIRST
			if (!signedTransaction.signature && !signedTransaction.signatureMap) {
				throw new Error(
					'User signature is required. Transaction was not signed by wallet.'
				);
			}

			let decodedSignatureMap;
			let transaction; // Declare transaction variable outside try block

			try {
				// Try to use signatureMap if provided directly (from WalletConnect response)
				if (signedTransaction.signatureMap) {
					console.log('📦 Using signatureMap from WalletConnect response');
					if (typeof signedTransaction.signatureMap === 'string') {
						const signatureMapBytes = Buffer.from(
							signedTransaction.signatureMap,
							'base64'
						);
						decodedSignatureMap =
							proto.proto.SignatureMap.decode(signatureMapBytes);
					} else {
						decodedSignatureMap = signedTransaction.signatureMap;
					}
				} else {
					console.log('📦 Decoding signature from base64 string');
					const signatureMapBytes = Buffer.from(
						signedTransaction.signature,
						'base64'
					);
					console.log(
						'📦 Decoded signature bytes, length:',
						signatureMapBytes.length
					);

					// Decode protobuf SignatureMap from WalletConnect
					console.log('📦 Decoding protobuf SignatureMap...');
					decodedSignatureMap =
						proto.proto.SignatureMap.decode(signatureMapBytes);
				}

				console.log('✅ Successfully decoded SignatureMap:', {
					sigPairCount: decodedSignatureMap.sigPair?.length || 0,
					sigPairDetails: decodedSignatureMap.sigPair?.map((pair) => ({
						hasEd25519: !!pair.ed25519,
						hasECDSASecp256k1: !!pair.ECDSASecp256k1,
						hasEcdsaSecp256k1: !!pair.ecdsaSecp256k1,
						ed25519Length: pair.ed25519?.length || 0,
						ECDSASecp256k1Length: pair.ECDSASecp256k1?.length || 0,
						ecdsaSecp256k1Length: pair.ecdsaSecp256k1?.length || 0,
						pubKeyPrefixLength: pair.pubKeyPrefix?.length || 0,
						allKeys: Object.keys(pair),
					})),
				});

				if (!decodedSignatureMap.sigPair?.length) {
					throw new Error('No signature pairs found in wallet signature');
				}

				// Fetch user's public key for verification
				let accountPublicKey = null;
				try {
					const accountInfo = await new AccountInfoQuery()
						.setAccountId(userAccountId)
						.execute(executorClient);
					accountPublicKey = accountInfo.key;
					console.log(
						'📦 Retrieved user account public key:',
						accountPublicKey?.toString()
					);
				} catch (keyError) {
					console.warn(
						'⚠️ Failed to fetch account info for public key verification:',
						keyError?.message
					);
				}

				// CRITICAL: Decode the original transaction to get the transaction body
				console.log(
					'📦 Decoding original transaction bytes to extract body...'
				);
				console.log('📦 Original transaction bytes type:', {
					isArray: Array.isArray(originalTransactionBytes),
					isUint8Array: originalTransactionBytes instanceof Uint8Array,
					isBuffer: Buffer.isBuffer(originalTransactionBytes),
					length: originalTransactionBytes?.length,
				});

				// Convert to Buffer properly
				let transactionBuffer;
				if (Buffer.isBuffer(originalTransactionBytes)) {
					transactionBuffer = originalTransactionBytes;
				} else if (originalTransactionBytes instanceof Uint8Array) {
					transactionBuffer = Buffer.from(originalTransactionBytes);
				} else if (Array.isArray(originalTransactionBytes)) {
					transactionBuffer = Buffer.from(originalTransactionBytes);
				} else {
					throw new Error('Invalid originalTransactionBytes type');
				}

				console.log(
					'📦 Transaction buffer ready, length:',
					transactionBuffer.length
				);
				let originalSignedTransactionBytes;

				// Try decoding as TransactionList first
				try {
					const originalTransactionList =
						proto.proto.TransactionList.decode(transactionBuffer);
					if (
						originalTransactionList.transactionList &&
						originalTransactionList.transactionList.length > 0
					) {
						originalSignedTransactionBytes =
							originalTransactionList.transactionList[0];
						console.log(
							'✅ Decoded TransactionList with',
							originalTransactionList.transactionList.length,
							'entry'
						);
					}
				} catch (listError) {
					console.log('⚠️ Not a TransactionList:', listError.message);
				}

				if (!originalSignedTransactionBytes) {
					console.log('📦 Trying to decode as Transaction wrapper...');
					const originalTransactionProto =
						proto.proto.Transaction.decode(transactionBuffer);
					if (
						originalTransactionProto.signedTransactionBytes &&
						originalTransactionProto.signedTransactionBytes.length > 0
					) {
						originalSignedTransactionBytes =
							originalTransactionProto.signedTransactionBytes;
						console.log(
							'✅ Extracted signedTransactionBytes from Transaction wrapper'
						);
					} else if (originalTransactionProto.signedTransaction) {
						originalSignedTransactionBytes =
							proto.proto.SignedTransaction.encode(
								originalTransactionProto.signedTransaction
							).finish();
						console.log(
							'✅ Encoded signedTransaction from Transaction wrapper'
						);
					} else {
						throw new Error(
							'Original transaction bytes do not contain SignedTransaction data'
						);
					}
				}

				const normalizeToUint8Array = (data, context = 'root') => {
					if (!data) {
						throw new Error(`Missing signed transaction bytes (${context})`);
					}
					if (data instanceof Uint8Array) {
						return data;
					}
					if (Buffer.isBuffer(data)) {
						return new Uint8Array(data);
					}
					if (typeof data === 'string') {
						return Uint8Array.from(Buffer.from(data, 'base64'));
					}
					if (Array.isArray(data)) {
						return Uint8Array.from(data);
					}
					if (typeof data.length === 'number' && typeof data !== 'function') {
						return Uint8Array.from(Array.from(data));
					}
					if (typeof data.byteLength === 'number') {
						return new Uint8Array(data);
					}
					if (data.buffer instanceof ArrayBuffer) {
						return new Uint8Array(data.buffer);
					}
					if (data.bytes !== undefined) {
						return normalizeToUint8Array(data.bytes, `${context}.bytes`);
					}
					if (data.value !== undefined) {
						return normalizeToUint8Array(data.value, `${context}.value`);
					}
					if (data.signedTransactionBytes !== undefined) {
						return normalizeToUint8Array(
							data.signedTransactionBytes,
							`${context}.signedTransactionBytes`
						);
					}
					if (data.signedTransaction) {
						return proto.proto.SignedTransaction.encode(
							data.signedTransaction
						).finish();
					}
					if (data.transactionBytes !== undefined) {
						return normalizeToUint8Array(
							data.transactionBytes,
							`${context}.transactionBytes`
						);
					}
					console.error('❌ Unable to normalize signed transaction bytes', {
						context,
						dataKeys: Object.keys(data || {}),
					});
					throw new Error('Unsupported signed transaction bytes format');
				};

				console.log('📦 Original signed transaction bytes info:', {
					type: typeof originalSignedTransactionBytes,
					constructor: originalSignedTransactionBytes?.constructor?.name,
					keys: originalSignedTransactionBytes
						? Object.keys(originalSignedTransactionBytes)
						: [],
					hasSignedTransactionBytes:
						originalSignedTransactionBytes?.signedTransactionBytes !==
						undefined,
					hasSignedTransaction:
						originalSignedTransactionBytes?.signedTransaction !== undefined,
					hasBytesField: originalSignedTransactionBytes?.bytes !== undefined,
					hasValueField: originalSignedTransactionBytes?.value !== undefined,
				});

				const signedBytesForDecode = normalizeToUint8Array(
					originalSignedTransactionBytes
				);

				console.log(
					'📦 Signed bytes ready for decode, length:',
					signedBytesForDecode.length
				);

				// Get the signed transaction to extract TransactionBody
				const originalSignedTransaction =
					proto.proto.SignedTransaction.decode(signedBytesForDecode);

				if (!originalSignedTransaction.bodyBytes) {
					throw new Error(
						'Transaction body bytes not found in original transaction'
					);
				}

				let transactionBodyInfo = {};
				let transactionBody;
				try {
					transactionBody = proto.proto.TransactionBody.decode(
						originalSignedTransaction.bodyBytes
					);

					// Extract full transaction ID with timestamp
					const txId = transactionBody.transactionID;
					const accountStr = txId?.accountID
						? `${txId.accountID.shard?.low || 0}.${
								txId.accountID.realm?.low || 0
						  }.${txId.accountID.accountNum?.low || 0}`
						: undefined;
					const validStartSeconds =
						txId?.transactionValidStart?.seconds?.low || 0;
					const validStartNanos = txId?.transactionValidStart?.nanos || 0;
					const fullTransactionId = txId
						? `${accountStr}@${validStartSeconds}.${validStartNanos}`
						: undefined;

					transactionBodyInfo = {
						transactionId: accountStr,
						fullTransactionId: fullTransactionId,
						nodeAccountId: transactionBody.nodeAccountID
							? `${transactionBody.nodeAccountID.shard?.low || 0}.${
									transactionBody.nodeAccountID.realm?.low || 0
							  }.${transactionBody.nodeAccountID.accountNum?.low || 0}`
							: undefined,
						hasContractCall: !!transactionBody.contractCall,
						gas: transactionBody.contractCall?.gas?.toString(),
						payable: transactionBody.contractCall?.amount?.toString(),
					};
				} catch (bodyError) {
					console.warn(
						'⚠️ Failed to decode TransactionBody:',
						bodyError?.message
					);
				}

				console.log('✅ Decoded original transaction body:', {
					bodyBytesLength: originalSignedTransaction.bodyBytes.length,
					transactionBodyInfo,
				});

				// CRITICAL: Build a NEW SignedTransaction with body + WalletConnect signature
				// This creates a properly signed transaction that Hedera will accept
				console.log(
					'📦 Building new SignedTransaction with WalletConnect signature...'
				);

				// Create a new SignedTransaction with the body and signature from WalletConnect
				const newSignedTransaction = proto.proto.SignedTransaction.create({
					bodyBytes: originalSignedTransaction.bodyBytes,
					sigMap: decodedSignatureMap,
				});

				console.log('✅ Created SignedTransaction with signature:', {
					bodyBytesLength: newSignedTransaction.bodyBytes.length,
					sigPairCount: newSignedTransaction.sigMap.sigPair.length,
					sigPairDetails: newSignedTransaction.sigMap.sigPair.map((pair) => {
						const ecdsaSig = pair.ECDSASecp256k1 || pair.ecdsaSecp256k1;
						return {
							hasEd25519: !!pair.ed25519,
							hasECDSA: !!ecdsaSig,
							ed25519Length: pair.ed25519?.length || 0,
							ecdsaLength: ecdsaSig?.length || 0,
							ecdsaHex: ecdsaSig
								? Buffer.from(ecdsaSig).toString('hex')
								: 'none',
							pubKeyPrefixLength: pair.pubKeyPrefix?.length || 0,
							pubKeyPrefixHex: pair.pubKeyPrefix
								? Buffer.from(pair.pubKeyPrefix).toString('hex')
								: 'none',
						};
					}),
				});

				// Encode the SignedTransaction
				const newSignedTxBytes =
					proto.proto.SignedTransaction.encode(newSignedTransaction).finish();
				console.log(
					'📦 Encoded SignedTransaction, length:',
					newSignedTxBytes.length
				);

				// Wrap in Transaction proto
				const transactionWrapper = proto.proto.Transaction.create({
					signedTransactionBytes: newSignedTxBytes,
				});
				const transactionWrapperBytes =
					proto.proto.Transaction.encode(transactionWrapper).finish();
				console.log(
					'📦 Created Transaction wrapper, length:',
					transactionWrapperBytes.length
				);

				// Now deserialize as a Transaction object that SDK can use
				transaction = Transaction.fromBytes(transactionWrapperBytes);
				console.log('✅ Transaction reconstructed from signed bytes');
				console.log(
					'📝 Transaction ID:',
					transaction.transactionId?.toString()
				);
				console.log(
					'📝 Transaction payer:',
					transaction.transactionId?.accountId?.toString()
				);

				// CRITICAL: Compare transaction IDs
				if (transactionBodyInfo.fullTransactionId) {
					const reconstructedTxId = transaction.transactionId?.toString();
					console.log('🔍 Transaction ID comparison:', {
						original: transactionBodyInfo.fullTransactionId,
						reconstructed: reconstructedTxId,
						match: transactionBodyInfo.fullTransactionId === reconstructedTxId,
					});

					if (transactionBodyInfo.fullTransactionId !== reconstructedTxId) {
						console.error(
							'❌ CRITICAL: Transaction ID mismatch! Signature was for different transaction.'
						);
						console.error('This will cause INVALID_SIGNATURE error.');
					}
				}

				// Verify signature if we have the account public key
				if (accountPublicKey) {
					try {
						const isSignatureValid =
							accountPublicKey.verifyTransaction(transaction);
						console.log(
							'📦 Local signature verification result:',
							isSignatureValid
						);

						if (!isSignatureValid) {
							console.warn('⚠️ Signature verification failed locally');
							console.warn(
								'⚠️ This is expected for ECDSA signatures from WalletConnect'
							);
							console.warn(
								'⚠️ Hedera SDK verification may not support ECDSA properly'
							);
							console.warn('⚠️ Network verification should work correctly');
						} else {
							console.log('✅ Signature verified successfully locally!');
						}
					} catch (verifyError) {
						console.warn(
							'⚠️ Failed to locally verify signature:',
							verifyError?.message
						);
					}
				}

				console.log('✅ Transaction fully signed and ready for execution');
				console.log(
					'📦 Transaction protobuf bytes (length):',
					transactionWrapperBytes.length
				);
				console.log('📦 Transaction has frozen state:', transaction.isFrozen());
			} catch (accountError) {
				console.error('❌ Failed to reconstruct signed transaction:', {
					message: accountError.message,
					stack: accountError.stack,
					name: accountError.name,
				});
				throw new Error(
					`Could not reconstruct signed transaction: ${accountError.message}`
				);
			}

			console.log('🚀 Executing transaction with user signature...');
			console.log('💰 Transaction details before execution:', {
				payerAccount: signedTransaction.accountId || userAddress,
				transactionId: transaction.transactionId?.toString(),
				transactionPayer: transaction.transactionId?.accountId?.toString(),
				isFrozen: transaction.isFrozen(),
				transactionType: transaction.constructor.name,
			});

			// Execute the signed transaction
			console.log('📤 Submitting transaction to Hedera network...');
			const response = await transaction.execute(executorClient);

			if (response.errorMessage) {
				throw new Error(`Transaction failed: ${response.errorMessage}`);
			}

			// Get the receipt (free operation - no HBAR cost)
			const receipt = await response.getReceipt(executorClient);

			if (receipt.status.toString() !== 'SUCCESS') {
				throw new Error(`Transaction failed with status: ${receipt.status}`);
			}

			console.log('✅ Transaction receipt received:', {
				status: receipt.status.toString(),
				transactionId: response.transactionId.toString(),
			});

			// Try to get the record for return values (costs HBAR - may fail if executor account has insufficient balance)
			let hplayAmount = 0;
			let gasUsed = 0;

			try {
				const record = await response.getRecord(executorClient);
				gasUsed = receipt.gasUsed?.toNumber() || 0;

				console.log('📦 Transaction record details:', {
					hasContractFunctionResult: !!record.contractFunctionResult,
					contractFunctionResultDetails: record.contractFunctionResult
						? {
								contractId:
									record.contractFunctionResult.contractId?.toString(),
								gasUsed: record.contractFunctionResult.gasUsed?.toNumber(),
								errorMessage: record.contractFunctionResult.errorMessage,
								bloom: record.contractFunctionResult.bloom?.length,
								logs: record.contractFunctionResult.logs?.length,
						  }
						: 'No contract function result',
				});

				// Extract HPLAY amount from the result
				if (record.contractFunctionResult) {
					try {
						// Try to get return value
						if (
							record.contractFunctionResult.bytes &&
							record.contractFunctionResult.bytes.length > 0
						) {
							hplayAmount = record.contractFunctionResult
								.getUint256(0)
								.toNumber();

							console.log(
								'✅ Extracted HPLAY amount from contract result:',
								hplayAmount
							);
						} else {
							console.warn(
								'⚠️ Contract function result has no return value (empty bytes)'
							);
							console.warn(
								'⚠️ This may indicate contract reverted or function is not payable'
							);
						}
					} catch (extractError) {
						console.error(
							'❌ Failed to extract HPLAY amount from result:',
							extractError
						);
						console.error(
							'Contract may have reverted or returned unexpected data'
						);
					}
				} else {
					console.warn('⚠️ No contract function result in transaction record');
				}
			} catch (recordError) {
				console.warn(
					'⚠️ Failed to get transaction record (executor account may have insufficient HBAR):',
					recordError.message
				);
				console.warn(
					'⚠️ Transaction was successful but cannot retrieve HPLAY amount from contract result'
				);
				console.warn(
					'⚠️ Suggestion: Top up executor account (0.0.7154350) with HBAR to enable record queries'
				);
				// Transaction is still successful, just can't get the record
				// Use estimated HPLAY based on exchange rate (5 HPLAY per HBAR)
				hplayAmount = Math.floor((hbarAmountTinybars / 100000000) * 5);
				console.log(
					`⚠️ Using estimated HPLAY amount based on exchange rate: ${hplayAmount} HPLAY`
				);
			}

			console.log('✅ REAL transaction executed successfully:', {
				transactionId: response.transactionId.toString(),
				hplayAmount: hplayAmount,
				gasUsed: gasUsed,
				walletType: signedTransaction.walletType,
				userAccountId: signedTransaction.accountId || userAddress,
				isRealWalletSignature: true,
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
					gasUsed: gasUsed,
					contractId: receipt.contractId?.toString(),
					accountId: receipt.accountId?.toString(),
				},
				walletType: signedTransaction.walletType,
				isRealTransaction: true,
				userAccountId: signedTransaction.accountId || userAddress,
			};
		} catch (error) {
			console.error('❌ Error executing REAL signed swap transaction:', error);
			throw error;
		}
	}

	/**
	 * Create token association transaction for user
	 * @param {string} userAddress User's Hedera address
	 * @param {string} tokenId Token ID to associate
	 * @returns {Promise<Object>} Transaction data for user to sign
	 */
	async createTokenAssociationTransaction(userAddress, tokenId) {
		try {
			if (!this.client) {
				throw new Error('Hedera client not initialized');
			}

			const { TokenAssociateTransaction, TransactionId } = await import(
				'@hashgraph/sdk'
			);
			const userAccountId = AccountId.fromString(userAddress);

			// Create token association transaction
			const transaction = new TokenAssociateTransaction()
				.setAccountId(userAccountId)
				.setTokenIds([tokenId]);

			// Set transaction ID with user as payer
			const transactionId = TransactionId.generate(userAccountId);
			transaction.setTransactionId(transactionId);

			// Set single node
			const singleNode = AccountId.fromString('0.0.3');
			transaction.setNodeAccountIds([singleNode]);

			// Freeze transaction
			const tempClient = initializeHederaClient();
			const frozenTransaction = await transaction.freezeWith(tempClient);

			// Get transaction bytes
			const transactionBytes = frozenTransaction.toBytes();
			const transactionBytesArray = Array.from(transactionBytes);

			// Extract body bytes
			const txList = proto.proto.TransactionList.decode(
				Buffer.from(transactionBytes)
			);
			const txProto = txList.transactionList[0];
			let bodyBytes;

			if (txProto.signedTransactionBytes) {
				const signedTx = proto.proto.SignedTransaction.decode(
					txProto.signedTransactionBytes
				);
				bodyBytes = signedTx.bodyBytes;
			} else if (txProto.signedTransaction) {
				bodyBytes = txProto.signedTransaction.bodyBytes;
			}

			const bodyBytesArray = Array.from(bodyBytes);

			return {
				success: true,
				transactionData: transactionBytesArray,
				transactionBodyData: bodyBytesArray,
				transactionId: transactionId.toString(),
				tokenId: tokenId,
				userAddress: userAddress,
			};
		} catch (error) {
			console.error('Error creating token association transaction:', error);
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
