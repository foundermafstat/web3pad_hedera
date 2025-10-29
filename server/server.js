import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import GameRoomManager from './gameRoomManager.js';
import { GAME_TYPES, GAME_INFO } from './games/index.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import gameSessionRoutes from './routes/game-sessions.js';
import walletRoutes from './routes/wallet.js';
import gamesRoutes from './routes/games.js';
import contractRoutes from './routes/contracts-simple.js';
import swapRoutes from './routes/swap.js';
import prisma from './lib/prisma.js';
import { socketAuthMiddleware } from './middleware/auth.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
});

// Apply socket auth middleware
io.use(socketAuthMiddleware);

const PORT = process.env.PORT || 3001;

// CORS middleware for Express routes
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200);
	}
	next();
});

// Parse JSON bodies
app.use(express.json());

// Инициализируем менеджер игровых комнат
const roomManager = GameRoomManager;

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));

// Auth routes
app.use('/api/auth', authRoutes);

// Profile and leaderboard routes
app.use('/api', profileRoutes);

// Wallet routes
app.use('/api/profile', walletRoutes);

// Game session routes
app.use('/api', gameSessionRoutes);

// Games routes
app.use('/api/games', gamesRoutes);

// Contract routes
app.use('/api/contracts', contractRoutes);
app.use('/api/swap', swapRoutes);

// Blockchain routes

app.get('/api/rooms', (req, res) => {
	const rooms = roomManager.getActiveRooms();
	res.json(rooms);
});

// Health check
app.get('/api/health', async (req, res) => {
	try {
		// Test database connection
		await prisma.$queryRaw`SELECT 1`;
		res.json({ 
			status: 'ok', 
			database: 'connected',
			timestamp: new Date().toISOString() 
		});
	} catch (error) {
		res.status(500).json({ 
			status: 'error', 
			database: 'disconnected',
			error: error.message 
		});
	}
});

// Broadcast room list to all connected clients
function broadcastRoomList() {
	const rooms = roomManager.getActiveRooms();
	io.emit('rooms:list', rooms);
}

// Socket handling
io.on('connection', (socket) => {
	console.log('User connected:', socket.id);

	// Send current rooms list on connection
	socket.emit('rooms:list', roomManager.getActiveRooms());

	// Создать новую комнату
	socket.on('createRoom', ({ gameType, roomId, config }) => {
		try {
			let game;
			let room = roomManager.getRoom(roomId);

			// If room doesn't exist, create it
			if (!room) {
				game = roomManager.createRoom(roomId, gameType, config);
				room = roomManager.getRoom(roomId);
				console.log(`Room ${roomId} created with type ${gameType}`);
			} else {
				game = room.game;
				console.log(
					`Room ${roomId} already exists, connecting screen to existing room`
				);
			}

			// Add the game screen socket to the room so it receives gameState
			if (room) {
				room.sockets.add(socket);
				// Also track this socket-room relationship
				roomManager.playerToRoom.set(socket.id, roomId);
			}

			socket.emit('roomCreated', {
				roomId,
				gameType,
				gameInfo: game.getGameInfo(),
			});
			console.log(`Screen ${socket.id} connected to room ${roomId}`);
		} catch (error) {
			socket.emit('error', { message: error.message });
			console.error('Error creating room:', error);
		}
	});

	// Присоединиться к комнате
	socket.on('joinRoom', ({ roomId, playerName, walletAddress }) => {
		try {
			const { room, playerData } = roomManager.joinRoom(
				roomId,
				socket,
				playerName,
				walletAddress
			);

			// Отправляем подтверждение присоединившемуся игроку
			socket.emit('playerJoined', {
				playerId: socket.id,
				roomId,
				gameType: room.game.gameType,
				playerData,
				gameConfig: room.game.config,
			});

			// Уведомляем всех в комнате о новом игроке
			roomManager.broadcastToRoom(roomId, 'playerConnected', playerData);

			console.log(`Player ${playerName} joined room ${roomId}, wallet: ${walletAddress || 'none'}`);
		} catch (error) {
			socket.emit('error', { message: error.message });
			console.error('Error joining room:', error);
		}
	});

	// Получить размеры экрана
	socket.on('screenDimensions', (dimensions) => {
		try {
			const newDimensions = roomManager.handleScreenDimensions(
				socket.id,
				dimensions
			);
			if (newDimensions) {
				console.log(
					`Updated world dimensions: ${newDimensions.width}x${newDimensions.height}`
				);
			}
		} catch (error) {
			console.error('Error updating screen dimensions:', error);
		}
	});

	// Обработка ввода игрока
	socket.on('playerInput', (input) => {
		try {
			roomManager.handlePlayerInput(socket.id, input);
		} catch (error) {
			console.error('Error handling player input:', error);
		}
	});

	// Обработка прицеливания (для шутера)
	socket.on('playerAim', (direction) => {
		try {
			roomManager.handlePlayerAim(socket.id, direction);
		} catch (error) {
			console.error('Error handling player aim:', error);
		}
	});

	// Обработка выстрела (для шутера)
	socket.on('playerShoot', () => {
		try {
			const bullet = roomManager.handlePlayerShoot(socket.id);
			if (bullet) {
				const room = roomManager.getRoomByPlayerId(socket.id);
				if (room) {
					const player = room.game.players.get(socket.id);
					console.log(`Player ${player?.name || socket.id} shot bullet`);
				}
			}
		} catch (error) {
			console.error('Error handling player shoot:', error);
		}
	});

	// New unified game events
	socket.on('game:create', ({ roomId, gameType, config }) => {
		try {
			let game;
			let room = roomManager.getRoom(roomId);

			if (!room) {
				game = roomManager.createRoom(roomId, gameType, config);
				room = roomManager.getRoom(roomId);
				console.log(`[game:create] Room ${roomId} created with type ${gameType}`);
			} else {
				game = room.game;
				console.log(`[game:create] Room ${roomId} already exists`);
			}

			if (room) {
				room.sockets.add(socket);
				roomManager.playerToRoom.set(socket.id, roomId);
			}

			socket.emit('game:created', {
				roomId,
				gameType,
				gameInfo: game.getGameInfo(),
			});
		} catch (error) {
			socket.emit('error', { message: error.message });
			console.error('Error creating game:', error);
		}
	});

	socket.on('controller:join', ({ roomId, gameType, playerId, controllerType }) => {
		try {
			let room = roomManager.getRoom(roomId);
			
			if (!room) {
				console.log(`[controller:join] Room ${roomId} doesn't exist, creating it`);
				roomManager.createRoom(roomId, gameType, {});
				room = roomManager.getRoom(roomId);
			}

			if (room) {
				room.sockets.add(socket);
				roomManager.playerToRoom.set(socket.id, roomId);
			}

			// Notify game screen about new controller
			roomManager.broadcastToRoom(roomId, 'controller:joined', { 
				id: playerId, 
				controllerType: controllerType || 'mobile',
				joinedAt: new Date().toISOString()
			}, socket.id);
			
			// Also send player:joined for compatibility
			roomManager.broadcastToRoom(roomId, 'player:joined', { playerId, controllerType }, socket.id);
			
			console.log(`[controller:join] Controller ${playerId} joined room ${roomId} with ${controllerType || 'standard'} controller`);
		} catch (error) {
			console.error('Error joining controller:', error);
		}
	});

	// Shooter game specific handlers
	socket.on('shooter:auth', ({ roomId, walletAddress, playerName }) => {
		try {
			let room = roomManager.getRoom(roomId);
			
			if (!room) {
				console.log(`[shooter:auth] Room ${roomId} doesn't exist, creating it`);
				// Create room with proper configuration
				roomManager.createRoom(roomId, 'shooter', {
					name: `Shooter Room ${roomId}`,
					maxPlayers: 4,
					hostId: socket.id,
					hostName: playerName
				});
				room = roomManager.getRoom(roomId);
			}

			// Add socket to room first
			if (room) {
				room.sockets.add(socket);
				roomManager.playerToRoom.set(socket.id, roomId);
			}

			// Add player to game with wallet address
			const { room: gameRoom, playerData } = roomManager.joinRoom(
				roomId,
				socket,
				playerName,
				walletAddress
			);

			socket.emit('shooter:auth:success', {
				playerId: socket.id,
				roomId,
				playerData,
				gameConfig: gameRoom.game.config,
			});

			// Notify all players about new player
			roomManager.broadcastToRoom(roomId, 'shooter:player:joined', playerData);
			
			console.log(`[shooter:auth] Player ${playerName} authenticated in room ${roomId} with wallet ${walletAddress}`);
		} catch (error) {
			socket.emit('shooter:auth:error', { message: error.message });
			console.error('Error in shooter auth:', error);
		}
	});

	// Gyroscope data from controller
	socket.on('controller:gyro', (data) => {
		try {
			const roomId = roomManager.playerToRoom.get(socket.id);
			if (roomId) {
				// Broadcast gyro data to game screen
				roomManager.broadcastToRoom(roomId, 'controller:gyro', data, socket.id);
			}
		} catch (error) {
			console.error('Error handling gyro data:', error);
		}
	});

	// Send vibration command from game to controller
	socket.on('game:vibrate', ({ playerId, duration, pattern }) => {
		try {
			const roomId = roomManager.playerToRoom.get(socket.id);
			if (roomId) {
				const room = roomManager.getRoom(roomId);
				if (room) {
					// Find the player's socket and send vibration
					room.sockets.forEach((clientSocket) => {
						// Check if this socket matches the playerId
						if (playerId.includes(clientSocket.id)) {
							clientSocket.emit('controller:vibrate', { duration, pattern });
							console.log(`[game:vibrate] Sent vibration to ${playerId}`);
						}
					});
				}
			}
		} catch (error) {
			console.error('Error sending vibration:', error);
		}
	});

	// Room management events
	socket.on('rooms:list', () => {
		socket.emit('rooms:list', roomManager.getActiveRooms());
	});

	socket.on('room:create', (data) => {
		try {
			const roomId = `room-${Math.random().toString(36).substring(2, 9)}`;
			const { name, gameType, maxPlayers, password, hostName, userId, hostParticipates } = data;

			console.log('[room:create]', { 
				roomId, 
				name, 
				gameType, 
				maxPlayers, 
				hasPassword: !!password,
				hostParticipates: !!hostParticipates,
				isAuthenticated: !socket.user?.isGuest,
				userId: socket.user?.userId || userId
			});

			// Get user info
			const actualHostName = hostName || 
				socket.user?.username || 
				`Host-${socket.id.substring(0, 4)}`;

			const game = roomManager.createRoom(roomId, gameType, {
				name,
				maxPlayers,
				password,
				hostId: socket.id,
				hostName: actualHostName,
				userId: socket.user?.userId || userId,
				hostParticipates: !!hostParticipates,
			});

			// Notify creator first (for redirect) before broadcasting
			socket.emit('room:created', {
				roomId,
				gameInfo: game.getGameInfo(),
				hostParticipates: !!hostParticipates,
			});

			// Then broadcast updated room list to all clients (including creator)
			// Creator will see it in the list but duplicate check prevents double-add
			broadcastRoomList();

			console.log(`[room:create] Room ${roomId} (${name}) created by ${socket.id}, host participates: ${!!hostParticipates}`);
		} catch (error) {
			socket.emit('error', { message: error.message });
			console.error('Error creating room:', error);
		}
	});

	socket.on('room:join', ({ roomId, playerName, password, walletAddress }) => {
		try {
			// Validate password if room has one
			if (!roomManager.validateRoomPassword(roomId, password)) {
				socket.emit('error', { message: 'Incorrect password' });
				return;
			}

			const { room, playerData } = roomManager.joinRoom(roomId, socket, playerName, walletAddress);

			socket.emit('room:joined', {
				roomId,
				playerId: socket.id,
				playerData,
				gameType: room.game.gameType,
			});

			// Broadcast updated room list
			broadcastRoomList();

			console.log(`[room:join] Player ${playerName} joined room ${roomId}, wallet: ${walletAddress || 'none'}`);
		} catch (error) {
			socket.emit('error', { message: error.message });
			console.error('Error joining room:', error);
		}
	});

	// Shooter game input handlers
	socket.on('shooter:input', ({ input }) => {
		try {
			roomManager.handlePlayerInput(socket.id, input);
		} catch (error) {
			console.error('Error handling shooter input:', error);
		}
	});

	socket.on('shooter:aim', ({ direction }) => {
		try {
			roomManager.handlePlayerAim(socket.id, direction);
		} catch (error) {
			console.error('Error handling shooter aim:', error);
		}
	});

	socket.on('shooter:shoot', () => {
		try {
			roomManager.handlePlayerShoot(socket.id);
		} catch (error) {
			console.error('Error handling shooter shoot:', error);
		}
	});

	// Отключение
	socket.on('disconnect', () => {
		try {
			const roomId = roomManager.leaveRoom(socket.id);
			if (roomId) {
				roomManager.broadcastToRoom(roomId, 'playerDisconnected', socket.id);
				roomManager.broadcastToRoom(roomId, 'player:left', { playerId: socket.id });
				roomManager.broadcastToRoom(roomId, 'controller:left', socket.id);
				console.log(`Player ${socket.id} disconnected from room ${roomId}`);
				
				// Broadcast updated room list
				broadcastRoomList();
			}
		} catch (error) {
			console.error('Error handling disconnect:', error);
		}
	});
});

server.listen(PORT, () => {
	console.log(`W3P server running on port ${PORT}`);
	console.log(`Available game types:`, Object.keys(GAME_TYPES));
});
