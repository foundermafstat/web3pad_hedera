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
            error: 'Failed to fetch swap rate'
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
            error: 'Failed to fetch user swap information'
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
        
        const swapResult = await contractService.swapHbarForHplay(
            userAddress, 
            hbarAmount, 
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
 * @route POST /api/contracts/player-sbt/mint
 * @desc Mint SBT for a user. Server must have GAME_SERVER_ROLE on PlayerSBT.
 * @access Public (expects userAddress in body)
 */
router.post('/player-sbt/mint', async (req, res) => {
    try {
        const { userAddress, tokenUri } = req.body || {};
        if (!userAddress) {
            return res.status(400).json({ success: false, error: 'userAddress is required' });
        }

        const result = await contractService.mintPlayerSBT(userAddress, tokenUri || 'ipfs://player-sbt-default');
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error minting Player SBT:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to mint Player SBT' });
    }
});

export default router;
