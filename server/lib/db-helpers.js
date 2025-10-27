import prisma from './prisma.js';
import bcrypt from 'bcryptjs';

/**
 * User Management
 */
export async function createUser({ email, username, password, displayName }) {
	const hashedPassword = await bcrypt.hash(password, 10);

	return await prisma.user.create({
		data: {
			email,
			username,
			password: hashedPassword,
			displayName,
		},
	});
}

export async function findUserByEmail(email) {
	return await prisma.user.findUnique({
		where: { email },
	});
}

export async function findUserByUsername(username) {
	return await prisma.user.findUnique({
		where: { username },
	});
}

export async function verifyPassword(password, hashedPassword) {
	return await bcrypt.compare(password, hashedPassword);
}

export async function updateUserStats(userId, { experience, coins, level }) {
	return await prisma.user.update({
		where: { id: userId },
		data: {
			...(experience !== undefined && { experience }),
			...(coins !== undefined && { coins }),
			...(level !== undefined && { level }),
		},
	});
}

/**
 * Game Room Management
 */
export async function createGameRoom({
	roomId,
	name,
	gameTypeCode,
	hostId,
	maxPlayers,
	password,
	config,
}) {
	// Get game type by code
	const gameType = await prisma.gameType.findUnique({
		where: { code: gameTypeCode },
	});

	if (!gameType) {
		throw new Error(`Game type ${gameTypeCode} not found`);
	}

	const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

	return await prisma.gameRoom.create({
		data: {
			roomId,
			name,
			gameTypeId: gameType.id,
			hostId,
			maxPlayers,
			hasPassword: !!password,
			password: hashedPassword,
			config,
		},
		include: {
			gameType: true,
			host: {
				select: {
					id: true,
					username: true,
					displayName: true,
					avatar: true,
				},
			},
		},
	});
}

export async function findGameRoomByRoomId(roomId) {
	return await prisma.gameRoom.findUnique({
		where: { roomId },
		include: {
			gameType: true,
			host: {
				select: {
					id: true,
					username: true,
					displayName: true,
					avatar: true,
				},
			},
		},
	});
}

export async function updateGameRoomPlayers(roomId, currentPlayers) {
	return await prisma.gameRoom.update({
		where: { roomId },
		data: { currentPlayers },
	});
}

export async function updateGameRoomStatus(roomId, status) {
	const data = { status };
	if (status === 'finished') {
		data.closedAt = new Date();
	}

	return await prisma.gameRoom.update({
		where: { roomId },
		data,
	});
}

export async function getActiveGameRooms() {
	return await prisma.gameRoom.findMany({
		where: {
			status: { in: ['waiting', 'playing'] },
		},
		include: {
			gameType: true,
			host: {
				select: {
					id: true,
					username: true,
					displayName: true,
					avatar: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
	});
}

export async function verifyRoomPassword(roomId, password) {
	const room = await prisma.gameRoom.findUnique({
		where: { roomId },
		select: { password: true, hasPassword: true },
	});

	if (!room) return false;
	if (!room.hasPassword) return true;
	if (!password || !room.password) return false;

	return await bcrypt.compare(password, room.password);
}

/**
 * Game Session Management
 */
export async function createGameSession({
	gameRoomId,
	gameTypeCode,
	hostId,
	gameData,
}) {
	const gameType = await prisma.gameType.findUnique({
		where: { code: gameTypeCode },
	});

	if (!gameType) {
		throw new Error(`Game type ${gameTypeCode} not found`);
	}

	return await prisma.gameSession.create({
		data: {
			gameRoomId,
			gameTypeId: gameType.id,
			hostId,
			gameData,
		},
		include: {
			gameType: true,
		},
	});
}

export async function endGameSession(sessionId, gameData) {
	return await prisma.gameSession.update({
		where: { id: sessionId },
		data: {
			status: 'completed',
			endedAt: new Date(),
			duration: gameData?.duration,
			gameData,
		},
	});
}

/**
 * Game Results
 */
export async function saveGameResult({
	sessionId,
	playerId,
	playerName,
	score,
	kills,
	deaths,
	lapTime,
	questionsRight,
	questionsTotal,
	rank,
	performance,
	achievements,
}) {
	return await prisma.gameResult.create({
		data: {
			sessionId,
			playerId,
			playerName,
			score,
			kills,
			deaths,
			lapTime,
			questionsRight,
			questionsTotal,
			rank,
			performance,
			achievements,
		},
	});
}

export async function getPlayerResults(playerId, gameTypeCode, limit = 10) {
	const gameType = await prisma.gameType.findUnique({
		where: { code: gameTypeCode },
	});

	if (!gameType) return [];

	return await prisma.gameResult.findMany({
		where: {
			playerId,
			session: {
				gameTypeId: gameType.id,
			},
		},
		include: {
			session: {
				include: {
					gameType: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
		take: limit,
	});
}

/**
 * Player Statistics
 */
export async function updatePlayerStats(userId, gameTypeCode, result) {
	const gameType = await prisma.gameType.findUnique({
		where: { code: gameTypeCode },
	});

	if (!gameType) {
		throw new Error(`Game type ${gameTypeCode} not found`);
	}

	// Get or create player stats
	let stats = await prisma.playerStats.findUnique({
		where: {
			userId_gameTypeId: {
				userId,
				gameTypeId: gameType.id,
			},
		},
	});

	if (!stats) {
		stats = await prisma.playerStats.create({
			data: {
				userId,
				gameTypeId: gameType.id,
			},
		});
	}

	// Calculate new stats
	const gamesPlayed = stats.gamesPlayed + 1;
	const gamesWon = result.rank === 1 ? stats.gamesWon + 1 : stats.gamesWon;
	const totalScore = stats.totalScore + (result.score || 0);
	const highestScore = Math.max(stats.highestScore, result.score || 0);
	const averageScore = totalScore / gamesPlayed;
	const winRate = (gamesWon / gamesPlayed) * 100;

	// Update stats
	return await prisma.playerStats.update({
		where: {
			userId_gameTypeId: {
				userId,
				gameTypeId: gameType.id,
			},
		},
		data: {
			gamesPlayed,
			gamesWon,
			gamesLost: gamesPlayed - gamesWon,
			totalScore,
			highestScore,
			averageScore,
			winRate,
			...(result.kills !== undefined && {
				totalKills: (stats.totalKills || 0) + result.kills,
			}),
			...(result.deaths !== undefined && {
				totalDeaths: (stats.totalDeaths || 0) + result.deaths,
			}),
			...(result.lapTime !== undefined && {
				bestLapTime: stats.bestLapTime
					? Math.min(stats.bestLapTime, result.lapTime)
					: result.lapTime,
			}),
			...(result.questionsRight !== undefined && {
				questionsAnswered:
					(stats.questionsAnswered || 0) + (result.questionsTotal || 0),
				questionsCorrect:
					(stats.questionsCorrect || 0) + result.questionsRight,
			}),
			lastPlayedAt: new Date(),
		},
	});
}

export async function getPlayerStats(userId, gameTypeCode) {
	const gameType = await prisma.gameType.findUnique({
		where: { code: gameTypeCode },
	});

	if (!gameType) return null;

	return await prisma.playerStats.findUnique({
		where: {
			userId_gameTypeId: {
				userId,
				gameTypeId: gameType.id,
			},
		},
		include: {
			user: {
				select: {
					username: true,
					displayName: true,
					avatar: true,
				},
			},
		},
	});
}

/**
 * Game Content
 */
export async function getGameContent(gameTypeCode, type, category = null) {
	const gameType = await prisma.gameType.findUnique({
		where: { code: gameTypeCode },
	});

	if (!gameType) return [];

	return await prisma.gameContent.findMany({
		where: {
			gameTypeId: gameType.id,
			type,
			...(category && { category }),
			isActive: true,
		},
	});
}

export async function createGameContent(gameTypeCode, { type, category, difficulty, data }) {
	const gameType = await prisma.gameType.findUnique({
		where: { code: gameTypeCode },
	});

	if (!gameType) {
		throw new Error(`Game type ${gameTypeCode} not found`);
	}

	return await prisma.gameContent.create({
		data: {
			gameTypeId: gameType.id,
			type,
			category,
			difficulty,
			data,
		},
	});
}

/**
 * Leaderboard
 */
export async function getLeaderboard(gameTypeCode, period = 'alltime', limit = 100) {
	const where = {};

	if (gameTypeCode) {
		const gameType = await prisma.gameType.findUnique({
			where: { code: gameTypeCode },
		});
		if (gameType) {
			where.gameTypeId = gameType.id;
		}
	}

	where.period = period;

	// Get latest leaderboard for the period
	const leaderboard = await prisma.leaderboard.findFirst({
		where,
		orderBy: { createdAt: 'desc' },
	});

	return leaderboard ? leaderboard.rankings : [];
}

/**
 * Achievements
 */
export async function unlockAchievement(userId, achievementCode) {
	const achievement = await prisma.achievement.findUnique({
		where: { code: achievementCode },
	});

	if (!achievement) {
		throw new Error(`Achievement ${achievementCode} not found`);
	}

	// Check if already unlocked
	const existing = await prisma.userAchievement.findUnique({
		where: {
			userId_achievementId: {
				userId,
				achievementId: achievement.id,
			},
		},
	});

	if (existing) return existing;

	return await prisma.userAchievement.create({
		data: {
			userId,
			achievementId: achievement.id,
		},
		include: {
			achievement: true,
		},
	});
}

export async function getUserAchievements(userId) {
	return await prisma.userAchievement.findMany({
		where: { userId },
		include: {
			achievement: true,
		},
		orderBy: { unlockedAt: 'desc' },
	});
}

