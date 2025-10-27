import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get user profile by username or ID
router.get('/profile/:username', async (req, res) => {
	try {
		const { username } = req.params;

		// Try to find user by username first, then by ID
		let user = await prisma.user.findUnique({
			where: { username },
			select: {
				id: true,
				username: true,
				displayName: true,
				avatar: true,
				blockchainConnected: true,
				level: true,
				experience: true,
				coins: true,
				createdAt: true,
				wallets: {
					select: {
						address: true,
						type: true,
						network: true,
						isPrimary: true,
					},
				},
			},
		}).catch(() => null);

		// If not found by username, try to find by ID
		if (!user) {
			user = await prisma.user.findUnique({
				where: { id: username },
				select: {
					id: true,
					username: true,
					displayName: true,
					avatar: true,
					blockchainConnected: true,
					level: true,
					experience: true,
					coins: true,
					createdAt: true,
					wallets: {
						select: {
							address: true,
							type: true,
							network: true,
							isPrimary: true,
						},
					},
				},
			}).catch(() => null);
		}

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Get player statistics
		const stats = await prisma.playerStats.findMany({
			where: { userId: user.id },
			include: {
				user: false,
			},
		});

		// Get achievements
		const achievements = await prisma.userAchievement.findMany({
			where: { userId: user.id },
			include: {
				achievement: true,
			},
			orderBy: {
				unlockedAt: 'desc',
			},
		});

		// Get recent game results
		const recentGames = await prisma.gameResult.findMany({
			where: { playerId: user.id },
			include: {
				session: {
					include: {
						gameType: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: 10,
		});

		// Calculate overall stats
		const totalGamesPlayed = stats.reduce((sum, s) => sum + s.gamesPlayed, 0);
		const totalGamesWon = stats.reduce((sum, s) => sum + s.gamesWon, 0);
		const totalScore = stats.reduce((sum, s) => sum + s.totalScore, 0);
		const winRate = totalGamesPlayed > 0 ? (totalGamesWon / totalGamesPlayed) * 100 : 0;

		res.json({
			user,
			stats: {
				byGame: stats,
				overall: {
					totalGamesPlayed,
					totalGamesWon,
					totalScore,
					winRate: Math.round(winRate * 10) / 10,
				},
			},
			achievements: achievements.map((ua) => ({
				...ua.achievement,
				unlockedAt: ua.unlockedAt,
			})),
			recentGames: recentGames.map((result) => ({
				id: result.id,
				gameType: result.session.gameType.name,
				gameTypeCode: result.session.gameType.code,
				score: result.score,
				rank: result.rank,
				createdAt: result.createdAt,
				sessionId: result.sessionId,
			})),
		});
	} catch (error) {
		console.error('Profile fetch error:', error);
		res.status(500).json({ error: 'Failed to fetch profile' });
	}
});

// Get list of all players
router.get('/players/list', async (req, res) => {
	try {
		const { limit = 100 } = req.query;

		const users = await prisma.user.findMany({
			select: {
				id: true,
				username: true,
				displayName: true,
				avatar: true,
				level: true,
				experience: true,
				coins: true,
				createdAt: true,
				playerStats: {
					select: {
						totalScore: true,
						gamesPlayed: true,
						gamesWon: true,
					},
				},
			},
			take: parseInt(limit),
			orderBy: {
				level: 'desc',
			},
		});

		const players = users.map((user) => {
			const totalScore = user.playerStats.reduce((sum, s) => sum + s.totalScore, 0);
			const totalGames = user.playerStats.reduce((sum, s) => sum + s.gamesPlayed, 0);
			const totalWins = user.playerStats.reduce((sum, s) => sum + s.gamesWon, 0);
			const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

			return {
				id: user.id,
				username: user.username,
				displayName: user.displayName,
				avatar: user.avatar,
				level: user.level,
				experience: user.experience,
				coins: user.coins,
				createdAt: user.createdAt,
				stats: {
					totalGames,
					totalWins,
					totalScore,
					winRate,
				},
			};
		});

		res.json({ players, total: players.length });
	} catch (error) {
		console.error('Players list fetch error:', error);
		res.status(500).json({ error: 'Failed to fetch players list' });
	}
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
	try {
		const { gameType = 'global', period = 'alltime' } = req.query;

		// Get all users with their total scores
		const users = await prisma.user.findMany({
			select: {
				id: true,
				username: true,
				displayName: true,
				avatar: true,
				level: true,
				experience: true,
				playerStats: {
					select: {
						totalScore: true,
						gamesPlayed: true,
						gamesWon: true,
					},
				},
			},
		});

		// Calculate rankings
		const rankings = users
			.map((user) => {
				const totalScore = user.playerStats.reduce((sum, s) => sum + s.totalScore, 0);
				const totalGames = user.playerStats.reduce((sum, s) => sum + s.gamesPlayed, 0);
				const totalWins = user.playerStats.reduce((sum, s) => sum + s.gamesWon, 0);
				const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

				return {
					userId: user.id,
					username: user.username,
					displayName: user.displayName,
					avatar: user.avatar,
					level: user.level,
					experience: user.experience,
					totalScore,
					totalGames,
					totalWins,
					winRate: Math.round(winRate * 10) / 10,
				};
			})
			.filter((user) => user.totalGames > 0) // Only users who played games
			.sort((a, b) => b.totalScore - a.totalScore) // Sort by score
			.map((user, index) => ({
				...user,
				rank: index + 1,
			}));

		res.json({
			period,
			gameType,
			rankings,
			totalPlayers: rankings.length,
		});
	} catch (error) {
		console.error('Leaderboard fetch error:', error);
		res.status(500).json({ error: 'Failed to fetch leaderboard' });
	}
});

export default router;

