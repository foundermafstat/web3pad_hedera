import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Update user's wallet address
router.post('/wallet', async (req, res) => {
    try {
        const { userId, walletAddress } = req.body;
        
        // Basic auth check - in production you'd use proper JWT verification
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userIdFromAuth = authHeader.split(' ')[1];
        if (userIdFromAuth !== userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address is required' });
        }

        // Validate wallet address format (basic Ethereum address check)
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
            return res.status(400).json({ error: 'Invalid wallet address format' });
        }

        // Check if wallet is already linked to another user
        const existingUser = await prisma.user.findUnique({
            where: { walletAddress: walletAddress.toLowerCase() },
        });

        if (existingUser && existingUser.id !== userId) {
            return res.status(409).json({ 
                error: 'This wallet is already linked to another account' 
            });
        }

        // Update user's wallet address
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { walletAddress: walletAddress.toLowerCase() },
            select: {
                id: true,
                username: true,
                displayName: true,
                blockchainAddress: true,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating wallet address:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove user's wallet address
router.delete('/wallet', async (req, res) => {
    try {
        const { userId } = req.body;
        
        // Basic auth check
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userIdFromAuth = authHeader.split(' ')[1];
        if (userIdFromAuth !== userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Remove wallet address from user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { walletAddress: null },
            select: {
                id: true,
                username: true,
                displayName: true,
                blockchainAddress: true,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error removing wallet address:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
