import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
		const searchParams = request.nextUrl.searchParams;
		const limit = searchParams.get('limit') || '50';
		const gameType = searchParams.get('gameType') || 'all';

		const response = await fetch(
			`${serverUrl}/api/game-sessions/list?limit=${limit}&gameType=${gameType}`,
			{ cache: 'no-store' }
		);

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Failed to fetch games list' },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error fetching games list:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

