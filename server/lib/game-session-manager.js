import prisma from './prisma.js';

/**
 * Game Session Manager
 * Handles creation, tracking, and completion of game sessions
 */

export class GameSessionManager {
	/**
	 * Create a new game room in database
	 */
	static async createGameRoom(roomId, gameTypeCode, hostId, config = {}) {
		try {
			// Find game type
			const gameType = await prisma.gameType.findUnique({
				where: { code: gameTypeCode },
			});

			if (!gameType) {
				console.error('[GameSessionManager] Game type not found:', gameTypeCode);
				return null;
			}

			// Create game room
			const room = await prisma.gameRoom.create({
				data: {
					roomId,
					name: config.name || `${gameType.name} Room`,
					gameTypeId: gameType.id,
					hostId,
					maxPlayers: config.maxPlayers || gameType.maxPlayers,
					hasPassword: !!config.password,
					password: config.password || null,
					status: 'waiting',
					config: config || {},
				},
			});

			console.log(`[GameSessionManager] Room created: ${roomId} (${gameType.name})`);
			return room;
		} catch (error) {
			console.error('[GameSessionManager] Error creating room:', error);
			return null;
		}
	}

	/**
	 * Start a game session
	 */
	static async startGameSession(roomId, gameTypeCode, hostId) {
		try {
			// Find game type
			const gameType = await prisma.gameType.findUnique({
				where: { code: gameTypeCode },
			});

			if (!gameType) {
				console.error('[GameSessionManager] Game type not found:', gameTypeCode);
				return null;
			}

			// Find or create game room
			let gameRoom = await prisma.gameRoom.findUnique({
				where: { roomId },
			});

			// Create session
			const session = await prisma.gameSession.create({
				data: {
					gameRoomId: gameRoom?.id,
					gameTypeId: gameType.id,
					hostId,
					status: 'active',
					gameData: {},
				},
			});

			// Update room status
			if (gameRoom) {
				await prisma.gameRoom.update({
					where: { id: gameRoom.id },
					data: { status: 'playing' },
				});
			}

			console.log(`[GameSessionManager] Session started: ${session.id} for room ${roomId}`);
			return session;
		} catch (error) {
			console.error('[GameSessionManager] Error starting session:', error);
			return null;
		}
	}

	/**
	 * Complete a game session and save results
	 */
	static async completeGameSession(sessionId, results, gameData = {}) {
		try {
			// Calculate duration
			const session = await prisma.gameSession.findUnique({
				where: { id: sessionId },
				include: { gameType: true },
			});

			if (!session) {
				console.error('[GameSessionManager] Session not found:', sessionId);
				return null;
			}

			const duration = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);

			// Update session
			await prisma.gameSession.update({
				where: { id: sessionId },
				data: {
					status: 'completed',
					endedAt: new Date(),
					duration,
					gameData,
				},
			});

			// Save individual player results
			const savedResults = [];
			for (const result of results) {
				const gameResult = await prisma.gameResult.create({
					data: {
						sessionId,
						playerId: result.userId || result.playerId || 'guest',
						playerName: result.playerName || result.username || 'Guest',
						score: result.score || 0,
						kills: result.kills,
						deaths: result.deaths,
						lapTime: result.lapTime,
						questionsRight: result.questionsRight,
						questionsTotal: result.questionsTotal,
						rank: result.rank,
						performance: result.performance || {},
						achievements: result.achievements || [],
					},
				});
				savedResults.push(gameResult);

				// Update player stats if user is registered
				if (result.userId && result.userId !== 'guest') {
					await this.updatePlayerStats(
						result.userId,
						session.gameTypeId,
						result
					);
				}
			}

			// Update room status
			if (session.gameRoomId) {
				await prisma.gameRoom.update({
					where: { id: session.gameRoomId },
					data: { status: 'finished', closedAt: new Date() },
				});
			}

			console.log(`[GameSessionManager] Session completed: ${sessionId}, ${savedResults.length} results saved`);
			return { session, results: savedResults };
		} catch (error) {
			console.error('[GameSessionManager] Error completing session:', error);
			return null;
		}
	}

	/**
	 * Update player statistics
	 */
	static async updatePlayerStats(userId, gameTypeId, result) {
		try {
			// Find or create player stats
			let stats = await prisma.playerStats.findUnique({
				where: {
					userId_gameTypeId: {
						userId,
						gameTypeId,
					},
				},
			});

			const isWin = result.rank === 1;

			if (!stats) {
				// Create new stats
				stats = await prisma.playerStats.create({
					data: {
						userId,
						gameTypeId,
						gamesPlayed: 1,
						gamesWon: isWin ? 1 : 0,
						gamesLost: isWin ? 0 : 1,
						totalScore: result.score || 0,
						highestScore: result.score || 0,
						averageScore: result.score || 0,
						totalKills: result.kills || 0,
						totalDeaths: result.deaths || 0,
						bestLapTime: result.lapTime,
						totalRaceTime: result.lapTime || 0,
						questionsAnswered: result.questionsTotal || 0,
						questionsCorrect: result.questionsRight || 0,
						winRate: isWin ? 100 : 0,
						averageRank: result.rank || null,
						lastPlayedAt: new Date(),
					},
				});
			} else {
				// Update existing stats
				const newGamesPlayed = stats.gamesPlayed + 1;
				const newGamesWon = stats.gamesWon + (isWin ? 1 : 0);
				const newTotalScore = stats.totalScore + (result.score || 0);
				const newAverageScore = newTotalScore / newGamesPlayed;
				const newWinRate = (newGamesWon / newGamesPlayed) * 100;

				// Calculate new average rank
				const newAverageRank = stats.averageRank
					? (stats.averageRank * stats.gamesPlayed + (result.rank || 0)) / newGamesPlayed
					: result.rank || null;

				stats = await prisma.playerStats.update({
					where: {
						userId_gameTypeId: {
							userId,
							gameTypeId,
						},
					},
					data: {
						gamesPlayed: newGamesPlayed,
						gamesWon: newGamesWon,
						gamesLost: newGamesPlayed - newGamesWon,
						totalScore: newTotalScore,
						highestScore: Math.max(stats.highestScore, result.score || 0),
						averageScore: newAverageScore,
						totalKills: (stats.totalKills || 0) + (result.kills || 0),
						totalDeaths: (stats.totalDeaths || 0) + (result.deaths || 0),
						bestLapTime: result.lapTime && (!stats.bestLapTime || result.lapTime < stats.bestLapTime)
							? result.lapTime
							: stats.bestLapTime,
						totalRaceTime: (stats.totalRaceTime || 0) + (result.lapTime || 0),
						questionsAnswered: (stats.questionsAnswered || 0) + (result.questionsTotal || 0),
						questionsCorrect: (stats.questionsCorrect || 0) + (result.questionsRight || 0),
						winRate: newWinRate,
						averageRank: newAverageRank,
						lastPlayedAt: new Date(),
					},
				});
			}

			// Update user level and experience
			const experienceGained = Math.floor((result.score || 0) / 10);
			await this.addUserExperience(userId, experienceGained);

			console.log(`[GameSessionManager] Stats updated for user ${userId}`);
			return stats;
		} catch (error) {
			console.error('[GameSessionManager] Error updating player stats:', error);
			return null;
		}
	}

	/**
	 * Add experience to user and handle level ups
	 */
	static async addUserExperience(userId, experience) {
		try {
			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!user) return;

			const newExperience = user.experience + experience;
			const xpPerLevel = 1000;
			const newLevel = Math.floor(newExperience / xpPerLevel) + 1;

			await prisma.user.update({
				where: { id: userId },
				data: {
					experience: newExperience,
					level: newLevel,
				},
			});

			console.log(`[GameSessionManager] User ${userId} gained ${experience} XP, now level ${newLevel}`);
		} catch (error) {
			console.error('[GameSessionManager] Error adding experience:', error);
		}
	}

	/**
	 * Get active session for a room
	 */
	static async getActiveSession(roomId) {
		try {
			const gameRoom = await prisma.gameRoom.findUnique({
				where: { roomId },
			});

			if (!gameRoom) return null;

			const session = await prisma.gameSession.findFirst({
				where: {
					gameRoomId: gameRoom.id,
					status: 'active',
				},
				orderBy: {
					startedAt: 'desc',
				},
			});

			return session;
		} catch (error) {
			console.error('[GameSessionManager] Error getting active session:', error);
			return null;
		}
	}

	/**
	 * Update room player count
	 */
	static async updateRoomPlayerCount(roomId, playerCount) {
		try {
			await prisma.gameRoom.update({
				where: { roomId },
				data: { currentPlayers: playerCount },
			});
		} catch (error) {
			console.error('[GameSessionManager] Error updating player count:', error);
		}
	}
}

export default GameSessionManager;


