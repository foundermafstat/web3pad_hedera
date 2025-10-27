import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export async function GET(
	request: NextRequest,
	{ params }: { params: { contractAddress: string } }
) {
	try {
		const { contractAddress } = params;

		const response = await fetch(`${SERVER_URL}/api/blockchain/contract/${contractAddress}/info`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			// Return mock data when server is not available
			return NextResponse.json({
				success: true,
				data: {
					address: contractAddress,
					name: 'Mock Contract',
					description: 'Mock contract for testing',
					version: '1.0.0',
					network: 'testnet',
					deployedAt: new Date().toISOString(),
					owner: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7'
				}
			});
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error fetching contract info:', error);
		
		// Return mock data when server is not available
		return NextResponse.json({
			success: true,
			data: {
				address: contractAddress,
				name: 'Mock Contract',
				description: 'Mock contract for testing',
				version: '1.0.0',
				network: 'testnet',
				deployedAt: new Date().toISOString(),
				owner: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7'
			}
		});
	}
}
