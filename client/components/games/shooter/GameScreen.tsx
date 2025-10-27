'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { io, Socket } from 'socket.io-client';
import { FaArrowLeft, FaUsers, FaBolt, FaQrcode, FaWifi } from 'react-icons/fa';
import dynamic from 'next/dynamic';

const GameQRSheet = dynamic(
	() => import('@/components/GameQRSheet').then((mod) => ({ default: mod.GameQRSheet })),
	{ ssr: false }
);

const GameInterfaceHeader = dynamic(() => import('@/components/GameInterfaceHeader'), {
	ssr: false,
});

interface Player {
	id: string;
	name: string;
	x: number;
	y: number;
	alive: boolean;
	color: string;
	kills: number;
	deaths: number;
	effects: {
		speedBoost: { active: boolean; endTime: number };
		shield: { active: boolean; endTime: number };
	};
	facingDirection?: { x: number; y: number };
	aimDirection?: { x: number; y: number };
	isMoving?: boolean;
}

interface Bullet {
	id: string;
	x: number;
	y: number;
	playerId: string;
}

interface Bot {
	id: string;
	x: number;
	y: number;
	alive: boolean;
	color: string;
	size: number;
	isChasing: boolean;
}

interface Obstacle {
	x: number;
	y: number;
	width: number;
	height: number;
	type: string;
}

interface InteractiveObject {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	type: string;
	active?: boolean;
	cooldown?: number;
}

interface GameScreenProps {
	gameId: string;
	gameType: string;
	onBack: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
	gameId,
	gameType,
	onBack,
}) => {
	console.log('[GameScreen] Rendering with:', { gameId, gameType });
	const pixiContainer = useRef<HTMLDivElement>(null);
	const appRef = useRef<PIXI.Application | null>(null);
	const socketRef = useRef<Socket | null>(null);
	const gameContainerRef = useRef<PIXI.Container | null>(null);
	const playersRef = useRef<Map<string, PIXI.Container>>(new Map());
	const bulletsRef = useRef<Map<string, PIXI.Graphics>>(new Map());
	const botsRef = useRef<Map<string, PIXI.Container>>(new Map());
	const obstaclesRef = useRef<PIXI.Graphics[]>([]);
	const interactiveObjectsRef = useRef<Map<string, PIXI.Container>>(new Map());
	const [connectedPlayers, setConnectedPlayers] = useState<Player[]>([]);
	const [gameStats, setGameStats] = useState({
		totalKills: 0,
		activePlayers: 0,
	});
	const [showQRPopup, setShowQRPopup] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState<
		'connecting' | 'connected' | 'disconnected'
	>('connecting');

	useEffect(() => {
		// Prevent multiple initializations
		if (appRef.current) {
			console.log('[GameScreen] App already exists, skipping initialization');
			return;
		}

		console.log('[GameScreen] Starting initialization...');

		let socket: Socket | null = null;

		// Initialize PIXI (async in v8)
		const initPixi = async () => {
			try {
				console.log('[GameScreen] Starting Pixi.js initialization...');

				// Wait for next frame to ensure layout is complete
				await new Promise((resolve) => requestAnimationFrame(resolve));
				// Wait one more frame to ensure all styles are applied
				await new Promise((resolve) => requestAnimationFrame(resolve));

				// Get actual container dimensions instead of window dimensions
				const containerElement = pixiContainer.current;
				if (!containerElement) {
					console.error('[GameScreen] Container element not found');
					return;
				}

				console.log('[GameScreen] Container element found:', {
					width: containerElement.clientWidth,
					height: containerElement.clientHeight,
					childrenCount: containerElement.children.length,
				});

				// Calculate proper dimensions - use full container size
				const containerRect = containerElement.getBoundingClientRect();
				const screenWidth = Math.floor(containerRect.width);
				const screenHeight = Math.floor(containerRect.height);

				console.log(
					`[GameScreen] Using container size: ${screenWidth}x${screenHeight} (container: ${containerRect.width}x${containerRect.height})`
				);

				const app = new PIXI.Application();
				await app.init({
					width: screenWidth,
					height: screenHeight,
					backgroundColor: 0x0a0a0a,
					antialias: true,
					resizeTo: containerElement, // Auto-resize to container
				});
				console.log('[GameScreen] Pixi.js initialized successfully');
				console.log('[GameScreen] Canvas dimensions:', {
					width: app.canvas.width,
					height: app.canvas.height,
					style: app.canvas.style.cssText,
				});

				if (pixiContainer.current) {
					// Clear any existing canvases first
					while (pixiContainer.current.firstChild) {
						pixiContainer.current.removeChild(pixiContainer.current.firstChild);
					}

					// Set canvas to fill container completely
					app.canvas.style.display = 'block';
					app.canvas.style.width = '100%';
					app.canvas.style.height = '100%';
					app.canvas.style.position = 'absolute';
					app.canvas.style.top = '0';
					app.canvas.style.left = '0';
					app.canvas.style.objectFit = 'cover';

					pixiContainer.current.appendChild(app.canvas);
					console.log('[GameScreen] Canvas added to DOM');
					console.log(
						'[GameScreen] Canvas final bounds:',
						app.canvas.getBoundingClientRect()
					);
				} else {
					console.error('[GameScreen] Container lost between checks!');
					return;
				}
				appRef.current = app;

				// Create game world
				const gameContainer = new PIXI.Container();
				app.stage.addChild(gameContainer);
				gameContainerRef.current = gameContainer;
				console.log('Game container created and added to stage');

				// Draw bot spawn points
				const spawnPoints = [
					{ x: 200, y: 200 },
					{ x: 1000, y: 400 },
					{ x: 600, y: 100 },
				];

				spawnPoints.forEach((spawn, index) => {
					const spawnMarker = new PIXI.Graphics();
					spawnMarker.lineStyle(2, 0xff4444, 0.5);
					spawnMarker.drawCircle(spawn.x, spawn.y, 20);
					spawnMarker.lineStyle(1, 0xff4444, 0.3);
					spawnMarker.drawCircle(spawn.x, spawn.y, 30);
					gameContainer.addChild(spawnMarker);
				});

			// Initialize socket
			socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
				transports: ['websocket', 'polling'],
				timeout: 5000,
				reconnection: true,
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
			});
				socketRef.current = socket;

				// Socket event handlers
				socket.on('connect', () => {
					console.log('[GameScreen] Socket connected to server');
					setConnectionStatus('connected');

					// Create room and join
					console.log('[GameScreen] Creating room:', {
						gameType,
						roomId: gameId,
					});
					socket!.emit('createRoom', {
						gameType,
						roomId: gameId,
						config: {
							worldWidth: screenWidth,
							worldHeight: screenHeight,
						},
					});
					console.log(`[GameScreen] Room creation request sent`);
				});

				socket.on('roomCreated', (data) => {
					console.log('[GameScreen] Room created successfully:', data);
					// Send screen dimensions to server
					if (socket) {
						socket.emit('screenDimensions', {
							width: screenWidth,
							height: screenHeight,
						});
						console.log(
							`[GameScreen] Sent screen dimensions: ${screenWidth}x${screenHeight}`
						);
					}
				});

				// Receive updated world dimensions from server
				socket.on(
					'worldDimensions',
					(dimensions: { width: number; height: number }) => {
						console.log(
							`Received world dimensions from server: ${dimensions.width}x${dimensions.height}`
						);
						// World is now using these dimensions on server side
					}
				);

				socket.on('disconnect', (reason) => {
					console.log('Game screen disconnected:', reason);
					setConnectionStatus('disconnected');
				});

				socket.on('connect_error', (error) => {
					console.error('Game screen connection error:', error);
					setConnectionStatus('disconnected');
				});

				let gameStateCount = 0;
				socket.on(
					'gameState',
					(state: {
						players: Player[];
						bullets: Bullet[];
						bots: Bot[];
						obstacles: Obstacle[];
						interactiveObjects: InteractiveObject[];
					}) => {
						gameStateCount++;

						if (!gameContainerRef.current) {
							console.warn('gameState received but gameContainer not ready');
							return;
						}

						// Log every 300 updates (roughly once per 5 seconds at 60fps)
						if (gameStateCount % 300 === 0) {
							console.log(
								`📡 gameState #${gameStateCount}: ${
									state.players?.length || 0
								} players, ${state.bullets?.length || 0} bullets, ${
									state.bots?.length || 0
								} bots`
							);
						}

						if (state.players && Array.isArray(state.players)) {
							updatePlayers(state.players, gameContainerRef.current);
							setConnectedPlayers(state.players);

							const totalKills = state.players.reduce(
								(sum, player) => sum + (player.kills || 0),
								0
							);
							const activePlayers = state.players.filter(
								(player) => player.alive
							).length;
							setGameStats({ totalKills, activePlayers });
						}

						if (state.bots && Array.isArray(state.bots)) {
							updateBots(state.bots, gameContainerRef.current);
						}

						if (state.bullets && Array.isArray(state.bullets)) {
							updateBullets(state.bullets, gameContainerRef.current);
						}

						if (state.obstacles && Array.isArray(state.obstacles)) {
							updateObstacles(state.obstacles, gameContainerRef.current);
						}

						if (
							state.interactiveObjects &&
							Array.isArray(state.interactiveObjects)
						) {
							updateInteractiveObjects(
								state.interactiveObjects,
								gameContainerRef.current
							);
						}
					}
				);

				socket.on('playerConnected', (player: Player) => {
					console.log(
						`Player ${player.name} connected at (${player.x}, ${player.y})`
					);
				});

				socket.on('playerDisconnected', (playerId: string) => {
					console.log(`Player disconnected: ${playerId}`);
					if (gameContainerRef.current) {
						removePlayer(playerId, gameContainerRef.current);
					}
				});

				socket.on(
					'playerHit',
					(data: { playerId: string; shooterId: string }) => {
						if (gameContainerRef.current) {
							createHitEffect(data.playerId, gameContainerRef.current);
						}
					}
				);

				socket.on(
					'botKilled',
					(data: { botId: string; killerId: string; x: number; y: number }) => {
						if (gameContainerRef.current) {
							createBloodEffect(data.x, data.y, gameContainerRef.current);
						}
					}
				);

				console.log('Socket initialized and event handlers attached');
			} catch (error) {
				console.error('Error initializing Pixi.js or Socket:', error);
			}
		};

		initPixi();

		// Handle window resize
		const handleResize = () => {
			if (appRef.current && pixiContainer.current) {
				const containerRect = pixiContainer.current.getBoundingClientRect();
				const newWidth = Math.floor(containerRect.width);
				const newHeight = Math.floor(containerRect.height);
				
				console.log(`[GameScreen] Resizing to: ${newWidth}x${newHeight}`);
				
				appRef.current.renderer.resize(newWidth, newHeight);
			}
		};

		window.addEventListener('resize', handleResize);

		return () => {
			console.log('[GameScreen] Cleanup called');
			window.removeEventListener('resize', handleResize);
			if (socket) socket.disconnect();
			if (appRef.current) {
				appRef.current.destroy({ removeView: true });
				appRef.current = null;
			}
			gameContainerRef.current = null;
			playersRef.current.clear();
			bulletsRef.current.clear();
			botsRef.current.clear();
			obstaclesRef.current = [];
			interactiveObjectsRef.current.clear();
		};
	}, [gameId, gameType]);

	const createDirectionIndicator = (
		aimDirection: { x: number; y: number },
		color: number,
		isMoving: boolean = false
	) => {
		const container = new PIXI.Container();

		// Calculate angle from direction vector
		const angle = Math.atan2(aimDirection.y, aimDirection.x);

		// Main direction arrow - longer and more prominent
		const mainArrow = new PIXI.Graphics();
		mainArrow.lineStyle(4, 0xffffff, 0.9);

		// Arrow line
		const arrowLength = 35;
		const startX = 0;
		const startY = 0;
		const endX = Math.cos(angle) * arrowLength;
		const endY = Math.sin(angle) * arrowLength;

		mainArrow.moveTo(startX, startY);
		mainArrow.lineTo(endX, endY);

		// Arrowhead
		const arrowHeadSize = 8;
		const arrowHeadAngle = Math.PI / 6;

		mainArrow.lineTo(
			endX - arrowHeadSize * Math.cos(angle - arrowHeadAngle),
			endY - arrowHeadSize * Math.sin(angle - arrowHeadAngle)
		);
		mainArrow.moveTo(endX, endY);
		mainArrow.lineTo(
			endX - arrowHeadSize * Math.cos(angle + arrowHeadAngle),
			endY - arrowHeadSize * Math.sin(angle + arrowHeadAngle)
		);

		container.addChild(mainArrow);

		// 360-degree direction ring with markers
		const ring = new PIXI.Graphics();

		// Outer ring - subtle background
		ring.lineStyle(2, 0x444444, 0.3);
		ring.drawCircle(0, 0, 45);

		// Direction markers every 45 degrees
		for (let i = 0; i < 8; i++) {
			const markerAngle = (i * Math.PI) / 4;
			const isMainDirection =
				Math.abs(markerAngle - angle) < 0.2 ||
				Math.abs(markerAngle - angle - Math.PI * 2) < 0.2 ||
				Math.abs(markerAngle - angle + Math.PI * 2) < 0.2;

			const markerLength = isMainDirection ? 12 : 6;
			const markerAlpha = isMainDirection ? 0.8 : 0.4;
			const markerColor = isMainDirection ? color : 0x888888;
			const markerWidth = isMainDirection ? 3 : 1;

			ring.lineStyle(markerWidth, markerColor, markerAlpha);

			const innerRadius = 40;
			const outerRadius = innerRadius + markerLength;

			const startX = Math.cos(markerAngle) * innerRadius;
			const startY = Math.sin(markerAngle) * innerRadius;
			const endX = Math.cos(markerAngle) * outerRadius;
			const endY = Math.sin(markerAngle) * outerRadius;

			ring.moveTo(startX, startY);
			ring.lineTo(endX, endY);
		}

		// Highlight the current direction sector
		const sectorAngle = Math.PI / 4; // 45 degrees
		const sectorStart = angle - sectorAngle / 2;
		const sectorEnd = angle + sectorAngle / 2;

		ring.lineStyle(0);
		ring.beginFill(color, 0.1);
		ring.moveTo(0, 0);
		ring.arc(0, 0, 40, sectorStart, sectorEnd);
		ring.lineTo(0, 0);
		ring.endFill();

		// Active direction arc - thicker line showing current direction
		ring.lineStyle(4, color, 0.7);
		ring.arc(0, 0, 42, angle - 0.3, angle + 0.3);

		container.addChild(ring);

		// Movement indicator - pulsing ring when moving
		if (isMoving) {
			const movementRing = new PIXI.Graphics();
			movementRing.lineStyle(2, 0xffffff, 0.5);
			movementRing.drawCircle(0, 0, 50);

			// Add pulsing animation
			const pulseAnimation = () => {
				const time = Date.now() * 0.005;
				const scale = 1 + Math.sin(time) * 0.1;
				movementRing.scale.set(scale);
				movementRing.alpha = 0.3 + Math.sin(time) * 0.2;
			};

			// Store animation function for cleanup
			(movementRing as any).pulseAnimation = pulseAnimation;

			container.addChild(movementRing);
		}

		// Compass directions (N, E, S, W)
		const compassLabels = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
		for (let i = 0; i < 8; i++) {
			const labelAngle = (i * Math.PI) / 4;
			const labelRadius = 60;

			const labelX = Math.cos(labelAngle) * labelRadius;
			const labelY = Math.sin(labelAngle) * labelRadius;

			const label = new PIXI.Text(compassLabels[i], {
				fontFamily: 'Arial',
				fontSize: 10,
				fill: 0x888888,
				align: 'center',
			});
			label.anchor.set(0.5);
			label.x = labelX;
			label.y = labelY;
			label.alpha = 0.6;

			container.addChild(label);
		}

		return container;
	};

	const updatePlayers = (players: Player[], container: PIXI.Container) => {
		// Remove disconnected players
		for (const [playerId, playerContainer] of playersRef.current) {
			if (!players.find((p) => p.id === playerId)) {
				container.removeChild(playerContainer);
				playersRef.current.delete(playerId);
				console.log(`Removed player ${playerId}`);
			}
		}

		// Update or create player graphics
		players.forEach((player) => {
			let playerContainer = playersRef.current.get(player.id);

			if (!playerContainer) {
				playerContainer = new PIXI.Container();
				playersRef.current.set(player.id, playerContainer);
				container.addChild(playerContainer);
				console.log(
					`✅ Created player ${player.name} at (${player.x}, ${player.y}), alive: ${player.alive}, container has ${container.children.length} children now`
				);
			}

			// Clear previous graphics
			playerContainer.removeChildren();

			if (player.alive) {
				// Parse player color
				let color: number;
				if (typeof player.color === 'string') {
					if (player.color.startsWith('#')) {
						color = parseInt(player.color.substring(1), 16);
					} else {
						color = parseInt(player.color, 16);
					}
				} else {
					color = player.color;
				}

				if (isNaN(color)) {
					color = 0xff6b6b;
				}

				// 360-degree direction indicator (drawn first, behind player)
				if (
					player.aimDirection &&
					(Math.abs(player.aimDirection.x) > 0.1 ||
						Math.abs(player.aimDirection.y) > 0.1)
				) {
					const directionIndicator = createDirectionIndicator(
						player.aimDirection,
						color,
						player.isMoving || false
					);
					directionIndicator.x = 15; // Center on player
					directionIndicator.y = 15;
					playerContainer.addChild(directionIndicator);

					// Animate movement rings
					const movementRings = directionIndicator.children.filter(
						(child: any) => child.pulseAnimation
					);
					movementRings.forEach((ring: any) => {
						if (ring.pulseAnimation) {
							ring.pulseAnimation();
						}
					});
				}

				// Main player body (drawn on top)
				const playerGraphic = new PIXI.Graphics();
				playerGraphic.beginFill(color);
				playerGraphic.drawCircle(15, 15, 15);
				playerGraphic.endFill();

				// Player border
				playerGraphic.lineStyle(3, 0xffffff, 0.8);
				playerGraphic.drawCircle(15, 15, 15);

				// Inner glow
				playerGraphic.lineStyle(1, color, 0.5);
				playerGraphic.drawCircle(15, 15, 18);

				playerContainer.addChild(playerGraphic);

				// Shield effect
				if (
					player.effects &&
					player.effects.shield &&
					player.effects.shield.active
				) {
					const shield = new PIXI.Graphics();
					shield.lineStyle(4, 0x00ffff, 0.8);
					shield.drawCircle(15, 15, 25);

					// Shield particles
					for (let i = 0; i < 6; i++) {
						const particleAngle = (i * Math.PI * 2) / 6;
						const particleX = 15 + Math.cos(particleAngle) * 28;
						const particleY = 15 + Math.sin(particleAngle) * 28;

						shield.beginFill(0x00ffff, 0.6);
						shield.drawCircle(particleX, particleY, 2);
						shield.endFill();
					}

					playerContainer.addChild(shield);
				}

				// Speed boost effect
				if (
					player.effects &&
					player.effects.speedBoost &&
					player.effects.speedBoost.active
				) {
					const speedEffect = new PIXI.Graphics();

					// Speed trail effect
					for (let i = 0; i < 3; i++) {
						const trailAlpha = 0.4 - i * 0.1;
						const trailRadius = 20 + i * 3;

						speedEffect.beginFill(0xffff00, trailAlpha);
						speedEffect.drawCircle(15, 15, trailRadius);
						speedEffect.endFill();
					}

					playerContainer.addChild(speedEffect);
				}

				// Player name with background
				const nameBackground = new PIXI.Graphics();
				nameBackground.beginFill(0x000000, 0.7);
				nameBackground.drawRoundedRect(-25, -25, 50, 15, 3);
				nameBackground.endFill();
				nameBackground.x = 15;
				nameBackground.y = -10;
				playerContainer.addChild(nameBackground);

				const nameText = new PIXI.Text(player.name, {
					fontFamily: 'Arial',
					fontSize: 10,
					fill: 0xffffff,
					align: 'center',
					fontWeight: 'bold',
				});
				nameText.anchor.set(0.5);
				nameText.x = 15;
				nameText.y = -17;
				playerContainer.addChild(nameText);

				// Health/status indicator
				const statusIndicator = new PIXI.Graphics();
				statusIndicator.beginFill(0x00ff00, 0.8);
				statusIndicator.drawCircle(25, 5, 3);
				statusIndicator.endFill();
				playerContainer.addChild(statusIndicator);
			} else {
				// Ghost effect for dead players
				const ghostGraphic = new PIXI.Graphics();
				ghostGraphic.beginFill(0x666666, 0.3);
				ghostGraphic.drawCircle(15, 15, 15);
				ghostGraphic.endFill();

				ghostGraphic.lineStyle(2, 0x888888, 0.5);
				ghostGraphic.drawCircle(15, 15, 15);

				playerContainer.addChild(ghostGraphic);

				// "DEAD" text
				const deadText = new PIXI.Text('DEAD', {
					fontFamily: 'Arial',
					fontSize: 8,
					fill: 0xff4444,
					align: 'center',
					fontWeight: 'bold',
				});
				deadText.anchor.set(0.5);
				deadText.x = 15;
				deadText.y = 15;
				playerContainer.addChild(deadText);
			}

			// Update position
			playerContainer.x = player.x;
			playerContainer.y = player.y;
			playerContainer.visible = true;
		});
	};

	const updateBullets = (bullets: Bullet[], container: PIXI.Container) => {
		// Remove old bullets
		for (const [bulletId, bulletGraphic] of bulletsRef.current) {
			if (!bullets.find((b) => b.id === bulletId)) {
				container.removeChild(bulletGraphic);
				bulletsRef.current.delete(bulletId);
			}
		}

		// Update or create bullet graphics
		bullets.forEach((bullet) => {
			let bulletGraphic = bulletsRef.current.get(bullet.id);

			if (!bulletGraphic) {
				bulletGraphic = new PIXI.Graphics();
				bulletGraphic.beginFill(0xffff00);
				bulletGraphic.drawCircle(0, 0, 4);
				bulletGraphic.endFill();

				// Bullet glow
				bulletGraphic.lineStyle(2, 0xffff00, 0.6);
				bulletGraphic.drawCircle(0, 0, 6);

				// Bullet trail
				bulletGraphic.lineStyle(1, 0xffffff, 0.3);
				bulletGraphic.drawCircle(0, 0, 8);

				bulletsRef.current.set(bullet.id, bulletGraphic);
				container.addChild(bulletGraphic);
			}

			bulletGraphic.x = bullet.x;
			bulletGraphic.y = bullet.y;
		});
	};

	const updateBots = (bots: Bot[], container: PIXI.Container) => {
		// Remove disconnected bots
		for (const [botId, botContainer] of botsRef.current) {
			if (!bots.find((b) => b.id === botId && b.alive)) {
				container.removeChild(botContainer);
				botsRef.current.delete(botId);
			}
		}

		// Update or create bot graphics
		bots.forEach((bot) => {
			if (!bot.alive) return;

			let botContainer = botsRef.current.get(bot.id);

			if (!botContainer) {
				botContainer = new PIXI.Container();
				botsRef.current.set(bot.id, botContainer);
				container.addChild(botContainer);
			}

			// Clear previous graphics
			botContainer.removeChildren();

			// Bot body
			const botGraphic = new PIXI.Graphics();
			const color = parseInt(bot.color.substring(1), 16);

			// Different appearance based on chasing state
			if (bot.isChasing) {
				// Alert state - pulsing red
				const pulseAlpha = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
				botGraphic.beginFill(color, pulseAlpha);
				botGraphic.drawCircle(bot.size / 2, bot.size / 2, bot.size / 2);
				botGraphic.endFill();

				// Angry eyes
				botGraphic.beginFill(0xffffff);
				botGraphic.drawCircle(bot.size / 2 - 6, bot.size / 2 - 4, 3);
				botGraphic.drawCircle(bot.size / 2 + 6, bot.size / 2 - 4, 3);
				botGraphic.endFill();

				// Chase indicator
				const indicator = new PIXI.Graphics();
				indicator.lineStyle(2, 0xff0000, 0.6);
				indicator.drawCircle(bot.size / 2, bot.size / 2, bot.size / 2 + 5);
				botContainer.addChild(indicator);
			} else {
				// Idle state
				botGraphic.beginFill(color, 0.8);
				botGraphic.drawCircle(bot.size / 2, bot.size / 2, bot.size / 2);
				botGraphic.endFill();

				// Peaceful eyes
				botGraphic.beginFill(0xffffff);
				botGraphic.drawCircle(bot.size / 2 - 6, bot.size / 2 - 4, 2);
				botGraphic.drawCircle(bot.size / 2 + 6, bot.size / 2 - 4, 2);
				botGraphic.endFill();
			}

			// Bot border
			botGraphic.lineStyle(2, 0x000000, 0.8);
			botGraphic.drawCircle(bot.size / 2, bot.size / 2, bot.size / 2);

			botContainer.addChild(botGraphic);

			// Update position
			botContainer.x = bot.x;
			botContainer.y = bot.y;
		});
	};

	const updateObstacles = (
		obstacles: Obstacle[],
		container: PIXI.Container
	) => {
		if (obstaclesRef.current.length === 0) {
			obstacles.forEach((obstacle) => {
				const obstacleGraphic = new PIXI.Graphics();
				obstacleGraphic.beginFill(0x333333);
				obstacleGraphic.drawRect(
					obstacle.x,
					obstacle.y,
					obstacle.width,
					obstacle.height
				);
				obstacleGraphic.endFill();

				// Add border
				obstacleGraphic.lineStyle(2, 0x555555);
				obstacleGraphic.drawRect(
					obstacle.x,
					obstacle.y,
					obstacle.width,
					obstacle.height
				);

				obstaclesRef.current.push(obstacleGraphic);
				container.addChild(obstacleGraphic);
			});
		}
	};

	const updateInteractiveObjects = (
		objects: InteractiveObject[],
		container: PIXI.Container
	) => {
		if (!objects || !Array.isArray(objects)) {
			return;
		}

		objects.forEach((obj) => {
			let objContainer = interactiveObjectsRef.current.get(obj.id);

			if (!objContainer) {
				objContainer = new PIXI.Container();
				interactiveObjectsRef.current.set(obj.id, objContainer);
				container.addChild(objContainer);
			}

			// Clear previous graphics
			objContainer.removeChildren();

			const graphic = new PIXI.Graphics();

			switch (obj.type) {
				case 'teleporter':
					graphic.beginFill(
						0x9b59b6,
						obj.cooldown && obj.cooldown > Date.now() ? 0.3 : 0.8
					);
					graphic.drawCircle(obj.width / 2, obj.height / 2, obj.width / 2);
					graphic.endFill();
					graphic.lineStyle(2, 0xe74c3c);
					graphic.drawCircle(obj.width / 2, obj.height / 2, obj.width / 2 - 5);
					break;

				case 'speedBoost':
					if (obj.active) {
						graphic.beginFill(0xf39c12, 0.8);
						graphic.drawPolygon([
							obj.width / 2,
							0,
							obj.width,
							obj.height / 2,
							obj.width / 2,
							obj.height,
							0,
							obj.height / 2,
						]);
						graphic.endFill();
						graphic.lineStyle(2, 0xe67e22);
						graphic.drawPolygon([
							obj.width / 2,
							0,
							obj.width,
							obj.height / 2,
							obj.width / 2,
							obj.height,
							0,
							obj.height / 2,
						]);
					}
					break;

				case 'shield':
					if (obj.active) {
						graphic.beginFill(0x3498db, 0.8);
						graphic.drawRect(0, 0, obj.width, obj.height);
						graphic.endFill();
						graphic.lineStyle(2, 0x2980b9);
						graphic.drawRect(0, 0, obj.width, obj.height);
					}
					break;

				case 'bouncer':
					graphic.beginFill(0xe74c3c, 0.8);
					graphic.drawCircle(obj.width / 2, obj.height / 2, obj.width / 2);
					graphic.endFill();
					graphic.lineStyle(3, 0xc0392b);
					graphic.drawCircle(obj.width / 2, obj.height / 2, obj.width / 2 - 3);
					break;
			}

			objContainer.addChild(graphic);
			objContainer.x = obj.x;
			objContainer.y = obj.y;
		});
	};

	const removePlayer = (playerId: string, container: PIXI.Container) => {
		const playerContainer = playersRef.current.get(playerId);
		if (playerContainer) {
			container.removeChild(playerContainer);
			playersRef.current.delete(playerId);
		}
	};

	const createHitEffect = (playerId: string, container: PIXI.Container) => {
		const player = connectedPlayers.find((p) => p.id === playerId);
		if (!player) return;

		// Create explosion effect
		const particles = new PIXI.Container();
		container.addChild(particles);

		for (let i = 0; i < 20; i++) {
			const particle = new PIXI.Graphics();
			particle.beginFill(0xff4444);
			particle.drawCircle(0, 0, Math.random() * 5 + 2);
			particle.endFill();

			particle.x = player.x + 15;
			particle.y = player.y + 15;

			const angle = (Math.PI * 2 * i) / 20;
			const speed = Math.random() * 100 + 50;

			particles.addChild(particle);

			// Animate particle
			const animate = () => {
				particle.x += Math.cos(angle) * speed * 0.016;
				particle.y += Math.sin(angle) * speed * 0.016;
				particle.alpha -= 0.02;
				particle.scale.x *= 0.98;
				particle.scale.y *= 0.98;

				if (particle.alpha > 0) {
					requestAnimationFrame(animate);
				} else {
					particles.removeChild(particle);
				}
			};
			animate();
		}

		// Remove particles container after animation
		setTimeout(() => {
			container.removeChild(particles);
		}, 3000);
	};

	const createBloodEffect = (
		x: number,
		y: number,
		container: PIXI.Container
	) => {
		// Create blood splatter particles
		const bloodContainer = new PIXI.Container();
		container.addChild(bloodContainer);

		// More particles for blood effect
		for (let i = 0; i < 30; i++) {
			const particle = new PIXI.Graphics();
			const size = Math.random() * 6 + 3;

			// Dark red blood color
			const bloodColor = 0x8b0000 + Math.floor(Math.random() * 0x220000);
			particle.beginFill(bloodColor);
			particle.drawCircle(0, 0, size);
			particle.endFill();

			particle.x = x + 12.5; // Center of bot
			particle.y = y + 12.5;

			const angle = (Math.PI * 2 * i) / 30 + (Math.random() - 0.5) * 0.5;
			const speed = Math.random() * 150 + 80;
			const gravity = 50; // Simulated gravity

			bloodContainer.addChild(particle);

			// Animate particle with gravity
			let velocityX = Math.cos(angle) * speed;
			let velocityY = Math.sin(angle) * speed;

			const animate = () => {
				velocityY += gravity * 0.016; // Apply gravity
				particle.x += velocityX * 0.016;
				particle.y += velocityY * 0.016;
				particle.alpha -= 0.015;
				particle.scale.x *= 0.985;
				particle.scale.y *= 0.985;

				if (particle.alpha > 0 && particle.y < window.innerHeight) {
					requestAnimationFrame(animate);
				} else {
					bloodContainer.removeChild(particle);
				}
			};
			animate();
		}

		// Splatter mark that stays briefly
		const splatter = new PIXI.Graphics();
		splatter.beginFill(0x8b0000, 0.6);
		for (let i = 0; i < 8; i++) {
			const splatAngle = (Math.PI * 2 * i) / 8;
			const splatDist = 15 + Math.random() * 10;
			splatter.drawCircle(
				x + 12.5 + Math.cos(splatAngle) * splatDist,
				y + 12.5 + Math.sin(splatAngle) * splatDist,
				Math.random() * 8 + 4
			);
		}
		splatter.endFill();
		container.addChild(splatter);

		// Fade out splatter
		let splatAlpha = 0.6;
		const fadeSplat = () => {
			splatAlpha -= 0.01;
			splatter.alpha = splatAlpha;
			if (splatAlpha > 0) {
				requestAnimationFrame(fadeSplat);
			} else {
				container.removeChild(splatter);
			}
		};
		setTimeout(fadeSplat, 1000);

		// Remove blood container after animation
		setTimeout(() => {
			container.removeChild(bloodContainer);
		}, 4000);
	};

	// Generate controller URL for QR code dynamically (client-side only)
	const [controllerUrl, setControllerUrl] = useState('');
	
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const baseUrl = window.location.origin;
			const url = `${baseUrl}/game/${gameType}?mode=controller&roomId=${gameId}`;
			setControllerUrl(url);
			console.log('[GameScreen] QR URL:', url);
		}
	}, [gameType, gameId]);

	return (
		<div className="fixed inset-0 w-full h-full bg-gray-900 flex flex-col overflow-hidden z-50">
			{/* Game Interface Header */}
			<GameInterfaceHeader
				onBack={onBack}
				connectionStatus={connectionStatus}
				onShowQR={() => setShowQRPopup(true)}
				gameType={gameType}
				activePlayers={gameStats.activePlayers}
				totalKills={gameStats.totalKills}
			/>

			{/* Game Canvas - Full Screen */}
			<div
				className="flex-1 relative bg-gray-900 overflow-hidden"
				style={{ 
					minHeight: 0,
					width: '100%',
					height: 'calc(100vh - 64px)' // Full height minus header
				}}
			>
				<div
					ref={pixiContainer}
					className="absolute inset-0 w-full h-full"
					style={{ 
						width: '100%', 
						height: '100%',
						minHeight: '100%'
					}}
				/>
			</div>

			{/* QR Code Sheet */}
			<GameQRSheet
				isOpen={showQRPopup}
				onClose={() => setShowQRPopup(false)}
				controllerUrl={controllerUrl}
				players={connectedPlayers}
				gameType={gameType}
			/>
		</div>
	);
};

export default GameScreen;
