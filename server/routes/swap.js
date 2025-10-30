import express from 'express';
import { contractService } from '../lib/contract-service.js';
import { transactionService } from '../lib/transaction-service.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route POST /api/swap/create-transaction
 * @desc Create swap transaction for user to sign
 * @access Public
 */
router.post('/create-transaction', async (req, res) => {
    try {
        const { userAddress, hbarAmount } = req.body;
        
        if (!userAddress || !hbarAmount) {
            return res.status(400).json({ success: false, error: 'User address and HBAR amount are required' });
        }
        
        const amount = parseFloat(hbarAmount);
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid HBAR amount' });
        }
        
        const hbarAmountTinybars = Math.floor(amount * 100000000);
        
        const transactionData = await transactionService.createSwapTransaction(
            userAddress, 
            hbarAmountTinybars
        );
        
        res.json({ success: true, data: transactionData });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Failed to create swap transaction' });
    }
});

/**
 * @route POST /api/swap/submit-transaction
 * @desc Submit signed transaction to Hedera network
 * @access Public
 */
router.post('/submit-transaction', async (req, res) => {
    try {
        const { signedTransaction, userAddress, hbarAmount, originalTransactionBytes } = req.body;
        
        if (!signedTransaction || !userAddress || !hbarAmount) {
            return res.status(400).json({ success: false, error: 'Signed transaction, user address and HBAR amount are required' });
        }
        
        const hbarAmountTinybars = Math.floor(parseFloat(hbarAmount) * 100000000);
        
        // Execute the signed transaction with original transaction bytes
        const swapResult = await transactionService.executeSignedSwapTransaction(
            signedTransaction,
            userAddress,
            hbarAmountTinybars,
            originalTransactionBytes
        );
        
        res.json({ success: true, data: swapResult });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Failed to submit signed transaction' });
    }
});

/**
 * @route POST /api/swap/execute
 * @desc Execute HBAR to HPLAY swap transaction
 * @access Public (with optional authentication)
 */
router.post('/execute', async (req, res) => {
    try {
        const { userAddress, hbarAmount, signature, message } = req.body;
        
        // Validate required parameters
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
        
        // Convert HBAR to tinybars (1 HBAR = 100,000,000 tinybars)
        const hbarAmountTinybars = Math.floor(amount * 100000000);
        
        // Execute the swap through contract service
        const swapResult = await contractService.swapHbarForHplay(
            userAddress, 
            hbarAmountTinybars, 
            signature, 
            message
        );
        
        res.json({
            success: true,
            data: swapResult
        });
        
    } catch (error) {
        console.error('❌ Error executing swap:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to execute swap transaction'
        });
    }
});

/**
 * @route GET /api/swap/rate
 * @desc Get current swap rate
 * @access Public
 */
router.get('/rate', async (req, res) => {
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
 * @route GET /api/swap/user/:address
 * @desc Get user swap information
 * @access Public
 */
router.get('/user/:address', async (req, res) => {
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
 * @route GET /api/swap/balance/:address
 * @desc Get HBAR balance for user
 * @access Public
 */
router.get('/balance/:address', async (req, res) => {
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
            error: error.message || 'Failed to fetch HBAR balance'
        });
    }
});

/**
 * @route GET /api/swap/token-balance/:address
 * @desc Get HPLAY token balance for user
 * @access Public
 */
router.get('/token-balance/:address', async (req, res) => {
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
            error: error.message || 'Failed to fetch token balance'
        });
    }
});

/**
 * @route GET /api/swap/stats
 * @desc Get swap statistics
 * @access Public
 */
router.get('/stats', async (req, res) => {
    try {
        const [swapRate, systemStats] = await Promise.all([
            contractService.getSwapRate(),
            contractService.getSystemStats()
        ]);
        
        res.json({
            success: true,
            data: {
                swapRate,
                systemStats,
                timestamp: Date.now()
            }
        });
    } catch (error) {
        console.error('Error fetching swap stats:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch swap statistics'
        });
    }
});

export default router;
