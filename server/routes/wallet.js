import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Add wallet to user
router.post('/wallet', async (req, res) => {
    try {
        const { userId, address, type, network, isPrimary } = req.body;
        
        if (!userId || !address || !type) {
            return res.status(400).json({ error: 'userId, address, and type are required' });
        }

        // Check if wallet with same address and type already exists
        const existingWallet = await prisma.wallet.findFirst({
            where: {
                address: address.toLowerCase(),
                type: type.toLowerCase(),
            },
        });

        if (existingWallet) {
            if (existingWallet.userId === userId) {
                // Update existing wallet
                const updatedWallet = await prisma.wallet.update({
                    where: { id: existingWallet.id },
                    data: {
                        network,
                        isPrimary: isPrimary || false,
                    },
                });
                return res.json({ success: true, wallet: updatedWallet });
            } else {
                return res.status(409).json({ 
                    error: 'This wallet is already linked to another account' 
                });
            }
        }

        // If this is primary, unset other primary wallets
        if (isPrimary) {
            await prisma.wallet.updateMany({
                where: { userId },
                data: { isPrimary: false },
            });
        }

        // Create new wallet
        const wallet = await prisma.wallet.create({
            data: {
                userId,
                address: address.toLowerCase(),
                type: type.toLowerCase(),
                network,
                isPrimary: isPrimary || false,
            },
        });

        res.json({ success: true, wallet });
    } catch (error) {
        console.error('Error adding wallet:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove wallet from user
router.delete('/wallet/:walletId', async (req, res) => {
    try {
        const { walletId } = req.params;
        
        // Find wallet
        const wallet = await prisma.wallet.findUnique({
            where: { id: walletId },
        });

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        // Delete wallet
        await prisma.wallet.delete({
            where: { id: walletId },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing wallet:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user wallets
router.get('/wallet/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const wallets = await prisma.wallet.findMany({
            where: { userId },
            orderBy: [
                { isPrimary: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        res.json({ success: true, wallets });
    } catch (error) {
        console.error('Error fetching wallets:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
