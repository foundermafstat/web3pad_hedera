import { NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export async function GET() {
	try {
		const response = await fetch(`${SERVER_URL}/api/blockchain/status`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			// Return mock data when server is not available
			return NextResponse.json({
				success: true,
				data: {
					enabled: false,
					network: 'testnet',
					registryContract: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.registry',
					shooterContract: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.shooter-game'
				}
			});
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error fetching blockchain status:', error);
		
		// Return mock data when server is not available
		return NextResponse.json({
			success: true,
			data: {
				enabled: false,
				network: 'testnet',
				registryContract: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.registry',
				shooterContract: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.shooter-game'
			}
		});
	}
}
