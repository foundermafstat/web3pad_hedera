'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { io, Socket } from 'socket.io-client';
import { FaArrowLeft, FaUsers, FaQrcode, FaWifi } from 'react-icons/fa';
import dynamic from 'next/dynamic';

const GameQRSheet = dynamic(
	() => import('@/components/GameQRSheet').then((mod) => ({ default: mod.GameQRSheet })),
	{ ssr: false }
);

interface Player {
	id: string;
	name: string;
	x: number;
	y: number;
	angle: number;
	speed: number;
	color: string;
	lap: number;
	alive: boolean;
	currentCheckpoint: number;
	isRacing: boolean;
	lapTime: number | null;
	bestLapTime: number | null;
}

interface Checkpoint {
	id: number;
	x: number;
	y: number;
	width: number;
	height: number;
	totalCheckpoints: number;
}

interface SandArea {
	x: number;
	y: number;
	width: number;
	height: number;
	type: string;
}

interface Barrier {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface StartLine {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface RaceGameScreenProps {
	gameId: string;
	gameType: string;
	onBack: () => void;
}

const RaceGameScreen: React.FC<RaceGameScreenProps> = ({
	gameId,
	gameType,
	onBack,
}) => {
	console.log('[RaceGameScreen] Rendering with:', { gameId, gameType });
	const pixiContainer = useRef<HTMLDivElement>(null);
	const appRef = useRef<PIXI.Application | null>(null);
	const socketRef = useRef<Socket | null>(null);
	const gameContainerRef = useRef<PIXI.Container | null>(null);
	const playersRef = useRef<Map<string, PIXI.Container>>(new Map());
	const checkpointsRef = useRef<PIXI.Graphics[]>([]);
	const sandAreasRef = useRef<PIXI.Graphics[]>([]);
	const barriersRef = useRef<PIXI.Graphics[]>([]);
	const startLineRef = useRef<PIXI.Graphics | null>(null);
	const [connectedPlayers, setConnectedPlayers] = useState<Player[]>([]);
	const [showQRPopup, setShowQRPopup] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState<
		'connecting' | 'connected' | 'disconnected'
	>('connecting');

	useEffect(() => {
		if (appRef.current) {
			console.log(
				'[RaceGameScreen] App already exists, skipping initialization'
			);
			return;
		}

		console.log('[RaceGameScreen] Starting initialization for:', {
			gameId,
			gameType,
		});

		let socket: Socket | null = null;

		const initPixi = async () => {
			try {
				console.log('[RaceGameScreen] Waiting for next frame...');
				await new Promise((resolve) => requestAnimationFrame(resolve));
				await new Promise((resolve) => requestAnimationFrame(resolve));

				const containerElement = pixiContainer.current;
				console.log(
					'[RaceGameScreen] Container element:',
					containerElement,
					'exists:',
					!!containerElement
				);
				if (!containerElement) {
					console.error('[RaceGameScreen] Container element not found!');
					return;
				}

				// Fixed game world dimensions (same as server)
				const gameWorldWidth = 1920;
				const gameWorldHeight = 1080;

				// Calculate available space
				const headerHeight = 50;
				const availableWidth = window.innerWidth;
				const availableHeight = window.innerHeight - headerHeight;

				// Calculate scale to fit within available space
				const scaleX = availableWidth / gameWorldWidth;
				const scaleY = availableHeight / gameWorldHeight;
				const scale = Math.min(scaleX, scaleY);

				// Scaled dimensions
				const canvasWidth = gameWorldWidth * scale;
				const canvasHeight = gameWorldHeight * scale;

				console.log('[RaceGameScreen] Canvas dimensions:', canvasWidth, 'x', canvasHeight, 'scale:', scale);

				console.log('[RaceGameScreen] Creating PIXI Application...');
				const app = new PIXI.Application();
				await app.init({
					width: canvasWidth,
					height: canvasHeight,
					backgroundColor: 0x1a1a1a,
					antialias: true,
				});
				console.log('[RaceGameScreen] PIXI Application created successfully');

				if (pixiContainer.current) {
					while (pixiContainer.current.firstChild) {
						pixiContainer.current.removeChild(pixiContainer.current.firstChild);
					}

					app.canvas.style.display = 'block';
					app.canvas.style.width = `${canvasWidth}px`;
					app.canvas.style.height = `${canvasHeight}px`;
					app.canvas.style.position = 'absolute';
					app.canvas.style.top = '0';
					app.canvas.style.left = '0';

					console.log('[RaceGameScreen] Appending canvas to container...');
					pixiContainer.current.appendChild(app.canvas);
					console.log('[RaceGameScreen] Canvas appended successfully');
				} else {
					console.error('[RaceGameScreen] Container lost between checks!');
					return;
				}
				appRef.current = app;

				const gameContainer = new PIXI.Container();
				app.stage.addChild(gameContainer);
				gameContainerRef.current = gameContainer;
				console.log('[RaceGameScreen] Game container created');

				console.log('[RaceGameScreen] Initializing socket connection...');
				socket = io(process.env.NEXT_PUBLIC_SERVER_URL!, {
					transports: ['websocket', 'polling'],
					timeout: 5000,
					reconnection: true,
					reconnectionAttempts: 5,
					reconnectionDelay: 1000,
				});
				socketRef.current = socket;

				socket.on('connect', () => {
					console.log('[RaceGameScreen] Socket connected to server');
					setConnectionStatus('connected');

					console.log('[RaceGameScreen] Creating room:', {
						gameType,
						roomId: gameId,
					});
					socket!.emit('createRoom', {
						gameType,
						roomId: gameId,
						config: {
							trackWidth: gameWorldWidth,
							trackHeight: gameWorldHeight,
						},
					});
				});

				socket.on('roomCreated', (data) => {
					console.log('[RaceGameScreen] Room created successfully:', data);
				});

				socket.on('disconnect', (reason) => {
					console.log('Disconnected:', reason);
					setConnectionStatus('disconnected');
				});

				socket.on('connect_error', (error) => {
					console.error('Connection error:', error);
					setConnectionStatus('disconnected');
				});

				socket.on(
					'gameState',
					(state: {
						players: Player[];
						checkpoints: Checkpoint[];
						sandAreas: SandArea[];
						barriers: Barrier[];
						startLine: StartLine;
					}) => {
						if (!gameContainerRef.current) return;

						console.log('[RaceGameScreen] GameState received:', {
							players: state.players?.length,
							sandAreas: state.sandAreas?.length,
							barriers: state.barriers?.length,
							checkpoints: state.checkpoints?.length,
							hasStartLine: !!state.startLine
						});

						// Draw track elements first (background layers)
						if (state.sandAreas && Array.isArray(state.sandAreas)) {
							updateSandAreas(state.sandAreas, gameContainerRef.current);
						}

						if (state.barriers && Array.isArray(state.barriers)) {
							updateBarriers(state.barriers, gameContainerRef.current);
						}

						if (state.startLine) {
							updateStartLine(state.startLine, gameContainerRef.current);
						}

						if (state.checkpoints && Array.isArray(state.checkpoints)) {
							updateCheckpoints(state.checkpoints, gameContainerRef.current);
						}

						// Draw players last (foreground layer)
						if (state.players && Array.isArray(state.players)) {
							updatePlayers(state.players, gameContainerRef.current);
							setConnectedPlayers(state.players);
						}
					}
				);

				socket.on('playerConnected', (player: Player) => {
					console.log(`Player ${player.name} connected`);
				});

				socket.on('playerDisconnected', (playerId: string) => {
					console.log(`Player disconnected: ${playerId}`);
					if (gameContainerRef.current) {
						removePlayer(playerId, gameContainerRef.current);
					}
				});
			} catch (error) {
				console.error('[RaceGameScreen] Error initializing:', error);
			}
		};

		console.log('[RaceGameScreen] Calling initPixi...');
		initPixi();

		return () => {
			console.log('[RaceGameScreen] Cleanup called');
			if (socket) socket.disconnect();
			if (appRef.current) {
				appRef.current.destroy({ removeView: true });
				appRef.current = null;
			}
			gameContainerRef.current = null;
			playersRef.current.clear();
			checkpointsRef.current = [];
			sandAreasRef.current = [];
			barriersRef.current = [];
			startLineRef.current = null;
		};
	}, [gameId, gameType]);

	const updatePlayers = (players: Player[], container: PIXI.Container) => {
		// Remove disconnected players
		for (const [playerId, playerContainer] of playersRef.current) {
			if (!players.find((p) => p.id === playerId)) {
				container.removeChild(playerContainer);
				playersRef.current.delete(playerId);
			}
		}

		// Update or create player graphics
		players.forEach((player) => {
			let playerContainer = playersRef.current.get(player.id);

			if (!playerContainer) {
				playerContainer = new PIXI.Container();
				playersRef.current.set(player.id, playerContainer);
				// Add players after track elements (higher z-index)
				container.addChild(playerContainer);
			}

			playerContainer.removeChildren();

			// Parse color
			let color: number;
			if (typeof player.color === 'string') {
				color = parseInt(
					player.color.startsWith('#')
						? player.color.substring(1)
						: player.color,
					16
				);
			} else {
				color = player.color;
			}

			// Draw improved car
			const carGraphic = new PIXI.Graphics();
			
			// Car body
			carGraphic.beginFill(color);
			carGraphic.drawRect(-15, -7.5, 30, 15);
			carGraphic.endFill();

			// Car border
			carGraphic.lineStyle(2, 0xffffff, 0.9);
			carGraphic.drawRect(-15, -7.5, 30, 15);

			// Windshield
			carGraphic.beginFill(0x4682b4, 0.6);
			carGraphic.drawRect(8, -5, 7, 10);
			carGraphic.endFill();

			// Headlights
			carGraphic.beginFill(0xffffaa, 0.8);
			carGraphic.drawRect(-12, -5, 3, 3);
			carGraphic.drawRect(-12, 2, 3, 3);
			carGraphic.endFill();

			carGraphic.rotation = player.angle;
			playerContainer.addChild(carGraphic);

			// Speed indicator
			const speedText = new PIXI.Text(
				`${Math.round(Math.abs(player.speed) / 10)}`,
				{
					fontFamily: 'Arial',
					fontSize: 9,
					fill: 0xffffff,
					align: 'center',
				}
			);
			speedText.anchor.set(0.5);
			speedText.y = -25;
			playerContainer.addChild(speedText);

			// Player name
			const nameText = new PIXI.Text(player.name, {
				fontFamily: 'Arial',
				fontSize: 11,
				fill: 0xffffff,
				align: 'center',
				fontWeight: 'bold',
			});
			nameText.anchor.set(0.5);
			nameText.y = -37;
			playerContainer.addChild(nameText);

			// Lap indicator
			const lapText = new PIXI.Text(`Lap: ${player.lap}`, {
				fontFamily: 'Arial',
				fontSize: 9,
				fill: 0xffff00,
				align: 'center',
			});
			lapText.anchor.set(0.5);
			lapText.y = 22;
			playerContainer.addChild(lapText);

			// Lap time
			if (player.lapTime !== null) {
				const timeText = new PIXI.Text(
					`${player.lapTime.toFixed(2)}s`,
					{
						fontFamily: 'Arial',
						fontSize: 8,
						fill: 0x00ff00,
						align: 'center',
					}
				);
				timeText.anchor.set(0.5);
				timeText.y = 33;
				playerContainer.addChild(timeText);
			}

			playerContainer.x = player.x;
			playerContainer.y = player.y;
		});
	};

	const updateSandAreas = (
		sandAreas: SandArea[],
		container: PIXI.Container
	) => {
		console.log('[RaceGameScreen] Updating sand areas:', sandAreas?.length);
		
		if (sandAreasRef.current.length === 0 && sandAreas && sandAreas.length > 0) {
			sandAreas.forEach((sand) => {
				const sandGraphic = new PIXI.Graphics();
				sandGraphic.beginFill(0xd4a574, 0.6);
				sandGraphic.drawRect(sand.x, sand.y, sand.width, sand.height);
				sandGraphic.endFill();

				// Sand texture
				sandGraphic.lineStyle(1, 0xc9a86a, 0.4);
				for (let i = 0; i < 20; i++) {
					const x = sand.x + Math.random() * sand.width;
					const y = sand.y + Math.random() * sand.height;
					sandGraphic.drawCircle(x, y, 2);
				}

				sandAreasRef.current.push(sandGraphic);
				container.addChild(sandGraphic);
			});
		}
	};

	const updateBarriers = (barriers: Barrier[], container: PIXI.Container) => {
		console.log('[RaceGameScreen] Updating barriers:', barriers?.length);
		
		if (barriersRef.current.length === 0 && barriers && barriers.length > 0) {
			barriers.forEach((barrier) => {
				const barrierGraphic = new PIXI.Graphics();
				
				// Barrier body
				barrierGraphic.beginFill(0x8b4513);
				barrierGraphic.drawRect(
					barrier.x,
					barrier.y,
					barrier.width,
					barrier.height
				);
				barrierGraphic.endFill();

				// Barrier border
				barrierGraphic.lineStyle(2, 0x654321);
				barrierGraphic.drawRect(
					barrier.x,
					barrier.y,
					barrier.width,
					barrier.height
				);

				// Warning stripes
				barrierGraphic.beginFill(0xffaa00);
				for (let y = barrier.y; y < barrier.y + barrier.height; y += 10) {
					barrierGraphic.drawRect(barrier.x + 5, y, barrier.width - 10, 5);
				}
				barrierGraphic.endFill();

				barriersRef.current.push(barrierGraphic);
				container.addChild(barrierGraphic);
			});
		}
	};

	const updateStartLine = (startLine: StartLine, container: PIXI.Container) => {
		console.log('[RaceGameScreen] Updating start line:', !!startLine);
		
		if (!startLineRef.current && startLine) {
			const checkered = new PIXI.Graphics();
			const size = 10;
			
			for (let i = 0; i < startLine.width / size; i++) {
				for (let j = 0; j < startLine.height / size; j++) {
					const x = startLine.x + i * size;
					const y = startLine.y + j * size;
					
					const isBlack = (i + j) % 2 === 0;
					checkered.beginFill(isBlack ? 0x000000 : 0xffffff);
					checkered.drawRect(x, y, size, size);
					checkered.endFill();
				}
			}

			startLineRef.current = checkered;
			container.addChild(checkered);
		}
	};

	const updateCheckpoints = (
		checkpoints: Checkpoint[],
		container: PIXI.Container
	) => {
		console.log('[RaceGameScreen] Updating checkpoints:', checkpoints?.length);
		
		if (checkpointsRef.current.length === 0 && checkpoints && checkpoints.length > 0) {
			checkpoints.forEach((checkpoint, index) => {
				const cpGraphic = new PIXI.Graphics();
				
				// Checkpoint background
				cpGraphic.lineStyle(3, 0xffff00, 0.8);
				cpGraphic.beginFill(0xffff00, 0.15);
				cpGraphic.drawRect(
					checkpoint.x,
					checkpoint.y,
					checkpoint.width,
					checkpoint.height
				);
				cpGraphic.endFill();

				// Arrow indicator
				cpGraphic.lineStyle(2, 0xffff00, 0.9);
				const centerX = checkpoint.x + checkpoint.width / 2;
				const centerY = checkpoint.y + checkpoint.height / 2;
				cpGraphic.moveTo(centerX - 10, centerY - 15);
				cpGraphic.lineTo(centerX, centerY);
				cpGraphic.lineTo(centerX + 10, centerY - 15);

				container.addChild(cpGraphic);
				checkpointsRef.current.push(cpGraphic);

				// Checkpoint number
				const cpText = new PIXI.Text(`${index + 1}`, {
					fontFamily: 'Arial',
					fontSize: 16,
					fill: 0xffff00,
					fontWeight: 'bold',
				});
				cpText.anchor.set(0.5);
				cpText.x = centerX;
				cpText.y = centerY - 30;
				container.addChild(cpText);
			});
		}
	};

	const removePlayer = (playerId: string, container: PIXI.Container) => {
		const playerContainer = playersRef.current.get(playerId);
		if (playerContainer) {
			container.removeChild(playerContainer);
			playersRef.current.delete(playerId);
		}
	};

	// Generate controller URL for QR code dynamically (client-side only)
	const [controllerUrl, setControllerUrl] = useState('');

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const url = `${process.env.NEXT_PUBLIC_CLIENT_URL}/game/${gameType}?mode=controller&roomId=${gameId}`;
			setControllerUrl(url);
			console.log('[RaceGameScreen] QR URL:', url);
		}
	}, [gameType, gameId]);

	// Sort players by lap
	const sortedPlayers = [...connectedPlayers].sort((a, b) => b.lap - a.lap);

	return (
		<div className="fixed inset-0 w-full h-full bg-gray-900 flex flex-col overflow-hidden z-50">
			<div className="bg-gray-800/90 backdrop-blur-sm px-4 py-2 flex items-center justify-between border-b border-gray-700/50 flex-shrink-0 z-10">
				<button
					onClick={onBack}
					className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm"
				>
					<FaArrowLeft className="w-4 h-4" />
					<span>Exit</span>
				</button>

				<div className="flex items-center space-x-4 text-sm">
					<div className="flex items-center space-x-1">
						{connectionStatus === 'connected' ? (
							<FaWifi className="w-4 h-4 text-green-400" />
						) : (
							<FaWifi className="w-4 h-4 text-red-400" />
						)}
						<span
							className={
								connectionStatus === 'connected'
									? 'text-green-400'
									: 'text-red-400'
							}
						>
							{connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
						</span>
					</div>
					<div className="flex items-center space-x-1 text-green-400">
						<FaUsers className="w-4 h-4" />
						<span>{connectedPlayers.length}</span>
					</div>
					<button
						onClick={() => setShowQRPopup(true)}
						className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
					>
						<FaQrcode className="w-4 h-4" />
						<span>Connect</span>
					</button>
				</div>
			</div>

			<div
				className="flex-1 relative bg-gray-900 overflow-hidden"
				style={{ minHeight: 0 }}
			>
				<div
					ref={pixiContainer}
					className="absolute inset-0"
					style={{ width: '100%', height: '100%' }}
				/>
			</div>

			{/* Leaderboard overlay */}
			{sortedPlayers.length > 0 && (
				<div className="absolute top-14 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 space-y-2 max-h-64 overflow-y-auto">
					<h3 className="text-white font-bold text-sm mb-2">Leaderboard</h3>
					{sortedPlayers.map((player, index) => (
						<div
							key={player.id}
							className="flex items-center space-x-2 text-xs"
						>
							<span className="text-yellow-400 font-bold w-6">#{index + 1}</span>
							<div
								className="w-3 h-3 rounded"
								style={{ backgroundColor: player.color }}
							/>
							<span className="text-white">{player.name}</span>
							<span className="text-gray-400 ml-auto">Lap {player.lap}</span>
							{player.bestLapTime && (
								<span className="text-green-400">
									{player.bestLapTime.toFixed(2)}s
								</span>
							)}
						</div>
					))}
				</div>
			)}

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

export default RaceGameScreen;
