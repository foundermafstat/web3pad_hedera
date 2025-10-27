import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/games
 * Get all active games
 */
router.get('/', async (req, res) => {
	try {
		const games = await prisma.gameType.findMany({
			where: {
				isActive: true,
			},
			orderBy: {
				sortOrder: 'asc',
			},
		});

		res.json({
			success: true,
			games,
		});
	} catch (error) {
		console.error('Error fetching games:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch games',
		});
	}
});

/**
 * GET /api/games/:gameCode
 * Get specific game by code with achievements
 */
router.get('/:gameCode', async (req, res) => {
	try {
		const { gameCode } = req.params;

		const game = await prisma.gameType.findUnique({
			where: {
				code: gameCode,
			},
			include: {
				gameAchievements: {
					where: {
						isActive: true,
					},
					orderBy: {
						sortOrder: 'asc',
					},
				},
			},
		});

		if (!game) {
			return res.status(404).json({
				success: false,
				error: 'Game not found',
			});
		}

		res.json({
			success: true,
			game,
		});
	} catch (error) {
		console.error('Error fetching game:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch game',
		});
	}
});

/**
 * GET /api/games/:gameCode/achievements
 * Get achievements for specific game
 */
router.get('/:gameCode/achievements', async (req, res) => {
	try {
		const { gameCode } = req.params;

		const game = await prisma.gameType.findUnique({
			where: {
				code: gameCode,
			},
			select: {
				id: true,
				code: true,
				name: true,
			},
		});

		if (!game) {
			return res.status(404).json({
				success: false,
				error: 'Game not found',
			});
		}

		const achievements = await prisma.gameAchievement.findMany({
			where: {
				gameTypeId: game.id,
				isActive: true,
			},
			orderBy: {
				sortOrder: 'asc',
			},
		});

		res.json({
			success: true,
			game: {
				code: game.code,
				name: game.name,
			},
			achievements,
		});
	} catch (error) {
		console.error('Error fetching game achievements:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch achievements',
		});
	}
});

/**
 * GET /api/games/:gameCode/stats
 * Get statistics for specific game
 */
router.get('/:gameCode/stats', async (req, res) => {
	try {
		const { gameCode } = req.params;

		const game = await prisma.gameType.findUnique({
			where: {
				code: gameCode,
			},
		});

		if (!game) {
			return res.status(404).json({
				success: false,
				error: 'Game not found',
			});
		}

		// Get game statistics
		const totalSessions = await prisma.gameSession.count({
			where: {
				gameTypeId: game.id,
				status: 'completed',
			},
		});

		const activeSessions = await prisma.gameSession.count({
			where: {
				gameTypeId: game.id,
				status: 'active',
			},
		});

		const totalPlayers = await prisma.gameResult.findMany({
			where: {
				session: {
					gameTypeId: game.id,
				},
			},
			select: {
				playerId: true,
			},
			distinct: ['playerId'],
		});

		res.json({
			success: true,
			stats: {
				totalSessions,
				activeSessions,
				totalPlayers: totalPlayers.length,
			},
		});
	} catch (error) {
		console.error('Error fetching game stats:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch stats',
		});
	}
});

export default router;
