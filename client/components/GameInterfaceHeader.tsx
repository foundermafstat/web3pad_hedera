'use client';

import React from 'react';
import { FaArrowLeft, FaUsers, FaBolt, FaQrcode, FaWifi, FaHeart, Coins, Waves as WavesIcon, FaPlay, FaTrophy, FaClock } from 'react-icons/fa';

interface GameInterfaceHeaderProps {
	onBack: () => void;
	connectionStatus: 'connecting' | 'connected' | 'disconnected';
	onShowQR: () => void;
	gameType: string;
	// Game stats
	activePlayers?: number;
	totalKills?: number;
	// Tower Defence specific
	wave?: number;
	money?: number;
	castleHealth?: number;
	maxCastleHealth?: number;
	isWaveActive?: boolean;
	gameOver?: boolean;
	onStartWave?: () => void;
	// Quiz specific
	players?: any[];
	// Common
	className?: string;
}

export default function GameInterfaceHeader({
	onBack,
	connectionStatus,
	onShowQR,
	gameType,
	activePlayers = 0,
	totalKills = 0,
	wave = 0,
	money = 0,
	castleHealth = 100,
	maxCastleHealth = 100,
	isWaveActive = false,
	gameOver = false,
	onStartWave,
	players = [],
	className = '',
}: GameInterfaceHeaderProps) {
	const renderConnectionStatus = () => {
		return (
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
					{connectionStatus}
				</span>
			</div>
		);
	};

	const renderGameSpecificStats = () => {
		switch (gameType) {
			case 'shooter':
				return (
					<>
						<div className="flex items-center space-x-1 text-green-400">
							<FaUsers className="w-4 h-4" />
							<span>{activePlayers}</span>
						</div>
						<div className="flex items-center space-x-1 text-yellow-400">
							<FaBolt className="w-4 h-4" />
							<span>{totalKills}</span>
						</div>
					</>
				);

			case 'race':
				return (
					<div className="flex items-center space-x-1 text-green-400">
						<FaUsers className="w-4 h-4" />
						<span>{activePlayers}</span>
					</div>
				);

			case 'towerdefence':
				return (
					<>
						<div className="flex items-center space-x-1 text-yellow-400">
							<Coins className="w-4 h-4" />
							<span>{money}</span>
						</div>
						<div className="flex items-center space-x-1 text-red-400">
							<FaHeart className="w-4 h-4" />
							<span>
								{castleHealth}/{maxCastleHealth}
							</span>
						</div>
						<div className="flex items-center space-x-1 text-blue-400">
							<WavesIcon className="w-4 h-4" />
							<span>Wave {wave}</span>
						</div>
						<div className="flex items-center space-x-1 text-green-400">
							<FaUsers className="w-4 h-4" />
							<span>{activePlayers}</span>
						</div>
						{!isWaveActive && !gameOver && onStartWave && (
							<button
								onClick={onStartWave}
								className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
							>
								<FaPlay className="w-4 h-4" />
								<span>Start Wave</span>
							</button>
						)}
					</>
				);

			case 'quiz':
				return (
					<div className="flex items-center space-x-1 text-white">
						<FaUsers className="w-4 h-4" />
						<span>{players.length}</span>
					</div>
				);

			case 'gyrotest':
				return (
					<div className="flex items-center space-x-1 text-white">
						<FaUsers className="w-4 h-4" />
						<span>{activePlayers}</span>
					</div>
				);

			default:
				return (
					<div className="flex items-center space-x-1 text-green-400">
						<FaUsers className="w-4 h-4" />
						<span>{activePlayers}</span>
					</div>
				);
		}
	};

	return (
		<div
			className={`bg-gray-800/90 backdrop-blur-sm px-4 py-2 flex items-center justify-between border-b border-gray-700/50 flex-shrink-0 relative z-40 ${className}`}
		>
			<button
				onClick={onBack}
				className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm"
			>
				<FaArrowLeft className="w-4 h-4" />
				<span>Exit</span>
			</button>

			<div className="flex items-center space-x-4 text-sm">
				{renderConnectionStatus()}
				{renderGameSpecificStats()}
				<button
					onClick={onShowQR}
					className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
				>
					<FaQrcode className="w-4 h-4" />
					<span>Connect</span>
				</button>
			</div>
		</div>
	);
}
