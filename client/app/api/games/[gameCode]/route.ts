import { NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

interface RouteContext {
	params: {
		gameCode: string;
	};
}

export async function GET(request: Request, { params }: RouteContext) {
	try {
		const { gameCode } = params;
		
		const response = await fetch(`${SERVER_URL}/api/games/${gameCode}`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			if (response.status === 404) {
				return NextResponse.json(
					{ success: false, error: 'Game not found' },
					{ status: 404 }
				);
			}
			throw new Error('Failed to fetch game from server');
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error fetching game from server:', error);
		return NextResponse.json(
			{ success: false, error: 'Failed to fetch game' },
			{ status: 500 }
		);
	}
}
