'use client';

import React, { useState, useEffect } from 'react';
import { FaGamepad, FaPlus, FaLayerGroup } from 'react-icons/fa';
import { Room } from '@/types/room';
import RoomCard from '@/components/RoomCard';

interface ActiveRoomsBarProps {
	rooms: Room[];
	onCreateRoomClick: () => void;
	onRoomClick: (room: Room) => void;
	onJoinRoomDirect: (room: Room) => void;
	expandedRoomId: string | null;
}

export default function ActiveRoomsBar({ 
	rooms, 
	onCreateRoomClick, 
	onRoomClick, 
	onJoinRoomDirect,
	expandedRoomId 
}: ActiveRoomsBarProps) {
	const [isMobile, setIsMobile] = useState(false);
	const [showWeb3Auth, setShowWeb3Auth] = useState(false);

	// Check if mobile
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	const handleJoinRoom = (room: Room) => {
		onJoinRoomDirect(room);
	};

	const handleWeb3Success = () => {
		setShowWeb3Auth(false);
		// Refresh the page to update auth state
		window.location.reload();
	};

	const handleWeb3Error = (error: string) => {
		console.error('Web3 auth error:', error);
		// Optionally show error toast
	};
	return (
		<div className="container flex justify-center mx-auto sticky max-w-3xl top-16 z-40 bg-background/10 rounded-lg backdrop-blur-md border-b border-gray-700/50 shadow-xl">
			<div className="w-full px-4 py-4">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-2">
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
						<h3 className="text-white font-bold text-lg">
							{rooms.length > 0 ? `Active Rooms (${rooms.length})` : 'No active rooms'}
						</h3>
					</div>
					<div className="flex items-center space-x-2">
						{!showWeb3Auth ? (
							<button
								onClick={() => setShowWeb3Auth(true)}
								className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-md font-semibold transition-all shadow-lg hover:shadow-xl text-sm"
							>
								<FaLayerGroup className="w-4 h-4" />
								<span>Web3</span>
							</button>
						) : (
							<div className="relative">
							
								<button
									onClick={() => setShowWeb3Auth(false)}
									className="ml-2 text-xs text-gray-400 hover:text-white transition-colors"
								>
									×
								</button>
							</div>
						)}
						<button
							onClick={onCreateRoomClick}
							className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-md font-semibold transition-all shadow-lg hover:shadow-xl text-sm"
						>
							<FaPlus className="w-4 h-4" />
							<span>Create Room</span>
						</button>
					</div>
				</div>
				
				{/* Rooms List - Dynamic with animations */}
				{rooms.length > 0 ? (
					<div className={isMobile ? "flex flex-wrap gap-3" : "space-y-3"}>
						{rooms.map((room, index) => (
							<div
								key={room.id || (room as any).roomId || `room-${index}`}
								className="animate-in slide-in-from-left-4 fade-in duration-500"
								style={{
									animationDelay: `${index * 100}ms`,
									animationFillMode: 'both'
								}}
							>
							<RoomCard 
								room={room} 
								onClick={() => onRoomClick(room)}
								onJoin={handleJoinRoom}
								isMobile={isMobile}
							/>
							</div>
						))}
					</div>
				) : (
					<div className="flex items-center justify-center py-12 text-gray-400">
						<div className="text-center">
							<FaGamepad className="w-16 h-16 mx-auto mb-4 opacity-50" />
							<p className="text-lg">No rooms available. Create the first one!</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
