'use client';

import React, { useState } from 'react';
import { FaUsers, FaLock, FaUnlock, FaGamepad, FaBullseye, FaCar, FaBuilding, FaBrain, FaMobile } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';

interface RoomCreateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreateRoom: (data: CreateRoomData) => void;
}

interface CreateRoomData {
	name: string;
	gameType: string;
	maxPlayers: number;
	password?: string;
	hostParticipates: boolean;
}

const GAME_TYPES = [
	{ id: 'shooter', name: 'Battle Arena', icon: <FaBullseye className="w-4 h-4" />, color: 'from-red-500 to-orange-500' },
	{ id: 'race', name: 'Race Track', icon: <FaCar className="w-4 h-4" />, color: 'from-blue-500 to-cyan-500' },
	{ id: 'towerdefence', name: 'Tower Defence', icon: <FaBuilding className="w-4 h-4" />, color: 'from-purple-500 to-pink-500' },
	{ id: 'quiz', name: 'Quiz Battle', icon: <FaBrain className="w-4 h-4" />, color: 'from-green-500 to-emerald-500' },
	{ id: 'gyrotest', name: 'Gyro Test', icon: <FaMobile className="w-4 h-4" />, color: 'from-indigo-500 to-violet-500' },
];

const RoomCreateModal: React.FC<RoomCreateModalProps> = ({
	isOpen,
	onClose,
	onCreateRoom,
}) => {
	const { data: session } = useSession();
	const [roomName, setRoomName] = useState('');
	const [selectedGame, setSelectedGame] = useState('');
	const [maxPlayers, setMaxPlayers] = useState(4);
	const [usePassword, setUsePassword] = useState(false);
	const [password, setPassword] = useState('');
	const [hostParticipates, setHostParticipates] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!session?.user) {
			newErrors.auth = 'Authentication required to create room';
		}

		if (!roomName.trim()) {
			newErrors.roomName = 'Room name is required';
		} else if (roomName.length < 3) {
			newErrors.roomName = 'Name must be at least 3 characters';
		} else if (roomName.length > 30) {
			newErrors.roomName = 'Name must be less than 30 characters';
		}

		if (!selectedGame) {
			newErrors.gameType = 'Please select a game type';
		}

		if (maxPlayers < 2) {
			newErrors.maxPlayers = 'Minimum 2 players required';
		} else if (maxPlayers > 10) {
			newErrors.maxPlayers = 'Maximum 10 players allowed';
		}

		if (usePassword && !password.trim()) {
			newErrors.password = 'Password is required when enabled';
		} else if (usePassword && password.length < 4) {
			newErrors.password = 'Password must be at least 4 characters';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		const data: CreateRoomData = {
			name: roomName.trim(),
			gameType: selectedGame,
			maxPlayers,
			password: usePassword ? password : undefined,
			hostParticipates,
		};

		onCreateRoom(data);
		handleClose();
	};

	const handleClose = () => {
		setRoomName('');
		setSelectedGame('');
		setMaxPlayers(4);
		setUsePassword(false);
		setPassword('');
		setHostParticipates(false);
		setErrors({});
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-background border-border">
				<DialogHeader>
					<DialogTitle className="flex items-center space-x-3">
						<FaGamepad className="w-6 h-6" />
						Create Room
					</DialogTitle>
					<DialogDescription>
						Set up your game room settings and invite players to join.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Auth Status */}
					{session?.user ? (
						<div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
							<div className="flex items-center space-x-2">
								<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								<span className="text-green-400 text-sm font-medium">
									Authenticated as {session.user.name || session.user.email}
								</span>
							</div>
						</div>
					) : (
						<div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
							<div className="flex items-center space-x-2">
								<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
								<span className="text-yellow-400 text-sm font-medium">
									Authentication required to create room
								</span>
							</div>
						</div>
					)}

					{errors.auth && (
						<div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
							<p className="text-red-400 text-sm">{errors.auth}</p>
						</div>
					)}

					{/* Room Name */}
					<div>
						<label className="block text-sm font-medium text-foreground mb-2">
							Room Name
						</label>
						<input
							type="text"
							value={roomName}
							onChange={(e) => setRoomName(e.target.value)}
							placeholder="Enter room name..."
							className={`w-full px-3 py-2 border ${
								errors.roomName ? 'border-red-500' : 'border-input'
							} rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent`}
							maxLength={30}
						/>
						{errors.roomName && (
							<p className="text-red-400 text-sm mt-1">{errors.roomName}</p>
						)}
						<p className="text-muted-foreground text-xs mt-1">
							{roomName.length}/30 characters
						</p>
					</div>

					{/* Game Type Selection */}
					<div>
						<label className="block text-sm font-medium text-foreground mb-3">
							Game Type
						</label>
						<div className="grid grid-cols-2 gap-2">
							{GAME_TYPES.map((game) => (
								<button
									key={game.id}
									type="button"
									onClick={() => setSelectedGame(game.id)}
									className={`relative p-3 rounded-md border-2 transition-all ${
										selectedGame === game.id
											? 'border-primary bg-primary/10'
											: 'border-border bg-background hover:border-muted-foreground'
									}`}
								>
									<div className="text-center">
										<div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-muted text-muted-foreground mb-1">
											{game.icon}
										</div>
										<div className="text-xs font-medium text-foreground">
											{game.name}
										</div>
									</div>
									{selectedGame === game.id && (
										<div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
									)}
								</button>
							))}
						</div>
						{errors.gameType && (
							<p className="text-red-400 text-sm mt-2">{errors.gameType}</p>
						)}
					</div>

					{/* Max Players */}
					<div>
						<label className="block text-sm font-medium text-foreground mb-2">
							Maximum Players
						</label>
						<div className="flex items-center space-x-3">
							<input
								type="range"
								min="2"
								max="10"
								value={maxPlayers}
								onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
								className="flex-1 h-2 bg-muted rounded-md appearance-none cursor-pointer accent-primary"
							/>
							<div className="flex items-center space-x-1 bg-muted px-3 py-1 rounded-md border border-border min-w-[60px] justify-center">
								<FaUsers className="w-4 h-4 text-muted-foreground" />
								<span className="text-foreground font-medium">{maxPlayers}</span>
							</div>
						</div>
						{errors.maxPlayers && (
							<p className="text-red-400 text-sm mt-1">{errors.maxPlayers}</p>
						)}
					</div>

					{/* Host Participation Toggle */}
					<div>
						<label className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border cursor-pointer hover:bg-muted transition-all">
							<div className="flex items-center space-x-3">
								<FaGamepad className="w-5 h-5 text-muted-foreground" />
								<div>
									<div className="text-foreground font-medium">Host Participates</div>
									<div className="text-muted-foreground text-sm">
										Your device becomes a controller
									</div>
								</div>
							</div>
							<input
								type="checkbox"
								checked={hostParticipates}
								onChange={(e) => setHostParticipates(e.target.checked)}
								className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-ring"
							/>
						</label>
					</div>

					{/* Password Toggle */}
					<div>
						<label className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border cursor-pointer hover:bg-muted transition-all">
							<div className="flex items-center space-x-3">
								{usePassword ? (
									<FaLock className="w-5 h-5 text-yellow-500" />
								) : (
									<FaUnlock className="w-5 h-5 text-muted-foreground" />
								)}
								<div>
									<div className="text-foreground font-medium">Password Protection</div>
									<div className="text-muted-foreground text-sm">
										Require password to join
									</div>
								</div>
							</div>
							<input
								type="checkbox"
								checked={usePassword}
								onChange={(e) => setUsePassword(e.target.checked)}
								className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-ring"
							/>
						</label>

						{usePassword && (
							<div className="mt-3">
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Enter password..."
									className={`w-full px-3 py-2 border ${
										errors.password ? 'border-red-500' : 'border-input'
									} rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent`}
								/>
								{errors.password && (
									<p className="text-red-400 text-sm mt-1">{errors.password}</p>
								)}
							</div>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex space-x-3 pt-4">
						<button
							type="button"
							onClick={handleClose}
							className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md font-medium transition-all"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-all"
						>
							Create Room
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default RoomCreateModal;

