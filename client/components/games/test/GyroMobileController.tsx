'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { FaMobile, FaWifi, FaVibrate, FaGamepad } from 'react-icons/fa';
import AuthModal from '@/components/AuthModal';

interface TestGyroMobileControllerProps {
	gameId: string;
	gameType: string;
}

interface GyroData {
	alpha: number; // Z-axis rotation (0-360)
	beta: number; // X-axis rotation (-180 to 180)
	gamma: number; // Y-axis rotation (-90 to 90)
}

const TestGyroMobileController: React.FC<TestGyroMobileControllerProps> = ({
	gameId,
	gameType,
}) => {
	const { data: session, status } = useSession();
	const socketRef = useRef<Socket | null>(null);
	const [playerId, setPlayerId] = useState<string>('');
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState<
		'connecting' | 'connected' | 'disconnected'
	>('connecting');
	const [gyroSupported, setGyroSupported] = useState(false);
	const [gyroPermission, setGyroPermission] = useState<
		'granted' | 'denied' | 'prompt'
	>('prompt');
	const [gyroData, setGyroData] = useState<GyroData>({
		alpha: 0,
		beta: 0,
		gamma: 0,
	});
	const [vibrationSupported, setVibrationSupported] = useState(false);
	const [isMounted, setIsMounted] = useState(false);
	const lastSendTime = useRef<number>(0);

	// Check authentication on mount
	useEffect(() => {
		if (status === 'unauthenticated') {
			setShowAuthModal(true);
		}
	}, [status]);

	// Check if mounted (client-side only)
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Check device capabilities
	useEffect(() => {
		if (!isMounted) return;

		// Check gyroscope support
		if (
			typeof DeviceOrientationEvent !== 'undefined' &&
			typeof DeviceOrientationEvent.requestPermission === 'function'
		) {
			// iOS 13+ requires permission
			setGyroSupported(true);
		} else if (typeof DeviceOrientationEvent !== 'undefined') {
			// Android and older iOS
			setGyroSupported(true);
			setGyroPermission('granted');
		}

		// Check vibration support
		if ('vibrate' in navigator) {
			setVibrationSupported(true);
			console.log('[TestGyroController] Vibration API supported');
		}
	}, [isMounted]);

	// Request gyroscope permission (iOS)
	const requestGyroPermission = async () => {
		if (
			typeof DeviceOrientationEvent !== 'undefined' &&
			typeof (DeviceOrientationEvent as any).requestPermission === 'function'
		) {
			try {
				const permission = await (
					DeviceOrientationEvent as any
				).requestPermission();
				setGyroPermission(permission);
				console.log('[TestGyroController] Gyro permission:', permission);
				return permission === 'granted';
			} catch (error) {
				console.error('[TestGyroController] Permission error:', error);
				setGyroPermission('denied');
				return false;
			}
		}
		return true;
	};

	// Handle device orientation
	useEffect(() => {
		if (gyroPermission !== 'granted') return;

		const handleOrientation = (event: DeviceOrientationEvent) => {
			const data: GyroData = {
				alpha: event.alpha || 0,
				beta: event.beta || 0,
				gamma: event.gamma || 0,
			};

			setGyroData(data);

			// Send to server (throttled to ~60fps)
			const now = Date.now();
			if (now - lastSendTime.current > 16 && socketRef.current) {
				socketRef.current.emit('controller:gyro', {
					playerId,
					...data,
				});
				lastSendTime.current = now;
			}
		};

		window.addEventListener('deviceorientation', handleOrientation);
		console.log('[TestGyroController] Gyroscope listener added');

		return () => {
			window.removeEventListener('deviceorientation', handleOrientation);
		};
	}, [gyroPermission, playerId]);

	// Socket connection
	useEffect(() => {
		if (!isMounted) return;

		console.log('[TestGyroController] Initializing with:', {
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
			console.log('[TestGyroController] Socket connected:', socket.id);
			setConnectionStatus('connected');

			const newPlayerId = `player-${socket.id}`;
			setPlayerId(newPlayerId);

			socket.emit('controller:join', {
				roomId: gameId,
				gameType: gameType,
				playerId: newPlayerId,
				controllerType: 'gyro',
			});

			console.log('[TestGyroController] Joined room:', gameId);
		});

		socket.on('disconnect', () => {
			console.log('[TestGyroController] Socket disconnected');
			setConnectionStatus('disconnected');
		});

		socket.on('connect_error', (error) => {
			console.error('[TestGyroController] Connection error:', error);
			setConnectionStatus('disconnected');
		});

		// Receive vibration command from server
		socket.on('controller:vibrate', (data: { duration?: number; pattern?: number[] }) => {
			if (vibrationSupported) {
				if (data.pattern) {
					navigator.vibrate(data.pattern);
				} else {
					navigator.vibrate(data.duration || 100);
				}
				console.log('[TestGyroController] Vibrated:', data);
			}
		});

		return () => {
			if (socket.connected) {
				socket.disconnect();
			}
		};
	}, [gameId, gameType, isMounted]);

	// Test vibration
	const testVibration = () => {
		if (vibrationSupported) {
			// Short buzz pattern
			navigator.vibrate([100, 50, 100]);
		}
	};

	const handleEnableGyro = async () => {
		const granted = await requestGyroPermission();
		if (!granted) {
			alert('Gyroscope permission denied. Please enable in settings.');
		}
	};

	// Auth loading state
	if (status === 'loading') {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
					<p className="text-white text-xl">Loading...</p>
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
				<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
					<div className="text-center text-white">
						<p className="text-xl mb-4">Please sign in to continue</p>
					</div>
				</div>
			</>
		);
	}

	// Prevent hydration issues - only render after mount
	if (!isMounted) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
				<div className="text-white text-xl">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
			{/* Connection Status */}
			<div className="absolute top-4 right-4 flex items-center space-x-2">
				{connectionStatus === 'connected' ? (
					<>
						<FaWifi className="w-5 h-5 text-green-400" />
						<span className="text-green-400 text-sm">Connected</span>
					</>
				) : (
					<>
						<FaWifi className="w-5 h-5 text-red-400" />
						<span className="text-red-400 text-sm">Disconnected</span>
					</>
				)}
			</div>

			<div className="w-full max-w-md space-y-6">
				{/* Header */}
				<div className="text-center">
					<FaMobile className="w-16 h-16 text-blue-400 mx-auto mb-4" />
					<h1 className="text-3xl font-bold text-white mb-2">
						Gyro Controller
					</h1>
					<p className="text-gray-300">
						Tilt your device to control the ball
					</p>
				</div>

				{/* Gyroscope Status */}
				<div className="bg-background/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
					<div className="flex items-center justify-between">
						<span className="text-white font-semibold">Gyroscope</span>
						<span
							className={`text-sm ${
								gyroSupported ? 'text-green-400' : 'text-red-400'
							}`}
						>
							{gyroSupported ? 'Supported' : 'Not Supported'}
						</span>
					</div>

					{gyroSupported && gyroPermission === 'prompt' && (
						<button
							onClick={handleEnableGyro}
							className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md font-semibold shadow-lg hover:shadow-xl transition-all"
						>
							Enable Gyroscope
						</button>
					)}

					{gyroPermission === 'granted' && (
						<div className="space-y-2 text-sm">
							<div className="flex justify-between text-gray-300">
								<span>Alpha (Z):</span>
								<span className="text-white font-mono">
									{gyroData.alpha.toFixed(1)}°
								</span>
							</div>
							<div className="flex justify-between text-gray-300">
								<span>Beta (X):</span>
								<span className="text-white font-mono">
									{gyroData.beta.toFixed(1)}°
								</span>
							</div>
							<div className="flex justify-between text-gray-300">
								<span>Gamma (Y):</span>
								<span className="text-white font-mono">
									{gyroData.gamma.toFixed(1)}°
								</span>
							</div>
						</div>
					)}

					{gyroPermission === 'denied' && (
						<p className="text-red-400 text-sm">
							Gyroscope permission denied. Please enable in browser settings.
						</p>
					)}
				</div>

				{/* Vibration Status */}
				<div className="bg-background/10 backdrop-blur-sm rounded-2xl p-6 space-y-4">
					<div className="flex items-center justify-between">
						<span className="text-white font-semibold">Vibration</span>
						<span
							className={`text-sm ${
								vibrationSupported ? 'text-green-400' : 'text-red-400'
							}`}
						>
							{vibrationSupported ? 'Supported' : 'Not Supported'}
						</span>
					</div>

					{vibrationSupported && (
						<button
							onClick={testVibration}
							className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-md font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
						>
							<FaVibrate className="w-5 h-5" />
							<span>Test Vibration</span>
						</button>
					)}
				</div>

				{/* Visual Indicator */}
				{gyroPermission === 'granted' && (
					<div className="bg-background/10 backdrop-blur-sm rounded-2xl p-6">
						<h3 className="text-white font-semibold mb-4 text-center">
							Device Tilt Indicator
						</h3>
						<div className="relative w-full h-48 bg-gray-800/50 rounded-md overflow-hidden">
							{/* Center crosshair */}
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-1 h-full bg-gray-600/30"></div>
								<div className="absolute w-full h-1 bg-gray-600/30"></div>
							</div>
							{/* Moving dot based on gamma (X) and beta (Y) */}
							<div
								className="absolute w-8 h-8 bg-blue-500 rounded-full shadow-lg transition-transform duration-100"
								style={{
									left: `${50 + (gyroData.gamma / 90) * 40}%`,
									top: `${50 + (gyroData.beta / 180) * 40}%`,
									transform: 'translate(-50%, -50%)',
								}}
							/>
						</div>
						<p className="text-gray-400 text-xs text-center mt-2">
							The dot shows device tilt direction
						</p>
					</div>
				)}

				{/* Instructions */}
				<div className="bg-background/5 backdrop-blur-sm rounded-md p-4">
					<p className="text-gray-300 text-sm text-center">
						📱 Hold your device flat, then tilt to move the ball
						<br />
						<div className="inline-flex items-center gap-2">
							<div className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary/50 text-primary">
								<FaGamepad className="w-3 h-3" />
							</div>
							The ball will hit walls and vibrate
						</div>
					</p>
				</div>
			</div>
		</div>
	);
};

export default TestGyroMobileController;

