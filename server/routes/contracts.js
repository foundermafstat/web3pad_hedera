import express from 'express';
import { contractService } from '../lib/contract-service.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Middleware to validate contract parameters
 */
const validateContractParams = (req, res, next) => {
    const { address } = req.params;
    
    if (!address) {
        return res.status(400).json({
            success: false,
            error: 'Address parameter is required'
        });
    }
    
    // Basic address validation
    if (typeof address !== 'string' || address.length < 10) {
        return res.status(400).json({
            success: false,
            error: 'Invalid address format'
        });
    }
    
    next();
};

// Apply middleware (commented out for debugging)
// router.use(logContractCalls);
// router.use(contractRateLimit(50, 60000)); // 50 requests per minute
// router.use(contractErrorMiddleware);

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
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in test endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Test endpoint failed'
        });
    }
});

/**
 * @route GET /api/contracts/system/stats
 * @desc Get system statistics
 * @access Public
 */
router.get('/system/stats', async (req, res) => {
    try {
        const stats = await contractService.getSystemStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching system stats:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch system statistics'
        });
    }
});

/**
 * @route GET /api/contracts/system/operational
 * @desc Check if system is operational
 * @access Public
 */
router.get('/system/operational', async (req, res) => {
    try {
        const operational = await contractService.isSystemOperational();
        res.json({
            success: true,
            data: { operational }
        });
    } catch (error) {
        console.error('Error checking system status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check system status'
        });
    }
});

/**
 * @route GET /api/contracts/player/:address/info
 * @desc Get comprehensive player information
 * @access Public
 */
router.get('/player/:address/info', validateContractParams, async (req, res) => {
    try {
        const { address } = req.params;
        const playerInfo = await contractService.getPlayerInfo(address);
        
        res.json({
            success: true,
            data: playerInfo
        });
    } catch (error) {
        console.error('Error fetching player info:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch player information'
        });
    }
});

/**
 * @route GET /api/contracts/player/:address/stats
 * @desc Get player statistics
 * @access Public
 */
router.get('/player/:address/stats', async (req, res) => {
    try {
        const { address } = req.params;
        const stats = await contractService.getPlayerStats(address);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching player stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch player statistics'
        });
    }
});

/**
 * @route GET /api/contracts/player/:address/game-stats/:gameId
 * @desc Get game-specific statistics for a player
 * @access Public
 */
router.get('/player/:address/game-stats/:gameId', async (req, res) => {
    try {
        const { address, gameId } = req.params;
        const gameStats = await contractService.getGameSpecificStats(address, gameId);
        
        res.json({
            success: true,
            data: gameStats
        });
    } catch (error) {
        console.error('Error fetching game stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch game statistics'
        });
    }
});

/**
 * @route GET /api/contracts/player/:address/sbt
 * @desc Check if player has SBT
 * @access Public
 */
router.get('/player/:address/sbt', async (req, res) => {
    try {
        const { address } = req.params;
        const hasSBT = await contractService.hasSBT(address);
        
        res.json({
            success: true,
            data: { hasSBT }
        });
    } catch (error) {
        console.error('Error checking SBT status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check SBT status'
        });
    }
});

/**
 * @route GET /api/contracts/player/:address/nft-count
 * @desc Get player NFT count
 * @access Public
 */
router.get('/player/:address/nft-count', async (req, res) => {
    try {
        const { address } = req.params;
        const nftCount = await contractService.getPlayerNFTCount(address);
        
        res.json({
            success: true,
            data: { nftCount }
        });
    } catch (error) {
        console.error('Error fetching NFT count:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch NFT count'
        });
    }
});

/**
 * @route GET /api/contracts/token/balance/:address
 * @desc Get token balance for an address
 * @access Public
 */
router.get('/token/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const balance = await contractService.getTokenBalance(address);
        
        res.json({
            success: true,
            data: { balance }
        });
    } catch (error) {
        console.error('Error fetching token balance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch token balance'
        });
    }
});

/**
 * @route GET /api/contracts/token/supply
 * @desc Get total token supply
 * @access Public
 */
router.get('/token/supply', async (req, res) => {
    try {
        const totalSupply = await contractService.getTotalSupply();
        
        res.json({
            success: true,
            data: { totalSupply }
        });
    } catch (error) {
        console.error('Error fetching total supply:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch total supply'
        });
    }
});

/**
 * @route GET /api/contracts/token/staked/:address
 * @desc Get staked balance for an address
 * @access Public
 */
router.get('/token/staked/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const stakedBalance = await contractService.getStakedBalance(address);
        
        res.json({
            success: true,
            data: { stakedBalance }
        });
    } catch (error) {
        console.error('Error fetching staked balance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch staked balance'
        });
    }
});

/**
 * @route GET /api/contracts/games/:gameId/info
 * @desc Get game module information
 * @access Public
 */
router.get('/games/:gameId/info', async (req, res) => {
    try {
        const { gameId } = req.params;
        const gameInfo = await contractService.getGameModule(gameId);
        
        res.json({
            success: true,
            data: gameInfo
        });
    } catch (error) {
        console.error('Error fetching game info:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch game information'
        });
    }
});

/**
 * @route GET /api/contracts/games/:gameId/difficulty
 * @desc Get difficulty multiplier for a game
 * @access Public
 */
router.get('/games/:gameId/difficulty', async (req, res) => {
    try {
        const { gameId } = req.params;
        const difficulty = await contractService.getDifficultyMultiplier(gameId);
        
        res.json({
            success: true,
            data: { difficulty }
        });
    } catch (error) {
        console.error('Error fetching game difficulty:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch game difficulty'
        });
    }
});

/**
 * @route GET /api/contracts/games/total
 * @desc Get total games registered
 * @access Public
 */
router.get('/games/total', async (req, res) => {
    try {
        const totalGames = await contractService.getTotalGamesRegistered();
        
        res.json({
            success: true,
            data: { totalGames }
        });
    } catch (error) {
        console.error('Error fetching total games:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch total games'
        });
    }
});

/**
 * @route GET /api/contracts/lottery/pool-balance
 * @desc Get lottery pool balance
 * @access Public
 */
router.get('/lottery/pool-balance', async (req, res) => {
    try {
        const poolBalance = await contractService.getLotteryPoolBalance();
        
        res.json({
            success: true,
            data: { poolBalance }
        });
    } catch (error) {
        console.error('Error fetching lottery pool balance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lottery pool balance'
        });
    }
});

/**
 * @route GET /api/contracts/lottery/participants
 * @desc Get total lottery participants
 * @access Public
 */
router.get('/lottery/participants', async (req, res) => {
    try {
        const participants = await contractService.getTotalParticipants();
        
        res.json({
            success: true,
            data: { participants }
        });
    } catch (error) {
        console.error('Error fetching lottery participants:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch lottery participants'
        });
    }
});

/**
 * @route GET /api/contracts/lottery/next-draw
 * @desc Get time until next lottery draw
 * @access Public
 */
router.get('/lottery/next-draw', async (req, res) => {
    try {
        const timeUntilNextDraw = await contractService.getTimeUntilNextDraw();
        
        res.json({
            success: true,
            data: { timeUntilNextDraw }
        });
    } catch (error) {
        console.error('Error fetching next draw time:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch next draw time'
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
            data: swapRate
        });
    } catch (error) {
        console.error('Error fetching swap rate:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch swap rate'
        });
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
            data: userSwapInfo
        });
    } catch (error) {
        console.error('Error fetching user swap info:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch user swap information'
        });
    }
});

/**
 * @route POST /api/contracts/rewards/calculate
 * @desc Calculate reward amount for a score and game
 * @access Public
 */
router.post('/rewards/calculate', async (req, res) => {
    try {
        const { score, gameId } = req.body;
        
        if (!score || !gameId) {
            return res.status(400).json({
                success: false,
                error: 'Score and gameId are required'
            });
        }
        
        const rewardAmount = await contractService.calculateReward(score, gameId);
        
        res.json({
            success: true,
            data: { rewardAmount }
        });
    } catch (error) {
        console.error('Error calculating reward:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate reward'
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
                error: 'User address and HBAR amount are required'
            });
        }
        
        // Validate hbarAmount is a positive number
        const amount = parseFloat(hbarAmount);
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid HBAR amount'
            });
        }
        
        const swapResult = await contractService.swapHbarForHplay(
            userAddress, 
            amount, 
            signature, 
            message
        );
        
        res.json({
            success: true,
            data: swapResult
        });
    } catch (error) {
        console.error('Error swapping tokens:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to swap tokens'
        });
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
            data: { balance }
        });
    } catch (error) {
        console.error('Error fetching HBAR balance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch HBAR balance'
        });
    }
});

export default router;
