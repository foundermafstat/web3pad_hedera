'use client';

import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { FaArrowLeft, FaUsers, FaQrcode, FaWifi } from 'react-icons/fa';
import dynamic from 'next/dynamic';

const GameQRSheet = dynamic(
	() => import('@/components/GameQRSheet').then((mod) => ({ default: mod.GameQRSheet })),
	{ ssr: false }
);

const GameInterfaceHeader = dynamic(() => import('@/components/GameInterfaceHeader'), {
	ssr: false,
});

interface TestGyroGameScreenProps {
	gameId: string;
	gameType: string;
	onBack: () => void;
}

interface Player {
	id: string;
	x: number;
	y: number;
	color: string;
	name: string;
	score: number;
}

interface GyroData {
	playerId: string;
	alpha: number;
	beta: number;
	gamma: number;
}

const TestGyroGameScreen: React.FC<TestGyroGameScreenProps> = ({
	gameId,
	gameType,
	onBack,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const socketRef = useRef<Socket | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const playersRef = useRef<Map<string, Player>>(new Map());

	const [connectedPlayers, setConnectedPlayers] = useState<Player[]>([]);
	const [showQRPopup, setShowQRPopup] = useState(false);
	const [controllerUrl, setControllerUrl] = useState('');
	const [connectionStatus, setConnectionStatus] = useState<
		'connecting' | 'connected' | 'disconnected'
	>('connecting');
	const [isMounted, setIsMounted] = useState(false);

	// Game constants
	const CANVAS_WIDTH = 800;
	const CANVAS_HEIGHT = 600;
	const BALL_RADIUS = 20;
	const FRICTION = 0.98;
	const GRAVITY_SCALE = 0.5;
	const MAX_SPEED = 15;

	// Check if mounted (client-side only)
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Generate controller URL
	useEffect(() => {
		if (!isMounted) return;
		
		const url = `${process.env.NEXT_PUBLIC_CLIENT_URL}/game/${gameType}?mode=controller&roomId=${gameId}`;
		setControllerUrl(url);
		console.log('[TestGyroGameScreen] QR URL:', url);
	}, [gameType, gameId, isMounted]);

	// Initialize Socket
	useEffect(() => {
		if (!isMounted) return;

		console.log('[TestGyroGameScreen] Initializing with:', {
			gameId,
			gameType,
			serverUrl: process.env.NEXT_PUBLIC_SERVER_URL,
		});

		const socket = io(process.env.NEXT_PUBLIC_SERVER_URL!, {
			transports: ['websocket', 'polling'],
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionAttempts: 5,
		});

		socketRef.current = socket;

		socket.on('connect', () => {
			console.log('[TestGyroGameScreen] Socket connected:', socket.id);
			setConnectionStatus('connected');

			socket.emit('game:create', {
				roomId: gameId,
				gameType: gameType,
			});

			console.log('[TestGyroGameScreen] Game created:', gameId);
		});

		socket.on('disconnect', () => {
			console.log('[TestGyroGameScreen] Socket disconnected');
			setConnectionStatus('disconnected');
		});

		socket.on('connect_error', (error) => {
			console.error('[TestGyroGameScreen] Connection error:', error);
			setConnectionStatus('disconnected');
		});

		// Player joined
		socket.on('player:joined', (data: { playerId: string }) => {
			console.log('[TestGyroGameScreen] Player joined:', data.playerId);

			// Assign random color
			const colors = [
				'#3B82F6', // blue
				'#EF4444', // red
				'#10B981', // green
				'#F59E0B', // amber
				'#8B5CF6', // violet
				'#EC4899', // pink
			];

			const player: Player = {
				id: data.playerId,
				x: CANVAS_WIDTH / 2,
				y: CANVAS_HEIGHT / 2,
				color: colors[playersRef.current.size % colors.length],
				name: `Player ${playersRef.current.size + 1}`,
				score: 0,
			};

			playersRef.current.set(data.playerId, player);
			updatePlayersList();
		});

		// Player left
		socket.on('player:left', (data: { playerId: string }) => {
			console.log('[TestGyroGameScreen] Player left:', data.playerId);
			playersRef.current.delete(data.playerId);
			updatePlayersList();
		});

		// Gyroscope data received
		socket.on('controller:gyro', (data: GyroData) => {
			const player = playersRef.current.get(data.playerId);
			if (player) {
				// Update player velocity based on device tilt
				// gamma: -90 to 90 (left-right tilt)
				// beta: -180 to 180 (forward-backward tilt)
				
				const vx = (data.gamma / 90) * MAX_SPEED * GRAVITY_SCALE;
				const vy = (data.beta / 180) * MAX_SPEED * GRAVITY_SCALE;

				// Update position
				player.x += vx;
				player.y += vy;

				// Bounce off walls with vibration feedback
				let hitWall = false;

				if (player.x - BALL_RADIUS < 0) {
					player.x = BALL_RADIUS;
					hitWall = true;
				} else if (player.x + BALL_RADIUS > CANVAS_WIDTH) {
					player.x = CANVAS_WIDTH - BALL_RADIUS;
					hitWall = true;
				}

				if (player.y - BALL_RADIUS < 0) {
					player.y = BALL_RADIUS;
					hitWall = true;
				} else if (player.y + BALL_RADIUS > CANVAS_HEIGHT) {
					player.y = CANVAS_HEIGHT - BALL_RADIUS;
					hitWall = true;
				}

				// Send vibration to controller if hit wall
				if (hitWall && socket.connected) {
					socket.emit('game:vibrate', {
						playerId: data.playerId,
						duration: 50,
					});
					player.score += 1;
				}

				playersRef.current.set(data.playerId, player);
			}
		});

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			if (socket.connected) {
				socket.disconnect();
			}
		};
	}, [gameId, gameType, isMounted]);

	// Update players list state
	const updatePlayersList = () => {
		setConnectedPlayers(Array.from(playersRef.current.values()));
	};

	// Render game
	useEffect(() => {
		if (!isMounted) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const render = () => {
			// Clear canvas
			ctx.fillStyle = '#1F2937';
			ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			// Draw grid
			ctx.strokeStyle = '#374151';
			ctx.lineWidth = 1;
			for (let x = 0; x < CANVAS_WIDTH; x += 50) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, CANVAS_HEIGHT);
				ctx.stroke();
			}
			for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(CANVAS_WIDTH, y);
				ctx.stroke();
			}

			// Draw center crosshair
			ctx.strokeStyle = '#4B5563';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(CANVAS_WIDTH / 2, 0);
			ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(0, CANVAS_HEIGHT / 2);
			ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
			ctx.stroke();

			// Draw walls
			ctx.strokeStyle = '#EF4444';
			ctx.lineWidth = 4;
			ctx.strokeRect(2, 2, CANVAS_WIDTH - 4, CANVAS_HEIGHT - 4);

			// Draw players
			playersRef.current.forEach((player) => {
				// Shadow
				ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
				ctx.beginPath();
				ctx.arc(player.x + 3, player.y + 3, BALL_RADIUS, 0, Math.PI * 2);
				ctx.fill();

				// Ball
				ctx.fillStyle = player.color;
				ctx.beginPath();
				ctx.arc(player.x, player.y, BALL_RADIUS, 0, Math.PI * 2);
				ctx.fill();

				// Shine effect
				ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
				ctx.beginPath();
				ctx.arc(
					player.x - BALL_RADIUS / 3,
					player.y - BALL_RADIUS / 3,
					BALL_RADIUS / 3,
					0,
					Math.PI * 2
				);
				ctx.fill();

				// Name
				ctx.fillStyle = '#FFFFFF';
				ctx.font = 'bold 12px Arial';
				ctx.textAlign = 'center';
				ctx.fillText(player.name, player.x, player.y - BALL_RADIUS - 5);
			});

			// Update state for UI
			updatePlayersList();

			animationFrameRef.current = requestAnimationFrame(render);
		};

		render();

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [isMounted]);

	// Prevent hydration issues - only render after mount
	if (!isMounted) {
		return (
			<div className="fixed inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
				<div className="text-white text-xl">Loading...</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 w-full h-full bg-gray-900 flex flex-col overflow-hidden pt-16">
			{/* Game Interface Header */}
			<GameInterfaceHeader
				onBack={onBack}
				connectionStatus={connectionStatus}
				onShowQR={() => setShowQRPopup(true)}
				gameType="gyrotest"
				activePlayers={connectedPlayers.length}
			/>

			{/* Main Content */}
			<div className="flex-1 flex overflow-hidden">
				{/* Game Canvas */}
				<div className="flex-1 flex items-center justify-center p-4">
					<div className="relative">
						<canvas
							ref={canvasRef}
							width={CANVAS_WIDTH}
							height={CANVAS_HEIGHT}
							className="border-2 border-gray-700 rounded-md shadow-2xl"
						/>
						{connectedPlayers.length === 0 && (
							<div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
								<div className="text-center">
									<p className="text-white text-xl mb-2">
										Waiting for players...
									</p>
									<p className="text-gray-400">
										Scan QR code to join with mobile device
									</p>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Sidebar */}
				<div className="w-80 bg-gray-800/50 backdrop-blur-sm border-l border-gray-700/50 p-4 overflow-y-auto">
					<h2 className="text-white text-lg font-bold mb-4">
						Gyroscope Test Game
					</h2>

					<div className="space-y-4">
						{/* Instructions */}
						<div className="bg-blue-900/30 border border-blue-700/50 rounded-md p-3">
							<h3 className="text-blue-400 font-semibold mb-2 text-sm">
								How to Play
							</h3>
							<ul className="text-gray-300 text-xs space-y-1">
								<li>• Scan QR code with mobile device</li>
								<li>• Enable gyroscope permission</li>
								<li>• Tilt device to move ball</li>
								<li>• Touch walls to score points</li>
								<li>• Feel vibration on wall hit</li>
							</ul>
						</div>

						{/* Players List */}
						<div className="space-y-2">
							<h3 className="text-white font-semibold text-sm">
								Connected Players ({connectedPlayers.length})
							</h3>
							{connectedPlayers.length === 0 ? (
								<p className="text-gray-400 text-sm">No players yet</p>
							) : (
								connectedPlayers.map((player) => (
									<div
										key={player.id}
										className="bg-gray-700/50 rounded-md p-3 space-y-2"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-2">
												<div
													className="w-4 h-4 rounded-full"
													style={{ backgroundColor: player.color }}
												/>
												<span className="text-white font-medium text-sm">
													{player.name}
												</span>
											</div>
											<span className="text-gray-400 text-xs">
												Score: {player.score}
											</span>
										</div>
										<div className="text-xs text-gray-400">
											Position: ({Math.round(player.x)}, {Math.round(player.y)})
										</div>
									</div>
								))
							)}
						</div>
					</div>
				</div>
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

export default TestGyroGameScreen;

