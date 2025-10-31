'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import {
	FaGamepad,
	FaBolt,
	FaHeart,
	FaTrophy,
	FaShieldAlt,
	FaTachometerAlt,
	FaWifi,
	FaCompass,
} from 'react-icons/fa';
import AuthModal from '../../AuthModal';
import { useWallet } from '@/contexts/WalletContext';

const DEFAULT_HEDERA_ACCOUNT_ID =
	process.env.NEXT_PUBLIC_DEFAULT_HEDERA_ACCOUNT_ID || '0.0.5911528';
const DEFAULT_EVM_ADDRESS =
	process.env.NEXT_PUBLIC_DEFAULT_EVM_ADDRESS ||
	'0x3263874809c13d364dEA26a89b1232268935e8eC';

const isHederaAccountId = (value?: string | null) =>
	Boolean(value && value.includes('.'));
const isEvmAddress = (value?: string | null) =>
	Boolean(value && value.startsWith('0x'));

interface MobileControllerProps {
	gameId: string;
	gameType: string;
}

interface PlayerData {
	shotsFired: number;
	id: string;
	name: string;
	x: number;
	y: number;
	color: string;
	health?: number;
	facingDirection?: { x: number; y: number };
	aimDirection?: { x: number; y: number };
	isMoving?: boolean;
	walletAddress?: string | null;
	hederaAccountId?: string | null;
	kills?: number;
	deaths?: number;
	botKills?: number;
	lives?: number;
	maxLives?: number;
	gameOver?: boolean;
	finalScore?: number;
	timeSurvivedSeconds?: number;
	resultSubmitted?: boolean;
	resultSignature?: any;
}

interface GameOverState {
	finalScore: number;
	player: PlayerData;
	blockchainResult?: any;
	timestamp: number;
}

const MobileController: React.FC<MobileControllerProps> = ({
	gameId,
	gameType,
}) => {
	const { data: session, status } = useSession();
	const {
		isConnected: walletConnected,
		walletAddress,
		connectWallet,
		refreshWalletState,
		signMessage,
	} = useWallet();
	const targetNetwork: 'mainnet' | 'testnet' = 'testnet';
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [connected, setConnected] = useState(false);
	const [playerName, setPlayerName] = useState('');
	const [isJoined, setIsJoined] = useState(false);
	const [playerData, setPlayerData] = useState<PlayerData | null>(null);
	const [playerStats, setPlayerStats] = useState({
		kills: 0,
		deaths: 0,
		botKills: 0,
		alive: true,
		effects: {
			speedBoost: { active: false, endTime: 0 },
			shield: { active: false, endTime: 0 },
		},
	});
	const [connectionStatus, setConnectionStatus] = useState<
		'connecting' | 'connected' | 'disconnected'
	>('connecting');
	const [sessionActive, setSessionActive] = useState(false);
	const [gameOverState, setGameOverState] = useState<GameOverState | null>(
		null
	);
	const [isSigningResult, setIsSigningResult] = useState(false);
	const [signatureError, setSignatureError] = useState<string | null>(null);
	const [signatureData, setSignatureData] = useState<{
		signatureMap: any;
		message: string;
	} | null>(null);

	// Check authentication on mount
	useEffect(() => {
		if (status === 'unauthenticated') {
			setShowAuthModal(true);
		} else if (status === 'authenticated' && session?.user) {
			setPlayerName(session.user.name || session.user.username || 'Player');
		}
	}, [status, session]);

	const socketRef = useRef<Socket | null>(null);
	const joystickRef = useRef<HTMLDivElement>(null);
	const knobRef = useRef<HTMLDivElement>(null);
	const inputStateRef = useRef({ x: 0, y: 0 });
	const aimDirectionRef = useRef({ x: 0, y: -1 }); // Default aim up
	const isDraggingRef = useRef(false);
	const joystickTouchIdRef = useRef<number | null>(null); // Track specific touch for joystick
	const lastInputSentRef = useRef({ x: 0, y: 0 });
	const gameOverRef = useRef(false);

	useEffect(() => {
		gameOverRef.current = Boolean(gameOverState);
	}, [gameOverState]);

	useEffect(() => {
		// Import dynamically to get the current socket URL
		import('@/lib/socket-utils').then(({ getSocketServerUrl }) => {
			const socketUrl = getSocketServerUrl();
			console.log(
				'[ShooterController] Connecting to socket server at:',
				socketUrl
			);
			const socket = io(socketUrl, {
				transports: ['websocket', 'polling'],
				timeout: 5000,
				reconnection: true,
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
			});

			socketRef.current = socket;

			socket.on('connect', () => {
				console.log(
					'[ShooterController] Connected to server with ID:',
					socket.id
				);
				setConnected(true);
				setConnectionStatus('connected');
				setSessionActive(false);
				setGameOverState(null);
				setSignatureData(null);
				setSignatureError(null);

				// Try to create room if it doesn't exist
				console.log('[ShooterController] Attempting to create room:', gameId);
				socket.emit('createRoom', {
					gameType: 'shooter',
					roomId: gameId,
					config: {
						worldWidth: 1920,
						worldHeight: 1080,
					},
				});
			});

			socket.on('disconnect', (reason) => {
				console.log('Disconnected from server:', reason);
				setConnected(false);
				setConnectionStatus('disconnected');
				setIsJoined(false);
				setSessionActive(false);
				setGameOverState(null);
			});

			socket.on('connect_error', (error) => {
				console.error('[ShooterController] Connection error:', error);
				setConnectionStatus('disconnected');
			});

			socket.on('error', (error) => {
				console.error('[ShooterController] Socket error:', error);
			});

			socket.on('roomCreated', (data) => {
				console.log('[ShooterController] Room created successfully:', data);
			});

			socket.on('room:joined', (data) => {
				console.log('[ShooterController] Player joined successfully:', data);
				setIsJoined(true);
				setSessionActive(true);
				setGameOverState(null);
				setSignatureData(null);
				setSignatureError(null);
				if (data.playerData) {
					setPlayerData(data.playerData);
					// Initialize aim direction from player data
					if (data.playerData.aimDirection) {
						aimDirectionRef.current = data.playerData.aimDirection;
					}
				}
			});

			socket.on('gameState', (state) => {
				if (gameOverRef.current) {
					return;
				}

				// Update player stats
				const player = state.players.find((p: any) => p.id === socket.id);
				if (player) {
					setPlayerStats({
						kills: player.kills,
						deaths: player.deaths,
						botKills: player.botKills || 0,
						alive: player.alive,
						effects: player.effects || {
							speedBoost: { active: false, endTime: 0 },
							shield: { active: false, endTime: 0 },
						},
					});

					// Update player data
					setPlayerData((prev) =>
						prev
							? {
									...prev,
									x: player.x,
									y: player.y,
									health: player.health,
									facingDirection: player.facingDirection,
									aimDirection: player.aimDirection,
									isMoving: player.isMoving,
							  }
							: null
					);

					// Update local aim direction reference
					if (player.aimDirection) {
						aimDirectionRef.current = player.aimDirection;
					}
				}
			});

			socket.on('gameOver', (payload) => {
				if (!payload?.player || payload.player.id !== socket.id) {
					return;
				}

				setSessionActive(false);
				setGameOverState({
					finalScore: payload.finalScore,
					player: payload.player,
					blockchainResult: payload.blockchainResult || null,
					timestamp: Date.now(),
				});
			});

			socket.on('playerSignatureRecorded', ({ playerId, signature }) => {
				if (playerId !== socket.id) return;
				setSignatureData(signature);
			});

			socket.on('gameResultSubmitted', ({ playerId, blockchainResult }) => {
				if (playerId !== socket.id) return;
				setGameOverState((prev) =>
					prev
						? {
								...prev,
								blockchainResult: blockchainResult || prev.blockchainResult,
						  }
						: prev
				);
			});

			return () => {
				socket.disconnect();
			};
		});
	}, [gameId]);

	// Send input updates at regular intervals
	useEffect(() => {
		if (!isJoined || !sessionActive || !socketRef.current) return;

		const sendInput = () => {
			const currentInput = inputStateRef.current;
			const lastInput = lastInputSentRef.current;

			// Only send if input has changed significantly or if there's movement
			const threshold = 0.01;
			if (
				Math.abs(currentInput.x - lastInput.x) > threshold ||
				Math.abs(currentInput.y - lastInput.y) > threshold
			) {
				socketRef.current?.emit('shooter:input', { input: currentInput });
				lastInputSentRef.current = { ...currentInput };
			}
		};

		const interval = setInterval(sendInput, 16); // ~60 FPS
		return () => clearInterval(interval);
	}, [isJoined, sessionActive]);

	const joinGame = () => {
		if (socketRef.current && playerName.trim() && connected) {
			console.log(
				'[ShooterController] Attempting to join room with name:',
				playerName.trim(),
				'gameId:',
				gameId
			);
			const resolvedWalletAddress = isEvmAddress(walletAddress)
				? walletAddress!
				: DEFAULT_EVM_ADDRESS;
			const resolvedHederaAccount = isHederaAccountId(walletAddress)
				? walletAddress!
				: DEFAULT_HEDERA_ACCOUNT_ID;
			if (!isHederaAccountId(walletAddress)) {
				console.warn(
					'[ShooterController] Hedera account missing from wallet context; using default id',
					resolvedHederaAccount
				);
			}
			socketRef.current.emit('room:join', {
				roomId: gameId,
				playerName: playerName.trim(),
				walletAddress: resolvedWalletAddress,
				hederaAccountId: resolvedHederaAccount,
			});
		}
	};

	const shoot = () => {
		if (socketRef.current && isJoined && sessionActive && playerStats.alive) {
			socketRef.current.emit('shooter:shoot');
			console.log('Shot fired in direction:', aimDirectionRef.current);
		}
	};

	const handleConnectWallet = useCallback(async () => {
		try {
			setSignatureError(null);
			await connectWallet(targetNetwork);
			await refreshWalletState();
		} catch (error: any) {
			console.error('[ShooterController] Wallet connect error:', error);
			setSignatureError(error?.message || 'Failed to connect wallet');
		}
	}, [connectWallet, refreshWalletState, targetNetwork]);

	const buildResultMessage = useCallback(() => {
		if (!gameOverState) return '';
		const resolvedWallet = isEvmAddress(walletAddress)
			? walletAddress!
			: isEvmAddress(gameOverState.player.walletAddress)
			? gameOverState.player.walletAddress!
			: DEFAULT_EVM_ADDRESS;
		const parts = [
			'ShooterResult',
			gameId,
			gameOverState.player.id,
			resolvedWallet,
			String(gameOverState.finalScore ?? gameOverState.player.finalScore ?? 0),
			String(gameOverState.player.kills ?? 0),
			String(gameOverState.player.botKills ?? 0),
			String(gameOverState.player.deaths ?? 0),
			String(gameOverState.player.timeSurvivedSeconds ?? 0),
			String(gameOverState.timestamp),
		];
		return parts.join('|');
	}, [gameOverState, gameId, walletAddress]);

	const handleSignResult = useCallback(async () => {
		if (!gameOverState || isSigningResult) return;
		try {
			setSignatureError(null);
			setIsSigningResult(true);

			if (!walletConnected || !walletAddress) {
				await connectWallet(targetNetwork);
				await refreshWalletState();
			}

			const message = buildResultMessage();
			if (!message) {
				throw new Error('Invalid result payload for signing');
			}

			const signature = await signMessage(message);
			setSignatureData(signature);

			const resolvedWalletAddress = isEvmAddress(walletAddress)
				? walletAddress!
				: isEvmAddress(gameOverState.player.walletAddress)
				? gameOverState.player.walletAddress!
				: DEFAULT_EVM_ADDRESS;
			const resolvedHederaAccount = isHederaAccountId(
				gameOverState.player.hederaAccountId
			)
				? gameOverState.player.hederaAccountId!
				: isHederaAccountId(walletAddress)
				? walletAddress!
				: DEFAULT_HEDERA_ACCOUNT_ID;

			if (!isHederaAccountId(gameOverState.player.hederaAccountId)) {
				console.warn(
					'[ShooterController] Using fallback Hedera account for signature submission:',
					resolvedHederaAccount
				);
			}

			socketRef.current?.emit('shooter:resultSignature', {
				roomId: gameId,
				playerId: gameOverState.player.id,
				walletAddress: resolvedWalletAddress,
				hederaAccountId: resolvedHederaAccount,
				message,
				signatureMap: signature.signatureMap,
				finalScore: gameOverState.finalScore,
				timestamp: gameOverState.timestamp,
			});
		} catch (error: any) {
			console.error('[ShooterController] Error signing result:', error);
			setSignatureError(error?.message || 'Failed to sign result');
		} finally {
			setIsSigningResult(false);
		}
	}, [
		buildResultMessage,
		connectWallet,
		gameId,
		gameOverState,
		isSigningResult,
		refreshWalletState,
		signMessage,
		targetNetwork,
		walletAddress,
		walletConnected,
	]);

	const handleRestart = useCallback(() => {
		setGameOverState(null);
		setSignatureData(null);
		setSignatureError(null);
		setSessionActive(false);
		setIsJoined(false);
		setPlayerStats({
			kills: 0,
			deaths: 0,
			botKills: 0,
			alive: true,
			effects: {
				speedBoost: { active: false, endTime: 0 },
				shield: { active: false, endTime: 0 },
			},
		});
		setPlayerData(null);
	}, []);

	useEffect(() => {
		if (!gameOverState) return;
		if (signatureData || isSigningResult || signatureError) return;
		handleSignResult();
	}, [
		gameOverState,
		signatureData,
		isSigningResult,
		signatureError,
		handleSignResult,
	]);

	const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
		e.preventDefault();

		// For touch events, track the touch identifier
		if (e.type.startsWith('touch')) {
			const touch = (e as React.TouchEvent).touches[0];
			if (touch) {
				joystickTouchIdRef.current = touch.identifier;
			}
		}

		isDraggingRef.current = true;

		if (joystickRef.current && knobRef.current) {
			joystickRef.current.style.opacity = '1';
			joystickRef.current.style.transform = 'scale(1.05)';
		}

		console.log(
			'Joystick interaction started, touchId:',
			joystickTouchIdRef.current
		);
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
			// Find the touch with our tracked identifier
			const touches =
				(e as TouchEvent).touches || (e as React.TouchEvent).touches;
			let targetTouch = touches[0]; // Default to first touch

			if (joystickTouchIdRef.current !== null) {
				for (let i = 0; i < touches.length; i++) {
					if (touches[i].identifier === joystickTouchIdRef.current) {
						targetTouch = touches[i];
						break;
					}
				}
			}

			if (!targetTouch) return; // Our touch ended

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
		const maxDistance = 60; // Increased for better precision

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
		const newInput = {
			x: normalizedX * inputStrength,
			y: normalizedY * inputStrength,
		};

		inputStateRef.current = newInput;

		// Update aim direction when there's significant input
		if (inputStrength > 0.1) {
			aimDirectionRef.current = { x: normalizedX, y: normalizedY };

			// Send aim direction to server
			if (socketRef.current) {
				socketRef.current.emit('shooter:aim', {
					direction: aimDirectionRef.current,
				});
			}
		}
	};

	const handleJoystickEnd = (e?: TouchEvent | React.TouchEvent) => {
		// For touch events, only end if it's our tracked touch
		if (e && e.type.startsWith('touch')) {
			const changedTouches =
				(e as TouchEvent).changedTouches ||
				(e as React.TouchEvent).changedTouches;
			let isOurTouch = false;

			for (let i = 0; i < changedTouches.length; i++) {
				if (changedTouches[i].identifier === joystickTouchIdRef.current) {
					isOurTouch = true;
					break;
				}
			}

			if (!isOurTouch) return; // Not our touch
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

		inputStateRef.current = { x: 0, y: 0 };
		console.log('Joystick interaction ended');
	};

	// Global event listeners for better touch/mouse handling
	useEffect(() => {
		const handleGlobalMouseMove = (e: MouseEvent) => {
			if (isDraggingRef.current) {
				handleJoystickMove(e);
			}
		};

		const handleGlobalMouseUp = () => {
			if (isDraggingRef.current) {
				handleJoystickEnd();
			}
		};

		const handleGlobalTouchMove = (e: TouchEvent) => {
			if (isDraggingRef.current) {
				e.preventDefault();
				handleJoystickMove(e);
			}
		};

		const handleGlobalTouchEnd = (e: TouchEvent) => {
			// Pass the event to check touch identifier
			handleJoystickEnd(e);
		};

		document.addEventListener('mousemove', handleGlobalMouseMove);
		document.addEventListener('mouseup', handleGlobalMouseUp);
		document.addEventListener('touchmove', handleGlobalTouchMove, {
			passive: false,
		});
		document.addEventListener('touchend', handleGlobalTouchEnd);

		return () => {
			document.removeEventListener('mousemove', handleGlobalMouseMove);
			document.removeEventListener('mouseup', handleGlobalMouseUp);
			document.removeEventListener('touchmove', handleGlobalTouchMove);
			document.removeEventListener('touchend', handleGlobalTouchEnd);
		};
	}, []);

	// Auth loading state
	if (status === 'loading') {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
				<div className="text-center">
					<div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
					<p className="text-white text-lg">Loading...</p>
				</div>
			</div>
		);
	}

	// Auth required
	if (status === 'unauthenticated' || showAuthModal) {
		return (
			<>
				<AuthModal
					isOpen={true}
					onClose={() => {}} // Cannot close without auth
					onSuccess={() => setShowAuthModal(false)}
				/>
				<div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
					<div className="text-center text-white">
						<p className="text-xl mb-4">Please sign in to continue</p>
					</div>
				</div>
			</>
		);
	}

	if (connectionStatus === 'connecting') {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
				<div className="text-center">
					<div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
					<p className="text-white text-lg">Connecting to game...</p>
					<p className="text-gray-300 text-sm mt-2">Game ID: {gameId}</p>
				</div>
			</div>
		);
	}

	if (connectionStatus === 'disconnected') {
		return (
			<div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center p-4">
				<div className="text-center">
					<FaWifi className="w-12 h-12 text-white mx-auto mb-4" />
					<p className="text-white text-lg">Connection Lost</p>
					<p className="text-gray-300 text-sm mt-2">
						Unable to connect to game server
					</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors"
					>
						Retry Connection
					</button>
				</div>
			</div>
		);
	}

	if (gameOverState) {
		const totalShots = gameOverState.player?.shotsFired ?? 0;
		return (
			<div className="min-h-screen bg-gradient-to-br from-[#150428] via-[#1f0f3d] to-black flex items-center justify-center p-6">
				<div className="w-full max-w-md bg-black/60 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 space-y-6">
					<div className="text-center space-y-2">
						<div className="flex items-center justify-center space-x-2">
							<FaGamepad className="w-6 h-6 text-purple-300" />
							<h1 className="text-white text-2xl font-semibold">
								Match Finished
							</h1>
						</div>
						<p className="text-gray-300">
							Your score:{' '}
							<span className="text-white font-semibold">
								{gameOverState.finalScore}
							</span>
						</p>
					</div>

					<div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
						<div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
							<p className="text-xs uppercase tracking-wide text-gray-400">
								Kills
							</p>
							<p className="text-white text-xl font-semibold">
								{gameOverState.player.kills ?? 0}
							</p>
						</div>
						<div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
							<p className="text-xs uppercase tracking-wide text-gray-400">
								Bots
							</p>
							<p className="text-white text-xl font-semibold">
								{gameOverState.player.botKills ?? 0}
							</p>
						</div>
						<div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
							<p className="text-xs uppercase tracking-wide text-gray-400">
								Deaths
							</p>
							<p className="text-white text-xl font-semibold">
								{gameOverState.player.deaths ?? 0}
							</p>
						</div>
						<div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
							<p className="text-xs uppercase tracking-wide text-gray-400">
								Survival
							</p>
							<p className="text-white text-xl font-semibold">
								{gameOverState.player.timeSurvivedSeconds ?? 0}
								<span className="text-sm ml-1">sec</span>
							</p>
						</div>
					</div>

					<div>
						<label className="block text-xs uppercase tracking-wide text-gray-400 mb-2">
							Nickname
						</label>
						<input
							type="text"
							value={playerName}
							onChange={(e) => setPlayerName(e.target.value)}
							placeholder="Enter nickname"
							className="w-full bg-white/5 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 text-white rounded-xl px-4 py-3 outline-none transition"
							maxLength={20}
						/>
					</div>

					<div className="grid gap-3">
						<button
							onClick={handleSignResult}
							disabled={isSigningResult || !!signatureData}
							className={`w-full py-3 rounded-xl font-semibold transition ${
								signatureData
									? 'bg-emerald-600 text-white'
									: isSigningResult
									? 'bg-purple-500/40 text-white'
									: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600'
							}`}
						>
							{signatureData
								? 'Result signed'
								: isSigningResult
								? 'Signing…'
								: 'Sign result'}
						</button>

						{!walletConnected && (
							<button
								onClick={handleConnectWallet}
								className="w-full py-3 rounded-xl font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition"
							>
								Connect wallet
							</button>
						)}

						<button
							onClick={handleRestart}
							className="w-full py-3 rounded-xl font-semibold bg-transparent border border-white/20 text-white hover:bg-white/10 transition"
						>
							Play again
						</button>
					</div>

					<div className="text-xs text-gray-400 space-y-2">
						<p>
							Wallet:{' '}
							{walletAddress ||
								gameOverState.player.walletAddress ||
								'not connected'}
						</p>
						<p>Shots fired: {totalShots}</p>
					</div>

					{signatureError && (
						<div className="text-red-400 text-sm text-center">
							{signatureError}
						</div>
					)}

					{signatureData && (
						<div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-xl break-words">
							Signature saved. Submitted to server.
						</div>
					)}

					{gameOverState.blockchainResult && (
						<div className="bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs p-3 rounded-xl break-words">
							Result recorded on-chain. Tx:{' '}
							{gameOverState.blockchainResult.transactionHash ||
								gameOverState.blockchainResult.txId ||
								'—'}
						</div>
					)}
				</div>
			</div>
		);
	}

	if (!isJoined) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
				<div className="max-w-sm w-full">
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4">
							<FaGamepad className="w-8 h-8 text-white" />
						</div>
						<h1 className="text-2xl font-bold text-white mb-2">
							Join in Web3Pad
						</h1>
						<p className="text-gray-300">Enter your player name</p>

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
							className="w-full bg-background/20 border border-white/30 rounded-md px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
							maxLength={20}
							autoFocus
						/>
						<button
							onClick={joinGame}
							disabled={!playerName.trim() || !connected}
							className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-md transition-all duration-200 disabled:cursor-not-allowed"
						>
							{connected ? 'Join Game' : 'Connecting...'}
						</button>
						<p className="text-xs text-gray-300 mt-3 text-center">
							{walletConnected
								? 'Wallet connected, the result will be signed automatically.'
								: 'After the match you will need to connect a wallet to sign the result.'}
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col overflow-hidden z-50">
			{/* Header */}
			<div className="bg-black/50 backdrop-blur-lg px-4 py-3 border-b border-gray-700">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<div
							className={`w-3 h-3 rounded-full ${
								playerStats.alive ? 'bg-green-400' : 'bg-red-400'
							}`}
						/>
						<span className="text-white font-medium">{playerName}</span>
						{playerData && (
							<div
								className="w-4 h-4 rounded-full border border-white/30"
								style={{ backgroundColor: playerData.color }}
							/>
						)}
						{playerData?.isMoving && (
							<div className="flex items-center space-x-1">
								<FaCompass className="w-3 h-3 text-blue-400" />
								<span className="text-blue-400 text-xs">Moving</span>
							</div>
						)}
					</div>
					<div className="flex items-center space-x-3 text-sm">
						<div
							className="flex items-center space-x-1 text-yellow-400"
							title="Player Kills"
						>
							<FaTrophy className="w-4 h-4" />
							<span>{playerStats.kills}</span>
						</div>
						<div
							className="flex items-center space-x-1 text-orange-400"
							title="Bot Kills"
						>
							<FaBolt className="w-4 h-4" />
							<span>{playerStats.botKills}</span>
						</div>
						<div
							className="flex items-center space-x-1 text-red-400"
							title="Deaths"
						>
							<FaHeart className="w-4 h-4" />
							<span>{playerStats.deaths}</span>
						</div>
						<div className="flex items-center space-x-1 text-green-400">
							<FaWifi className="w-4 h-4" />
						</div>
					</div>
				</div>

				{/* Health Bar */}
				{playerData && (
					<div className="mt-2 bg-gray-800/50 rounded-md p-2">
						<div className="flex items-center justify-between mb-1">
							<span className="text-xs text-gray-400">HP</span>
							<span className="text-xs text-white font-bold">
								{Math.max(0, Math.round(playerData.health || 100))}/100
							</span>
						</div>
						<div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
							<div
								className={`h-full transition-all duration-300 ${
									(playerData.health || 100) > 60
										? 'bg-green-500'
										: (playerData.health || 100) > 30
										? 'bg-yellow-500'
										: 'bg-red-500'
								}`}
								style={{ width: `${Math.max(0, playerData.health || 100)}%` }}
							/>
						</div>
					</div>
				)}

				{/* Active Effects */}
				{(playerStats.effects.speedBoost.active ||
					playerStats.effects.shield.active) && (
					<div className="flex items-center space-x-2 mt-2">
						{playerStats.effects.speedBoost.active && (
							<div className="flex items-center space-x-1 bg-orange-500/20 px-2 py-1 rounded-full">
								<FaTachometerAlt className="w-3 h-3 text-orange-400" />
								<span className="text-orange-400 text-xs">Speed</span>
							</div>
						)}
						{playerStats.effects.shield.active && (
							<div className="flex items-center space-x-1 bg-blue-500/20 px-2 py-1 rounded-full">
								<FaShieldAlt className="w-3 h-3 text-blue-400" />
								<span className="text-blue-400 text-xs">Shield</span>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Game Controls - Landscape Optimized */}
			<div className="flex-1 mobile-controller-landscape">
				{!playerStats.alive && (
					<div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
						<div className="bg-red-900/50 backdrop-blur-lg rounded-2xl p-4 border border-red-700">
							<p className="text-red-300 font-semibold text-center">
								You've been eliminated!
							</p>
							<p className="text-red-400 text-sm mt-1 text-center">
								Respawning soon...
							</p>
						</div>
					</div>
				)}

				{/* Movement Joystick - Left Side */}
				<div className="joystick-area">
					<div className="text-center mb-2">
						<span className="text-xs text-blue-400 font-medium">MOVEMENT</span>
					</div>
					<div
						ref={joystickRef}
						className="w-40 h-40 rounded-full bg-background/10 backdrop-blur-lg border-4 border-blue-400/50 relative opacity-90 transition-all duration-200 touch-none select-none cursor-pointer"
						onTouchStart={handleJoystickStart}
						onMouseDown={handleJoystickStart}
					>
						{/* Center dot */}
						<div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-400/70 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

						{/* Joystick knob */}
						<div
							ref={knobRef}
							className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-2xl border-4 border-blue-300/80 pointer-events-none"
						></div>
					</div>
				</div>

				{/* Action Buttons - Center */}
				<div className="action-area">
					<div className="text-center mb-2">
						<span className="text-xs text-red-400 font-medium">ACTIONS</span>
					</div>
					<button
						onTouchStart={(e) => {
							e.preventDefault();
							shoot();
						}}
						onMouseDown={(e) => {
							e.preventDefault();
							shoot();
						}}
						disabled={!playerStats.alive}
						className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 rounded-full text-white font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center border-4 border-red-400/50 disabled:border-gray-400/50"
					>
						<FaBolt className="w-10 h-10" />
					</button>
				</div>

				{/* Game Status - Right Side */}
				<div className="info-area">
					<div className="text-center mb-2">
						<span className="text-xs text-green-400 font-medium">STATUS</span>
					</div>
					<div className="w-20 h-20 rounded-full bg-background/10 backdrop-blur-lg border-4 border-green-400/30 flex items-center justify-center mb-2">
						<FaGamepad className="w-8 h-8 text-green-400" />
					</div>
					<div className="text-center">
						<div className="text-xs text-green-400 font-semibold">READY</div>
						<div className="text-xs text-gray-400 mt-1">
							{playerStats.alive ? 'ALIVE' : 'DEAD'}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MobileController;
