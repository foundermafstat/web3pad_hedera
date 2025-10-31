import express from 'express';
import { contractService } from '../lib/contract-service.js';
import { transactionService } from '../lib/transaction-service.js';

const router = express.Router();

/**
 * @route GET /api/contracts/test
 * @desc Test endpoint to check if contracts service is working
 * @access Public
 */
router.get('/test', async (req, res) => {
	try {
		res.json({
			success: true,
			message: 'Contracts service is working',
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error in test endpoint:', error);
		res.status(500).json({
			success: false,
			error: 'Test endpoint failed',
		});
	}
});

/**
 * @route GET /api/contracts/system/stats
 * @desc Get system statistics from HederaGameLaunchpad
 * @access Public
 */
router.get('/system/stats', async (req, res) => {
	try {
		const stats = await contractService.getSystemStats();
		res.json({ success: true, data: stats });
	} catch (error) {
		console.error('Error fetching system stats:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to fetch system statistics',
		});
	}
});

/**
 * @route GET /api/contracts/faucet/swap-rate
 * @desc Get faucet swap rate information
 * @access Public
 */
router.get('/faucet/swap-rate', async (req, res) => {
	try {
		const swapRate = await contractService.getSwapRate();

		res.json({
			success: true,
			data: swapRate,
		});
	} catch (error) {
		console.error('Error fetching swap rate:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch swap rate',
		});
	}
});

/**
 * FaucetManager JSON-RPC endpoints (ethers)
 */
router.get('/faucet/rpc/swap-rate', async (_req, res) => {
	try {
		const data = await contractService.getSwapRateRpc();
		res.json({ success: true, data });
	} catch (error) {
		console.error('Error fetching rpc swap rate:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch rpc swap rate' });
	}
});

router.get('/faucet/rpc/user/:address', async (req, res) => {
	try {
		const data = await contractService.getUserSwapInfoRpc(req.params.address);
		res.json({ success: true, data });
	} catch (error) {
		console.error('Error fetching rpc user swap info:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch rpc user swap info' });
	}
});

router.get('/faucet/rpc/bonus-factor/:address', async (req, res) => {
	try {
		const value = await contractService.calculateBonusFactorRpc(
			req.params.address
		);
		res.json({ success: true, data: { bonusFactor: value } });
	} catch (error) {
		console.error('Error fetching bonus factor:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch bonus factor' });
	}
});

router.get('/faucet/rpc/is-new-day/:lastTs', async (req, res) => {
	try {
		const flag = await contractService.isNewDayRpc(req.params.lastTs);
		res.json({ success: true, data: { isNewDay: flag } });
	} catch (error) {
		console.error('Error checking isNewDay:', error);
		res.status(500).json({ success: false, error: 'Failed to check isNewDay' });
	}
});

router.get('/faucet/rpc/remaining-daily/:address', async (req, res) => {
	try {
		const v = await contractService.getRemainingDailyLimitRpc(
			req.params.address
		);
		res.json({ success: true, data: { remaining: v } });
	} catch (error) {
		console.error('Error fetching remaining daily limit:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch remaining daily limit' });
	}
});

router.get('/faucet/rpc/stats', async (_req, res) => {
	try {
		const data = await contractService.getFaucetStatsRpc();
		res.json({ success: true, data });
	} catch (error) {
		console.error('Error fetching faucet stats:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch faucet stats' });
	}
});

/**
 * PlayerSBT RPC endpoints
 */
router.get('/player-sbt/rpc/has-sbt/:address', async (req, res) => {
	try {
		const hasSBT = await contractService.hasSBTRpc(req.params.address);
		res.json({ success: true, data: { hasSBT } });
	} catch (error) {
		console.error('Error checking hasSBT:', error);
		res.status(500).json({ success: false, error: 'Failed to check hasSBT' });
	}
});

router.get('/player-sbt/rpc/player-stats/:address', async (req, res) => {
	try {
		const data = await contractService.getPlayerStatsRpc(req.params.address);
		res.json({ success: true, data });
	} catch (error) {
		console.error('Error fetching player stats:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch player stats' });
	}
});

router.get('/player-sbt/rpc/game-stats/:address/:gameId', async (req, res) => {
	try {
		const { address, gameId } = req.params;
		const data = await contractService.getGameSpecificStatsRpc(address, gameId);
		res.json({ success: true, data });
	} catch (error) {
		console.error('Error fetching game stats:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch game stats' });
	}
});

router.get('/player-sbt/rpc/calculate-reward/:score/:gameId', async (req, res) => {
	try {
		const { score, gameId } = req.params;
		const reward = await contractService.calculateRewardRpc(
			Number(score),
			gameId
		);
		res.json({ success: true, data: { reward } });
	} catch (error) {
		console.error('Error calculating reward:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to calculate reward' });
	}
});

router.get('/player-sbt/rpc/token-id/:address', async (req, res) => {
	try {
		const tokenId = await contractService.getPlayerTokenIdRpc(
			req.params.address
		);
		res.json({ 
			success: true, 
			data: { 
				tokenId,
				hasSBT: tokenId > 0
			} 
		});
	} catch (error) {
		console.error('Error fetching token ID:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch token ID' });
	}
});

router.get('/player-sbt/rpc/total', async (_req, res) => {
	try {
		const total = await contractService.getTotalSBTsRpc();
		res.json({ success: true, data: { total } });
	} catch (error) {
		console.error('Error fetching total SBTs:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch total SBTs' });
	}
});

/**
 * GameRegistry RPC endpoints
 */
router.get('/game-registry/rpc/game-module/:gameId', async (req, res) => {
	try {
		const { gameId } = req.params;
		const data = await contractService.getGameModuleRpc(gameId);
		res.json({ success: true, data });
	} catch (error) {
		console.error('Error fetching game module:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch game module' });
	}
});

router.get('/game-registry/rpc/is-valid-server/:gameId/:server', async (req, res) => {
	try {
		const { gameId, server } = req.params;
		const isValid = await contractService.isValidServerRpc(gameId, server);
		res.json({ success: true, data: { isValid } });
	} catch (error) {
		console.error('Error checking valid server:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to check valid server' });
	}
});

router.get('/game-registry/rpc/difficulty-multiplier/:gameId', async (req, res) => {
	try {
		const { gameId } = req.params;
		const multiplier = await contractService.getDifficultyMultiplierRpc(gameId);
		res.json({ success: true, data: { multiplier } });
	} catch (error) {
		console.error('Error fetching difficulty multiplier:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch difficulty multiplier' });
	}
});

router.get('/game-registry/rpc/current-nonce/:gameId', async (req, res) => {
	try {
		const { gameId } = req.params;
		const nonce = await contractService.getCurrentNonceRpc(gameId);
		res.json({ success: true, data: { nonce } });
	} catch (error) {
		console.error('Error fetching current nonce:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch current nonce' });
	}
});

/**
 * NFTManager RPC endpoints
 */
router.get('/nft-manager/rpc/nft/:tokenId', async (req, res) => {
	try {
		const { tokenId } = req.params;
		const data = await contractService.getNFTRpc(Number(tokenId));
		res.json({ success: true, data });
	} catch (error) {
		console.error('Error fetching NFT:', error);
		res.status(500).json({ success: false, error: 'Failed to fetch NFT' });
	}
});

router.get('/nft-manager/rpc/player-nfts/:address', async (req, res) => {
	try {
		const { address } = req.params;
		const tokenIds = await contractService.getPlayerNFTsRpc(address);
		res.json({ success: true, data: { tokenIds } });
	} catch (error) {
		console.error('Error fetching player NFTs:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch player NFTs' });
	}
});

router.get('/nft-manager/rpc/player-nft-count/:address', async (req, res) => {
	try {
		const { address } = req.params;
		const count = await contractService.getPlayerNFTCountRpc(address);
		res.json({ success: true, data: { count } });
	} catch (error) {
		console.error('Error fetching player NFT count:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch player NFT count' });
	}
});

router.get('/nft-manager/rpc/rarity-burn-fee/:rarity', async (req, res) => {
	try {
		const { rarity } = req.params;
		const fee = await contractService.getRarityBurnFeeRpc(rarity);
		res.json({ success: true, data: { fee } });
	} catch (error) {
		console.error('Error fetching rarity burn fee:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch rarity burn fee' });
	}
});

router.get('/nft-manager/rpc/total', async (_req, res) => {
	try {
		const total = await contractService.getTotalNFTsRpc();
		res.json({ success: true, data: { total } });
	} catch (error) {
		console.error('Error fetching total NFTs:', error);
		res.status(500).json({ success: false, error: 'Failed to fetch total NFTs' });
	}
});

/**
 * @route GET /api/contracts/faucet/user/:address
 * @desc Get user swap information
 * @access Public
 */
router.get('/faucet/user/:address', async (req, res) => {
	try {
		const { address } = req.params;
		const userSwapInfo = await contractService.getUserSwapInfo(address);

		res.json({
			success: true,
			data: userSwapInfo,
		});
	} catch (error) {
		console.error('Error fetching user swap info:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch user swap information',
		});
	}
});

/**
 * @route GET /api/contracts/lottery/last-draw
 * @desc Get last draw timestamp
 * @access Public
 */
router.get('/lottery/last-draw', async (_req, res) => {
	try {
		const ts = await contractService.getLastDrawTimestamp();
		res.json({ success: true, data: { lastDrawTimestamp: ts } });
	} catch (error) {
		console.error('Error fetching last draw timestamp:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch last draw timestamp' });
	}
});

/**
 * @route GET /api/contracts/lottery/draw-interval
 * @desc Get draw interval seconds
 * @access Public
 */
router.get('/lottery/draw-interval', async (_req, res) => {
	try {
		const interval = await contractService.getDrawInterval();
		res.json({ success: true, data: { drawInterval: interval } });
	} catch (error) {
		console.error('Error fetching draw interval:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch draw interval' });
	}
});

/**
 * @route GET /api/contracts/lottery/is-participant/:address
 * @desc Check if address is lottery participant
 * @access Public
 */
router.get('/lottery/is-participant/:address', async (req, res) => {
	try {
		const { address } = req.params;
		const isParticipant = await contractService.isLotteryParticipant(address);
		res.json({ success: true, data: { isParticipant } });
	} catch (error) {
		console.error('Error checking participant:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to check participant' });
	}
});

/**
 * @route GET /api/contracts/lottery/participant/:address/tx-count
 * @desc Get participant transaction count
 * @access Public
 */
router.get('/lottery/participant/:address/tx-count', async (req, res) => {
	try {
		const { address } = req.params;
		const count = await contractService.getParticipantTransactionCount(address);
		res.json({ success: true, data: { count } });
	} catch (error) {
		console.error('Error fetching participant tx count:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch participant tx count' });
	}
});

/**
 * @route GET /api/contracts/lottery/participant/:address/volume
 * @desc Get participant volume
 * @access Public
 */
router.get('/lottery/participant/:address/volume', async (req, res) => {
	try {
		const { address } = req.params;
		const volume = await contractService.getParticipantVolume(address);
		res.json({ success: true, data: { volume } });
	} catch (error) {
		console.error('Error fetching participant volume:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch participant volume' });
	}
});

/**
 * @route GET /api/contracts/lottery/participants/all
 * @desc Get all participants (may be empty if decoding not supported)
 * @access Public
 */
router.get('/lottery/participants/all', async (_req, res) => {
	try {
		const participants = await contractService.getAllParticipants();
		res.json({ success: true, data: { participants } });
	} catch (error) {
		console.error('Error fetching all participants:', error);
		res
			.status(500)
			.json({ success: false, error: 'Failed to fetch participants' });
	}
});

/**
 * @route GET /api/contracts/account/:address/hbar-balance
 * @desc Get HBAR balance for an account
 * @access Public
 */
router.get('/account/:address/hbar-balance', async (req, res) => {
	try {
		const { address } = req.params;
		const balance = await contractService.getHbarBalance(address);

		res.json({
			success: true,
			data: { balance },
		});
	} catch (error) {
		console.error('Error fetching HBAR balance:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch HBAR balance',
		});
	}
});

/**
 * @route POST /api/contracts/faucet/swap
 * @desc Swap HBAR for HPLAY tokens
 * @access Public
 */
router.post('/faucet/swap', async (req, res) => {
	try {
		const { userAddress, hbarAmount, signature, message } = req.body;

		if (!userAddress || !hbarAmount) {
			return res.status(400).json({
				success: false,
				error: 'User address and HBAR amount are required',
			});
		}

		const swapResult = await contractService.swapHbarForHplay(
			userAddress,
			hbarAmount,
			signature,
			message
		);

		res.json({
			success: true,
			data: swapResult,
		});
	} catch (error) {
		console.error('Error swapping tokens:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to swap tokens',
		});
	}
});

/**
 * @route POST /api/contracts/player-sbt/mint
 * @desc Mint SBT for a user. Server must have GAME_SERVER_ROLE on PlayerSBT.
 * @access Public (expects userAddress in body)
 * @deprecated Use /player-sbt/create-mint-transaction and /player-sbt/execute-mint instead
 */
router.post('/player-sbt/mint', async (req, res) => {
	try {
		const { userAddress, tokenUri } = req.body || {};
		if (!userAddress) {
			return res
				.status(400)
				.json({ success: false, error: 'userAddress is required' });
		}

		const result = await contractService.mintPlayerSBT(
			userAddress,
			tokenUri || 'ipfs://player-sbt-default'
		);
		res.json({ success: true, data: result });
	} catch (error) {
		console.error('Error minting Player SBT:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to mint Player SBT',
		});
	}
});

/**
 * @route POST /api/contracts/player-sbt/create-mint-transaction
 * @desc Create SBT mint transaction for user to sign with their wallet
 * @access Public
 */
router.post('/player-sbt/create-mint-transaction', async (req, res) => {
	try {
		const { userAddress, tokenUri } = req.body || {};
		if (!userAddress) {
			return res
				.status(400)
				.json({ success: false, error: 'userAddress is required' });
		}

		// Check if user already has SBT
		try {
			const hasSBT = await contractService.hasSBT(userAddress);
			if (hasSBT) {
				return res.status(400).json({
					success: false,
					error: 'Player already has an SBT',
				});
			}
		} catch (checkError) {
			console.warn('Could not check if player has SBT:', checkError.message);
		}

		const result = await transactionService.createSBTMintTransaction(
			userAddress,
			tokenUri || 'ipfs://player-sbt-default'
		);

		res.json(result);
	} catch (error) {
		console.error('Error creating SBT mint transaction:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to create SBT mint transaction',
		});
	}
});

/**
 * @route POST /api/contracts/player-sbt/execute-mint
 * @desc Execute signed SBT mint transaction from user's wallet
 * @access Public
 */
router.post('/player-sbt/execute-mint', async (req, res) => {
	try {
		const { signedTransaction, userAddress, originalTransactionBytes } =
			req.body || {};

		if (!signedTransaction || !userAddress) {
			return res.status(400).json({
				success: false,
				error: 'signedTransaction and userAddress are required',
			});
		}

		const result = await transactionService.executeSignedSBTMintTransaction(
			signedTransaction,
			userAddress,
			originalTransactionBytes
		);

		res.json(result);
	} catch (error) {
		console.error('Error executing signed SBT mint transaction:', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Failed to execute SBT mint transaction',
		});
	}
});

export default router;
