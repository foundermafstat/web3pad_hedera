export interface GameInfo {
	id: string;
	name: string;
	description: string;
	minPlayers: number;
	maxPlayers: number;
	icon: string;
}

export interface CreateRoomData {
	name: string;
	gameType: string;
	maxPlayers: number;
	password?: string;
	hostParticipates: boolean;
}
