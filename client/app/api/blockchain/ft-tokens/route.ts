import { NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export async function GET() {
	try {
		const response = await fetch(`${SERVER_URL}/api/blockchain/ft-tokens`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			// Return mock data when server is not available
			return NextResponse.json({
				success: true,
				data: [
					{
						id: 1,
						name: 'W3P Points',
						symbol: 'W3P',
						decimals: 6,
						totalSupply: 1000000,
						contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.w3p-token',
						description: 'Main game currency for W3P platform',
						imageUrl: '/w3h-icon.jpg',
						ownerAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7',
						isActive: true
					},
					{
						id: 2,
						name: 'Game Credits',
						symbol: 'GCR',
						decimals: 2,
						totalSupply: 100000,
						contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.game-credits',
						description: 'Credits for in-game purchases',
						imageUrl: '/w3h-icon.jpg',
						ownerAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7',
						isActive: true
					},
					{
						id: 3,
						name: 'Achievement Tokens',
						symbol: 'ACH',
						decimals: 0,
						totalSupply: 10000,
						contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.achievement-tokens',
						description: 'Tokens earned through game achievements',
						imageUrl: '/w3h-icon.jpg',
						ownerAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7',
						isActive: true
					}
				]
			});
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error('Error fetching FT tokens:', error);
		
		// Return mock data when server is not available
		return NextResponse.json({
			success: true,
			data: [
				{
					id: 1,
					name: 'W3P Points',
					symbol: 'W3P',
					decimals: 6,
					totalSupply: 1000000,
					contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.w3p-token',
					description: 'Main game currency for W3P platform',
					imageUrl: '/w3h-icon.jpg',
					ownerAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7',
					isActive: true
				},
				{
					id: 2,
					name: 'Game Credits',
					symbol: 'GCR',
					decimals: 2,
					totalSupply: 100000,
					contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.game-credits',
					description: 'Credits for in-game purchases',
					imageUrl: '/w3h-icon.jpg',
					ownerAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7',
					isActive: true
				},
				{
					id: 3,
					name: 'Achievement Tokens',
					symbol: 'ACH',
					decimals: 0,
					totalSupply: 10000,
					contractAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7.achievement-tokens',
					description: 'Tokens earned through game achievements',
					imageUrl: '/w3h-icon.jpg',
					ownerAddress: 'ST1G646AB7VAKZP6P6SVA7S8P2H6T3Z07E6F410E7',
					isActive: true
				}
			]
		});
	}
}
