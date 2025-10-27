import { NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export async function GET() {
	try {
		const response = await fetch(`${SERVER_URL}/api/blockchain/game-modules`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			// Return mock data when server is not available
			return NextResponse.json({
				success: true,
				data: [
					{
						id: 1,
						name: 'Shooter Game Module',
						description: 'Fast-paced multiplayer shooter game',
						version: '1.0.0',
						contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.shooter-game',
						category: 'action',
						minStake: 0,
						maxPlayers: 8,
						isActive: true
					},
					{
						id: 2,
						name: 'Race Game Module',
						description: 'High-speed racing action',
						version: '1.0.0',
						contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.race-game',
						category: 'racing',
						minStake: 0,
						maxPlayers: 4,
						isActive: true
					},
					{
						id: 3,
						name: 'Quiz Game Module',
						description: 'Knowledge-based quiz game',
						version: '1.0.0',
						contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.quiz-game',
						category: 'trivia',
						minStake: 0,
						maxPlayers: 10,
						isActive: true
					},
					{
						id: 4,
						name: 'Tower Defence Module',
						description: 'Strategic tower defense game',
						version: '1.0.0',
						contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.towerdefence-game',
						category: 'strategy',
						minStake: 0,
						maxPlayers: 1,
						isActive: true
					}
				]
			});
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error fetching game modules:', error);
		
		// Return mock data when server is not available
		return NextResponse.json({
			success: true,
			data: [
				{
					id: 1,
					name: 'Shooter Game Module',
					description: 'Fast-paced multiplayer shooter game',
					version: '1.0.0',
					contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.shooter-game',
					category: 'action',
					minStake: 0,
					maxPlayers: 8,
					isActive: true
				},
				{
					id: 2,
					name: 'Race Game Module',
					description: 'High-speed racing action',
					version: '1.0.0',
					contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.race-game',
					category: 'racing',
					minStake: 0,
					maxPlayers: 4,
					isActive: true
				},
				{
					id: 3,
					name: 'Quiz Game Module',
					description: 'Knowledge-based quiz game',
					version: '1.0.0',
					contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.quiz-game',
					category: 'trivia',
					minStake: 0,
					maxPlayers: 10,
					isActive: true
				},
				{
					id: 4,
					name: 'Tower Defence Module',
					description: 'Strategic tower defense game',
					version: '1.0.0',
					contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.towerdefence-game',
					category: 'strategy',
					minStake: 0,
					maxPlayers: 1,
					isActive: true
				}
			]
		});
	}
}
