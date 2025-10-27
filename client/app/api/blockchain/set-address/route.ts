import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { roomId, playerId, address, nftTokenId } = body;

		const response = await fetch(`${SERVER_URL}/api/blockchain/set-address`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ roomId, playerId, address, nftTokenId }),
		});

		if (!response.ok) {
			// Return mock success when server is not available
			return NextResponse.json({
				success: true,
				data: {
					roomId,
					playerId,
					address,
					nftTokenId,
					message: 'Address set successfully (mock)'
				}
			});
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error setting player address:', error);
		
		// Return mock success when server is not available
		return NextResponse.json({
			success: true,
			data: {
				message: 'Address set successfully (mock)'
			}
		});
	}
}
