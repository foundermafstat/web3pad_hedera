'use client';

import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { FaArrowLeft, FaUsers, FaQrcode, FaWifi, FaTrophy, FaClock, FaStar } from 'react-icons/fa';
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
	color: string;
	avatar: string;
	score: number;
	ready: boolean;
	correctAnswers: number;
	wrongAnswers: number;
}

interface QuizGameScreenProps {
	gameId: string;
	gameType: string;
	onBack: () => void;
}

const QuizGameScreen: React.FC<QuizGameScreenProps> = ({
	gameId,
	gameType,
	onBack,
}) => {
	const socketRef = useRef<Socket | null>(null);
	const [players, setPlayers] = useState<Player[]>([]);
	const [gameState, setGameState] = useState<any>(null);
	const [showQRPopup, setShowQRPopup] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState<
		'connecting' | 'connected' | 'disconnected'
	>('connecting');

	// Generate controller URL for QR code dynamically (client-side only)
	const [controllerUrl, setControllerUrl] = useState('');
	
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const baseUrl = window.location.origin;
			const url = `${baseUrl}/game/${gameType}?mode=controller&roomId=${gameId}`;
			setControllerUrl(url);
			console.log('[QuizGameScreen] QR URL:', url);
		}
	}, [gameType, gameId]);

	useEffect(() => {
		console.log('[QuizGameScreen] Initializing with:', { gameId, gameType });

		const socket = io(
			process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
			{
				transports: ['websocket', 'polling'],
				timeout: 5000,
				reconnection: true,
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
			}
		);

		socketRef.current = socket;

		socket.on('connect', () => {
			console.log('[QuizGameScreen] Socket connected');
			setConnectionStatus('connected');
			socket.emit('createRoom', { gameType, roomId: gameId });
		});

		socket.on('disconnect', () => {
			console.log('[QuizGameScreen] Socket disconnected');
			setConnectionStatus('disconnected');
		});

		socket.on('roomCreated', (data: any) => {
			console.log('[QuizGameScreen] Room created:', data);
			// Ensure UI shows waiting room even before first gameState arrives
			setGameState((prev: any) => prev || { gameStarted: false, showingResults: false, minPlayers: 2, canStart: false, players: [] });
		});

		socket.on('gameState', (state: any) => {
			console.log('[QuizGameScreen] Game state received:', state);
			setGameState(state);
			if (state.players) {
				setPlayers(state.players);
			}
		});

		socket.on('error', (error: any) => {
			console.error('[QuizGameScreen] Socket error:', error);
			// If room already exists, we still want to connect to it
			// So let's just log the error and continue listening for gameState
		});

		return () => {
			console.log('[QuizGameScreen] Cleaning up...');
			socket.disconnect();
		};
	}, [gameId, gameType]);

	const renderConnectionStatus = () => {
		if (connectionStatus === 'connected') {
			return (
				<div className="flex items-center gap-2 text-green-400">
					<FaWifi size={20} />
					<span>Connected</span>
				</div>
			);
		} else if (connectionStatus === 'connecting') {
			return (
				<div className="flex items-center gap-2 text-yellow-400">
					<FaWifi size={20} className="animate-pulse" />
					<span>Connecting...</span>
				</div>
			);
		} else {
			return (
				<div className="flex items-center gap-2 text-red-400">
					<FaWifi size={20} />
					<span>Disconnected</span>
				</div>
			);
		}
	};

	const renderWaitingRoom = () => {
		const readyCount = players.filter((p) => p.ready).length;
		const minPlayers = gameState?.minPlayers || 2;
		const canStart = gameState?.canStart || false;

		return (
			<div className="flex flex-col items-center justify-center h-full gap-8 p-8">
				<div className="text-center">
					<h1 className="text-6xl font-bold text-white mb-4">Quiz Battle</h1>
					<p className="text-2xl text-gray-300">Waiting for players...</p>
					<p className="text-xl text-gray-400 mt-2">
						{readyCount} / {minPlayers} players ready
					</p>
					{canStart && (
						<p className="text-2xl text-green-400 mt-4 animate-pulse">
							Game starting soon!
						</p>
					)}
				</div>

				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl w-full">
					{players.map((player) => (
						<div
							key={player.id}
							className="bg-gray-800 rounded-md p-6 border-1 transition-all"
							style={{
								borderColor: player.ready ? '#11ff33' : '#ff0f0f',
								transform: player.ready ? 'scale(1.05)' : 'scale(1)',
							}}
						>
							<div className="flex flex-col items-center gap-3">
								<div
									className="text-6xl w-20 h-20 flex items-center justify-center rounded-lg"
									style={{ backgroundColor: player.color }}
								>
									{player.avatar}
								</div>
								<div className="text-xl font-bold text-white truncate w-full text-center">
									{player.name}
								</div>
								<div
									className={`text-sm font-semibold px-4 py-2 rounded-lg ${
										player.ready
											? 'bg-primary text-primary-foreground'
											: 'bg-gray-400 text-gray-100'
									}`}
								>
									{player.ready ? '✓ Ready' : 'Not Ready'}
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="text-gray-400 text-lg">Scan QR code to join</div>
			</div>
		);
	};

	const renderGamePlay = () => {
		const {
			currentRound,
			totalRounds,
			question,
			timeRemaining,
			roundDuration,
		} = gameState;
		const timePercent = (timeRemaining / roundDuration) * 100;

		return (
			<div className="flex flex-col h-full">
				{/* Header with round info and players */}
				<div className="bg-gray-900 p-6 border-b-4 border-gray-700">
					<div className="flex justify-between items-center mb-4">
						<div className="text-3xl font-bold text-white">
							Round {currentRound} / {totalRounds}
						</div>
						<div className="flex items-center gap-3 text-2xl text-white">
							<FaClock size={32} />
							<span className="font-mono font-bold">
								{Math.ceil(timeRemaining)}s
							</span>
						</div>
					</div>

					{/* Time bar */}
					<div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
						<div
							className="h-full transition-all duration-1000 ease-linear"
							style={{
								width: `${timePercent}%`,
								backgroundColor:
									timePercent > 50
										? '#10b981'
										: timePercent > 25
										? '#f59e0b'
										: '#ef4444',
							}}
						/>
					</div>

					{/* Players scoreboard */}
					<div className="flex gap-4 mt-4 overflow-x-auto">
						{players.map((player, index) => (
							<div
								key={player.id}
								className="flex items-center gap-3 bg-gray-800 rounded-md px-4 py-2 border-2"
								style={{ borderColor: player.color }}
							>
								<div className="text-3xl">{player.avatar}</div>
								<div>
									<div className="text-lg font-semibold text-white">
										{player.name}
									</div>
									<div
										className="text-xl font-bold"
										style={{ color: player.color }}
									>
										{player.score} pts
									</div>
								</div>
								{index === 0 && (
									<FaTrophy size={24} className="text-yellow-400" />
								)}
							</div>
						))}
					</div>
				</div>

				{/* Question area */}
				<div className="flex-1 flex items-center justify-center p-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
					<div className="max-w-7xl w-full">
						<div className="bg-background rounded-3xl p-12 shadow-2xl">
							<h2 className="text-5xl font-bold text-gray-900 text-center leading-tight">
								{question?.text}
							</h2>
						</div>

						{/* Answer options preview */}
						<div className="grid grid-cols-2 gap-6 mt-8">
							{question?.answers?.map((answer: string, index: number) => (
								<div
									key={index}
									className="bg-gray-800 rounded-md p-6 border-2 border-gray-700"
								>
									<div className="text-2xl font-semibold text-white text-center">
										{String.fromCharCode(65 + index)}. {answer}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderResults = () => {
		const { correctAnswer, playerAnswers, question } = gameState;

		return (
			<div className="flex flex-col h-full">
				{/* Header */}
				<div className="bg-gray-900 p-6 border-b-4 border-gray-700">
					<h2 className="text-4xl font-bold text-white text-center">
						Round Results
					</h2>
				</div>

				{/* Correct answer */}
				<div className="flex-1 flex flex-col items-center justify-center p-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
					<div className="max-w-7xl w-full mb-8">
						<div className="bg-background rounded-3xl p-8 shadow-2xl mb-8">
							<h3 className="text-3xl font-bold text-gray-900 text-center mb-4">
								{question?.text}
							</h3>
							<div className="bg-green-100 border-4 border-green-500 rounded-2xl p-6">
								<div className="text-2xl font-bold text-green-800 text-center">
									Correct answer: {String.fromCharCode(65 + correctAnswer)}.{' '}
									{question?.answers[correctAnswer]}
								</div>
							</div>
						</div>

						{/* Players results */}
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{players.map((player) => {
								const playerAnswer = playerAnswers?.[player.id];
								const isCorrect = playerAnswer?.correct;
								const answered =
									playerAnswer?.answer !== null &&
									playerAnswer?.answer !== undefined;

								return (
									<div
										key={player.id}
										className={`rounded-md p-4 border-4 ${
											isCorrect
												? 'bg-green-900 border-green-500'
												: answered
												? 'bg-red-900 border-red-500'
												: 'bg-gray-800 border-gray-600'
										}`}
									>
										<div className="flex flex-col items-center gap-2">
											<div className="text-4xl">{player.avatar}</div>
											<div className="text-lg font-bold text-white text-center">
												{player.name}
											</div>
											<div
												className="text-2xl font-bold"
												style={{ color: player.color }}
											>
												{player.score} pts
											</div>
											<div className="text-sm text-white">
												{isCorrect
													? '✓ Correct!'
													: answered
													? '✗ Wrong'
													: '- No answer'}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderGameFinished = () => {
		const winners = players.filter((p) => gameState?.winners?.includes(p.id));
		const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

		return (
			<div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
				{/* Fireworks effect */}
				<div className="absolute inset-0 pointer-events-none">
					{[...Array(20)].map((_, i) => (
						<div
							key={i}
							className="absolute animate-ping"
							style={{
								top: `${Math.random() * 100}%`,
								left: `${Math.random() * 100}%`,
								animationDelay: `${Math.random() * 2}s`,
								animationDuration: '2s',
							}}
						>
							✨
						</div>
					))}
				</div>

				<div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
					<h1 className="text-7xl font-bold text-white mb-8 animate-bounce flex items-center gap-4">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/50 text-primary">
							<FaStar className="w-8 h-8" />
						</div>
						Game Over!
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/50 text-primary">
							<FaStar className="w-8 h-8" />
						</div>
					</h1>

					{/* Winner(s) */}
					<div className="mb-12">
						<h2 className="text-5xl font-bold text-yellow-300 text-center mb-6 flex items-center justify-center gap-4">
							<div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/50 text-primary">
								<FaTrophy className="w-6 h-6" />
							</div>
							{winners.length > 1 ? 'Winners' : 'Winner'}
							<div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/50 text-primary">
								<FaTrophy className="w-6 h-6" />
							</div>
						</h2>
						<div className="flex gap-6 justify-center">
							{winners.map((winner) => (
								<div
									key={winner.id}
									className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl p-8 shadow-2xl border-8 border-yellow-300 animate-pulse"
								>
									<div className="flex flex-col items-center gap-4">
										<div className="text-9xl">{winner.avatar}</div>
										<div className="text-4xl font-bold text-white">
											{winner.name}
										</div>
										<div className="text-6xl font-bold text-white">
											{winner.score} pts
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Leaderboard */}
					<div className="bg-gray-900 bg-opacity-80 rounded-2xl p-8 max-w-4xl w-full">
						<h3 className="text-3xl font-bold text-white text-center mb-6">
							Leaderboard
						</h3>
						<div className="space-y-3">
							{sortedPlayers.map((player, index) => (
								<div
									key={player.id}
									className="flex items-center gap-4 bg-gray-800 rounded-md p-4 border-2"
									style={{ borderColor: player.color }}
								>
									<div className="text-4xl font-bold text-white w-12 text-center">
										{index === 0
											? '🥇'
											: index === 1
											? '🥈'
											: index === 2
											? '🥉'
											: index + 1}
									</div>
									<div className="text-4xl">{player.avatar}</div>
									<div className="flex-1">
										<div className="text-2xl font-bold text-white">
											{player.name}
										</div>
										<div className="text-sm text-gray-400">
											✓ {player.correctAnswers} correct | ✗{' '}
											{player.wrongAnswers} wrong
										</div>
									</div>
									<div
										className="text-3xl font-bold"
										style={{ color: player.color }}
									>
										{player.score} pts
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderContent = () => {
		if (!gameState) {
			return (
				<div className="flex items-center justify-center h-full">
					<div className="text-2xl text-white">Loading...</div>
				</div>
			);
		}

		if (gameState.gameFinished) {
			return renderGameFinished();
		}

		if (gameState.showingResults) {
			return renderResults();
		}

		if (gameState.gameStarted) {
			return renderGamePlay();
		}

		return renderWaitingRoom();
	};

	return (
		<div className="fixed inset-0 w-full h-full bg-gray-900 flex flex-col overflow-hidden pt-16">
			{/* Game Interface Header */}
			<div className="flex-shrink-0">
				<GameInterfaceHeader
					onBack={onBack}
					connectionStatus={connectionStatus}
					onShowQR={() => setShowQRPopup(true)}
					gameType="quiz"
					players={players}
				/>
			</div>

			{/* Game content */}
			<div className="flex-1 overflow-hidden">{renderContent()}</div>

			{/* QR Code Sheet */}
			<GameQRSheet
				isOpen={showQRPopup}
				onClose={() => setShowQRPopup(false)}
				controllerUrl={controllerUrl}
				players={players}
				gameType={gameType}
			/>
		</div>
	);
};

export default QuizGameScreen;
