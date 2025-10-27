'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import RoomCreateModal from '@/components/RoomCreateModal';
import RoomDetailsModal from '@/components/RoomDetailsModal';
import AuthModal from '@/components/AuthModal';
import { Room } from '@/types/room';
import {
	ActiveRoomsBar,
	GameVideoSlider,
	GamesSection,
	HowItWorksSection,
	TechnologySection,
	ControllerFeaturesSection,
	KeyFeaturesSection,
	UseCasesSection,
	FinalCTASection,
	GameInfo,
	CreateRoomData,
} from '@/components/landing';
import { PageWithFooter } from '@/components/PageWithFooter';
import { AllGamesPreloader } from '@/components/GamePreloader';
import { ThemeLogo } from '@/components/ThemeLogo';

export default function Home() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [games, setGames] = useState<Record<string, GameInfo>>({});
	const [loading, setLoading] = useState(true);
    

	// Debug logging
	const [error, setError] = useState<string | null>(null);
	const [rooms, setRooms] = useState<Room[]>([]);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const socketRef = useRef<Socket | null>(null);



	// Load games list
    useEffect(() => {
		const apiUrl = process.env.NODE_ENV === 'production'
			? `${window.location.protocol}//${window.location.host}/api/games`
			: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/games`;

		fetch(apiUrl)
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
				return res.json();
			})
			.then((data) => {
				setGames(data || {});
				setLoading(false);
			})
			.catch((error) => {
				console.error('Error loading games:', error);
				setError(error.message);
				setLoading(false);
			});
    }, []);

	// Socket connection for real-time room updates
    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
			transports: ['websocket', 'polling'],
			reconnection: true,
		});

		socketRef.current = socket;

		socket.on('connect', () => {
			console.log('[Home] Socket connected');
			socket.emit('rooms:list'); // Request current rooms list
		});

		socket.on('rooms:list', (roomsList: Room[]) => {
			console.log('[Home] Received rooms list:', roomsList);
			// Remove duplicates by id
			const uniqueRooms = Array.from(
				new Map(roomsList.map(room => [room.id, room])).values()
			);
			setRooms(uniqueRooms);
		});

		socket.on('rooms:updated', (updatedRooms: Room[]) => {
			console.log('[Home] Rooms updated:', updatedRooms);
			const uniqueRooms = Array.from(
				new Map(updatedRooms.map(room => [room.id, room])).values()
			);
			setRooms(uniqueRooms);
		});

		socket.on('room:created', (room: Room) => {
			console.log('[Home] Room created:', room);
			setRooms((prev) => {
				// Check if room already exists
				const exists = prev.some(r => r.id === room.id);
				if (exists) {
					console.log('[Home] Room already exists, skipping duplicate');
					return prev;
				}
				return [room, ...prev];
			});
		});

		socket.on('room:updated', (room: Room) => {
			console.log('[Home] Room updated:', room);
			setRooms((prev) => {
				const exists = prev.some(r => r.id === room.id);
				if (exists) {
					return prev.map((r) => (r.id === room.id ? room : r));
				}
				// If room doesn't exist, add it
				return [room, ...prev];
			});
		});

		socket.on('room:deleted', (roomId: string) => {
			console.log('[Home] Room deleted:', roomId);
			setRooms((prev) => prev.filter((r) => r.id !== roomId));
		});

		return () => {
			if (socket.connected) {
				socket.disconnect();
			}
		};
	}, [router]);

	const startGame = (gameType: string) => {
		const roomId = Math.random().toString(36).substring(2, 8);
		router.push(`/game/${gameType}?roomId=${roomId}`);
	};

	const handleCreateRoomClick = () => {
		// Check if user is authenticated
		if (status === 'unauthenticated') {
			console.log('[Home] User not authenticated, showing auth modal');
			setShowAuthModal(true);
			return;
		}
		setShowCreateModal(true);
	};

	const handleCreateRoom = (data: CreateRoomData) => {
		console.log('[Home] Creating room:', data);
		if (socketRef.current && session?.user) {
			// Listen for room creation confirmation
			socketRef.current.once('room:created', ({ roomId, gameInfo }: any) => {
				console.log('[Home] Room created, redirecting to game...', roomId);
				
				// If host participates, redirect to display page, otherwise to game screen
				if (data.hostParticipates) {
					router.push(`/game-display/${data.gameType}?roomId=${roomId}`);
				} else {
					router.push(`/game/${data.gameType}?roomId=${roomId}`);
				}
			});

			socketRef.current.emit('room:create', {
				...data,
				hostName: session.user.name || session.user.username || 'Host',
				userId: session.user.id,
			});
		}
	};

	const handleRoomClick = (room: Room) => {
		// Check if user is authenticated for joining
		if (status === 'unauthenticated') {
			console.log('[Home] User not authenticated, showing auth modal');
			setShowAuthModal(true);
			return;
		}
		
		// Show room details modal
		setSelectedRoom(room);
		setShowDetailsModal(true);
	};

	const handleJoinRoom = (roomId: string, password?: string) => {
		console.log('[Home] Joining room:', roomId, password ? 'with password' : '');
		router.push(`/game/${selectedRoom?.gameType}?roomId=${roomId}&mode=controller`);
	};

	const handleJoinRoomDirect = (room: Room) => {
		console.log('[Home] Joining room directly:', room.id);
		router.push(`/game/${room.gameType}?roomId=${room.id}&mode=controller`);
	};

	const handleAuthSuccess = () => {
		setShowAuthModal(false);
		console.log('[Home] Auth successful');
	};

	const handleTestShooterClick = () => {
		router.push('/test-shooter');
	};

	const handleTestPlayClick = () => {
		router.push('/test-play');
	};

	const handleTestQRClick = () => {
		router.push('/test-qr');
	};


	if (loading) {
		return (
			<div className="fixed min-h-screen z-[9999] top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-primary to-lime-300 flex items-center justify-center">
				<div className="text-center">
					<div className="mb-8">
						<div className="relative">
                            {/* Logo with animation */}
                            <ThemeLogo 
                                width={120} 
                                height={78} 
                                color="#000000"
                                className="relative z-10 logo-animated"
                            />
						</div>
					</div>
					<div className="text-black text-2xl font-medium animate-pulse">
						Loading games
					</div>
					<style jsx>{`
						.logo-animated {
							filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.05));
							animation: logoFloat 3s ease-in-out infinite, logoGlow 2s ease-in-out infinite alternate;
						}
						@keyframes logoFloat {
							0%, 100% {
								transform: translateY(0px);
							}
							50% {
								transform: translateY(-10px);
							}
						}
						@keyframes logoGlow {
							0% {
								filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.05));
							}
							100% {
								filter: drop-shadow(0 0 30px rgba(55, 255, 0, 0.8)) drop-shadow(0 0 50px rgb(179, 255, 2));
							}
						}
						@keyframes spin-slow {
							from {
								transform: rotate(0deg);
							}
							to {
								transform: rotate(360deg);
							}
						}
						.animate-spin-slow {
							animation: spin-slow 8s linear infinite;
						}
					`}</style>
				</div>
			</div>
		);
	}

	return (
		<PageWithFooter>
			<div className="min-h-screen bg-gradient-to-br from-background to-gray-800">
				{/* Preload game resources in background */}
				<AllGamesPreloader />
				
				{/* Active Rooms Bar
				<ActiveRoomsBar
					rooms={rooms}
					onCreateRoomClick={handleCreateRoomClick}
					onRoomClick={handleRoomClick}
					onJoinRoomDirect={handleJoinRoomDirect}
					expandedRoomId={null}
				/> */}

				{/* Modals */}
				<AuthModal
					isOpen={showAuthModal}
					onClose={() => setShowAuthModal(false)}
					onSuccess={handleAuthSuccess}
				/>
				<RoomCreateModal
					isOpen={showCreateModal}
					onClose={() => setShowCreateModal(false)}
					onCreateRoom={handleCreateRoom}
				/>
				<RoomDetailsModal
					room={selectedRoom}
					isOpen={showDetailsModal}
					onClose={() => {
						setShowDetailsModal(false);
						setSelectedRoom(null);
					}}
					onJoin={handleJoinRoom}
				/>

				{/* Landing Page Sections */}
				<GameVideoSlider 
					games={games} 
					onCreateRoomClick={handleCreateRoomClick}
					onPlayGame={startGame}
				/>
				{/* <GamesSection games={games} startGame={startGame} /> */}
				
				<div className="max-w-7xl mx-auto py-20 space-y-24">
					<HowItWorksSection />
					<TechnologySection />
					<ControllerFeaturesSection />
					<KeyFeaturesSection />
					<UseCasesSection />
					<FinalCTASection />
				</div>
			</div>
		</PageWithFooter>
	);
}

