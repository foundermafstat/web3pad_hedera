'use client';

import React, { useState } from 'react';
import { FaTimes, FaUsers, FaLock, FaPlay, FaClock, FaUser, FaCrown, FaCheckCircle, FaCircle, FaBullseye, FaCar, FaBuilding, FaBrain, FaMobile, FaGamepad } from 'react-icons/fa';
import { Room } from '../types/room';

interface RoomDetailsModalProps {
	room: Room | null;
	isOpen: boolean;
	onClose: () => void;
	onJoin: (roomId: string, password?: string) => void;
}

const GAME_ICONS: Record<string, React.ReactNode> = {
	shooter: <FaBullseye className="w-4 h-4" />,
	race: <FaCar className="w-4 h-4" />,
	towerdefence: <FaBuilding className="w-4 h-4" />,
	quiz: <FaBrain className="w-4 h-4" />,
	gyrotest: <FaMobile className="w-4 h-4" />,
};

const GAME_NAMES: Record<string, string> = {
	shooter: 'Battle Arena',
	race: 'Race Track',
	towerdefence: 'Tower Defence',
	quiz: 'Quiz Battle',
	gyrotest: 'Gyro Test',
};

const GAME_DESCRIPTIONS: Record<string, string> = {
	shooter: 'Multiplayer top-down shooter with bots and power-ups',
	race: 'Competitive racing game with checkpoints and obstacles',
	towerdefence: 'Defend your castle from waves of enemies',
	quiz: 'Test your knowledge in a multiplayer quiz game',
	gyrotest: 'Test gyroscope and vibration features',
};

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
	room,
	isOpen,
	onClose,
	onJoin,
}) => {
	const [password, setPassword] = useState('');
	const [showPasswordInput, setShowPasswordInput] = useState(false);

	if (!isOpen || !room) return null;

	const gameIcon = GAME_ICONS[room.gameType] || <FaGamepad className="w-4 h-4" />;
	const gameName = GAME_NAMES[room.gameType] || room.gameType;
	const gameDescription = GAME_DESCRIPTIONS[room.gameType] || 'No description available';

	const getStatusInfo = () => {
		switch (room.status) {
			case 'waiting':
				return { color: 'bg-green-500', text: 'Waiting for Players', canJoin: true };
			case 'playing':
				return { color: 'bg-yellow-500', text: 'Game in Progress', canJoin: false };
			case 'finished':
				return { color: 'bg-gray-500', text: 'Game Finished', canJoin: false };
			default:
				return { color: 'bg-gray-500', text: 'Unknown', canJoin: false };
		}
	};

	const statusInfo = getStatusInfo();
	const isFull = (room.currentPlayers || 0) >= (room.maxPlayers || 4);
	const canJoin = statusInfo.canJoin && !isFull;
	
	// Ensure players array exists
	const players = room.players || [];

	const handleJoinClick = () => {
		if (room.hasPassword && !showPasswordInput) {
			setShowPasswordInput(true);
		} else {
			onJoin(room.id, password || undefined);
			handleClose();
		}
	};

	const handleClose = () => {
		setPassword('');
		setShowPasswordInput(false);
		onClose();
	};

	const formatDate = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			month: 'short',
			day: 'numeric',
		});
	};

	return (
		<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
			<div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl animate-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 rounded-t-2xl">
					<button
						onClick={handleClose}
						className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 hover:bg-background/10 rounded-md"
					>
						<FaTimes className="w-6 h-6" />
					</button>

					<div className="flex items-start space-x-4">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-md bg-primary/50 text-primary">
							{gameIcon}
						</div>
						<div className="flex-1">
							<h2 className="text-3xl font-bold text-white mb-2">{room.name}</h2>
							<p className="text-blue-100 text-sm mb-3">{gameDescription}</p>
							<div className="flex items-center space-x-3">
								<div className={`flex items-center space-x-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full`}>
									<div className={`w-2 h-2 rounded-full ${statusInfo.color} animate-pulse`} />
									<span className="text-xs font-semibold text-white">{statusInfo.text}</span>
								</div>
								{room.hasPassword && (
									<div className="flex items-center space-x-1.5 bg-yellow-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-500/30">
										<FaLock className="w-3.5 h-3.5 text-yellow-400" />
										<span className="text-xs font-semibold text-yellow-300">Password Protected</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Body */}
				<div className="p-6 space-y-6">
					{/* Room Info */}
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-gray-800/50 rounded-md p-4 border border-gray-700">
							<div className="flex items-center space-x-2 text-gray-400 mb-1">
								<FaUsers className="w-4 h-4" />
								<span className="text-sm">Players</span>
							</div>
							<div className="text-2xl font-bold text-white">
								{room.currentPlayers}/{room.maxPlayers}
							</div>
							{isFull && (
								<div className="text-xs text-red-400 mt-1">Room is full</div>
							)}
						</div>

						<div className="bg-gray-800/50 rounded-md p-4 border border-gray-700">
							<div className="flex items-center space-x-2 text-gray-400 mb-1">
								<FaClock className="w-4 h-4" />
								<span className="text-sm">Created</span>
							</div>
							<div className="text-lg font-semibold text-white">
								{formatDate(room.createdAt)}
							</div>
						</div>
					</div>

					{/* Players List */}
					<div>
						<h3 className="text-lg font-bold text-white mb-3">Players in Room</h3>
						<div className="space-y-2">
							{players.length > 0 ? (
								players.map((player) => (
									<div
										key={player.id}
										className="flex items-center justify-between bg-gray-800/50 rounded-md p-3 border border-gray-700"
									>
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
												<FaUser className="w-5 h-5 text-white" />
											</div>
											<div>
												<div className="flex items-center space-x-2">
													<span className="text-white font-medium">{player.name}</span>
													{player.isHost && (
														<FaCrown className="w-4 h-4 text-yellow-400" />
													)}
												</div>
												<div className="text-xs text-gray-400">
													Joined {formatDate(player.joinedAt)}
												</div>
											</div>
										</div>
										<div>
											{player.isReady ? (
												<div className="flex items-center space-x-1.5 bg-green-500/20 px-3 py-1.5 rounded-full border border-green-500/30">
													<FaCheckCircle className="w-3.5 h-3.5 text-green-400" />
													<span className="text-xs font-semibold text-green-300">Ready</span>
												</div>
											) : (
												<div className="flex items-center space-x-1.5 bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600/30">
													<FaCircle className="w-3.5 h-3.5 text-gray-400" />
													<span className="text-xs font-semibold text-gray-400">Waiting</span>
												</div>
											)}
										</div>
									</div>
								))
							) : (
								<div className="text-center py-8 text-gray-400">
									<FaUsers className="w-12 h-12 mx-auto mb-2 opacity-50" />
									<p>No players yet</p>
								</div>
							)}
						</div>
					</div>

					{/* Password Input */}
					{showPasswordInput && room.hasPassword && (
						<div className="animate-in slide-in-from-top-2 duration-200">
							<label className="block text-sm font-semibold text-gray-300 mb-2">
								Enter Room Password
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter password..."
								className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
								autoFocus
							/>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex space-x-3 pt-2">
						<button
							onClick={handleClose}
							className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-semibold transition-all"
						>
							Close
						</button>
						<button
							onClick={handleJoinClick}
							disabled={!canJoin}
							className={`flex-1 px-6 py-3 rounded-md font-semibold transition-all shadow-lg flex items-center justify-center space-x-2 ${
								canJoin
									? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:shadow-xl'
									: 'bg-gray-700 text-gray-400 cursor-not-allowed'
							}`}
						>
							<FaPlay className="w-5 h-5" />
							<span>{showPasswordInput ? 'Confirm & Join' : 'Join Room'}</span>
						</button>
					</div>

					{!canJoin && !isFull && (
						<p className="text-center text-sm text-red-400">
							Cannot join - game is {room.status}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default RoomDetailsModal;

