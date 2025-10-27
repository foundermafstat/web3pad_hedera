import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export async function GET(
	request: NextRequest,
	{ params }: { params: { roomId: string } }
) {
	try {
		const { roomId } = params;

		const response = await fetch(`${SERVER_URL}/api/blockchain/room/${roomId}/session-data`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			// Return mock data when server is not available
			return NextResponse.json({
				success: true,
				data: {
					blockchainEnabled: false,
					blockchainSessionId: null,
					playerAddresses: {},
					blockchainResults: []
				}
			});
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error fetching session data:', error);
		
		// Return mock data when server is not available
		return NextResponse.json({
			success: true,
			data: {
				blockchainEnabled: false,
				blockchainSessionId: null,
				playerAddresses: {},
				blockchainResults: []
			}
		});
	}
}
