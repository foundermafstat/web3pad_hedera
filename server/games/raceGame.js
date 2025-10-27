import { BaseGame } from './baseGame.js';

// Race game player with improved physics
class RacePlayer {
	constructor(id, name, startX, startY, color) {
		this.id = id;
		this.name = name;
		this.x = startX;
		this.y = startY;
		
		// Physics properties
		this.velocityX = 0;
		this.velocityY = 0;
		this.speed = 0; // Magnitude of velocity
		this.angle = 0; // Car rotation
		this.angularVelocity = 0; // Rotation speed
		
		// Car properties
		this.maxSpeed = 800; // Increased from 400
		this.acceleration = 1200; // Increased from 200
		this.angularSpeed = 6; // Radians per second (increased from 3 for better turning)
		this.friction = 0.92; // Higher friction for better control
		this.driftFactor = 0.3; // Drift amount (higher = more drift)
		
		this.color = color;
		this.lap = 0;
		this.currentCheckpoint = 0;
		this.startTime = null;
		this.lapTime = null;
		this.bestLapTime = null;
		this.isRacing = false;
		
		this.currentInput = { accelerate: 0, turn: 0 };
		this.alive = true;
		this.dimensions = { width: 30, height: 15 };
		this.lastCollisionTime = 0;
	}

	updateInput(input) {
		this.currentInput.accelerate = Math.max(
			-1,
			Math.min(1, parseFloat(input.accelerate) || 0)
		);
		this.currentInput.turn = Math.max(
			-1,
			Math.min(1, parseFloat(input.turn) || 0)
		);
	}

	move(deltaTime, track, sandAreas) {
		if (!this.alive) return;

		// Apply acceleration
		const accelerate = this.currentInput.accelerate;
		if (Math.abs(accelerate) > 0.1) {
			const accelForce = accelerate * this.acceleration * deltaTime;
			this.velocityX += Math.cos(this.angle) * accelForce;
			this.velocityY += Math.sin(this.angle) * accelForce;
		}

		// Apply angular velocity for turning
		// Allow turning even at low speeds for better maneuverability
		if (Math.abs(this.speed) > 5) {
			// Use a more responsive turn multiplier - minimum 0.5 even at low speeds
			const turnMultiplier = 0.5 + (Math.abs(this.speed) / this.maxSpeed) * 0.5;
			this.angularVelocity = this.currentInput.turn * this.angularSpeed * turnMultiplier;
			this.angle += this.angularVelocity * deltaTime;
			
			// Drift effect - velocity doesn't match car direction when turning
			if (Math.abs(this.currentInput.turn) > 0.3) {
				const driftAngle = this.angle - this.driftFactor * this.currentInput.turn;
				const vx = this.velocityX;
				const vy = this.velocityY;
				this.velocityX = vx * 0.95 + Math.cos(driftAngle) * this.speed * 0.05;
				this.velocityY = vy * 0.95 + Math.sin(driftAngle) * this.speed * 0.05;
			}
		} else {
			// Even when almost stopped, allow some turning
			this.angularVelocity = this.currentInput.turn * this.angularSpeed * 0.3;
			this.angle += this.angularVelocity * deltaTime;
		}

		// Calculate speed magnitude
		this.speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
		
		// Limit max speed
		if (this.speed > this.maxSpeed) {
			const ratio = this.maxSpeed / this.speed;
			this.velocityX *= ratio;
			this.velocityY *= ratio;
			this.speed = this.maxSpeed;
		}

		// Check if on sand
		let isOnSand = false;
		for (const sand of sandAreas) {
			if (this.checkPointInRect(this.x, this.y, sand)) {
				isOnSand = true;
				break;
			}
		}

		// Apply friction (higher on sand)
		const friction = isOnSand ? 0.7 : this.friction;
		this.velocityX *= Math.pow(friction, deltaTime / 0.016);
		this.velocityY *= Math.pow(friction, deltaTime / 0.016);

		// Angular velocity decay
		this.angularVelocity *= 0.9;

		// Update position
		this.x += this.velocityX * deltaTime;
		this.y += this.velocityY * deltaTime;

		// Update speed after friction
		this.speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
	}

	checkCollision(other) {
		// Simple AABB collision
		return (
			this.x - this.dimensions.width / 2 < other.x + other.dimensions.width / 2 &&
			this.x + this.dimensions.width / 2 > other.x - other.dimensions.width / 2 &&
			this.y - this.dimensions.height / 2 < other.y + other.dimensions.height / 2 &&
			this.y + this.dimensions.height / 2 > other.y - other.dimensions.height / 2
		);
	}

	checkPointInRect(x, y, rect) {
		return x >= rect.x && x <= rect.x + rect.width &&
			   y >= rect.y && y <= rect.y + rect.height;
	}

	resolveCollision(other) {
		// Calculate collision vector
		const dx = other.x - this.x;
		const dy = other.y - this.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		
		if (distance < 0.1) return; // Avoid division by zero
		
		// Normalize
		const nx = dx / distance;
		const ny = dy / distance;
		
		// Relative velocity
		const rvx = other.velocityX - this.velocityX;
		const rvy = other.velocityY - this.velocityY;
		
		// Relative velocity along normal
		const relativeVel = rvx * nx + rvy * ny;
		
		// Don't resolve if velocities are separating
		if (relativeVel > 0) return;
		
		// Collision impulse (elastic collision)
		const restitution = 0.8;
		const impulse = -(1 + restitution) * relativeVel;
		
		// Apply impulse (assuming same mass)
		this.velocityX -= impulse * nx;
		this.velocityY -= impulse * ny;
		other.velocityX += impulse * nx;
		other.velocityY += impulse * ny;
		
		// Separate cars
		const overlap = (this.dimensions.width / 2 + other.dimensions.width / 2) - distance;
		if (overlap > 0) {
			const separateX = nx * overlap * 0.5;
			const separateY = ny * overlap * 0.5;
			this.x -= separateX;
			this.y -= separateY;
			other.x += separateX;
			other.y += separateY;
		}
		
		// Mark collision happened for both players
		this.lastCollisionTime = Date.now();
		other.lastCollisionTime = Date.now();
	}

	startRace() {
		if (!this.isRacing) {
			this.isRacing = true;
			this.startTime = Date.now();
		}
	}

	checkCheckpoint(checkpoint) {
		if (this.checkPointInRect(this.x, this.y, checkpoint)) {
			if (checkpoint.id === this.currentCheckpoint) {
				this.currentCheckpoint = (this.currentCheckpoint + 1) % checkpoint.totalCheckpoints;
				if (this.currentCheckpoint === 0 && this.isRacing) {
					// Completed lap
					this.lap++;
					this.lapTime = (Date.now() - this.startTime) / 1000;
					if (!this.bestLapTime || this.lapTime < this.bestLapTime) {
						this.bestLapTime = this.lapTime;
					}
					this.startTime = Date.now(); // Reset for next lap
				}
				return true;
			}
		}
		return false;
	}

	checkBarriers(barriers) {
		for (const barrier of barriers) {
			// Check if car center is in barrier
			if (
				this.x >= barrier.x &&
				this.x <= barrier.x + barrier.width &&
				this.y >= barrier.y &&
				this.y <= barrier.y + barrier.height
			) {
				// Find closest edge to push car away from
				const distToLeft = Math.abs(this.x - barrier.x);
				const distToRight = Math.abs(this.x - (barrier.x + barrier.width));
				const distToTop = Math.abs(this.y - barrier.y);
				const distToBottom = Math.abs(this.y - (barrier.y + barrier.height));
				
				const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
				
				// Push away from closest edge
				if (minDist === distToLeft) {
					this.x = barrier.x - this.dimensions.width / 2 - 1;
				} else if (minDist === distToRight) {
					this.x = barrier.x + barrier.width + this.dimensions.width / 2 + 1;
				} else if (minDist === distToTop) {
					this.y = barrier.y - this.dimensions.height / 2 - 1;
				} else {
					this.y = barrier.y + barrier.height + this.dimensions.height / 2 + 1;
				}
				
				// Stop or heavily reduce velocity
				this.velocityX *= 0.3;
				this.velocityY *= 0.3;
				this.speed *= 0.3;
				
				// Mark collision happened
				this.lastCollisionTime = Date.now();
				return true;
			}
		}
		return false;
	}

	checkCollisionWithRect(rect1, rect2) {
		return rect1.x < rect2.x + rect2.width &&
			   rect1.x + rect1.width > rect2.x &&
			   rect1.y < rect2.y + rect2.height &&
			   rect1.y + rect1.height > rect2.y;
	}

	getPlayerData() {
		return {
			id: this.id,
			name: this.name,
			x: this.x,
			y: this.y,
			angle: this.angle,
			speed: this.speed,
			color: this.color,
			lap: this.lap,
			currentCheckpoint: this.currentCheckpoint,
			isRacing: this.isRacing,
			lapTime: this.lapTime,
			bestLapTime: this.bestLapTime,
			alive: this.alive,
		};
	}
}

export class RaceGame extends BaseGame {
	constructor(gameId, config = {}) {
		super(gameId, config);
		this.gameType = 'race';

		// Fixed track dimensions
		this.trackWidth = 1920;
		this.trackHeight = 1080;

		// Create oval track
		this.createTrack();

		this.playerColors = [
			'#ff0000',
			'#00ff00',
			'#0000ff',
			'#ffff00',
			'#ff00ff',
			'#00ffff',
			'#ff8800',
			'#8800ff',
			'#00ff88',
			'#ff0088',
		];
		this.colorIndex = 0;
	}

	createTrack() {
		const centerX = this.trackWidth / 2;
		const centerY = this.trackHeight / 2;
		const trackWidth = Math.min(this.trackWidth, this.trackHeight) * 0.7;
		const trackRadiusX = trackWidth * 0.4;
		const trackRadiusY = trackWidth * 0.25;

		// Start/Finish line position (top of oval)
		const startX = centerX;
		const startY = centerY - trackRadiusY;

		// Create sand areas (wider than track)
		this.sandAreas = [
			// Outer sand areas
			{
				x: centerX - trackRadiusX - 80,
				y: centerY - trackRadiusY - 40,
				width: 160,
				height: trackRadiusY * 2 + 80,
				type: 'sand'
			},
			{
				x: centerX + trackRadiusX - 80,
				y: centerY - trackRadiusY - 40,
				width: 160,
				height: trackRadiusY * 2 + 80,
				type: 'sand'
			},
			// Inner sand area
			{
				x: centerX - trackRadiusX + 120,
				y: centerY - trackRadiusY + 40,
				width: trackRadiusX * 2 - 240,
				height: trackRadiusY * 2 - 80,
				type: 'sand'
			}
		];

		// Create barriers (walls)
		this.barriers = [];
		// Left barrier
		this.barriers.push({
			x: centerX - trackRadiusX - 100,
			y: centerY - trackRadiusY - 50,
			width: 20,
			height: trackRadiusY * 2 + 100
		});
		// Right barrier
		this.barriers.push({
			x: centerX + trackRadiusX + 80,
			y: centerY - trackRadiusY - 50,
			width: 20,
			height: trackRadiusY * 2 + 100
		});
		// Top barrier (with gap for start/finish)
		this.barriers.push({
			x: centerX - trackRadiusX - 100,
			y: centerY - trackRadiusY - 50,
			width: trackRadiusX + 50,
			height: 20
		});
		this.barriers.push({
			x: centerX + 50,
			y: centerY - trackRadiusY - 50,
			width: trackRadiusX + 50,
			height: 20
		});
		// Bottom barrier
		this.barriers.push({
			x: centerX - trackRadiusX - 100,
			y: centerY + trackRadiusY + 30,
			width: trackRadiusX * 2 + 200,
			height: 20
		});

		// Create checkpoints around the oval
		this.checkpoints = [
			{
				id: 0,
				x: centerX,
				y: centerY - trackRadiusY,
				width: 60,
				height: 60,
				totalCheckpoints: 4
			},
			{
				id: 1,
				x: centerX + trackRadiusX,
				y: centerY,
				width: 60,
				height: 60,
				totalCheckpoints: 4
			},
			{
				id: 2,
				x: centerX,
				y: centerY + trackRadiusY,
				width: 60,
				height: 60,
				totalCheckpoints: 4
			},
			{
				id: 3,
				x: centerX - trackRadiusX,
				y: centerY,
				width: 60,
				height: 60,
				totalCheckpoints: 4
			}
		];

		// Start line (checkered pattern area)
		this.startLine = {
			x: centerX - 40,
			y: centerY - trackRadiusY - 20,
			width: 80,
			height: 40
		};
	}

	addPlayer(playerId, playerName, userId = null) {
		const color = this.playerColors[this.colorIndex % this.playerColors.length];
		this.colorIndex++;

		const startX = this.trackWidth / 2;
		const startY = this.trackHeight / 2 - Math.min(this.trackWidth, this.trackHeight) * 0.25;

		const player = new RacePlayer(
			playerId,
			playerName,
			startX + (this.players.size * 40),
			startY,
			color
		);
		player.userId = userId;
		
		this.players.set(playerId, player);
		return player.getPlayerData();
	}

	handlePlayerInput(playerId, input) {
		const player = this.players.get(playerId);
		if (player && input !== null && input !== undefined) {
			player.updateInput(input);
			
			// Start race when player starts moving
			if (!player.isRacing && Math.abs(player.currentInput.accelerate) > 0.5) {
				player.startRace();
			}
		}
	}

	update(deltaTime) {
		// Process player movements
		for (const [, player] of this.players) {
			player.move(deltaTime, null, this.sandAreas);
			
			// Check barriers
			player.checkBarriers(this.barriers);
			
			// Check checkpoints
			for (const checkpoint of this.checkpoints) {
				player.checkCheckpoint(checkpoint);
			}
		}

		// Check player collisions
		const playersArray = Array.from(this.players.values());
		for (let i = 0; i < playersArray.length; i++) {
			for (let j = i + 1; j < playersArray.length; j++) {
				const p1 = playersArray[i];
				const p2 = playersArray[j];
				
				if (p1.alive && p2.alive && p1.checkCollision(p2)) {
					p1.resolveCollision(p2);
				}
			}
		}
	}

	getGameState() {
		const playersData = Array.from(this.players.values()).map((player) =>
			player.getPlayerData()
		);

		return {
			players: playersData,
			checkpoints: this.checkpoints,
			sandAreas: this.sandAreas,
			barriers: this.barriers,
			startLine: this.startLine,
		};
	}

	updateWorldSize(width, height) {
		if (width > this.trackWidth) this.trackWidth = width;
		if (height > this.trackHeight) this.trackHeight = height;
		this.createTrack(); // Recreate track with new dimensions
		return { width: this.trackWidth, height: this.trackHeight };
	}
}
