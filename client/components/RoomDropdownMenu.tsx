'use client';

import React from 'react';
import {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { FaUsers, FaLock, FaPlay, FaGamepad, FaDesktop, FaClock, FaUser, FaHashtag, FaCalendar } from 'react-icons/fa';
import { Room } from '@/types/room';

interface RoomDropdownMenuProps {
	room: Room;
	onJoin: (room: Room) => void;
	children: React.ReactNode;
}

const GAME_ICONS: Record<string, string> = {
	shooter: '🎯',
	race: '🏎️',
	towerdefence: '🏰',
	quiz: '🧠',
	gyrotest: '📱',
};

const GAME_NAMES: Record<string, string> = {
	shooter: 'Battle Arena',
	race: 'Race Track',
	towerdefence: 'Tower Defence',
	quiz: 'Quiz Battle',
	gyrotest: 'Gyro Test',
};

const RoomDropdownMenu: React.FC<RoomDropdownMenuProps> = ({
	room,
	onJoin,
	children,
}) => {
	const gameIcon = GAME_ICONS[room.gameType] || '🎮';
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

	const formatTime = (timestamp: number) => {
		const now = Date.now();
		const diff = now - timestamp;
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		
		if (days > 0) {
			return `${days}d ${hours % 24}h ago`;
		} else if (hours > 0) {
			return `${hours}h ${minutes % 60}m ago`;
		} else if (minutes > 0) {
			return `${minutes}m ago`;
		} else {
			return 'Just now';
		}
	};

	const formatFullDate = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger className="w-full justify-between bg-transparent hover:bg-accent/50 data-[state=open]:bg-accent/50">
						{children}
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<div className="w-[400px] p-4">
							{/* Header */}
							<div className="flex items-center space-x-3 mb-4 pb-4 border-b border-border">
								<div className="text-2xl">{gameIcon}</div>
								<div className="flex-1">
									<h3 className="font-semibold text-foreground">{room.name}</h3>
									<p className="text-sm text-muted-foreground">{gameName}</p>
								</div>
								<div className="flex items-center space-x-2">
									<div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
									<span className="text-xs text-muted-foreground">{getStatusText()}</span>
								</div>
							</div>

							{/* Game Info */}
							<div className="grid grid-cols-2 gap-4 mb-4">
								<div className="space-y-1">
									<div className="flex items-center space-x-2 text-xs text-muted-foreground">
										<FaHashtag className="w-3 h-3" />
										<span>Room ID</span>
									</div>
									<div className="text-sm font-mono">{room.id?.slice(-8) || 'N/A'}</div>
								</div>
								<div className="space-y-1">
									<div className="flex items-center space-x-2 text-xs text-muted-foreground">
										<FaCalendar className="w-3 h-3" />
										<span>Created</span>
									</div>
									<div className="text-sm">{formatTime(room.createdAt)}</div>
								</div>
							</div>

							{/* Host Info */}
							<div className="mb-4 p-3 bg-muted/50 rounded-md">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<FaUser className="w-4 h-4 text-muted-foreground" />
										<div>
											<div className="text-sm font-medium">{room.hostName}</div>
											{room.hostUserId && (
												<div className="text-xs text-muted-foreground font-mono">
													ID: {room.hostUserId.slice(-8)}
												</div>
											)}
										</div>
									</div>
									{room.hostParticipates && (
										<div className="flex items-center space-x-1 text-blue-500">
											<FaGamepad className="w-3 h-3" />
											<span className="text-xs">Plays</span>
										</div>
									)}
								</div>
							</div>

							{/* Players */}
							<div className="mb-4 p-3 bg-muted/50 rounded-md">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center space-x-2">
										<FaUsers className="w-4 h-4 text-muted-foreground" />
										<span className="text-sm font-medium">Players</span>
									</div>
									<div className="text-sm font-semibold">
										{room.currentPlayers}/{room.maxPlayers}
									</div>
								</div>

								{/* Players List */}
								{room.players && room.players.length > 0 ? (
									<div className="space-y-1">
										{room.players.map((player, index) => (
											<div key={index} className="flex items-center space-x-2 text-sm">
												<div 
													className="w-2 h-2 rounded-full" 
													style={{ backgroundColor: player.color || '#6b7280' }}
												/>
												<span>{player.name}</span>
												{player.isHost && (
													<span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
														Host
													</span>
												)}
											</div>
										))}
									</div>
								) : (
									<div className="text-xs text-muted-foreground">No players connected</div>
								)}
							</div>

							{/* Features */}
							<div className="flex flex-wrap gap-2 mb-4">
								{room.hasPassword && (
									<div className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded text-xs">
										<FaLock className="w-3 h-3" />
										<span>Password Protected</span>
									</div>
								)}
								{room.hostParticipates && (
									<div className="flex items-center space-x-1 bg-blue-500/20 text-blue-600 px-2 py-1 rounded text-xs">
										<FaGamepad className="w-3 h-3" />
										<span>Host Plays</span>
									</div>
								)}
							</div>

							{/* Action Button */}
							<div className="pt-2 border-t border-border">
								{room.status === 'waiting' ? (
									<button
										onClick={() => onJoin(room)}
										className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
									>
										<FaPlay className="w-4 h-4" />
										<span>Join Game</span>
									</button>
								) : (
									<button
										className="w-full py-2 bg-muted text-muted-foreground rounded-md text-sm font-medium cursor-not-allowed flex items-center justify-center space-x-2"
										disabled
									>
										<FaDesktop className="w-4 h-4" />
										<span>{room.status === 'playing' ? 'Game in Progress' : 'Game Finished'}</span>
									</button>
								)}
							</div>

							{/* Additional Info */}
							<div className="mt-3 text-xs text-muted-foreground">
								<div>Created: {formatFullDate(room.createdAt)}</div>
								{room.id && (
									<div className="font-mono">Full ID: {room.id}</div>
								)}
							</div>
						</div>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
};

export default RoomDropdownMenu;
