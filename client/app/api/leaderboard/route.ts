import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const gameType = searchParams.get('gameType') || 'global';
		const period = searchParams.get('period') || 'alltime';

		const response = await fetch(
			`${SERVER_URL}/api/leaderboard?gameType=${gameType}&period=${period}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Failed to fetch leaderboard' },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Leaderboard fetch error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch leaderboard' },
			{ status: 500 }
		);
	}
}

