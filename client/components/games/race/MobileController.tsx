'use client';

import React, { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { FaGamepad, FaFlag, FaTrophy, FaWifi, FaTachometerAlt } from 'react-icons/fa';

interface RaceMobileControllerProps {
	gameId: string;
	gameType: string;
}

interface PlayerData {
	id: string;
	name: string;
	x: number;
	y: number;
	color: string;
	speed: number;
	lap: number;
}

const RaceMobileController: React.FC<RaceMobileControllerProps> = ({
	gameId,
	gameType,
}) => {
	const [connected, setConnected] = useState(false);
	const [playerName, setPlayerName] = useState('');
	const [isJoined, setIsJoined] = useState(false);
	const [playerData, setPlayerData] = useState<PlayerData | null>(null);
	const [connectionStatus, setConnectionStatus] = useState<
		'connecting' | 'connected' | 'disconnected'
	>('connecting');

	const socketRef = useRef<Socket | null>(null);
	const joystickRef = useRef<HTMLDivElement>(null);
	const knobRef = useRef<HTMLDivElement>(null);
	const inputStateRef = useRef({ accelerate: 0, turn: 0 });
	const lastInputSentRef = useRef({ accelerate: 0, turn: 0 });
	const isDraggingRef = useRef(false);
	const joystickTouchIdRef = useRef<number | null>(null);
	const engineAudioRef = useRef<HTMLAudioElement | null>(null);
	const crashAudioRef = useRef<HTMLAudioElement | null>(null);

	// Initialize audio elements
	useEffect(() => {
		const engineAudio = new Audio('/sounds/engine.mp3');
		engineAudio.loop = true;
		engineAudio.volume = 0.4;
		engineAudioRef.current = engineAudio;

		const crashAudio = new Audio('/sounds/crash.mp3');
		crashAudio.volume = 0.7;
		crashAudioRef.current = crashAudio;

		return () => {
			if (engineAudioRef.current) {
				engineAudioRef.current.pause();
				engineAudioRef.current = null;
			}
			if (crashAudioRef.current) {
				crashAudioRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		// Import dynamically to get the current socket URL
		import('@/lib/socket-utils').then(({ getSocketServerUrl }) => {
			const socketUrl = getSocketServerUrl();
			console.log('[RaceController] Connecting to socket server at:', socketUrl);
			console.log('[RaceController] Game ID:', gameId);
			const socket = io(socketUrl, {
				transports: ['websocket', 'polling'],
				timeout: 20000,
				reconnection: true,
				reconnectionAttempts: 10,
				reconnectionDelay: 1000,
				forceNew: false,
			});

			socketRef.current = socket;

			socket.on('connect', () => {
				console.log('[RaceController] Connected to server with ID:', socket.id);
				setConnected(true);
				setConnectionStatus('connected');
				
				console.log('[RaceController] Attempting to create room:', gameId);
				socket.emit('createRoom', {
					gameType: 'race',
					roomId: gameId,
					config: {
						worldWidth: 1920,
						worldHeight: 1080,
					},
				});
			});

			socket.on('disconnect', (reason) => {
				console.log('[RaceController] Disconnected from server:', reason);
				setConnected(false);
				setConnectionStatus('disconnected');
				setIsJoined(false);
			});

			socket.on('connect_error', (error) => {
				console.error('[RaceController] Connection error:', error);
				setConnectionStatus('disconnected');
			});

			socket.on('roomCreated', (data) => {
				console.log('[RaceController] Room created successfully:', data);
			});

			socket.on('error', (error) => {
				console.error('[RaceController] Socket error:', error);
			});

			socket.on('room:joined', (data) => {
				console.log('[RaceController] Player joined successfully:', data);
				setIsJoined(true);
				if (data.playerData) {
					setPlayerData(data.playerData);
				}
			});

			socket.on('gameState', (state) => {
				const player = state.players.find((p: any) => p.id === socket.id);
				if (player) {
					setPlayerData(player);
				}
			});

			socket.on('collision', (data) => {
				console.log('[RaceController] Collision detected:', data);
				// Play crash sound
				if (crashAudioRef.current) {
					crashAudioRef.current.currentTime = 0;
					crashAudioRef.current.play().catch(err => console.log('Crash audio play failed:', err));
				}
			});

			return () => {
				socket.disconnect();
			};
		});
	}, [gameId]);

	// Send input updates
	useEffect(() => {
		if (!isJoined || !socketRef.current) return;

		const sendInput = () => {
			const currentInput = inputStateRef.current;
			const lastInput = lastInputSentRef.current;

			const threshold = 0.01;
			if (
				Math.abs(currentInput.accelerate - lastInput.accelerate) > threshold ||
				Math.abs(currentInput.turn - lastInput.turn) > threshold
			) {
				socketRef.current?.emit('playerInput', currentInput);
				lastInputSentRef.current = { ...currentInput };
			}
		};

		const interval = setInterval(sendInput, 16); // ~60 FPS
		return () => clearInterval(interval);
	}, [isJoined]);

	// Handle engine sound based on acceleration input
	useEffect(() => {
		if (!engineAudioRef.current) return;

		const checkAcceleration = () => {
			const isAccelerating = Math.abs(inputStateRef.current.accelerate) > 0.3;

			if (isAccelerating) {
				if (engineAudioRef.current && engineAudioRef.current.paused) {
					engineAudioRef.current.play().catch(err => console.log('Audio play failed:', err));
				}
			} else {
				if (engineAudioRef.current && !engineAudioRef.current.paused) {
					engineAudioRef.current.pause();
				}
			}
		};

		// Check acceleration more frequently
		const interval = setInterval(checkAcceleration, 100);
		return () => clearInterval(interval);
	}, []);



	const joinGame = () => {
		if (socketRef.current && playerName.trim() && connected) {
			console.log('[RaceController] Attempting to join room:', gameId, 'with name:', playerName.trim());
			socketRef.current.emit('room:join', {
				roomId: gameId,
				playerName: playerName.trim(),
			});
		} else {
			console.error('[RaceController] Cannot join game:', {
				socket: !!socketRef.current,
				playerName: playerName.trim(),
				connected
			});
		}
	};

	// Joystick handlers
	const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
		e.preventDefault();
		
		if (e.type.startsWith('touch')) {
			const touch = (e as React.TouchEvent).touches[0];
			if (touch) {
				joystickTouchIdRef.current = touch.identifier;
			}
		}
		
		isDraggingRef.current = true;
		
		if (joystickRef.current) {
			joystickRef.current.style.opacity = '1';
			joystickRef.current.style.transform = 'scale(1.05)';
		}
	};

	const handleJoystickMove = (
		e: TouchEvent | MouseEvent | React.TouchEvent | React.MouseEvent
	) => {
		if (!isDraggingRef.current || !joystickRef.current || !knobRef.current)
			return;

		e.preventDefault();
		const rect = joystickRef.current.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		let clientX, clientY;
		if (e.type.startsWith('touch')) {
			const touches = (e as TouchEvent).touches || (e as React.TouchEvent).touches;
			let targetTouch = touches[0];

			if (joystickTouchIdRef.current !== null) {
				for (let i = 0; i < touches.length; i++) {
					if (touches[i].identifier === joystickTouchIdRef.current) {
						targetTouch = touches[i];
						break;
					}
				}
			}

			if (!targetTouch) return;
			clientX = targetTouch.clientX;
			clientY = targetTouch.clientY;
		} else {
			const mouse = e as MouseEvent | React.MouseEvent;
			clientX = mouse.clientX;
			clientY = mouse.clientY;
		}

		const deltaX = clientX - centerX;
		const deltaY = clientY - centerY;
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		const maxDistance = 100;

		// Calculate normalized direction
		let normalizedX = distance > 0 ? deltaX / distance : 0;
		let normalizedY = distance > 0 ? deltaY / distance : 0;

		// Limit the knob position within the joystick circle
		const constrainedDistance = Math.min(distance, maxDistance);
		const knobX = normalizedX * constrainedDistance;
		const knobY = normalizedY * constrainedDistance;

		knobRef.current.style.transform = `translate(${knobX}px, ${knobY}px)`;

		// Calculate input strength based on distance from center
		const inputStrength = Math.min(distance / maxDistance, 1);
		
		// X-axis controls turning
		// Y-axis controls acceleration (negative Y = accelerate forward)
		const accelerate = -normalizedY * inputStrength;
		const turn = normalizedX * inputStrength;

		inputStateRef.current.accelerate = accelerate;
		inputStateRef.current.turn = turn;
	};

	const handleJoystickEnd = (e?: TouchEvent | React.TouchEvent) => {
		if (e && e.type.startsWith('touch')) {
			const changedTouches = (e as TouchEvent).changedTouches || (e as React.TouchEvent).changedTouches;
			let isOurTouch = false;

			for (let i = 0; i < changedTouches.length; i++) {
				if (changedTouches[i].identifier === joystickTouchIdRef.current) {
					isOurTouch = true;
					break;
				}
			}

			if (!isOurTouch) return;
		}

		isDraggingRef.current = false;
		joystickTouchIdRef.current = null;

		if (knobRef.current) {
			knobRef.current.style.transform = 'translate(0px, 0px)';
		}

		if (joystickRef.current) {
			joystickRef.current.style.opacity = '0.9';
			joystickRef.current.style.transform = 'scale(1)';
		}

		inputStateRef.current = { accelerate: 0, turn: 0 };
	};

	// Global event listeners
	useEffect(() => {
		const handleGlobalTouchMove = (e: TouchEvent) => {
			if (isDraggingRef.current) {
				e.preventDefault();
				handleJoystickMove(e);
			}
		};

		const handleGlobalTouchEnd = (e: TouchEvent) => {
			handleJoystickEnd(e);
		};

		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (isDraggingRef.current) {
				handleJoystickMove(e);
			}
		};

		const handleGlobalMouseUp = () => {
			handleJoystickEnd();
		};

		document.addEventListener('touchmove', handleGlobalTouchMove, {
			passive: false,
		});
		document.addEventListener('touchend', handleGlobalTouchEnd);
		document.addEventListener('mousemove', handleGlobalMouseMove);
		document.addEventListener('mouseup', handleGlobalMouseUp);

		return () => {
			document.removeEventListener('touchmove', handleGlobalTouchMove);
			document.removeEventListener('touchend', handleGlobalTouchEnd);
			document.removeEventListener('mousemove', handleGlobalMouseMove);
			document.removeEventListener('mouseup', handleGlobalMouseUp);
		};
	}, []);

	if (connectionStatus === 'connecting') {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
				<div className="text-center">
					<div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
					<p className="text-white text-lg">Connecting to game...</p>
					<p className="text-gray-300 text-sm mt-2">Room: {gameId}</p>
				</div>
			</div>
		);
	}

	if (connectionStatus === 'disconnected') {
		return (
			<div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center p-4">
				<div className="text-center">
					<FaWifi className="w-12 h-12 text-white mx-auto mb-4" />
					<p className="text-white text-lg">Connection lost</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors"
					>
						Retry connection
					</button>
				</div>
			</div>
		);
	}

	if (!isJoined) {
		return (
			<div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
				<div className="max-w-sm w-full">
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mb-4">
							<FaGamepad className="w-8 h-8 text-white" />
						</div>
						<h1 className="text-2xl font-bold text-white mb-2">
							Join the race
						</h1>
						<p className="text-gray-300">Enter player name</p>

						<div className="flex items-center justify-center space-x-2 mt-4">
							<FaWifi className="w-4 h-4 text-green-400" />
							<span className="text-green-400 text-sm">Connected</span>
						</div>
					</div>

					<div className="bg-background/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
						<input
							type="text"
							value={playerName}
							onChange={(e) => setPlayerName(e.target.value)}
							onKeyPress={(e) => e.key === 'Enter' && joinGame()}
							placeholder="Your name"
							className="w-full bg-background/20 border border-white/30 rounded-md px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
							maxLength={20}
							autoFocus
						/>
						<button
							onClick={joinGame}
							disabled={!playerName.trim() || !connected}
							className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-md transition-all duration-200 disabled:cursor-not-allowed"
						>
							{connected ? 'Join' : 'Connecting...'}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 w-screen h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col overflow-hidden z-50">
			{/* Header */}
			<div className="bg-black/50 backdrop-blur-lg px-4 py-3 border-b border-gray-700">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<FaFlag className="w-5 h-5 text-yellow-400" />
						<span className="text-white font-medium">{playerName}</span>
						{playerData && (
							<div
								className="w-4 h-4 rounded-full border border-white/30"
								style={{ backgroundColor: playerData.color }}
							/>
						)}
					</div>
					<div className="flex items-center space-x-3 text-sm">
						<div className="flex items-center space-x-1 text-yellow-400">
							<FaTrophy className="w-4 h-4" />
							<span>Lap {playerData?.lap || 0}</span>
						</div>
						<div className="flex items-center space-x-1 text-green-400">
							<FaWifi className="w-4 h-4" />
						</div>
					</div>
				</div>

				{/* Speedometer */}
				{playerData && (
					<div className="mt-2 bg-gray-800/50 rounded-md p-2">
						<div className="flex items-center justify-between mb-1">
							<span className="text-xs text-gray-400">Speed</span>
							<div className="flex items-center space-x-1">
								<FaTachometerAlt className="w-3 h-3 text-blue-400" />
								<span className="text-xs text-white font-bold">
									{Math.round(Math.abs(playerData.speed) / 10)} km/h
								</span>
							</div>
						</div>
						<div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-300"
								style={{
									width: `${Math.min(
										100,
										(Math.abs(playerData.speed) / 800) * 100
									)}%`,
								}}
							/>
						</div>
					</div>
				)}
			</div>

			{/* Controls - Single Joystick in Center */}
			<div className="flex-1 flex items-center justify-center pb-12">
				<div className="flex flex-col items-center">
					<div className="text-center mb-4">
						<span className="text-gray-400 text-sm">JOYSTICK CONTROL</span>
					</div>
					<div
						ref={joystickRef}
						className="w-48 h-48 rounded-full bg-background/10 backdrop-blur-lg border-4 border-blue-400/50 relative opacity-90 transition-all duration-200 touch-none select-none cursor-pointer"
						onTouchStart={handleJoystickStart}
						onMouseDown={handleJoystickStart}
					>
						{/* Center dot */}
						<div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-400/70 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

						{/* Joystick knob */}
						<div
							ref={knobRef}
							className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-2xl border-4 border-blue-300/80 pointer-events-none"
						></div>
					</div>
					<div className="mt-4 text-xs text-gray-500 text-center">
						<p>Up: Accelerate</p>
						<p>Down: Brake</p>
						<p>Left/Right: Turn</p>
					</div>
				</div>
			</div>

			{/* Instructions */}
			<div className="p-4 bg-black/30 backdrop-blur-lg">
				<p className="text-gray-400 text-sm text-center">
					Use joystick to control direction and speed • Drive through checkpoints
				</p>
			</div>
		</div>
	);
};

export default RaceMobileController;
