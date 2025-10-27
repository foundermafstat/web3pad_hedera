'use client';

import React from 'react';
import { FaUsers, FaLock, FaPlay, FaClock, FaGamepad, FaDesktop, FaBullseye, FaCar, FaBuilding, FaBrain, FaMobile } from 'react-icons/fa';
import { Room } from '../types/room';
import RoomDropdownMenu from './RoomDropdownMenu';

interface RoomCardProps {
	room: Room;
	onClick: () => void;
	onJoin?: (room: Room) => void;
	isMobile?: boolean;
}

const GAME_COLORS: Record<string, string> = {
	shooter: 'from-red-500/20 to-orange-500/20 border-red-500/30 hover:border-red-500/50',
	race: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-500/50',
	towerdefence: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-500/50',
	quiz: 'from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-500/50',
	gyrotest: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30 hover:border-indigo-500/50',
};

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

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick, onJoin, isMobile = false }) => {
	const colorClass = GAME_COLORS[room.gameType] || 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
	const gameIcon = GAME_ICONS[room.gameType] || <FaGamepad className="w-4 h-4" />;
	const gameName = GAME_NAMES[room.gameType] || room.gameType;

	const getStatusColor = () => {
		switch (room.status) {
			case 'waiting':
				return 'bg-green-500';
			case 'playing':
				return 'bg-yellow-500';
			case 'finished':
				return 'bg-gray-500';
			default:
				return 'bg-gray-500';
		}
	};

	const getStatusText = () => {
		switch (room.status) {
			case 'waiting':
				return 'Open';
			case 'playing':
				return 'Playing';
			case 'finished':
				return 'Finished';
			default:
				return 'Unknown';
		}
	};

	if (isMobile) {
		// Mobile card: 120x80 pixels with dropdown
		return (
			<RoomDropdownMenu room={room} onJoin={onJoin || (() => {})}>
				<div className="relative group w-[120px] h-[80px] bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 rounded-md p-2 transition-all duration-300 hover:shadow-lg hover:bg-card hover:scale-105 flex flex-col items-center justify-between text-center cursor-pointer">
					{/* Game Icon */}
					<div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/50 text-primary">
						{gameIcon}
					</div>
					
					{/* Room Name */}
					<div className="text-xs font-bold text-foreground truncate w-full">
						{room.name}
					</div>
					
					{/* Players Count */}
					<div className="flex items-center space-x-1 text-xs text-muted-foreground">
						<FaUsers className="w-3 h-3" />
						<span>{room.currentPlayers}/{room.maxPlayers}</span>
					</div>
					
					{/* Status Indicator */}
					<div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
				</div>
			</RoomDropdownMenu>
		);
	}

	// Desktop card with dropdown
	return (
		<RoomDropdownMenu room={room} onJoin={onJoin || (() => {})}>
			<div className="relative group w-full text-left bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 rounded-md p-4 transition-all duration-300 hover:shadow-lg hover:bg-card hover:scale-[1.02] cursor-pointer">
				<div className="flex items-center justify-between">
					{/* Left: Game Info */}
					<div className="flex items-center space-x-3 flex-1 min-w-0">
						<div className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md bg-primary/50 text-primary">
							{gameIcon}
						</div>
						<div className="flex-1 min-w-0 text-left">
							<div className="text-sm font-bold text-foreground truncate">{room.name}</div>
							<div className="text-xs text-muted-foreground">{gameName}</div>
						</div>
					</div>

					{/* Right: Status & Players */}
					<div className="flex items-center space-x-3 flex-shrink-0">
						{room.hasPassword && (
							<FaLock className="w-3 h-3 text-yellow-500" />
						)}
						
						{room.hostParticipates && (
							<div className="flex items-center space-x-1" title="Host participates in game">
								<FaGamepad className="w-3 h-3 text-blue-500" />
							</div>
						)}
						
						<div className="flex items-center space-x-1">
							<FaUsers className="w-3 h-3 text-muted-foreground" />
							<span className="text-xs font-medium text-foreground">
								{room.currentPlayers}/{room.maxPlayers}
							</span>
						</div>

						<div className="flex items-center space-x-1">
							<div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
							<span className="text-xs text-muted-foreground">{getStatusText()}</span>
						</div>
					</div>
				</div>
			</div>
		</RoomDropdownMenu>
	);
};

export default RoomCard;

