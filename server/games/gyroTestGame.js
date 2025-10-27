import { BaseGame } from './baseGame.js';

export class GyroTestGame extends BaseGame {
	constructor(gameId, config = {}) {
		super(gameId, 'gyrotest', config);
		
		this.name = 'Gyroscope Test';
		this.description = 'Test gyroscope and vibration features';
		
		console.log(`[GyroTestGame] Game ${gameId} created`);
	}

	// Override update to do nothing - this game is purely client-side
	update(deltaTime) {
		// No server-side logic needed for gyro test
	}

	// Minimal game info
	getGameInfo() {
		return {
			gameId: this.gameId,
			gameType: this.gameType,
			name: this.name,
			description: this.description,
			playerCount: this.players.size,
		};
	}
}

