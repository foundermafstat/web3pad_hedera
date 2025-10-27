// Room types for the application

export interface Room {
	id: string;
	roomId?: string; // Optional fallback ID
	name: string;
	gameType: string;
	hostId: string;
	hostName: string;
	hostUserId?: string; // User account ID
	maxPlayers: number;
	currentPlayers: number;
	hasPassword: boolean;
	hostParticipates: boolean;
	status: 'waiting' | 'playing' | 'finished';
	createdAt: number;
	players?: RoomPlayer[]; // Optional array of players
}

export interface RoomPlayer {
	id: string;
	name: string;
	isHost: boolean;
	isReady: boolean;
	joinedAt: number;
	color?: string;
}

export interface CreateRoomData {
	name: string;
	gameType: string;
	maxPlayers: number;
	password?: string;
	hostParticipates: boolean;
}

export interface JoinRoomData {
	roomId: string;
	playerName: string;
	password?: string;
}

