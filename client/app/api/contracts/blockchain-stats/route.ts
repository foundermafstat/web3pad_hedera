import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const addressParam = searchParams.get('address');
		const gameId = searchParams.get('gameId');

		if (!addressParam) {
			return NextResponse.json(
				{ success: false, error: 'Missing address parameter' },
				{ status: 400 }
			);
		}

		const address = decodeURIComponent(addressParam);
		const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
		const url = gameId
			? `${serverUrl}/api/contracts/player/${address}/blockchain-stats?gameId=${encodeURIComponent(gameId)}`
			: `${serverUrl}/api/contracts/player/${address}/blockchain-stats`;

		console.log('[API] Fetching blockchain stats for address:', address, 'gameId:', gameId);

		const response = await fetch(url, {
			cache: 'no-store'
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[API] Server error:', response.status, errorText);
			throw new Error(`Server returned ${response.status}: ${errorText}`);
		}

		const data = await response.json();
		console.log('[API] Blockchain stats received:', data);
		return NextResponse.json(data);
	} catch (error) {
		console.error('[API] Error fetching blockchain stats:', error);
		return NextResponse.json(
			{ success: false, error: error instanceof Error ? error.message : 'Failed to fetch blockchain stats' },
			{ status: 500 }
		);
	}
}

