import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export async function GET(
	request: NextRequest,
	{ params }: { params: { playerAddress: string } }
) {
	try {
		const { playerAddress } = params;

		const response = await fetch(`${SERVER_URL}/api/blockchain/player/${playerAddress}/sessions`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			// Return mock data when server is not available
			return NextResponse.json({
				success: true,
				data: []
			});
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error fetching player sessions:', error);
		
		// Return mock data when server is not available
		return NextResponse.json({
			success: true,
			data: []
		});
	}
}
