import express from 'express';
import { contractService } from '../lib/contract-service.js';

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

export default router;
