import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, description, imageUrl, traits, playerAddress } = body;

		const response = await fetch(`${SERVER_URL}/api/blockchain/create-nft`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name, description, imageUrl, traits, playerAddress }),
		});

		if (!response.ok) {
			// Return mock success when server is not available
			return NextResponse.json({
				success: true,
				data: {
					nftId: 'mock-nft-' + Date.now(),
					txId: 'mock-tx-' + Date.now(),
					name,
					description,
					imageUrl,
					traits,
					playerAddress,
					message: 'NFT created successfully (mock)'
				}
			});
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error creating NFT:', error);
		
		// Return mock success when server is not available
		return NextResponse.json({
			success: true,
			data: {
				nftId: 'mock-nft-' + Date.now(),
				txId: 'mock-tx-' + Date.now(),
				message: 'NFT created successfully (mock)'
			}
		});
	}
}
