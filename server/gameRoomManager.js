import { createGame, GAME_TYPES } from './games/index.js';
import GameSessionManager from './lib/game-session-manager.js';

// Менеджер игровых комнат
class GameRoomManager {
	constructor() {
		this.rooms = new Map(); // roomId -> { game, sockets: Set(), info: {} }
		this.playerToRoom = new Map(); // playerId -> roomId
		this.gameLoops = new Map(); // roomId -> intervalId
	}

	// Создать новую игровую комнату
	createRoom(roomId, gameType, config = {}) {
		if (this.rooms.has(roomId)) {
			throw new Error(`Room ${roomId} already exists`);
		}

		const game = createGame(gameType, roomId, config);
		
		// Extended room info
		const roomInfo = {
			id: roomId,
			name: config.name || `Room ${roomId}`,
			gameType,
			hostId: config.hostId || 'system',
			hostName: config.hostName || 'Host',
			hostUserId: config.userId || null, // Store actual user ID from auth
			maxPlayers: config.maxPlayers || 4,
			currentPlayers: 0,
			hasPassword: !!config.password,
			hostParticipates: !!config.hostParticipates,
			password: config.password || null,
			status: 'waiting',
			createdAt: Date.now(),
			players: [],
		};

		this.rooms.set(roomId, {
			game,
			sockets: new Set(),
			info: roomInfo,
			createdAt: Date.now(),
		});

		// Save room to database if user is authenticated
		if (roomInfo.hostUserId) {
			GameSessionManager.createGameRoom(
				roomId,
				gameType,
				roomInfo.hostUserId,
				config
			).catch(err => console.error('[GameRoomManager] Error creating room in DB:', err));
		}

		// Запустить игровой цикл для этой комнаты
		this.startGameLoop(roomId);

		console.log(`[GameRoomManager] Created room ${roomId} (${roomInfo.name}) with game type ${gameType}`);
		return game;
	}

	// Get list of all active rooms (public info only)
	getActiveRooms() {
		const activeRooms = [];
		this.rooms.forEach((room) => {
			// Don't include password in public list
			const { password, ...publicInfo } = room.info;
			
			// Ensure id exists (use roomId if id is missing)
			const roomData = {
				...publicInfo,
				id: publicInfo.id || publicInfo.roomId || room.info.id,
				currentPlayers: room.game.players.size,
				players: Array.from(room.game.players.values()).map(p => ({
					id: p.id,
					name: p.name,
					isHost: p.id === room.info.hostId,
					isReady: false, // TODO: implement ready system
					joinedAt: Date.now(),
				})),
			};
			
			activeRooms.push(roomData);
		});
		return activeRooms;
	}

	// Validate room password
	validateRoomPassword(roomId, password) {
		const room = this.rooms.get(roomId);
		if (!room) return false;
		
		if (!room.info.hasPassword) return true;
		return room.info.password === password;
	}

	// Update room status
	updateRoomStatus(roomId, status) {
		const room = this.rooms.get(roomId);
		if (room) {
			room.info.status = status;
		}
	}

	// Получить игру по ID комнаты
	getRoom(roomId) {
		return this.rooms.get(roomId);
	}

	// Присоединить игрока к комнате
	joinRoom(roomId, socket, playerName, walletAddress = null) {
		const room = this.rooms.get(roomId);
		if (!room) {
			throw new Error(`Room ${roomId} not found`);
		}

		// Добавляем сокет в комнату (если еще не добавлен)
		if (!room.sockets.has(socket)) {
			room.sockets.add(socket);
		}
		this.playerToRoom.set(socket.id, roomId);

		// Get userId from socket authentication (if available)
		const userId = socket.user?.userId || null;

		// Проверяем, не добавлен ли уже игрок
		if (room.game.players.has(socket.id)) {
			const existingPlayer = room.game.players.get(socket.id);
			if (existingPlayer?.gameOver) {
				console.log(`[GameRoomManager] Resetting player ${playerName} for new session in room ${roomId}`);
				room.game.players.delete(socket.id);
				const resetData = room.game.addPlayer(socket.id, playerName, userId, walletAddress);
				return { room, playerData: resetData };
			}
			console.log(`[GameRoomManager] Player ${playerName} already in room ${roomId}`);
			return { room, playerData: existingPlayer.getPlayerData() };
		}

		// Добавляем игрока в игру с walletAddress
		const playerData = room.game.addPlayer(socket.id, playerName, userId, walletAddress);

		// Update room player count in database
		if (room.info.hostUserId) {
			GameSessionManager.updateRoomPlayerCount(roomId, room.game.players.size)
				.catch(err => console.error('[GameRoomManager] Error updating player count:', err));
		}

		console.log(`[GameRoomManager] Player ${playerName} (${socket.id}) joined room ${roomId}, userId: ${userId || 'guest'}, wallet: ${walletAddress || 'none'}`);
		return { room, playerData };
	}

	// Покинуть комнату
	leaveRoom(socketId) {
		const roomId = this.playerToRoom.get(socketId);
		if (!roomId) return null;

		const room = this.rooms.get(roomId);
		if (!room) return null;

		// Check if this socket is a player or just a screen
		const isPlayer = room.game.players.has(socketId);

		if (isPlayer) {
			// Remove player from game
			room.game.removePlayer(socketId);
		}

		// Remove socket from room
		room.sockets.forEach((s) => {
			if (s.id === socketId) {
				room.sockets.delete(s);
			}
		});

		this.playerToRoom.delete(socketId);

		// Only close room if no players left (not just no sockets)
		// This allows the game screen to stay open even if all players disconnect
		if (room.game.players.size === 0 && room.sockets.size === 0) {
			this.closeRoom(roomId);
		}

		console.log(
			`Socket ${socketId} left room ${roomId}, isPlayer: ${isPlayer}`
		);
		return roomId;
	}

	// Закрыть комнату
	closeRoom(roomId) {
		const room = this.rooms.get(roomId);
		if (!room) return;

		// Останавливаем игровой цикл
		this.stopGameLoop(roomId);

		// Удаляем комнату
		this.rooms.delete(roomId);

		console.log(`Closed room ${roomId}`);
	}

	// Запустить игровой цикл для комнаты
	startGameLoop(roomId) {
		const room = this.rooms.get(roomId);
		if (!room) return;

		let lastUpdate = Date.now();
		const intervalId = setInterval(async () => {
			const now = Date.now();
			const deltaTime = (now - lastUpdate) / 1000;
			lastUpdate = now;

			// Обновляем состояние игры
			room.game.update(deltaTime);

			// Check for collision events (for race game)
			if (room.game.gameType === 'race') {
				for (const [, player] of room.game.players) {
					// Check if player had a collision in last 100ms
					if (player.lastCollisionTime && Date.now() - player.lastCollisionTime < 100) {
						// Send collision event to this player
						const socket = Array.from(room.sockets).find(s => s.id === player.id);
						if (socket) {
							socket.emit('collision', { playerId: player.id, timestamp: Date.now() });
						}
						// Reset collision time
						player.lastCollisionTime = 0;
					}
				}
			}

			// Check for respawn events (for shooter game)
			if (room.game.gameType === 'shooter') {
				// Check if any player respawned
				for (const [, player] of room.game.players) {
					if (player.checkRespawn && player.checkRespawn()) {
						player.respawn(room.game.worldWidth, room.game.worldHeight, room.game.playerSize);
						// Notify all clients about respawn
						room.sockets.forEach((socket) => {
							socket.emit('playerRespawned', { 
								playerId: player.id, 
								playerData: player.getPlayerData() 
							});
						});
					}
				}
			}

			// Check for game over conditions (for shooter game)
			if (room.game.gameType === 'shooter') {
				const gameOverResult = room.game.checkGameOver();
				if (gameOverResult.gameOver) {
					// Save result to blockchain
					try {
						const blockchainResult = await room.game.saveGameResultToBlockchain(gameOverResult.player.id);
						console.log(`[GameRoomManager] Game over for player ${gameOverResult.player.id}, blockchain result:`, blockchainResult);
						
						// Notify all players about game over
						room.sockets.forEach((socket) => {
							socket.emit('gameOver', {
								player: gameOverResult.player,
								finalScore: gameOverResult.finalScore,
								blockchainResult: blockchainResult
							});
						});
					} catch (error) {
						console.error('[GameRoomManager] Error saving game result to blockchain:', error);
					}
				}
			}

			// Отправляем состояние всем игрокам в комнате
			const gameState = room.game.getGameState();
			room.sockets.forEach((socket) => {
				socket.emit('gameState', gameState);
			});
		}, 1000 / 60); // 60 FPS

		this.gameLoops.set(roomId, intervalId);
	}

	// Остановить игровой цикл для комнаты
	stopGameLoop(roomId) {
		const intervalId = this.gameLoops.get(roomId);
		if (intervalId) {
			clearInterval(intervalId);
			this.gameLoops.delete(roomId);
		}
	}

	// Получить комнату по ID игрока
	getRoomByPlayerId(playerId) {
		const roomId = this.playerToRoom.get(playerId);
		return roomId ? this.rooms.get(roomId) : null;
	}

	// Получить список всех активных комнат
	getActiveRooms() {
		const rooms = [];
		for (const [roomId, room] of this.rooms) {
			rooms.push({
				roomId,
				gameType: room.game.gameType,
				playerCount: room.game.players.size,
				createdAt: room.createdAt,
			});
		}
		return rooms;
	}

	// Обработать ввод игрока
	handlePlayerInput(socketId, input) {
		const room = this.getRoomByPlayerId(socketId);
		if (!room) return;

		room.game.handlePlayerInput(socketId, input);
	}

	// Обработать прицеливание игрока (для шутера)
	handlePlayerAim(socketId, direction) {
		const room = this.getRoomByPlayerId(socketId);
		if (!room || !room.game.handlePlayerAim) return;

		room.game.handlePlayerAim(socketId, direction);
	}

	// Обработать выстрел игрока (для шутера)
	handlePlayerShoot(socketId) {
		const room = this.getRoomByPlayerId(socketId);
		if (!room || !room.game.handlePlayerShoot) return;

		const bullet = room.game.handlePlayerShoot(socketId);
		return bullet;
	}

	// Обновить размеры мира
	handleScreenDimensions(socketId, dimensions) {
		const room = this.getRoomByPlayerId(socketId);
		if (!room || !room.game.updateWorldSize) return;

		const newDimensions = room.game.updateWorldSize(
			dimensions.width,
			dimensions.height
		);

		// Отправляем обновлённые размеры всем в комнате
		room.sockets.forEach((socket) => {
			socket.emit('worldDimensions', newDimensions);
		});

		return newDimensions;
	}

	// Save player's post-game signature
	handlePlayerResultSignature(playerId, signaturePayload) {
		const roomId = this.playerToRoom.get(playerId);
		if (!roomId) return null;

		const room = this.rooms.get(roomId);
		if (!room || typeof room.game.recordPlayerSignature !== 'function') {
			return null;
		}

		const result = room.game.recordPlayerSignature(playerId, signaturePayload);
		if (result) {
			room.sockets.forEach((socket) => {
				socket.emit('playerSignatureRecorded', {
					playerId,
					signature: result,
				});
			});

			const player = room.game.players.get(playerId);
			if (player?.gameOver && !player.resultSubmitted) {
				room.game
					.saveGameResultToBlockchain(playerId)
					.then((blockchainResult) => {
						if (blockchainResult) {
							room.sockets.forEach((socket) => {
								socket.emit('gameResultSubmitted', {
									playerId,
									blockchainResult,
								});
							});
						}
					})
					.catch((error) => {
						console.error('[GameRoomManager] Error saving result after signature:', error);
					});
			}
		}

		return result;
	}

	// Отправить событие всем игрокам в комнате
	broadcastToRoom(roomId, event, data) {
		const room = this.rooms.get(roomId);
		if (!room) return;

		room.sockets.forEach((socket) => {
			socket.emit(event, data);
		});
	}
}

// Export singleton instance
const gameRoomManager = new GameRoomManager();
export default gameRoomManager;
export { GameRoomManager };
