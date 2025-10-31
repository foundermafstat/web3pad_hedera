import { ethers } from 'ethers';
import { HEDERA_CONFIG, getContractEvmAddress } from './hedera-config.js';

const DEFAULT_CHAIN_ID = Number(
	process.env.HEDERA_CHAIN_ID ||
	process.env.HEDERA_TESTNET_CHAIN_ID ||
	296
);

const REGISTERED_GAME_ID = 'shooter';
const REGISTERED_SERVER_ADDRESS = (process.env.GAME_SERVER_ADDRESS || '0x3263874809c13d364dEA26a89b1232268935e8eC').toLowerCase();

const RESULT_VERIFIER_ABI = [
	'function submitGameResult(address player,string gameId,uint256 score,bytes signature,uint256 nonce,uint256 timestamp) external returns (bool)',
	'function getPlayerNonce(address player) public view returns (uint256)',
	'function minimumScores(string gameId) public view returns (uint256)',
	'function SIGNATURE_EXPIRATION_TIME() public view returns (uint256)'
];

class ResultVerifierService {
	constructor() {
		this.initialized = false;
		this.initializing = null;
	}

	async ensureInitialized() {
		if (this.initialized) {
			return;
		}

		if (!this.initializing) {
			this.initializing = this.initialize();
		}

		await this.initializing;
	}

	async initialize() {
		const rpcUrl = process.env.HEDERA_JSON_RPC_URL || HEDERA_CONFIG.jsonRpcUrl;
		if (!rpcUrl) {
			throw new Error('Hedera JSON-RPC URL is not configured (HEDERA_JSON_RPC_URL/HEDERA_CONFIG.jsonRpcUrl).');
		}

		const privateKey = process.env.GAME_SERVER_PRIVATE_KEY;
		if (!privateKey) {
			throw new Error('GAME_SERVER_PRIVATE_KEY is not configured.');
		}

		const normalizedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

		this.provider = new ethers.JsonRpcProvider(rpcUrl, {
			name: 'hedera-testnet',
			chainId: DEFAULT_CHAIN_ID,
		});

		this.wallet = new ethers.Wallet(normalizedPrivateKey, this.provider);
		this.contractAddress = getContractEvmAddress('ResultVerifier');
		this.contract = new ethers.Contract(
			this.contractAddress,
			RESULT_VERIFIER_ABI,
			this.wallet
		);

		if (REGISTERED_SERVER_ADDRESS && this.wallet.address.toLowerCase() !== REGISTERED_SERVER_ADDRESS) {
			console.warn(
				`[ResultVerifierService] Wallet address ${this.wallet.address} does not match registered server ${REGISTERED_SERVER_ADDRESS}`
			);
		}

		this.initialized = true;
	}

	async getPlayerNonce(playerAddress) {
		await this.ensureInitialized();
		const address = ethers.getAddress(playerAddress);
		const nonce = await this.contract.getPlayerNonce(address);
		return ethers.toBigInt(nonce);
	}

	async getMinimumScore(gameId = REGISTERED_GAME_ID) {
		await this.ensureInitialized();
		const minScore = await this.contract.minimumScores(gameId);
		return ethers.toBigInt(minScore);
	}

	async submitGameResult({ playerAddress, gameId = REGISTERED_GAME_ID, score, metrics = {} }) {
		if (!playerAddress) {
			throw new Error('Player address is required for game result submission.');
		}

		await this.ensureInitialized();

		const normalizedAddress = ethers.getAddress(playerAddress);
		const currentNonce = await this.getPlayerNonce(normalizedAddress);
		const nextNonce = currentNonce + 1n;
		const timestamp = BigInt(Math.floor(Date.now() / 1000));
		const scoreBigInt = ethers.toBigInt(score ?? 0);
		const minimumScore = await this.getMinimumScore(gameId);

		if (minimumScore > 0n && scoreBigInt < minimumScore) {
			throw new Error(`Score ${scoreBigInt} is below minimum threshold ${minimumScore} for game ${gameId}.`);
		}

		const messageHash = ethers.solidityPackedKeccak256(
			['address', 'string', 'uint256', 'uint256', 'uint256'],
			[normalizedAddress, gameId, scoreBigInt, timestamp, nextNonce]
		);
		const signature = await this.wallet.signMessage(ethers.getBytes(messageHash));

		const gasLimit = 1_200_000n;

		try {
			await this.contract.submitGameResult.staticCall(
				normalizedAddress,
				gameId,
				scoreBigInt,
				signature,
				nextNonce,
				timestamp,
				{ gasLimit }
			);
		} catch (error) {
			const reason = error?.reason || error?.shortMessage || error?.message || 'unknown';
			console.error('[ResultVerifierService] Simulation failed:', {
				reason,
				playerAddress: normalizedAddress,
				gameId,
				score: scoreBigInt.toString(),
				nonce: nextNonce.toString(),
				timestamp: timestamp.toString(),
			});
			throw new Error(`ResultVerifier simulation reverted: ${reason}`);
		}
		const txResponse = await this.contract.submitGameResult(
			normalizedAddress,
			gameId,
			scoreBigInt,
			signature,
			nextNonce,
			timestamp,
			{ gasLimit }
		);

		const receipt = await txResponse.wait();

		return {
			success: receipt.status === 1,
			transactionHash: receipt.hash,
			blockNumber: receipt.blockNumber,
			nonce: Number(nextNonce),
			timestamp: Number(timestamp),
			signature,
			metrics,
			gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : null,
			contractAddress: this.contractAddress,
		};
	}
}

export const resultVerifierService = new ResultVerifierService();
export { ResultVerifierService };

