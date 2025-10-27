import { NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export async function GET() {
	try {
		const response = await fetch(`${SERVER_URL}/api/games`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			throw new Error(`Server responded with status: ${response.status}`);
		}

		// Check if response is JSON
		const contentType = response.headers.get('content-type');
		if (!contentType || !contentType.includes('application/json')) {
			throw new Error('Server returned non-JSON response');
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error fetching games from server:', error);
		
		// Return mock data when server is not available
		return NextResponse.json({
			success: true,
			games: [
				{
					id: 1,
					code: 'shooter',
					name: 'Shooter Game',
					description: 'Fast-paced multiplayer shooter',
					isActive: true,
					sortOrder: 1
				},
				{
					id: 2,
					code: 'race',
					name: 'Race Game',
					description: 'High-speed racing action',
					isActive: true,
					sortOrder: 2
				},
				{
					id: 3,
					code: 'quiz',
					name: 'Quiz Game',
					description: 'Test your knowledge',
					isActive: true,
					sortOrder: 3
				},
				{
					id: 4,
					code: 'towerdefence',
					name: 'Tower Defence',
					description: 'Strategic tower defense',
					isActive: true,
					sortOrder: 4
				}
			]
		});
	}
}
